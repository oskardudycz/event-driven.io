---
title: Idempotent Command Handling
category: "Event Sourcing"
cover: 2024-11-15-cover.png
author: oskar dudycz
---

![](2024-11-15-cover.png)

> _"Is your command handling idempotent?"_ 

Sounds like a douchebag question to ask. Actually, that's not a question but a statement that we want to sound smart.

Maybe a definition from Wikipedia could help?

> Idempotence (UK: /ˌɪdɛmˈpoʊtəns/, US: /ˈaɪdəm-/) is the property of certain operations in mathematics and computer science whereby they can be applied multiple times without changing the result beyond the initial application.

Meh, even more douchy.

Yet, if we frame it as:

> "How do you handle business logic that should only be run once when the record doesn't exist? For instance: creating a user on the first call or ensuring that we're checking in guests to the hotel only once.

Or:

> Should checking out a guest fail or succeed if the guest was already checked out?

Now we're talking! We're bringing the discussion back. We can reason and discuss specific cases.

Let's say that we have the Guest Stay finances workflow explained in the [How TypeScript can help in modelling business workflows](/en/how_to_have_fun_with_typescript_and_workflow/). It starts by checking in guests; then we record charges (e.g. night stay, beer at the bar, massage at SPA) and pay for them. Guests can check out if our balance is settled (so the difference between charges and payments equals zero).

Now, we could start with the naive implementation that throws exceptions when the business rule is not fulfilled. For check-in, this could look as follows:

```ts
function checkIn (
  command: CheckIn,
  state: GuestStayAccount,
): GuestCheckedIn {
  const { data: { guestId, roomId }, metadata } = command;

  if (state.status === 'CheckedIn')
    throw new IllegalStateError(`Guest is already checked-in!`);

  if (state.status === 'CheckedOut')
    throw new IllegalStateError(`Guest account is already checked out`);

  const now = metadata?.now ?? new Date();

  return {
    type: 'GuestCheckedIn',
    data: {
      guestId,
      roomId,
      guestStayAccountId: toGuestStayAccountId(guestId, roomId, now),
      checkedInAt: now,
    },
  };
};
```

I designed my model to express possible states. The guest state can be either not existing, checked in or checked out. Essentially it's a state machine.

```ts
type NotExisting = { status: 'NotExisting' };

type CheckedIn = { status: 'CheckedIn'; balance: number };

type CheckedOut = { status: 'CheckedOut' };

type GuestStayAccount = NotExisting | CheckedIn | CheckedOut;

const initialState = (): GuestStayAccount => ({
  status: 'NotExisting',
});
```

Thanks to that, I can make the explicit check, ensuring that I assume I can perform the check-in only when the guest's stay does not exist. Otherwise, I'm throwing exceptions with meaningful messages. 

That could work for the basic scenario. **Yet, even if we're designing the business logic or backend code, we should always consider user experience.** Throwing exceptions helps us ensure that we won't end up in the wrong state, which is a minimum effort we should make. Yet, undoubtedly, it doesn't provide a good user experience. Some can say:

> No worries, we'll return the Result instead of throwing an exception!

That's sweet, but for me, it's Potato vs Potahto.

`youtube: https://www.youtube.com/watch?v=Mc3Fn7R9mkE`

Of course, I understand the principles of not driving our logic by exceptions, but we can map exceptions and results to specific HTTP statuses, pop-ups with an error message, etc.

**Whether we throw exceptions or return _Result.Error_, it'll be the same (bad) user experience.** The flow is stopped with an error. It's "just" syntactic sugar we prefer.

If we haven't done that yet, it's about time to ask a business expert what should happen if someone tries to check in twice. If you think that this can't ever happen, then think about scenarios like:
- the hotel clerk clicks check-in twice,
- someone uses the check-in booth,
- we have a quick check-in workflow, where automatically, a guest account is created, a confirmed reservation, and checked in,
- we're integrating with external systems that can send us a web-hook multiple times,
- the process is asynchronous or initiated in other modules, and queues can retry command delivery.

It may appear that it'd be a better experience to succeed silently if the check-in has already been made. So, we accept the command and say, "Yeah, fine."  How to do it? 

The easiest option is to just remove if statement:

```ts
if (state.status === 'CheckedIn')
  throw new IllegalStateError(`Guest is already checked-in!`);
```

Still, if we just do that, then business logic would go forward, and it'd return _GuestCheckedIn_ again. It'd be stored, and that's not necessarily where we'd like to end up. We've already checked in, and we don't care how many more times someone tries to do it again. What other options do we have, then?

**We should have a way to say that we're ignoring the command.** There are multiple options to achieve it, for instance, by returning:
- null,
- result type informing that we're ignoring processing,
- explicit event telling that error condition was achieved,
- empty array or events,
- another creative way you came up with.

Again, it's a bit potato vs potahto discussion, highly dependent on your preferences. Let me go through mine. Returning null, in this case, could be meaningless for other people unless that's our general convention. Returning explicit events is fair but sometimes a bit too heavy; we'll discuss that later in more detail. Result type informing that we're ignoring processing would be best if we're not doing Event Sourcing, as we need to know whether we should update the state with the new one. **As I'm doing Event Sourcing here, my safe default would be an empty array of events. In Event Sourcing, logic should return one or an array of events, so this should not introduce additional complexity.**

An updated method will look as follows:

```ts
function checkIn (
  { data: { guestId, roomId }, metadata }: CheckIn,
  state: GuestStayAccount,
): GuestCheckedIn | [] {
  if (state.status === 'CheckedIn')
    return [];

  if (state.status === 'CheckedOut')
    throw new IllegalStateError(`Guest account is already checked out`);

  const now = metadata?.now ?? new Date();

  return {
    type: 'GuestCheckedIn',
    data: {
      guestId,
      roomId,
      guestStayAccountId: toGuestStayAccountId(guestId, roomId, now),
      checkedInAt: now,
    },
  };
};
```

A simple change, but it makes our processing more explicit. If we prefer, we can still throw an exception if the guest was checked out. That can mean something is fishy, and we may still want to throw an exception in this case. Still, we should always discuss that with business. It's fine to mix multiple strategies for various invariants.

## Command Handling infrastructure

Such change, of course, has to be reflected in our infrastructure. In Event Sourcing the flow looks as follow:
1. Get the stream events and build the state from them.
2. Run the business logic based on the state and passed command.
3. Store new events in the same stream you've read.

Now, between 2 and 3, we should add an additional step checking if any changes have been made, so in our case, an empty array was returned. The pseudo-code for a generic command handling was returned could look as follows:

```ts
// 1. Aggregate the stream
const aggregationResult = await eventStore.aggregateStream(streamName, {
  evolve,
  initialState,
});

// Use the aggregate state
const state = aggregationResult.state;
const currentStreamVersion = aggregationResult.currentStreamVersion;

// 2. Run business logic
const result = handle(state);

const newEvents = Array.isArray(result) ? result : [result];

// 3. Check if any changes have been made
if (newEvents.length === 0) {
  return {
    newEvents: [],
    newState: state,
    nextExpectedStreamVersion: currentStreamVersion,
    createdNewStream: false,
  };
}

// 4. Append result to the stream
const appendResult = await eventStore.appendToStream(
  streamName,
  newEvents,
  {
     expectedStreamVersion: currentStreamVersion,
  },
);

// 5. Return result with updated state
return {
  ...appendResult,
  newEvents,
  newState: newEvents.reduce(evolve, state),
};
```

If you're not doing Event Sourcing then it's the same stuff; it could look as follows:

```ts
// 1. Aggregate the stream
const findResult = await repository.findById(recordId)_;

// Use the aggregate state
const state = findResult.state ?? initialState();
const currentStreamVersion = findResult.currentVersion;

// 2. Run business logic
const result = handle(state);

// 3. Check if any changes have been made
if (isIgnoredResult(result)) {
  return {
    newState: state,
    nextExpectedVersion: currentVersion,
    createdNewRecord: false,
  };
}

// 4. Append result to the stream
const storeResult = await repository.store(
  recordId,
  result,
  {
     expectedVersion: currentVersion,
  },
);

// 5. Return result with updated state
return {
  ...storeResult,
  newState: result,
};
```

Essentially, we're loading the current state. If it doesn't exist, we're setting the default initial state. For Event Stream, not existing will mean an empty events array; for the classical approach, it can be null. Thanks to assigning explicit initial state. We're making things explicit. Thanks to that, we can check whether the record exists in our business logic.

We also get the current version of the record and use it as the expected version when appending event(s)/performing the state update. We're using [Optimistic Concurrency](/en/optimistic_concurrency_for_pessimistic_times/) here. We're telling our storage engine to only accept the update if the stream/record version in the database is the same as the expected one. Otherwise, it should reject the update (usually by throwing an exception). Thanks to that, we're ensuring that if another change happens in parallel, our update won't be accepted. All mature storage engines support [Optimistic Concurrency](/en/optimistic_concurrency_for_pessimistic_times/). If they don't, then run away; they're not mature!

## Idempotency and Optimistic Concurrency 

That's cool stuff, but we already said that throwing exceptions is not a perfect solution. What's more, the change happening in parallel doesn't have to be conflicting. In our current business rules, the only conflicting change is when a guest is checked out. If we're recording charges or payments, then the guest stay is still running, and we should safely succeed. How to handle that?

**The solution for that is the retry policy.** We could wrap our command handling in the retry that would check if concurrency error was thrown.

Let's say that we have the following wrapper for the command handling:

```ts
const CommandHandler =
  <State, EventType extends Event>(
    evolve: (state: State, event: StreamEvent) => State;
    initialState: () => State;
  ) =>
  async (
    eventStore: EventStore,
    streamName: string,
    handle: (
      state: State,
    ) => StreamEvent[]
  ): Promise<CommandHandlerResult> => {
    // (...) Command handling code you saw above
  };
```

We can define it for our guest stay as:

```ts
const handle = CommandHandler({ evolve, initialState });
```

And use it in our endpoint for checking in guest as:

```ts
export const guestStayAccountsApi =
  (
    eventStore: EventStore,
  ): WebApiSetup =>
  router.post(
    '/guests/:guestId/stays/:roomId',
    on(async (request: CheckInRequest) => {
      // 1. Prepare command 
      const guestStayAccountId = toGuestStayAccountId(
        request.params.guestId, 
        request.params.roomId
      );

      const command: CheckIn = {
        type: 'CheckIn',
        data: {
          guestId: request.params.guestId,
           roomId: request.params.roomId,
         },
        metadata: { now: new Date() },
       };

      // 2. Run command handling logic
      await handle(eventStore, guestStayAccountId, (state) =>
        checkIn(command, state),
      );
        
      // 3. If no error was thrown, return success
      return Created({
        url: `/guests/${guestId}/stays/${roomId}/periods/${formatDateToUtcYYYYMMDD(now)}`,
      });
    }),
  );
```

With this approach, we have a handle method, which is an abstraction for command handling. Thanks to the repeatable pattern of handling business logic, we can make it generic, leaving business logic focused and explicit. As long it returns events, then we're good.

**Getting back to the retries.** As our command handler is just a function, we could decorate it with retry code.

Let's start by defining the general retry policy. I'm using the [async-retry](https://www.npmjs.com/package/async-retry) npm package. If you're in C#, check [Polly](https://www.pollydocs.org), and in Java, check [Spring Retry](https://github.com/spring-projects/spring-retry). Each environment has a recommended package to handle that.

The only thing I added is a bit easier way to pass function to check if we should retry on a specfic error.

```ts
import retry from 'async-retry';

export type AsyncRetryOptions = retry.Options & {
  shouldRetryError?: (error: unknown) => boolean;
};

export const NoRetries: AsyncRetryOptions = { retries: 0 };

export const asyncRetry = async <T>(
  fn: () => Promise<T>,
  opts?: AsyncRetryOptions,
): Promise<T> => {
  if (opts === undefined || opts.retries === 0) return fn();

  return retry(
    async (bail) => {
      try {
        return await fn();
      } catch (error) {
        if (opts?.shouldRetryError && !opts.shouldRetryError(error)) {
          bail(error as Error);
        }
        throw error;
      }
    },
    opts ?? NoRetries,
  );
};
```

Let's also define a check for concurrency error. It could look as:

```ts
const isExpectedVersionConflictError = (
  error: unknown,
): boolean =>
  error instanceof ExpectedVersionConflictError;
```

Depending on your storage engine this function will differ, for instance for PostgreSQL change it could be:

```ts
const isExpectedVersionConflictError = (
  error: unknown,
): boolean =>
  error instanceof Error && 'code' in error && error.code === '23505';
```

Having that, we can adjust our command handler to:

```ts
export const defaultRetryOptions: AsyncRetryOptions =
  {
    retries: 3,
    minTimeout: 100,
    factor: 1.5,
    shouldRetryError: isExpectedVersionConflictError,
  };

const CommandHandler =
  <State, EventType extends Event>(
    evolve: (state: State, event: StreamEvent) => State;
    initialState: () => State;
  ) =>
  async (
    eventStore: EventStore,
    streamName: string,
    handle: (
      state: State,
    ) => StreamEvent[],
    options?: { retry: AsyncRetryOptions }
  ): Promise<CommandHandlerResult> => 
    asyncRetry(() =>{
      // (...) Command handling code you saw before
    },
    options?.retry ?? defaultRetryOptions,
  );
```

No other change is needed; our logic can remain the same. Of course, we can make it more sophisticated or default to no retries and only make retries in specific cases, but I think you get the idea.

It's essential to the business logic and the whole command handling flow. Without reading again, we won't get the new state and the current stream version, and the update will fail.

## Handling duplicates

Retries are nice, but how do we handle duplicates? Won't retries generate new records? It may happen if we were always generating new random IDs for our guest stay. For instance:

```ts
import { randomUUID } from 'node:crypto';

const guestStayAccountId = randomUUID();

const command: CheckIn = {
  type: 'CheckIn',
  data: {
    guestId: request.params.guestId,
    roomId: request.params.roomId,
  },
  metadata: { now: new Date() },
};

await handle(eventStore, guestStayAccountId, (state) =>
  checkIn(command, state),
);
```

But that's not what we did, we did:

```ts
const guestStayAccountId =  toGuestStayAccountId(
  request.params.guestId, 
  request.params.roomId
);
```

**where _toGuestStayAccountId_ creates a predictable id based on provided data**:

```ts
const toGuestStayAccountId = (
  guestId: string,
  roomId: string,
) => `guest_stay_account-${guestId}:${roomId}`;
```

The stay can be represented by guest and room (it could also be reservation ID or whatever is predictable).

Thanks to that, no matter how many times we retry, we'll always be accessing the same record; the combination of business logic, transactions, and optimistic concurrency will ensure that we won't end up in the wrong state.

## Idempotency handling in updates

We can also apply the same pattern to the update operation, let's say we have the following code for recording charge:

```ts
function recordCharge (
  { data: { guestStayAccountId, chargeId, amount }, metadata }: RecordCharge,
  state: GuestStayAccount,
): ChargeRecorded {
  assertIsCheckedIn(state);

  return {
    type: 'ChargeRecorded',
    data: {
      chargeId,
      guestStayAccountId,
      amount: amount,
      recordedAt: metadata?.now ?? new Date(),
    },
  };
};

const assertIsCheckedIn = (state: GuestStayAccount): state is CheckedIn => {
  if (state.status === 'NotExisting')
    throw new IllegalStateError(`Guest account doesn't exist!`);

  if (state.status === 'CheckedOut')
    throw new IllegalStateError(`Guest account is already checked out);

  return true;
};
```

This function is not idempotent. Of course, we will ensure that we're not recording charges for not existing or checked-out accounts, but this code won't help us for not recording double charges. Doubled charges are not something we'd like to have in the financial module. Or anywhere.

To detect it, we'd need information about the recorded transaction ids. Then, we could check if the following transaction hasn't been handled already.  

Let's change our state definition to include transaction ids:

```ts
type NotExisting = { status: 'NotExisting' };

type CheckedIn = { 
  status: 'CheckedIn'; 
  balance: number;
  // new property
  transactionIds: string[];
};

type CheckedOut = { status: 'CheckedOut' };

type GuestStayAccount = NotExisting | CheckedIn | CheckedOut;

const initialState = (): GuestStayAccount => ({
  status: 'NotExisting',
});
```

We also need to change our _evolve_ function, which we're using to define [how we build our state from events](/en/how_to_get_the_current_entity_state_in_event_sourcing/).

```ts
function evolve (
  state: GuestStayAccount,
  { type, data: event }: GuestStayAccountEvent,
): GuestStayAccount => {
  switch (type) {
    case 'GuestCheckedIn': {
      return state.status === 'NotExisting'
        ? { status: 'CheckedIn', balance: 0 }
        : state;
    }
    case 'ChargeRecorded': {
      return state.status === 'CheckedIn'
        ? {
            ...state,
            balance: state.balance - event.amount, 
            // new line
            transactionIds: [ ...state.transactionIds, event.chargeId ],
          }
        : state;
    }
    case 'PaymentRecorded': {
      return state.status === 'CheckedIn'
        ? {
            ...state,
            balance: state.balance + event.amount,
            // new line
            transactionIds: [ ...state.transactionIds, event.paymentId ],
          }
        : state;
    }
    case 'GuestCheckedOut': {
      return state.status === 'CheckedIn' ? { status: 'CheckedOut' } : state;
    }
    case 'GuestCheckoutFailed': {
      return state;
    }
    default: {
      const _notExistingEventType: never = type;
      return state;
    }
  }
};
```

For the classical approach, you'd need to extend your table schema.

**And now, the question? How can we get the charge id?** The sender should generate it. Who's _"the sender"_? For instance:
- web page,
- mobile application,
- other module,
- external payment gateway.

We're good as long as the same charge has the same charge id in the command data. If we're retrying operations from our web page, we should ensure that we're not recording the new charge id on each retry.

The updated logic handling idempotency correctly can look as follows:

```ts
function recordCharge (
  { data: { guestStayAccountId, chargeId, amount }, metadata }: RecordCharge,
  state: GuestStayAccount,
): ChargeRecorded | [] {
  assertIsCheckedIn(state);

  // idempotence check
  if(state.transactionIds.includes(chargeId))
    return [];

  return {
    type: 'ChargeRecorded',
    data: {
      chargeId,
      guestStayAccountId,
      amount: amount,
      recordedAt: metadata?.now ?? new Date(),
    },
  };
};
```

## Look Ma' no exceptions

Ok, but what about those errors? Many people don't like exceptions, and that's for good reasons. Some languages even don't allow us to return them. How would I model errors in general?

It depends, I see a few ways:
- if they're "just" errors and I'm in an environment like C# or Java, then I'd throw an exception and map it to the status. For functional environment or Go, Rust, I'd return the result. I'm not a big fan of Railway Oriented Programming in languages that don't have the pipeline operator. Without it, it's not ergonomic.
- The same for events that are part of the [asynchronous workflow](/en/saga_process_manager_distributed_transactions/).
- if they represent idempotent handling, then return an empty array or explicitly ignore the object.
- if they're important to business, I'd model them as events and store them in the stream.

Let's discuss the last option, and let's say that knowing that the charge was rejected is important information for businesses, as they'd like to track those failure scenarios. They can be part of antifraud detection or similar processes.

Having that we could define additional event type:

```ts
type ChargeFailed = Event<
  'ChargeFailed',
  {
    chargeId: string;
    guestStayAccountId: string;
    reason: 'NotCheckedIn' | 'AlreadyCheckedOut';
    failedAt: Date;
  }
>;

type PaymentFailed = Event<
  'PaymentFailed',
  {
    paymentId: string;
    guestStayAccountId: string;
    reason: 'NotCheckedIn' | 'AlreadyCheckedOut';
    failedAt: Date;
  }
>;

// (...) other event types

export type GuestStayAccountEvent =
  | GuestCheckedIn
  | ChargeRecorded
  | ChargeFailed // <= new
  | PaymentRecorded
  | PaymentFailed // <= new
  | GuestCheckedOut
  | GuestCheckoutFailed;
```

Instead of throwing exception, we could return now an event:

```ts
function recordCharge (
  { data: { guestStayAccountId, chargeId, amount }, metadata }: RecordCharge,
  state: GuestStayAccount,
): ChargeRecorded | ChargeFailed | [] {
  // failure
  if (state.status !== 'CheckedIn') {
    return {
      type: 'ChargeFailed',
      data: {
        chargeId,
        guestStayAccountId,
        reason: state.status === 'NotExisting'?
          'NotCheckedIn' : 'AlreadyCheckedOut'
        failedAt: metadata?.now ?? new Date(),
      },
  }

  if(state.transactionIds.includes(chargeId))
    return [];

  return {
    type: 'ChargeRecorded',
    data: {
      chargeId,
      guestStayAccountId,
      amount: amount,
      recordedAt: metadata?.now ?? new Date(),
    },
  };
};
```

By default, this event will be stored in the stream. Still, even if we don't want to store it in the stream, we can decide not to throw exceptions but model all edge cases as events. Then, we can decide on the application layer whether to store it or not. Maybe we would like to just log it.

We can orchestrate it like this:

```ts
  await handle(
    eventStore,  
    guestStayAccountId, 
    (state) => {
      const result = recordCharge(command, state);

      // check if it's failed event
      if(result !== [] && result.type === 'ChargeFailed') {
        console.log(result);
        // let's ignore it, we could also throw error here
        return [];
      }

      return result;
    }
);
```

## Generic idempotency handling

I think business logic is the proper place to check the business rules, and not handling doubled charges is actually a business rule. Still, many people prefer to handle it generically. Let's discuss how to do it.

**We could store the handled command ids in the external store and run only business logic if it wasn't already handled.** The store could be defined as:

```ts
type IdempotencyKeyStore = {
  tryLock: (
    key: string,
    options?: { timeoutInMs?: number },
  ) => boolean | Promise<boolean>;
  accept: (key: string) => void | Promise<void>;
  release: (key: string) => void | Promise<void>;
};
```

The store has the following methods:
- _tryLock_ - that tries to lock the specified key for a certain period of time. Returns true if the lock was acquired and false otherwise.
- _accept_ -  accepts the key lock after successful handling.
- _release_ - releases the lock in case of handling failure.

What's most important is that those operations should be thread-safe and atomic. Without that, we may face race conditions. The safest safest option is to use a distributed lock, e.g., Redis or a relational database.

Having that, we can define our wrapper as:

```ts
type IdempotentOptions<T> = {
  store: IdempotencyKeyStore;
  key: string;
  defaultResult: () => T | Promise<T>;
  timeoutInMs?: number;
};

async function idempotent <T>(
  fn: () => Promise<T>,
  options: IdempotentOptions<T>,
): Promise<T> {
  const { key, timeoutInMs, defaultResult, store } = options;

  //Attempt to acquire the lock for the specified key
  const appended = await store.tryLock(key, { timeoutInMs });

  // If it was used, return the default result
  if (!appended) return await defaultResult();

  try {
    // run handler
    const result = await fn();

    // Mark operation as successful
    await store.accept(key);

    return result;
  } catch (error) {
    // Release key if it was used already
    await store.release(key);
    throw error;
  }
};
```

We're passing the function to wrap together with options:
- idempotency store,
- idempotency key,
- default result if the command was already handled,
- optional lock timeout.

Having that, we:
1. Attempt to acquire the lock for the specified key.
2. If the attempt wasn't successful return the default result.
3. If we acquired lock, then run the business logic.
4. If it fails, release the lock. We don't want to lock the key, let someone fix the state condition, and retry later.
5. If it was successful, accept the lock and return the result.

The example lock store based on Redis could look as follows:

```ts
const defaultTryLockPeriod = 1; // 1 second
const defaultLockPeriod = 86400; // 1 day

const redisStore: IdempotencyKeyStore = {
  tryLock: async ((
    key: string,
    options?: { timeoutInMs?: number },
  ) => {
    const result = await redis.set(key, "in-progress", "NX", "EX", options?.timeoutInMs ?? defaultTryLockPeriod);
    return result === "OK";
  },
  accept: async (key: string) => {
    // Update the key to "completed" status with a longer TTL
    await redis.set(key, "completed", "XX", "EX", defaultLockPeriod); // 1 day TTL
  },
  release: (key: string) => 
    redis.del(key),
};
```

Having that, we could decorate our command handler with idempotent handling:

```ts
const CommandHandler =
  <State, EventType extends Event>(
    evolve: (state: State, event: StreamEvent) => State;
    initialState: () => State;
  ) =>
  async (
    idempotencyKeyStore: IdempotencyKeyStore,
    eventStore: EventStore,
    streamName: string,
    handle: (
      state: State,
    ) => StreamEvent[],
    options: { retry: AsyncRetryOptions, idempotencyKey: string }
  ): Promise<CommandHandlerResult> => 
    idempotent(() => {
      asyncRetry(() =>{
        // (...) Command handling code you saw before
        },
        options?.retry ?? defaultRetryOptions,
      ),
      {  
        idempotencyKeyStore: IdempotencyKeyStore;
        key: options.IdempotencyKey,
        defaultResult: async () => {
          const { state, currentStreamVersion } = await eventStore.aggregateStream(streamName, {
            evolve,
            initialState,
          });

          return {
            newEvents: [],
            newState: state,
            nextExpectedStreamVersion: currentStreamVersion,
            createdNewStream: false,
          };
        }
      }
    );
```

Nothing fancy besides getting the current state in case we already handled this command.

The endpoint will look as follows:

```ts
export const guestStayAccountsApi =
  (
    eventStore: EventStore,
    idempotencyKeyStore: IdempotencyKeyStore,
  ): WebApiSetup =>
  router.post(
    '/guests/:guestId/stays/:roomId/periods/:checkInDate/charges',
    on(async (request: RecordChargeRequest) => {
      const guestStayAccountId = parseGuestStayAccountId(request.params);

      const command: RecordCharge = {
        type: 'RecordCharge',
        data: {
          chargeId: request.body.chargeId,
          guestStayAccountId,
          amount: Number(request.body.amount),
        },
        metadata: { now: new Date() },
      };

      await handle(
        eventStore, 
        idempotencyKeyStore, 
        guestStayAccountId, 
        (state) => recordCharge(command, state),
        { idempotencyKey: command.chargeId }
      );

      return NoContent();
    }),
  );
```

And guess what? That's also a way how external API providers are handling it:
- [Stripe](https://stripe.com/docs/api/idempotent_requests)
- [Visa](https://developer.visa.com/capabilities/vpp/docs-how-to)
- [Checkout](https://www.checkout.com/docs/payments/manage-payments/retry-a-payment)

Of course, it's up to you how you compose; you could even make it more generic and part of your HTTP middleware based on the [Idempotency-Key header](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/). The choice is yours, but the logic will be the same.

## TLDR

Idempotency isn’t just a buzzword—it’s a practical way to handle operations that should only happen once, no matter how many times they’re retried. Whether it’s checking in a guest, recording charges, or processing API calls, the key is ensuring consistency without breaking the flow. By designing systems that handle duplicates gracefully, use optimistic concurrency, or apply idempotency keys, we can avoid annoying edge cases and give users a better experience. It’s not about exceptions versus results—it’s about designing systems that actually work in the real world. 

We went through the various ways to handle it. Both explicitly and generically. From building predictable state machines, handling it in business logic,  to leveraging Optimistic Concurrency, retries and distributed locks.

As tempting as it is to use generic handling, as you saw above, idempotency handling is highly dependent on the business rules; those rules tend to change. If we use generic handling, we're always adding additional overhead, even if most of our applications rarely have idempotency issues. That's something to consider, as it can also increase costs in cloud environments.

Whether you're processing financial transactions, integrating with external APIs, or handling user commands, the principles remain the same: make the system resilient, maintain consistency, and prioritize user experience.

Because, in the end, it's not about whether you throw exceptions or return results—it's about understanding the nuances of the business domain and designing solutions that respect those rules. 

So, how are you making your command handling idempotent? If you haven’t thought about it yet, maybe now’s the time.


**If you need to help in applying those practices, I'm here to help.** Check my [training](/en/training/) page. A workshop is the most effective way to jump-start, I'm also doing consulting and mentoring, [drop me an e-mail!](mailto:oskar@event-driven.io) and we'll find the best way to help you and your team.

**And guess what, all of those you saw in the article, is already available in [Emmett](https://github.com/event-driven-io/emmett/)!** Come join us, we have cookies! [Join our Discord channel](https://discord.gg/fTpqUTMmVa) and discuss further questions!

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

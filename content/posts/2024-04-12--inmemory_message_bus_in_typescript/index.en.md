---
title: How to build an in-memory Message Bus in TypeScript
category: "Event Sourcing"
cover: 2024-04-12-cover.png
author: oskar dudycz
---

![](2024-04-12-cover.png)

**I'm writing this article on Friday, and it's about time to have some fun. As this is a programming blog, let's have some fun coding.** Let's do an exercise designing a type-safe in-memory message bus in TypeScript!

What's a message bus? Let's start from the beginning. 

**There are two ways of communicating: direct and indirect.** For direct communication, we ask another component to perform a specific action and want to know if that happened. For indirect communication, we notify others that something has happened and let them decide what to do. In a nutshell, direct is represented by command, and indirect by event. Read more in [What's the difference between a command and an event?](/pl/whats_the_difference_between_event_and_command/).

**Typically, direct communication is assumed to be blocking and indirect non-blocking, but that's a common practice, not a rule.** Both types of communication can be blocking or non-blocking. In the real world, we may ask other people to do something and wait until they finish or assume that they will reply to us when they have done it. For indirect communication, even though we're not interested in what will happen after we broadcast news, we'd like to know whether all interested parties took action.

This may sound mind-boggling, but it's not if we focus on modelling our communication as it's happening in real business processes. I explained that with examples in [How TypeScript can help in modelling business workflows](/pl/how_to_have_fun_with_typescript_and_workflow/). 

What can we do with our messages, then? The bare minimum is:
- **sending:** expecting it to be handled, but not returning a reason,
- **publishing:** broadcasting information to all subscribers and waiting for them to process it.
- **scheduling:** assuming that this message will be published later asynchronously, for instance, using [Outbox Pattern](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/).

There is more to that; Gregor Hohpe curated most of the [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com) in his book and website. There are over 65 of them, so let's start simple and expand in further articles.

Let's start with defining Command and Event types:

```typescript
type Event<
  EventType extends string = string,
  EventData extends Record<string, unknown> = Record<string, unknown>,
  EventMetaData extends Record<string, unknown> = Record<string, unknown>,
> = Flavour<
  Readonly<{
    type: EventType;
    data: Readonly<EventData>;
    metaData?: Readonly<EventMetaData>;
  }>,
  'Event'
>;

type Command<
  CommandType extends string = string,
  CommandData extends Record<string, unknown> = Record<string, unknown>,
  CommandMetaData extends Record<string, unknown> = Record<string, unknown>,
> = Flavour<
  Readonly<{
    type: CommandType;
    data: Readonly<CommandData>;
    metaData?: Readonly<CommandMetaData>;
  }>,
  'Command'
>;

```

They both have the _type_ representing their name, data-specific information this message gathers, and optional metadata. As the structure is the same, they're both _flavoured_ to let the TypeScript compiler distinguish the differences between them. Read more details on that in [other article](/pl/how_to_have_fun_with_typescript_and_workflow/), in which I explained the details of this definition.

Having them, let's define how our sending and publishing definition will look like:

```typescript
interface EventsPublisher {
  publish<EventType extends Event = Event>(event: EventType): Promise<void>;
}

interface CommandSender {
  send<CommandType extends Command = Command>(
    command: CommandType,
  ): Promise<void>;
}
```

**We're making the intention specific by limiting publishing for events, as they are indirect broadcasts, and sending to allow only commands, as they represent direct communication to a single handler.**

The schedule will look accordingly, but allow to schedule both types. 

```typescript
type ScheduleOptions = { afterInMs: number } | { at: Date };

interface MessageScheduler<CommandOrEvent extends Command | Event> {
  schedule<MessageType extends CommandOrEvent>(
    message: MessageType,
    when?: ScheduleOptions,
  ): Promise<void>;
}
```

Here, we assume that it'll be forwarded in a separate process, and we're not expecting to get any response either for command or from the event. If we want to reply to the status of the command, then we should do it by publishing the a follow up event with a new fact and handing it back. We also allow passing additional options informing when the message should be scheduled.

**You may wonder why we aren't putting all that into a single interface, and the reason is that we want to be precise about the intention.** Typically, you're either handling events or commands, and it's better to have the option to use a narrowed interface that allows you to do only certain things. If we have the granular definitions, then we can also compose them into other interfaces, getting an all-in-one box. Here's how you do it:

```typescript
interface EventBus extends EventsPublisher, MessageScheduler<Event> {}

interface CommandBus extends CommandSender, MessageScheduler<Command> {}

interface MessageBus extends CommandBus, EventBus {
  schedule<MessageType extends Command | Event>(
    message: MessageType,
    when?: ScheduleOptions,
  ): Promise<void>;
}
```

There you have it!

Now that we know how to send, publish, and schedule messages, how do we handle them? We'll need processors that allow registering functions with a specific handling. Let's define them!

```typescript
type EventHandler<EventType extends Event = Event> = (
  event: EventType,
) => Promise<void> | void;

interface EventProcessor {
  subscribe<EventType extends Event>(
    eventHandler: EventHandler<EventType>,
    ...eventTypes: EventTypeOf<EventType>[]
  ): void;
}

type CommandHandler<CommandType extends Command = Command> = (
  command: CommandType,
) => Promise<void> | void;

interface CommandProcessor {
  handle<CommandType extends Command>(
    commandHandler: CommandHandler<CommandType>,
    ...commandTypes: CommandTypeOf<CommandType>[]
  ): void;
}
```

We allow registering a single handler for the event and command handlers, as we may want to unify the handling of the commands or events grouped into [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types). For instance having:

```typescript
export type GuestStayAccountEvent =
  | GuestCheckedIn
  | ChargeRecorded
  | PaymentRecorded
  | GuestCheckedOut
  | GuestCheckoutFailed;

const handleGuestStay = (event: GuestStayAccountEvent) => {
  switch (event.type) {
    case 'GuestCheckedIn':
      return onCheckedIn(event.data);
    case 'ChargeRecorded':
      return onChargeRecorded(event.data);
    case 'GuestCheckedOut':
      return onGuestCheckedOut(event.data);
    case 'GuestCheckoutFailed':
      return onGuestCheckoutFailed(event.data);
  }
};
```

We can register it with:

```typescript
eventProcessor.subscribe(
  handleGuestStay,
  'GuestCheckedIn',
  'ChargeRecorded',
  'GuestCheckedOut',
  'GuestCheckoutFailed',
);
```

And accordingly with command handling.

You may notice that I used two new types: _EventTypeOf_ and _CommandTypeOf_. They're used to having a strongly typed way of handling message types. They're defined as:

```typescript
type CommandTypeOf<T extends Command> = T['type'];

type EventTypeOf<T extends Event> = T['type'];
```

It is a TypeScript trick that tells the compiler of the expected range of the message types. If we try to provide other values, then the compiler will show an error. Sweet!

It would be even sweeter if we didn't have to provide those string values but take them directly from the message type definition. Unfortunately, coding in TypeScript, we cannot have only good things. Those type annotations are only available at compile time. On runtime, there's no trace of that. That's the _"beauty"_ of the dynamic runtime in JavaScript.

**Cool, the last step before going finally to implementation is to implement a processor for scheduled messages:**

```typescript
type ScheduledMessage = {
  message: Event | Command;
  options?: ScheduleOptions;
};

interface ScheduledMessageProcessor {
  dequeue(): ScheduledMessage[];
}
```

We're exposing method that will dequeue the pending messages. We can take them and store them in [Outbox](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/) or forward to messaging queue.

Now, we have our requirements, let's proceed with the implementation. We'll tackle that one by one, let's start with the overall definition of the message bus setup:

```typescript
type MessageHandler = EventHandler | CommandHandler;

type MessageProcessor = EventProcessor | CommandProcessor;

const getInMemoryMessageBus = ():
  & MessageBus
  & MessageProcessor
  & ScheduledMessageProcessor => {
  const allHandlers = new Map<string, MessageHandler[]>();
  let pendingMessages: ScheduledMessage[] = [];

  return { 
    // (...) here will go the interfaces methods definition
  };
};
```

We'll take benefit of the [Structural Typing](/pl/structural_typing_in_type_script/) and provide the one implementation to rule them all, as our command and event handler definitions are the same from the JavaScript runtime perspective. Only at compile time they differ, later on, they just take the message and run the message handling.

We'll also group all handlers in the same map that takes the message type and arrays of functions to process it. Event handlers can have multiple ones, for commands it'll be always a single handler, as we won't allow to register more than one.

We'll also have the unified pending messages collection, this will also guarantee the ordering on the producer side, which is quite important for handling workflows and building projections when subscribing to events.

Let's now show it one by one starting with registering event handler:

```typescript
return {
 // (...)
 subscribe<EventType extends Event>(
    eventHandler: EventHandler<EventType>,
    ...eventTypes: EventTypeOf<EventType>[]
  ): void {
    for (const eventType of eventTypes) {
      if (!allHandlers.has(eventType)) allHandlers.set(eventType, []);

      allHandlers.set(eventType, [
        ...(allHandlers.get(eventType) ?? []),
        eventHandler as MessageHandler,
      ]);
    }
  },
};
```

For each event type, we're just appending the handler to already existing set. A single event type can have multiple handlers (as event notification is a broadcast).

Registering command handler looks accordingly, but there's a slight change:

```typescript
return {
  handle: <CommandType extends Command>(
    commandHandler: CommandHandler<CommandType>,
    ...commandTypes: CommandTypeOf<CommandType>[]
  ): void => {
    const alreadyRegistered = [...allHandlers.keys()].filter((registered) =>
      commandTypes.includes(registered),
    );

    if (alreadyRegistered.length > 0)
       throw new Error(
        `Cannot register handler for commands ${alreadyRegistered.join(', ')} as they're already registered!`,
      );
    for (const commandType of commandTypes) {
      allHandlers.set(commandType, [commandHandler as MessageHandler]);
    }
  },
};
```

As mentioned, we're checking if there's no handler already registered for the specific command type. If there's then we're throwing an error, otherwise just adding it to the handlers registration.


Let's now show how to publish an event:

```typescript
return {
  // (...)
  publish: async <EventType extends Event = Event>(
    event: EventType,
  ): Promise<void> => {
    const handlers = allHandlers.get(event.type) ?? [];

    for (const handler of handlers) {
      const eventHandler = handler as EventHandler<EventType>;

      await eventHandler(event);
    }
  },
};
```

We're just calling each registered handler sequentially. We could also use _Promise.all_ and allow handling them in parallel, or allow both type of handling depending on how the event handler was registered.

Sending command will look accordingly, but again we're adding a validation.

```typescript
return {
  // (...)
  send: async <CommandType extends Command = Command>(
    command: CommandType,
  ): Promise<void> => {
    const handlers = allHandlers.get(command.type);

    if (handlers === undefined || handlers.length === 0)
      throw new EmmettError(
        `No handler registered for command ${command.type}!`,
      );

    const commandHandler = handlers[0] as CommandHandler<CommandType>;

      await commandHandler(command);
  },
};
```

We're doublechecking if there's an actual handler for command, because if it's not then there's no point for sending it, remember, it's a direct communication, expecting command to be handled precisely once. We don't need to check if there are more handlers, as we're not allowing to register such.

Scheduling is even simpler as we just need to put message into the pending items collection:

```typescript
return {
  // (...)
  schedule: <MessageType extends Command | Event>(
    message: MessageType,
    when?: ScheduleOptions,
  ): void => {
    pendingMessages = [...pendingMessages, { message, options: when }];
  },
};
```

We'll dequeue it later on while processing those scheduled message. We'll do it simply as that:

```typescript
return {
  // (...)
  dequeue: (): ScheduledMessage[] => {
    const pending = pendingMessages;
    pendingMessages = [];
    return pending;
  },
};
```
The good thing is that we can assign such object to any of the interfaces we defined above. E.g.

```typescript
const eventPublisher: EventPublisher = getInMemoryMessageBus();
```

or

```typescript
const commandBus: CommandBus = getInMemoryMessageBus();
```

It'll respect the proper types. It's a good starting point, we can separate handling when they'll become too different. Our interfaces are already simple enough that they should be stable, allowing us to expand the implementation once we need it (e.g. adding stuff like retry policy, telemetry, middlewares, etc.).

Do you want to use it in your project? No worries, I got you covered, [Emmett](https://event-driven-io.github.io/emmett/getting-started.html) already supports that!

Just run

```bash
npm install @event-driven-io/emmett
```

And you can use all those types out of the box, e.g.

```typescript
import { getInMemoryMessageBus } from '@event-driven-io/emmett';

const messageBus = getInMemoryMessageBus();
```

And you can use all those types out of the box, e.g.

```typescript
import { getInMemoryMessageBus } from '@event-driven-io/emmett';

const messageBus = getInMemoryMessageBus();
```

Then use it as for event subscription:

```typescript
 messageBus.subscribe(
  handleGuestStay,
  'GuestCheckedIn',
  'ChargeRecorded',
  'GuestCheckedOut',
  'GuestCheckoutFailed',
);
```

and for event publishing:

```typescript
const event:GuestCheckedOut = {
  type: 'GuestCheckedOut',
  data: {
    guestStayAccountId: 'r9293';
    checkedOutAt: new Date();
  }
>;

await messageBus.publish(event);
```

Last, but not least, I'd like to end this article with a disclaimer.

**Command bus can be overkill in cases where we have only a single entry point (e.g. API endpoint).** In such cases, I suggest to have just explicit application code in the endpoint. 

For instance with [Emmett it'd look like that](https://event-driven-io.github.io/emmett/getting-started.html#webapi-definition):

```typescript
export const shoppingCartApi =
  (
    eventStore: EventStore,
    // (...) other dependencies
    getUnitPrice: (productId: string) => Promise<number>,
  ): WebApiSetup =>
  (router: Router): void => {
  router.post(
    '/clients/:clientId/shopping-carts/current/product-items',
    async (request: AddProductItemRequest, response: Response) => {
      // 1. Translate request params to the command
      const shoppingCartId = getShoppingCartId(
        assertNotEmptyString(request.params.clientId),
      );
      const productId = assertNotEmptyString(request.body.productId);

      const command: AddProductItemToShoppingCart = {
        type: 'AddProductItemToShoppingCart',
        data: {
          shoppingCartId,
          productItem: {
            productId,
            quantity: assertPositiveNumber(request.body.quantity),
            unitPrice: await getUnitPrice(productId),
          },
        },
      };

      // 2. Handle command
      await handle(eventStore, shoppingCartId, (state) =>
        addProductItem(command, state),
      );

      // 3. Send response status
      response.sendStatus(204);
    },
  );
}
```

That gives a proper developer experience, rather than just calling ev. As you understand your dependencies, you can go to the definition of business logic. A command bus requires much more jumping around the codebase as you hide all dependencies and handling details.

```typescript
export const shoppingCartApi =
  (
    commandSender: CommandSender,
    getUnitPrice: (productId: string) => Promise<number>,
  ): WebApiSetup =>
  (router: Router): void => {
  router.post(
    '/clients/:clientId/shopping-carts/current/product-items',
    async (request: AddProductItemRequest, response: Response) => {
      // 1. Translate request params to the command
      const shoppingCartId = getShoppingCartId(
        assertNotEmptyString(request.params.clientId),
      );
      const productId = assertNotEmptyString(request.body.productId);

      const command: AddProductItemToShoppingCart = {
        type: 'AddProductItemToShoppingCart',
        data: {
          shoppingCartId,
          productItem: {
            productId,
            quantity: assertPositiveNumber(request.body.quantity),
            unitPrice: await getUnitPrice(productId),
          },
        },
      };

      // 2. Handle command
      await commandSender.send(command, state));

      // 3. Send response status
      response.sendStatus(204);
    },
  );
}
```

If I have more than one entry point, e.g., event (as it always can/should have more than one recipient) or command that may come from messaging tooling and API, then the command bus is useful, as it allows me to build common middleware.

The downside of the message bus is that it can create another level of indirection, making it hard to understand where the handler is, what the impact of the change is, etc.

Also, it doesn't give proper delivery guarantees unless we wrap the whole processing in transactions, which can cause deadlocks and other types of complexity.

**That's why I'm not using it everywhere, but where I need it.** I evolved from the message bus all the things. But it still can be useful, especially for event publishing, where, by nature, you don't want to know how it'll be handled as an event producer.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

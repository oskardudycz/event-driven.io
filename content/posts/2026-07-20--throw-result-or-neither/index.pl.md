---
title: On swimming, learning and my journey to being the last one
category: "Event Sourcing"
cover: 2026-07-20-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

![cover](./2026-07-20-cover.jpg)

**There is one question I keep getting about my event-sourced code: why don’t I use** `Result`**?**

It usually comes after someone sees a decision throwing an exception. They would put the failure in a `Result`, leave `try/catch` at the application boundary, and make the distinction explicit in the return type. That is a fair question, but the return type is only part of the answer.

**I don’t mind using exceptions. I also return business failures as events.** Which one I choose depends on what the failure means and what the application needs to do with it. What’s more, I don’t mind Result either, as long as I’m using a language where it’s a native and idiomatic way to use it. Stil…

**Some failures are worth retaining as business data.** An out-of-stock request can contribute to an unmet-demand report. A declined payment can start another process or be grouped by its reason. An item limit can explain why customers abandon an operation.

Gojko Adzic calls the systematic use of unexpected or marginal usage patterns to improve a product **[lizard optimization](https://www.architecture-weekly.com/p/webinar-23-gojko-adzic-on-designing)**. Repeated out-of-stock requests can reveal demand we do not serve or a user experience that encourages impossible quantities. Turning every attempt into only a response or an exception log makes that pattern harder to find. An event gives the application data it can query, project, and use in another process.

Event Sourcing can help take advantage of unwanted and unexpected failures. We can model negative outcomes as events, just like regular ones. Our business logic informs us of what happened, not whether it’s a success or an error. It’s just an outcome of our decision.

So essentially we’re getting three options to deal with an unexpected scenario.

- throw an error (e.g. `OutOfStockError)` and catch it at the boundary;
- return a `Result` with the failure on its error track;
- return an event (e.g. `ProductItemOutOfStock`) and decide separately what we do with it.
    

Having that, my answer is rarely “just throw” or “just return `Result`.” Before choosing either, I need to know what should be persisted, what the caller should receive, and whether the failure belongs in the application’s exception path.

## **An error as a business fact**

Let’s say that the customer asked for a quantity we cannot supply. Recording that outcome can be useful even though the cart did not change. The cart may also reach its item limit or fail payment authorisation. These are expected business outcomes, and the decision can describe each one with a distinct event:

```typescript
const addProductItem = (
  command: AddProductItem,
  state: ShoppingCart,
): ProductItemAdded | ProductItemOutOfStock | ShoppingCartItemLimitReached => {
  if (state.status === "Confirmed")
    throw new IllegalStateError(
      "Cannot add a product to a confirmed shopping cart",
    );

  const { shoppingCartId, productItem, availableQuantity, maximumItems, now } =
    command.data;

  if (productItem.quantity > availableQuantity)
    return {
      type: "ProductItemOutOfStock",
      data: {
        shoppingCartId,
        productId: productItem.productId,
        requestedQuantity: productItem.quantity,
        availableQuantity,
        attemptedAt: now,
      },
    };

  if (state.productItems.length >= maximumItems)
    return {
      type: "ShoppingCartItemLimitReached",
      data: {
        maximumItems,
        requestedProductId: productItem.productId,
      },
    };

  return {
    type: "ProductItemAdded",
    data: { shoppingCartId, productItem },
  };
};
```

`ProductItemOutOfStock` carries the requested and available quantities. `ShoppingCartItemLimitReached` carries the configured limit and the product that crossed it.

We could also model a single `ProductItemAddingFailed` event instead. It could have a `reason` string, but then we’d use the granularity and precision of the information. With distinct event types, a projection, workflow, endpoint, or test can check the relevant outcome directly.

What’s more, we could also add a FailedToAddProductToClosedShoppingCart and get rid of throwing entirely. We’ll get to that, but for now…

## **Broken rules can throw**

Not every failure needs a business event. A confirmed cart can no longer be modified, so `AddProductItem` is not a valid operation for that state. A command without required data is invalid as well. An unavailable event store, a stock-service timeout, or a serialisation error means the operation could not be completed reliably. I use exceptions for these cases.

The throw happens before an event is returned, so the handler has nothing to append. The exception retains its stack and reaches the application’s error boundary.

Some people prefer to use Result and hope for deterministic decision-making. Still, in most popular dev environments (TypeScript, Java, C#, Python, etc.), we can get exceptions. Even in strongly-typed Rust, we can get a panic or other cases. In the presented code `loadShoppingCart` can reject because of data unavailability, `appendToStream` can report a concurrency or connection error, and base code library code can throw on a random, stupid null pointer. The application still needs an error boundary somewhere:

```typescript
try {
  const result = await handleAddProductItem(command);
  return mapResultToResponse(result);
} catch (error) {
  return mapToErrorResponse(error);
}
```

That boundary might be inside WebAPI route, a message handler callback, or wrapped with a conventional error middleware. The remaining choice is whether expected business outcomes should use the same path.

## **What** `Result` **would add**

`Result` puts the success value and the expected failures on separate branches, visible in the type like:

```typescript
type Result<Success, Failure> =
  | { success: true; value: Success }
  | { success: false; error: Failure };
```

The cart decision becomes:

```typescript
type AddProductItemFailure =
  | ProductItemOutOfStock
  | ShoppingCartItemLimitReached;

const addProductItem = (
  command: AddProductItem,
  state: ShoppingCart,
): Result<ProductItemAdded, AddProductItemFailure> => {
  const { shoppingCartId, productItem, availableQuantity, maximumItems, now } =
    command.data;

  if (productItem.quantity > availableQuantity)
    return {
      success: false,
      error: {
        type: "ProductItemOutOfStock",
        data: {
          shoppingCartId,
          productId: productItem.productId,
          requestedQuantity: productItem.quantity,
          availableQuantity,
          attemptedAt: now,
        },
      },
    };

  if (state.productItems.length >= maximumItems)
    return {
      success: false,
      error: {
        type: "ShoppingCartItemLimitReached",
        data: {
          maximumItems,
          requestedProductId: productItem.productId,
        },
      },
    };

  return {
    success: true,
    value: {
      type: "ProductItemAdded",
      data: { shoppingCartId, productItem },
    },
  };
};
```

Technically it looks more or less the same: `ProductItemAdded` is returned on the success branch, while the other two errors are returned on the failure branch. The caller checks the branch before returning the event. In this application, adding the product changes the cart and produces a 204 response. Running out of stock or exceeding the limit leaves the cart unchanged and produces a 409 response. The handler appends only the success value:

```typescript
const handleAddProductItem = async (
  command: AddProductItem,
): Promise<Result<ProductItemAdded, AddProductItemFailure>> => {
  const state = await loadShoppingCart(command.data.shoppingCartId);
  const result = addProductItem(command, state);

  if (result.success) 
    return PreconditionFailed();
  
  await eventStore.appendToStream(
    shoppingCartStreamName(command.data.shoppingCartId),
    [result.value],
  );

  return NoContent();
};
```

If we used event, it could look like that:

```typescript
const handleAddProductItem = async (
  command: AddProductItem,
): Promise<Result<ProductItemAdded, AddProductItemFailure>> => {
  const state = await loadShoppingCart(command.data.shoppingCartId);
  const event = addProductItem(command, state);

  if (event.type === "ProductItemOutOfStock" || event.type === "ShoppingCartItemLimitReached") 
    return PreconditionFailed();
  
  await eventStore.appendToStream(
    shoppingCartStreamName(command.data.shoppingCartId),
    [result.value],
  );

  return NoContent();
};
```

Both versions preserve the same three event types. `Result` adds a success-or-failure classification around them. Which can be fine, but if you look again at the sample, it’s still pretty easy to ignore the different consequences of the events. We’re just one check on success further from it.

I saw many codebases where people were just blindly muting all errors by default, getting no benefit from it, but just polluting the codebase. Also keeping in mind that they still need to wrap the codebase with try/catch and have a conventional mapping layer.

We can also see that the Result wrapper in our case doesn’t add much besides success/error classification. If we’d like to return different response status based on the _failure_ scenario, we’d need to add the same switch. So we’re not removing the decision; we’re just making it easier to ignore.  
  
Of course, many languages made it streamlined by adding pipe operator etc. Yet, again, many popular environments don’t have it. TypeScript has no pipe operator; the [TC39 proposal](https://github.com/tc39/proposal-pipeline-operator) is not (yet?) part of the language. Repeating the branch adds checks throughout the call chain; introducing a helper library adds vocabulary that is not native to the language. Those libraries are extremely noisy and require tribal knowledge and onboarding.

Scott Wlaschin, who popularised railway-oriented programming, [makes the same qualification](https://fsharpforfunandprofit.com/posts/against-railway-oriented-programming/): `Result` models expected alternatives, but it is not intended to wrap every function or replace exceptions.

**Same for events; we should always discuss with the business if this information is important for them and if they want to keep it.** We should also ask what should happen and if we can and should recover in our business application when this scenario happens.

`ProductItemAdded`, `ProductItemOutOfStock`, and `ShoppingCartItemLimitReached` just tell what has happened. Domain doesn’t need to care how the application handles it. It can mean failure for the current request and still be worth recording because a projection or workflow consumes it. Adding those rules to `Result` would move persistence concerns into the domain decision and add premature classification. When we change the behaviour in the application and record one of those scenarios, we would need to change domain code, even if business rules are the same. Just to formally move one case from failure to success.

Adding `Result` changes every calling layer without replacing the persistence rules, batch handling, or exception boundary. I do not see much of a gain here. Of course, a codebase that already uses `Result` as its error channel may judge it differently, especially when the alternatives are not events. Thus…

## **Returning an event doesn’t mean persisting it**

`ProductItemOutOfStock` might be needed after the request. Measuring unmet demand, suggesting alternatives, or showing failed attempts to support staff requires a durable event. Still, if our business doesn’t care about the fact and we just want to log it, or forward to the HTTP Response, then we may not need to record it. Appending it would retain data the application does not need. Omitting it from the decision would instead force the endpoint to reread the outcome.

For this example, the decision returns `ProductItemOutOfStock` to the caller and the stream remains unchanged. I call this **selective persistence**: the decision describes the outcome, while the application decides whether it should be durable.

Command Handling can be described by the following steps:

1.  **[Read events from the stream and build the state from them](/pl/how_to_get_the_current_entity_state_in_event_sourcing/)** (in other words _aggregate stream_).
    
2.  **Run the business logic using the command and the state.** Use the default (_initial_) state if the stream does not exist.
    
3.  **Append the result of the business logic (so events) at the end of the stream** from which you’ve read events. Use the read version (or the one provided by the user) for an [optimistic concurrency check](/pl/optimistic_concurrency_for_pessimistic_times/).
    

In a nutshell, we could generalise it as:

```typescript
function handleCommand<State, Command, Event>(
  eventStore: EventStore, 
  streamId: string,
  decide: (state: State) => Event[],
  evolve: (event: Event, state: State) => State,
  initialState: () => State,
  // 👇 See what I did here
  skipEvent?: (event: Event) => boolean
  ) {
  // 1. Get the state
  const { state, currentStreamVersion } = await eventStore.aggregateStream(streamName, {
    evolve,
    initialState,
  });

  // 2. Run business logic
  const events = decide(state);

  // 3. Filter out "failure" events 
  const eventsToAppend = skipEvent ? events.filter(skipEvent) : events;
  
  // 4. Append events
  const appendResult = await eventStore.appendToStream(streamName, [event], {
    expectedStreamVersion: currentStreamVersion,
  });

  // 5. Return result
  return {
    ...appendResult,
    events, // 👈 all events
    appendedEvents, // 👈 only those that were appended
    newState: evolve(aggregation.state, event),
  }
}
```

A command handler reads a stream, rebuilds its state, runs a decision, applies the produced events, and appends them with an optimistic concurrency check. [Emmett](https://github.com/event-driven-io/emmett) takes care of that flow. The application provides `evolve` to apply an event to state and `initialState` for a new stream.

We can pass `skipEvent` function that inspects the decision’s outcome before anything is appended. The decision still returns the same events; the function only changes how the handler treats them.

In Emmett, I allow it to encapsulate the Command Handler setup by:

```typescript
// 1. Command handler setup
const handle = CommandHandler<ShoppingCart, ShoppingCartEvent>({
  evolve,
  initialState,
  middleware: [
    skipOn(
      (event) => event.type === "ProductItemOutOfStock" 
        || event.type === "ShoppingCartItemLimitReached"
    ),
  ],
});

// 2. Usage
const result = handle(eventStore, shoppingCartId, addProductItem);
```

I think that this setup clearly shows that we’re separating the business logic from how the business logic handles that, by explicitly using `skipOn` middleware, we’re telling that when such an event happens, we don’t want to store it, but we’ll still return it in the result.

This gives us the option to still do e.g. error mapping to HTTP status as:

```typescript
import {
  Conflict,
  NoContent,
  on,
  ResponseFromEvents,
  toWeakETag,
} from "@event-driven-io/emmett-expressjs";

const addProductItemApi = (router: Router) =>
  router.post(
    "/shopping-carts/:shoppingCartId/product-items",
    on(async (request: AddProductItemRequest) => {
      const shoppingCartId = request.params.shoppingCartId;
      const productId = String(request.body.productId);
      const availableQuantity = await inventory.getAvailableQuantity(productId);

      const command = {
        type: "AddProductItem",
        data: {
          shoppingCartId,
          productItem: {
            productId,
            quantity: Number(request.body.quantity),
          },
          availableQuantity,
          maximumItems: shoppingCartPolicy.maximumItems,
          now: new Date(),
      },

      const { events, nextExpectedStreamVersion } = await handle(
        eventStore, 
        shoppingCartId, 
        (state) => addProductItem(state, command),
      );

      if(events.some(event => event.type !== "ProductItemAdded"))
        return PreconditionFailed();

      return NoContent({
        eTag: toWeakETag(result.nextExpectedStreamVersion),
      }),
  });
```

We could, of course, do more advanced error or status mapping by returning exact data, etc. But this example proves that we’re not losing anything compared to the Result scenario. The code is still pretty simple, as with throwing, but more explicit and straightforward.

## **Several decisions on one stream**

You may be wondering why I added middleware, which sounds poshy for a simple filtering. But let’s discuss one more scenario: a batch import from the external e-commerce system.

A batch import often contains records for many business objects. Passing the complete list of them to one command handler would be the wrong boundary here: each cart has its own stream and its own concurrency check.

A single imported record can still require several operations on one aggregate. Suppose the shop imports draft carts from an external sales channel. One import file contains many carts, while each cart record contains several product lines. The importer handles the records separately, but all lines from one record target the same shopping-cart stream.

The integration contract requires the imported cart to match the source record. If one line is unavailable or the record exceeds the cart limit, storing the remaining lines would create a partial cart that exists in neither system. The importer therefore translates the lines into commands, but we’d like to handle them as one atomic transaction.

We could map a line of items to the sequence of our business logic:

```typescript
const importCartCommands: AddProductItem[] = importedCart.productItems.map(
  (productItem) => {
    type: "AddProductItem",
    data: {
      shoppingCartId: importedCart.shoppingCartId,
      productItem,
      availableQuantity: stockByProductId[productItem.productId],
      maximumItems,
      now,
    },
  }),
);
```

And feed it into our command handler:

```typescript
const { events, nextExpectedStreamVersion } = await handle(
  eventStore, 
  shoppingCartId, 
  importCartCommands.map(command => (state) => addProductItem(state, command)),
);
```

Every command uses the existing `addProductItem` decision and sees the provisional state produced by the previous accepted line. That allows the cart-limit rule to work across the complete record. Persistence waits until every line has been accepted.

Implementing that directly requires holding accepted events in memory and using them to build the state for the next decision. Only after the last line has been accepted can the application append them together. Technically it’s the same command logic, just wrapped with foreach, as we now have a sequence of decisions instead of the single one.

If every line is accepted, the handler appends their events together to that cart stream.

What should happen if we encounter unwanted scenarios? So e.g. `ProductItemOutOfStock` or `ShoppingCartItemLimitReached`? Should we stop processing or continue? Let me be a consultant for a moment: It depends! Fine, but on what? On your business logic.

In our case, we probably wouldn’t want to stop adding product items if one of them was out of stock. Tho, we may decide that there’s no point in processing it further if we already reached the items limit.

How to do it? We’d need to define a mapping function with different possible outcomes.

```typescript
type MapDecision = <Event>(event: Event) => void | 'APPEND' | 'SKIP' | 'STOP' | 'REJECT';
```

Where:

- APPEND or no result - success, append this event,
- SKIP - ignore this outcome, don’t append it, but continue processing,
- STOP - ignore this outcome, stop processing and append only those that were already accepted,
- REJECT - reject the whole batch, even if there were some successful events.

The example could be defined for all shopping cart events not to need repeat it in all functions:

```javascript
const mapShoppingCartDecision = (event: ShoppingCartEvent) => {
  switch(event.type) {
    case "ProductItemOutOfStock":
      return "SKIP";
    case "ShoppingCartItemLimitReached":
      return "STOP";
    case "ShoppingCartWasAlreadyConfirmed":
      return "REJECT";    
  }
}
```

We could pass it to our command handler and decide what to do with our processing.

In Emmett, I wrapped it as:

```typescript
const handle = CommandHandler<ShoppingCart, ShoppingCartEvent>({
  evolve,
  initialState,
  middleware: [
    skipOn(
      (event) => event.type === "ProductItemOutOfStock",
    ),
    stopOn(
      (event) => event.type === "ShoppingCartItemLimitReached"
    ),
    rejectOn(
      (event) => event.type === "ShoppingCartWasAlreadyConfirmed"
    ),
  ],
});
```

Still, as you see, we’re building on top of our business logic. It remains the same; we’re just handling persistence, statuses, etc.

Returned events show which lines passed before the rejection and which event stopped the import. The importer can report that outcome against the source record and continue with the next cart, which has a different stream.

For one product, rejecting meant leaving the stream unchanged. For an imported cart, it also means discarding the accepted events produced earlier for the same record.

If every line is accepted, the handler appends their events together to that cart stream. If one decision returns `ProductItemOutOfStock` or `ShoppingCartItemLimitReached`, `result.events` contains the outcomes produced up to that point, the imported record makes no change to the cart, and later lines are not considered.

The import job can map those events to a record-level outcome. It can report the exact business issue to the source system and continue with the next cart:

```typescript
const validatedProductIds = result.events.flatMap((event) =>
  event.type === "ProductItemAdded" ? [event.data.productItem.productId] : [],
);

const failure = result.events.find(
  (event) =>
    event.type === "ProductItemOutOfStock" ||
    event.type === "ShoppingCartItemLimitReached",
);

const importOutcome = (() => {
  switch (failure?.type) {
    case "ProductItemOutOfStock":
      return {
        status: "WaitingForStock" as const,
        validatedProductIds,
        productId: failure.data.productId,
        requestedQuantity: failure.data.requestedQuantity,
        availableQuantity: failure.data.availableQuantity,
      };

    case "ShoppingCartItemLimitReached":
      return {
        status: "Rejected" as const,
        validatedProductIds,
        productId: failure.data.requestedProductId,
        maximumItems: failure.data.maximumItems,
      };

    default:
      return {
        status: "Imported" as const,
        importedProductIds: validatedProductIds,
        streamVersion: result.nextExpectedStreamVersion,
      };
  }
})();

await importStatusStore.record(importedCart.externalId, importOutcome);

switch (importOutcome.status) {
  case "Imported":
    await salesChannel.confirmImport(
      importedCart.externalId,
      importOutcome.streamVersion,
    );
    break;

  case "WaitingForStock":
    await pendingImports.waitForStock(
      importedCart.externalId,
      importOutcome.productId,
    );
    break;

  case "Rejected":
    await salesChannel.rejectImport(importedCart.externalId, {
      productId: importOutcome.productId,
      maximumItems: importOutcome.maximumItems,
    });
    break;
}
```

A saved-list restore uses different rules. Available products return to the cart, unavailable ones are reported, and reaching the cart limit ends the restore. Products added before either outcome remain valid, so this operation is not atomic.

The additions run in one call because every decision needs the cart state produced by the accepted products before it. Otherwise, each decision would evaluate the item limit against an outdated cart.

The loop stages and applies available products. It returns an unavailable product without staging it and continues. It also returns the item-limit event without staging it, then stops because the cart cannot accept another distinct product

And here we’re getting back to the essential question.

## So should we throw or not?

If we’re getting the request from our UI, we’re the authority, so throwing could be fine; we return the status information telling the computer says no. (Read more in [How to validate business logic](/pl/how_to_validate_business_logic/)).

Still, should we throw on an import scenario? Who’s the authority here? What we’re doing is internalising decisions that someone else already made and is just informing us about, or telling us to do our job based on this information.

So throwing is not a valid option here. The external system told us that its cart contains these product lines. That is true about the source system, but it does not mean our cart can accept them. The importer translates the external record into commands, and the returned events describe how our local model understood each line.

For an accepted record, the `ProductItemAdded` events identify the imported lines and the resulting stream version is recorded. If stock is missing, the importer records the checked lines and the missing quantity. It can continue with other records, then rebuild this cart’s commands with current availability after an inventory update. Retrying the unchanged commands immediately would only reproduce the same outcome. If the cart exceeds its item limit, waiting for stock cannot help; the source record needs correcting, so the importer marks it as rejected.

Of course we could still throw if this operation is synchronous and we want to give quick feedback to the caller. Still, typically, we run batch operations as a background process; also, to have proper resilience, you already saw above how much integration could happen during such an import. Services we integrate with can be unavailable, have transient issues, time out, etc.

Those failures enter the import job’s retry or dead-letter policy because there is no reliable business outcome to report yet. The returned events let the application choose between continuing, waiting for a relevant business change, and rejecting one record. Exceptions would just stop processing and not allow recovery and continue with next steps (Read more in [No, it can never happen!](/pl/no_it_can_never_happen/))

There can be various error cases also on our side.

If another request changes the cart before our append, [Emmett](https://github.com/event-driven-io/emmett) handles the concurrency conflict by loading the stream again and rerunning the decisions against its new state. Decision middleware runs again as well.

An out-of-stock import is not a concurrency conflict. The cart state did not become stale; the input said that only two items were available. Running the same command again still returns `ProductItemOutOfStock`. The importer waits for an inventory change and then builds a new command with the current availability.

A custom retry policy can inspect a completed attempt, but it runs after that attempt’s append phase. Retrying a result is safe only when nothing was appended, and useful only when state or input can change.

A decision and its middleware can therefore run several times during one handler call. Code that only reads the command and state can be rerun. Sending an email or charging a card inside that code would repeat the external effect. In these examples, required external data is fetched before invoking the handler and included in the command. Effects caused by appended events run later in processors, after persistence.

Middleware could also be useful for authorisation, logging, and measurements. Some of that work belongs around each decision; some should run only once for the complete handler call. Its position relative to the retry boundary determines whether it sees aggregate state and whether a retry repeats it:

```typescript
await beforeAll(input);

const result = await retry(async () => {
  const state = await aggregate(streamName);

  for (const decision of decisions) {
    await runWithDecisionMiddleware(decision, state);
  }

  return appendSelectedEvents();
});

await afterAll(result);

return result;
```

The callback before the retry boundary receives the complete input once. It can authorise the command batch without repeating that work after a concurrency conflict. State is not available yet because the stream has not been loaded.

Middleware inside the boundary receives each decision, and the state is rebuilt for the current attempt. A concurrency retry runs it again.

The callback after the boundary receives the final result once, after persistence. It can record measurements based on appended events or the new stream version. If it throws, already appended events remain committed. Validation belongs earlier; notifications that must be delivered need a durable handler or outbox.

## Never Throw in Asynchronous Handlers

As you see, message processing can end up being pretty complex. That’s also why we use Event-Driven Architecture, as it helps to make that explicit and reason about it.

The import we discussed could be (and probably should be) triggered by an event (e.g. through a webhook), as we’re informed that those items were already processed and we should just accept or ignore it. What has been seen cannot be unseen.

Whether throwing is safe depends on what sits above the code to catch it. As discussed, a command handler behind an HTTP endpoint, its usual home, has the request: a thrown error unwinds into a response.

Asynchronous handlers, the projections, reactors, and workflows that react to events, have nothing above them. A throw propagates up, stops the processor, and leaves later events unhandled. The endpoint is only the usual home, not a rule: a command handler run from a reactor loses the same safety net. Instead of throwing, we need to turn the problem into data, so return an event.

**A message handler can turn a declined shopping cart operation into a compensating workflow.** For instance, for `ProductItemOutOfStock` order more products from the producer. It can, of course, just skip a message that should not block processing, or stop without advancing further.

**The same for [read models](http://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/#idempotency).** A projection cannot prevent the source event from being recorded because that event is already in the stream. Throwing only prevents the read model from advancing. If an event carries a value the read model did not expect, throwing does not undo it. The check that should have stopped it belongs in the business logic, before the event was ever recorded; by the time the projection runs, it is too late.

It builds a read model from events that are already recorded, and a recorded event is a fact: the projection only interprets it, so it has nothing to reject. If an event carries a value the read model did not expect, throwing does not undo it. The check that should have stopped it belongs in the business logic, before the event was ever recorded; by the time the projection runs, it is too late.

So accept the event and build the best read model you can from it. Skip a duplicate, fall back to a default, clamp a value back into range, whatever keeps the read model sensible and moving. Its error handling must account for delivery and recovery rather than reuse the rules of a command decision.

## **Conclusion**

The decision returns `ProductItemAdded`, `ProductItemOutOfStock`, or `ShoppingCartItemLimitReached` because the application needs to know which one happened. Out of stock is an unfavourable outcome, but that alone says nothing about storage. During an import it cancels the current source record. During a saved-list restore it is skipped while earlier additions remain. At the HTTP endpoint it becomes a conflict response. The event stays the same; its handling depends on the use case.

I do not try to remove exceptions from this design. Adding a product to a confirmed cart is an invalid operation. An unavailable event store prevents the handler from producing a reliable result. Both go to the application’s error boundary.

`Result` could label some of the returned events as failures, but persistence, continuation, and retry still need their own decisions. The exception path remains as well. The event types already distinguish the business outcomes, so I prefer to leave them as they are.

**So when someone asks me whether they should throw an error or use a** `Result` **type, I sometimes tell: actually, you can do neither.**

Cheers!

Oskar

p.s. if you liked this one, check also:

- [Idempotent Command Handling](/pl/idempotent_command_handling/)
- [Against Railway-Oriented Programming](https://fsharpforfunandprofit.com/posts/against-railway-oriented-programming/) by Scott Wlaschin
- [Emmett: Error Handling](https://file+.vscode-resource.vscode-cdn.net/home/oskar/Repos/emmett/src/docs/guides/error-handling.md)
- [Emmett: Command Handling](https://file+.vscode-resource.vscode-cdn.net/home/oskar/Repos/emmett/src/docs/guides/command-handling.md)

**p.s.2. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).

---
title: Prototyping, an underestimated design skill
category: "Event Sourcing"
cover: 2023-08-25-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-08-25-cover.png)

**Coding is an underestimated part of the design.** When we think about the design, we immediately fall to whiteboard diagrams, sticky notes, or endless discussions. That's fine and one way of doing things, but we should do more - prototyping and working with code during the design phase. I mentioned last time that we [don't need to fall into Test-Driven Development or Behaviour-Driven Design immediately](/pl/behaviour_driven_design_is_not_about_tests/). I showed before my approach to [composing business logic](/pl/how_to_effectively_compose_your_business_logic/); today, I'd like to expand on that.

**We'll use the following pieces in our recipe:**
- [Type-Driven Design](https://www.youtube.com/watch?v=Up7LcbGZFuo)
- [Decider pattern](https://thinkbeforecoding.com/post/2021/12/17/functional-event-sourcing-decider)
- Event Sourcing
- and code that with C# and [Marten](https://martendb.io/).

**Why such ingredients?**

Type-Driven Design focuses on shaping our types in a way that doesn't allow unexpected scenarios to happen. _"Talk is cheap; show me the code."_ Sure, let's say that we initially modelled our class as:

```csharp
public record ShoppingCart(
    Guid Id,
    Guid ClientId,
    ShoppingCartStatus Status,
    PricedProductItem[] ProductItems,
    DateTime? ConfirmedAt = null,
    DateTime? CanceledAt = null
){
    public bool IsClosed => ShoppingCartStatus.Closed.HasFlag(Status);

   // (...)
}
```

That's quite fine, but it allows us to create _ShoppingCart_ with a cancelled date and pending status. Nothing stops us from creating instances with wrong values besides good will.

In our logic, we also need to constantly check all the fields, for instance, if the status is pending while adding a product item.

```csharp
static ProductItemAddedToShoppingCart Handle(
    AddProductItemToShoppingCart command,
    ShoppingCart shoppingCart
)
{
    var (cartId, pricedProductItem) = command;

    if (shoppingCart.IsClosed)
        throw new InvalidOperationException(
            $"Adding product item for cart in '{shoppingCart.Status}' status is not allowed.");

    return new ProductItemAddedToShoppingCart(
        cartId,
        pricedProductItem
    );
}
```

It's okay to copy and paste it around the methods for simple logic, as we have here. But still, it's easy to forget that, especially when our logic evolves.

**How could Type-Driven Design help us in that?**

Let's say that we have the following business rules:
- Add product items to the pending shopping cart,
- Remove product items from the pending shopping cart if they were added before. 
- Confirm pending shopping cart if it has products,
- Cancel pending shopping cart.

So effectively, our shopping cart is a state machine that can be:
- Empty - initial state,
- Pending - it was opened,
- Closed - either confirmed or cancelled. We can merge that into this state, as we don't have business logic differentiating those two states.

Let's show that in code:

```csharp
public record ShoppingCart
{
    public record Empty: ShoppingCart;

    public record Pending(
        (ProductId ProductId, int Quantity)[] ProductItems
    ): ShoppingCart
    {
        public bool HasEnough(PricedProductItem productItem) =>
            ProductItems
                .Where(pi => pi.ProductId == productItem.ProductId)
                .Sum(pi => pi.Quantity) >= productItem.Quantity.Value;

        public bool HasItems { get; } =
            ProductItems.Sum(pi => pi.Quantity) <= 0;
    }

    public record Closed: ShoppingCart;

    private ShoppingCart() { } // Not to allow inheritance

    public Guid Id { get; set; } // To make Marten happy
}
```

The syntax is a bit weird, and [I blame C# for that](/pl/union_types_in_csharp/). Yet, effectively, it does what we want - so, saying explicitly that a shopping cart can be one of those states.

Interestingly, we also get more expressive types, as we can have a different set of data and possible methods for each state.

At first glance, the code may look a bit oversimplified. I removed dates and flattened _ProductItem_ into a tuple. Yet, I just left what we need to run our business logic. For it, we need to know the state of the shopping cart and the product items quantity. Other data is required just for the read models, and we're now modelling only business logic. (Read more about that process in [Slim your aggregates with Event Sourcing!](/pl/slim_your_entities_with_event_sourcing/)).

**We achieved a code that's expressive and simple enough to demonstrate our requirements around consistency.**

**Now, let's define the behaviour we must handle for our shopping cart.** We can again use types for that:

```csharp
public abstract record ShoppingCartCommand
{
    public record Open(ShoppingCartId ShoppingCartId, ClientId ClientId, DateTimeOffset Now): ShoppingCartCommand;

    public record AddProductItem(ShoppingCartId ShoppingCartId, PricedProductItem ProductItem): ShoppingCartCommand;

    public record RemoveProductItem(ShoppingCartId ShoppingCartId, PricedProductItem ProductItem): ShoppingCartCommand;

    public record Confirm(ShoppingCartId ShoppingCartId, DateTimeOffset Now): ShoppingCartCommand;

    public record Cancel(ShoppingCartId ShoppingCartId, DateTimeOffset Now): ShoppingCartCommand;
}
```

Those are all commands with the data. As you see, I'm modelling time explicitly here. We can inject current time to command, making it easier to text and our logic more predictable and self-contained. Similarly, I assume that the product price will be on the application layer, and in command, we already have all the information about the product.

Let's now code the business logic:

```csharp
public static class ShoppingCartService
{
    public static Opened Handle(Open command) =>
        new Opened(command.ClientId, command.Now);

    public static ProductItemAdded Handle(AddProductItem command, Pending shoppingCart) =>
        new ProductItemAdded(command.ProductItem);

    public static ProductItemRemoved Handle(RemoveProductItem command, Pending shoppingCart) =>
        shoppingCart.HasEnough(command.ProductItem)
            ? new ProductItemRemoved(command.ProductItem)
            : throw new InvalidOperationException("Not enough product items to remove.");

    public static Confirmed Handle(Confirm command, Pending shoppingCart) =>
        shoppingCart.HasItems
            ? new Confirmed(DateTime.UtcNow)
            : throw new InvalidOperationException("Shopping cart is empty!");

    public static Canceled Handle(Cancel command, Pending shoppingCart) =>
        new Canceled(DateTime.UtcNow);

    private static Pending EnsureIsPending(this ShoppingCart shoppingCart) =>
        shoppingCart as Pending ?? throw new InvalidOperationException(
            $"Invalid operation for '{shoppingCart.GetType().Name}' shopping card.");
}
```

The business logic looks simple, and that's the goal! That's only possible because of the explicit types. Thanks to them, we removed a lot of redundant checks (e.g. around the status, etc.). We also use simple functions that take commands and current state returning events. 

Thanks to that, we keep all the data in events and don't need to repeat it in the domain model. That's the power of Event Sourcing. [Our current state is always ephemeral and built in memory from events](/pl/how_to_get_the_current_entity_state_in_event_sourcing/). Thus, as long we have all the information in events, we can shape our domain model to our needs. [This pattern also works for regular state](/pl/how_events_can_help_on_making_state_based_approach_efficient/).

Let's express now how to build the state from events by extending Shopping Cart class:

```csharp
public record ShoppingCart
{
    // (...)

    public ShoppingCart Apply(ShoppingCartEvent @event) =>
        @event switch
        {
            Opened =>
                new Pending(Array.Empty<(ProductId ProductId, int Quantity)>()),

            ProductItemAdded (var (productId, quantity, _)) =>
                this is Pending pending
                    ? pending with
                    {
                        ProductItems = pending.ProductItems
                            .Concat(new[] { (productId, quantity.Value) })
                            .ToArray()
                    }
                    : this,

            ProductItemRemoved (var (productId, quantity, _)) =>
                this is Pending pending
                    ? pending with
                    {
                        ProductItems = pending.ProductItems
                            .Concat(new[] { (productId, -quantity.Value) })
                            .ToArray()
                    }
                    : this,

            Confirmed =>
                this is Pending ? new Closed() : this,

            Canceled =>
                this is Pending ? new Closed() : this,

            _ => this
        };
}

public abstract record ShoppingCartEvent
{
    public record Opened(ClientId ClientId, DateTimeOffset OpenedAt): ShoppingCartEvent;

    public record ProductItemAdded(PricedProductItem ProductItem): ShoppingCartEvent;

    public record ProductItemRemoved(PricedProductItem ProductItem): ShoppingCartEvent;

    public record Confirmed(DateTimeOffset ConfirmedAt): ShoppingCartEvent;

    public record Canceled(DateTimeOffset CanceledAt): ShoppingCartEvent;
}
```

Such a method also works as the documentation for state transition. Isn't that neat?

It is, but still, when we get our shopping cart from events and want to run the business logic on it, we need to ensure that it's in the expected state.

**To do it, let's define a general _Decide_ method that takes command and state and makes a decision respecting our defined types.**

```csharp
public static class ShoppingCartService
{
    public static ShoppingCartEvent Decide(
        ShoppingCartCommand command,
        ShoppingCart state
    ) =>
        command switch
        {
            Open open => Handle(open),
            AddProductItem addProduct => Handle(addProduct, state.EnsureIsPending()),
            RemoveProductItem removeProduct => Handle(removeProduct, state.EnsureIsPending()),
            Confirm confirm => Handle(confirm, state.EnsureIsPending()),
            Cancel cancel => Handle(cancel, state.EnsureIsPending()),
            _ => throw new InvalidOperationException($"Cannot handle {command.GetType().Name} command")
        };

    private static Pending EnsureIsPending(this ShoppingCart shoppingCart) =>
        shoppingCart as Pending ?? throw new InvalidOperationException(
            $"Invalid operation for '{shoppingCart.GetType().Name}' shopping card.");

    // (...)
}
```

Now, if we're using Marten, then we can generalise our decision processing to:

```csharp
public static class DocumentSessionExtensions
{
    public static Task Decide<TEntity, TCommand, TEvent>(
        this IDocumentSession session,
        Func<TCommand, TEntity, TEvent[]> decide,
        Func<TEntity> getDefault,
        Guid streamId,
        TCommand command,
        CancellationToken ct = default
    ) where TEntity : class =>
        session.Events.WriteToAggregate<TEntity>(streamId, stream =>
            stream.AppendMany(decide(command, stream.Aggregate ?? getDefault()).Cast<object>().ToArray()), ct);
}
```

We're using the [WriteToAggregate](https://martendb.io/scenarios/command_handler_workflow.html#writetoaggregate) method that loads the current state from events using defined earlier _Apply_ method. It allows encapsulating command handling logic.

We can use it to define processing for Shopping Cart:

```csharp
public static class ShoppingCartDocumentSessionExtensions
{
    public static Task Decide(
        this IDocumentSession session,
        ShoppingCartId streamId,
        ShoppingCartCommand command,
        CancellationToken ct = default
    ) =>
        session.Decide<ShoppingCart, ShoppingCartCommand, ShoppingCartEvent>(
            (c, s) => new[] { ShoppingCartService.Decide(c, s) },
            () => new Empty(),
            streamId.Value,
            command,
            ct
        );
}
```

We can use it then in our application code (e.g. controller method or endpoint):

```csharp
await documentSession.Decide(
    shoppingCartId,
    command,
    CancellationToken.None
);
```

Thanks to the Type-Driven Design, we're getting expressiveness and simplicity. From Event Sourcing, we're sprinkling it with a focus on business. Decider helps to compose that, and Marten makes it real.


We're [stacking the bricks](/pl/stacking_the_bricks/) and gradually building our code from smaller, composable building blocks. That lets us focus on the design and get faster feedback loops thanks to faster prototyping with real software.

See the full code in my [sample repo](https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Workshops/IntroductionToEventSourcing/Solved/08-BusinessLogic.Marten/Immutable/Solution3).

I also showed how you can do it similarly in:
- [Java](/pl/how_to_effectively_compose_your_business_logic/)
- [TypeScript](/pl/type_script_node_Js_event_sourcing/)
- [F#](/pl/writing_and_testing_business_logic_in_fsharp/)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
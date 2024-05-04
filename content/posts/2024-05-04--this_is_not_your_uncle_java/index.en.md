---
title: This is not your uncle's Java! Modelling with Java 22 records pattern matching in practice
category: "Java"
cover: 2024-05-04-cover.png
author: oskar dudycz
---

![](2024-05-04-cover.png)

**I like learning new things. It stimulates my creativity, helps me gain diverse perspectives, and helps me be humble.** When you're a notorious debutant, you learn to appreciate small stuff and simplicity, the [power of ignorance](/en/power_of_ignorance/). It shows that if you're down the rabbit hole, then this works both ways. Not many people could go the same way, but it also takes time to get out of that and embrace the outside world.

Still, I not only like to scratch the surface but also learn idiomatic ways and check how far I can go. Some time ago, [I got back to doing more Java](/en/12_things_I_learned_on_last_pull_request_review/), and it was a good move. This is not only because it appears that many of my clients after I went solo, are from JVM land but also because the language is changing rapidly. And those changes are made quickly and with a proper dose of consideration. I like reading JDK Enhancements Proposals. Even if you don't like Java, they're written in a really accessible way, so it's worth reading them to learn more about decision-making and see how languages and environments are evolving.

**This is not your uncle's Java anymore!**

If you're a frequent reader of my blog, you may have noticed that I use the Shopping Cart example frequently. And that's intentional; I think it's worth not doing it all at once. If I'm learning new technical aspects, I wouldn't like to crunch the business domain simultaneously. That also works the other way; it's safer to use a boring tech stack if I'm diving into a new domain. That reduces cognitive load.

**In my opinion, one of the best ways to learn a new technology or language is to have some sort of [Kata](https://en.wikipedia.org/wiki/Kata).** So, the topic we discussed many times is that we don't need to think about mechanics. For me, Kata is a shopping cart. It's straightforward enough, so I don't need to think too much about the domain, but it shows the common cases that can happen during implementation (consistency, concurrency, nested data, integration with other flows). It allows me to [dive a bit deeper](/en/dive_a_bit_deeper_look_a_bit_wider/) if I'd like to, e.g. to analyse integrations with other components, high traffic during Black Friday etc.

Still, getting back to not-your-uncle Java. Let's discuss the latest records and pattern-matching enhancements added in Java 22. As mentioned, we'll use my event-sourced shopping cart Kata. Please check [How to effectively compose your business logic](/en/how_to_effectively_compose_your_business_logic/) if you want to learn more about the domain.

Let's start this time with the end result and then explain what actually happened.

```java
public class ShoppingCartDecider {
  public static ShoppingCart.Event decide(Command command, ShoppingCart state) {
    return switch (on(state, command)) {
      case On(Initial _, Open(var id, var clientId, var now)) ->
        new Opened(id, clientId, now);

      case On(
        Pending _,
        AddProductItem(var id, var productItem, var now)
      ) -> new ProductItemAdded(id, productItem, now);

      case On(
        Pending(var productItems),
        RemoveProductItem(var id, var productItem, var now)
      ) -> {
        if (!productItems.hasEnough(productItem))
          throw new IllegalStateException("Not enough product items to remove");

        yield new ProductItemRemoved(id, productItem, now);
      }

      case On(Pending _, Confirm(var id, var now)) ->
        new Confirmed(id, now);

      case On(Pending _, Cancel(var id, var now)) ->
        new Canceled(id, now);

      default -> throw new IllegalStateException(
        String.format("Cannot %s on %s", command.getClass().getName(), state.getClass().getName())
      );
    };
  }
}
```

**This method is responsible for making business decisions on our shopping cart.** We can:
- open a new shopping cart (if it wasn't already opened),
- add product item to not closed (so not confirmed or cancelled) shopping cart,
- remove products if we added them already,
- confirm or cancel the pending cart.

Our function takes the current state and the command representing our intention. Both of them are immutable objects defined as union types.

Shopping Cart can be represented by the following states:

```java
public sealed interface ShoppingCart {
  record Initial() implements ShoppingCart {
  }

  record Pending(ProductItems ProductItems) implements ShoppingCart {
  }

  record Closed() implements ShoppingCart {
  }
}
```

**I'm using [sealed interface](https://openjdk.org/jeps/409) here, which allows me to say that only those three states can represent Shopping Carts.** What's more, that's also an enabler for advanced pattern matching. Notice that states contain only information that's needed for the business logic. To make it more focused, we're _outsourcing_ the logic to _ProductItems_ value object, which is defined as:

```java
public class ProductItems {
  Map<String, Integer> values;

  private ProductItems(Map<String, Integer> values) {
    this.values = values;
  }

  public static ProductItems empty() {
    return new ProductItems(new HashMap<>());
  }

  public ProductItems add(PricedProductItem productItem) {
    var newValues = new HashMap<>(values);

    newValues.compute(key((productItem)), (_, currentQuantity) ->
      Optional.ofNullable(currentQuantity).orElse(0) + productItem.quantity
    );

    return new ProductItems(newValues);
  }

  public ProductItems remove(PricedProductItem productItem) {
    var newValues = new HashMap<>(values);

    newValues.compute(key((productItem)), (_, currentQuantity) ->
      Optional.ofNullable(currentQuantity).orElse(0) - productItem.quantity
    );

    return new ProductItems(newValues);
  }

  public boolean hasEnough(PricedProductItem productItem) {
    var currentQuantity = values.getOrDefault(key(productItem), 0);

    return currentQuantity >= productItem.quantity();
  }


  private static String key(PricedProductItem pricedProductItem) {
    return String.format("%s_%s", pricedProductItem.productId, pricedProductItem.unitPrice());
  }

  public record PricedProductItem(
    UUID productId,
    int quantity,
    double unitPrice
  ) {
  }
}
```

It's also an immutable object but modelled as a class not to expose internal information. Product Item is represented by its product id and unit price. We can have the same product at different prices (e.g., some have a discount applied). To simplify business logic, we don't need to maintain a list of objects; it's fine to use a map where the key is the identifier built from product id unit price, and value quantity. We allow negative quantity to simplify processing, as we'll check that in the business logic through the exposed _hasEnough_ method.

Speaking about the business logic, we can define the API as the following set of commands:

```java
public class ShoppingCartDecider {
  public sealed interface Command {
    record Open(
      UUID shoppingCartId,
      UUID clientId,
      OffsetDateTime now
    ) implements Command {
    }

    record AddProductItem(
      UUID shoppingCartId,
      PricedProductItem productItem,
      OffsetDateTime now
    ) implements Command {
    }

    record RemoveProductItem(
      UUID shoppingCartId,
      PricedProductItem productItem,
      OffsetDateTime now
    ) implements Command {
    }

    record Confirm(
      UUID shoppingCartId,
      OffsetDateTime now
    ) implements Command {
    }

    record Cancel(
      UUID shoppingCartId,
      OffsetDateTime now
    ) implements Command {
    }
  }
}
```

**I define the Command type without prefix, as having it nested gives enough information about the context.** That's also why I don't use suffixes like _CancelShoppingCart_ but just name it _Cancel_.

In Event Sourcing outcome of the business logic is event or set of events, let's define them. We can do it accordingly to commands, and put them inside Shopping Cart class, as they're strictly related to shopping cart lifetime.

```java
public sealed interface ShoppingCart {
  // (...)

  sealed interface Event {
    record Opened(
      UUID shoppingCartId,
      UUID clientId,
      OffsetDateTime openedAt
    ) implements Event {
    }

    record ProductItemAdded(
      UUID shoppingCartId,
      ProductItems.PricedProductItem productItem,
      OffsetDateTime addedAt
    ) implements Event {
    }

    record ProductItemRemoved(
      UUID shoppingCartId,
      ProductItems.PricedProductItem productItem,
      OffsetDateTime removedAt
    ) implements Event {
    }

    record Confirmed(
      UUID shoppingCartId,
      OffsetDateTime confirmedAt
    ) implements Event {
    }

    record Canceled(
      UUID shoppingCartId,
      OffsetDateTime canceledAt
    ) implements Event {
    }
  }
}
```

Each event is appended to the stream. An event stream is a history of the record. It keeps all results (facts) of what has happened. It can look as follow:

```
Id: "shopping_cart-1294f9"

Events:
1. Opened
2. ProductItemAdded
3. ProductItemRemoved
4. ProductItemAdded
5. Confirmed
```

When we want to run the next decision, we need to build the current state from events. We read all of them and apply them one after another, evolving the state into its final form. You can do it the following way:

```java
ShoppingCart getShoppingCart(Event[] events) {
  ShoppingCart state = new Initial();
    
  for (var event : events) {
    state = evolve(state, event);
  }
  return state;
}
```

What would the evolve function look like? Similarly to the _decide_ presented first:

```java
public sealed interface ShoppingCart {
  // (...)

static ShoppingCart evolve(ShoppingCart state, Event event) {
    return switch (when(state, event)) {
      case When(Initial _, Opened _) ->
        new Pending(ProductItems.empty());

      case When(
        Pending(var productItems),
        ProductItemAdded(_, var productItem, _)
      ) -> new Pending(productItems.add(productItem));

      case When(
        Pending(var productItems),
        ProductItemRemoved(_, var productItem, _)
      ) -> new Pending(productItems.remove(productItem));

      case When(Pending _, Confirmed _),
           When(Pending _, Canceled _) -> new Closed();

      default -> state;
    };
  }
```

We're defining the expected state transitions/evolutions; we just return the state for other cases. Why am I not throwing an exception here? Read more in [Should you throw an exception when rebuilding the state from events?](/en/should_you_throw_exception_when_rebuilding_state_from_events/).

And let's stop here and explain a few stuff.

What's actually this code?

```java
switch (when(state, event)) {
   // (...)
}
```

**In Java 22, you can do pattern matching on records, yet the switch can take just a single object; here, we'd like to get the permutations of the potential state and events evolving them.** Java doesn't have tuples like e.g. [C#](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples) or [TypeScript](https://blog.logrocket.com/exploring-use-cases-typescript-tuples/). You need to be explicit and define dedicated types. From what I heard recently from Brian Goetz, that's intentional. See more:

`youtube: https://www.youtube.com/watch?v=bKwzONOGLxs`

So, let's define some explicit records to use them in switch!

```java
public class FunctionalTools {
  public static <State, Event> When<State, Event> when(State state, Event event){
    return new When<>(state, event);
  }

  public static <State, Event> On<State, Event> on(State state, Event event){
    return new On<>(state, event);
  }

  public record When<State, Event>(State state, Event event) {
  }

  public record On<State, Command>(State state, Command command) {
  }
}
```

As you see, those records are just wrappers for the values. They're explicit and named to be a bit more readable in the intended usage. I also added some helper factory functions to reduce the noise of generic record setup in the end usage.

Now, we can use the fabulous feature which is static import, e.g.

```java
import static FunctionalTools.When;
import static FunctionalTools.when;
```

Et voilà! Now, we can use it in the switch statement like:

```java
switch (when(state, event)) {
  // (...)
  case When(
    Pending(var productItems),
    ProductItemAdded(_, var productItem, _)
  ) -> new Pending(productItems.add(productItem));
}
```

This means we're creating a _When_ record using the _when_ function from state and event. Then we can destructure it and say that having _When_ record with the first property of type Pending (in other words, pending shopping cart) and the second parameter of type _ProductItemAdded_ (applying this event on the pending state), we should run the following code. In this case, return the new Pending shopping cart with the added product item.

**What's more, this type of check is exhaustive, so if we don't provide a default case, the compiler will tell you that you didn't provide all permutations!**

As you see, a bit of explicit code and intentional design can create a straightforward, declarative definition of our code. Much shorter than the imperative one. Of course we should be careful not to make it cryptic. The intention is to have explicit business logic, not sneaky, smart code.

Let's show the final code again. Decider, for running business logic:

```java
public class ShoppingCartDecider {
  public sealed interface Command {
    record Open(
      UUID shoppingCartId,
      UUID clientId,
      OffsetDateTime now
    ) implements Command {
    }

    record AddProductItem(
      UUID shoppingCartId,
      PricedProductItem productItem,
      OffsetDateTime now
    ) implements Command {
    }

    record RemoveProductItem(
      UUID shoppingCartId,
      PricedProductItem productItem,
      OffsetDateTime now
    ) implements Command {
    }

    record Confirm(
      UUID shoppingCartId,
      OffsetDateTime now
    ) implements Command {
    }

    record Cancel(
      UUID shoppingCartId,
      OffsetDateTime now
    ) implements Command {
    }
  }

  public static ShoppingCart.Event decide(Command command, ShoppingCart state) {
    return switch (on(state, command)) {
      case On(Initial _, Open(var id, var clientId, var now)) ->
        new Opened(id, clientId, now);

      case On(
        Pending _,
        AddProductItem(var id, var productItem, var now)
      ) -> new ProductItemAdded(id, productItem, now);

      case On(
        Pending(var productItems),
        RemoveProductItem(var id, var productItem, var now)
      ) -> {
        if (!productItems.hasEnough(productItem))
          throw new IllegalStateException("Not enough product items to remove");

        yield new ProductItemRemoved(id, productItem, now);
      }

      case On(Pending _, Confirm(var id, var now)) ->
        new Confirmed(id, now);

      case On(Pending _, Cancel(var id, var now)) ->
        new Canceled(id, now);

      default -> throw new IllegalStateException(
        String.format("Cannot %s on %s", command.getClass().getName(), state.getClass().getName())
      );
    };
  }
}
```

And shopping cart defining our state and its evolution:

```java
public sealed interface ShoppingCart {
  record Initial() implements ShoppingCart {
  }

  record Pending(ProductItems ProductItems) implements ShoppingCart {
  }

  record Closed() implements ShoppingCart {

  }

  sealed interface Event {
    record Opened(
      UUID shoppingCartId,
      UUID clientId,
      OffsetDateTime openedAt
    ) implements Event {
    }

    record ProductItemAdded(
      UUID shoppingCartId,
      ProductItems.PricedProductItem productItem,
      OffsetDateTime addedAt
    ) implements Event {
    }

    record ProductItemRemoved(
      UUID shoppingCartId,
      ProductItems.PricedProductItem productItem,
      OffsetDateTime removedAt
    ) implements Event {
    }

    record Confirmed(
      UUID shoppingCartId,
      OffsetDateTime confirmedAt
    ) implements Event {
    }

    record Canceled(
      UUID shoppingCartId,
      OffsetDateTime canceledAt
    ) implements Event {
    }
  }

  static  ShoppingCart getShoppingCart(Event[] events) {
    ShoppingCart state = new Initial();

    for (var event : events) {
      state = evolve(state, event);
    }
    return state;
  }

  static ShoppingCart evolve(ShoppingCart state, Event event) {
    return switch (when(state, event)) {
      case When(Initial _, Opened _) ->
        new Pending(ProductItems.empty());

      case When(
        Pending(var productItems),
        ProductItemAdded(_, var productItem, _)
      ) -> new Pending(productItems.add(productItem));

      case When(
        Pending(var productItems),
        ProductItemRemoved(_, var productItem, _)
      ) -> new Pending(productItems.remove(productItem));

      case When(Pending _, Confirmed _),
           When(Pending _, Canceled _) -> new Closed();

      default -> state;
    };
  }
}
```

I encourage you to play with those features. They can be super useful not only for Event Sourcing but also for domain modelling in general.

**One of the possible options is to go through my recently updated Event Sourcing self-paced kit. See more in [my repository](https://github.com/oskardudycz/EventSourcing.JVM/tree/main/workshops/introduction-to-event-sourcing). Or maybe doing a [full workshop with me](https://event-driven.io/en/training/).**

Yay or nay?

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

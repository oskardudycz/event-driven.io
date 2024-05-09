---
title: How to write a left-fold streams collector in Java
category: "Java"
cover: 2024-05-09-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-05-09-cover.png)

**[Last week, we covered the latest improvements to Java 22 around pattern matching and records.](/pl/this_is_not_your_uncle_java/)** They enable explicit business logic modelling, making it concise and guarded by the compiler. As usual, I put it into the context of Event Sourcing.

We ended it with two functions. First one evolveing the state based on the event:

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

The other taking an array of events into the final state:

```java
public sealed interface ShoppingCart {
  record Initial() implements ShoppingCart {
  }

  record Pending(ProductItems ProductItems) implements ShoppingCart {
  }

  record Closed() implements ShoppingCart {

  }

  static  ShoppingCart getShoppingCart(Event[] events) {
    ShoppingCart state = new Initial();

    for (var event : events) {
      state = evolve(state, event);
    }
    return state;
  }
  // (...)
}
```

Essentially, we're:
1. Reading the list of events.
2. Creating the initial state.
3. We're evolving the new state by applying the events to the current state for each event.
4. We repeat that for each event, getting the final state.

**This process is called Left Fold/Aggregation/Reduce (depending on who phrase it).**

That's fine, but some hip kids don't like to create such functions for each state. Cool kids of Java like streams. At least, that's what I heard. Wanna be like them?

Wouldn't it be nice if we could do something like:

```java
public sealed interface ShoppingCartService {
  // (...)
  static ShoppingCart getShoppingCart(EventStore eventStore, UUID shoppingCartId) {
    var events = eventStore.readStream(ShoppingCart.Event.class, shoppingCartId);

    return events.stream()
      .collect(foldLeft(ShoppingCart.Initial::new, ShoppingCart::evolve));
  }
}
```

That's possible but not as easy as it seems. There is no left-fold collector that'd aggregate values on top of the element (state) respecting the order. You can't use standard Java Stream collectors like _Collectors.toList()_ or _Collectors.toMap()_ for this. Streams API is built to enable both parallel and sequential processing, and that's great for reactive processing but not great for our case, where we don't need to parallelize that but just iterate the aggregating state. Knowing that we can simplify the processing, but to do that, we still need to go custom. 

Let's try, then and build a custom stream collector! Being a cool kid is not only about perks; it also requires some work upfront!

Let's see first the whole implementation and tackle its pieces one by one:

```java
public class FoldLeft<Entity, Event> implements Collector<Event, AtomicReference<Entity>, Entity> {
  private final Supplier<Entity> getInitial;
  private final BiFunction<Entity, Event, Entity> evolve;

  public FoldLeft(Supplier<Entity> getInitial, BiFunction<Entity, Event, Entity> evolve) {
    this.getInitial = getInitial;
    this.evolve = evolve;
  }

  public static <Entity, Event> FoldLeft<Entity, Event> foldLeft(
    Supplier<Entity> getInitial,
    BiFunction<Entity, Event, Entity> evolve
  ) {
    return new FoldLeft<>(getInitial, evolve);
  }


  @Override
  public Supplier<AtomicReference<Entity>> supplier() {
    return () -> new AtomicReference<>(getInitial.get());
  }

  @Override
  public BiConsumer<AtomicReference<Entity>, Event> accumulator() {
    return (wrapper, event) -> wrapper.set(evolve.apply(wrapper.get(), event));
  }

  @Override
  public BinaryOperator<AtomicReference<Entity>> combiner() {
    return (left, right) -> {
      left.set(right.get());
      return left;
    };
  }

  @Override
  public Function<AtomicReference<Entity>, Entity> finisher() {
    return AtomicReference::get;
  }

  @Override
  public Set<Characteristics> characteristics() {
    return new HashSet<>();
  }
}
```

It's not that much code, but it still can be a bit confusing if that's the first time we're implementing a custom collector. That's fine, as we probably should not be doing that too often!

**The custom collector, you need the following ingredients:**
1. **Supplier:** Provides an initial value for the accumulation (an empty shopping cart in your case).
2. **Accumulator:** Applies an event to the current state of the shopping cart, evolving the state based on the event type.
3. **Combiner:** Merges two states, which is crucial for parallel processing. In our case, it's just a simple value replacement. We're saying that the evolved state is now the current accumulated one.
4. **Finisher:** Extracts the final state from the accumulator's container.
5. **Characteristics:** Provide hints to the implementation about the collector's characteristics, such as whether it is CONCURRENT or UNORDERED. In our case, we return an empty set, implying none of these characteristics are explicitly claimed.

We're starting by stating that we're defining the custom collector by implementing _Collector<Event, AtomicReference<Entity>, Entity>_

```java
public class FoldLeft<Entity, Event> implements Collector<Event, AtomicReference<Entity>, Entity> {
  // (...)
}
```

It means that our stream will contain values of _Event_ type and we're expecting instance of _Entity_ as a result. We'll be accumulating values to [AtomicReference<Entity>](https://www.baeldung.com/java-atomic-variables), ensuring that updates to the state are thread-safe, which is crucial if your stream processing might be parallelised.

Then, we're providing functions that will return the initial state and the way to evolve it based on events. I added a static method to make usage less verbose.

```java
private final Supplier<Entity> getInitial;
private final BiFunction<Entity, Event, Entity> evolve;

public FoldLeft(Supplier<Entity> getInitial, BiFunction<Entity, Event, Entity> evolve) {
  this.getInitial = getInitial;
  this.evolve = evolve;
}

public static <Entity, Event> FoldLeft<Entity, Event> foldLeft(
  Supplier<Entity> getInitial,
  BiFunction<Entity, Event, Entity> evolve
) {
  return new FoldLeft<>(getInitial, evolve);
}
```

Then, we're overriding all the methods. Supplier with the initial state.

```java
@Override
public Supplier<AtomicReference<Entity>> supplier() {
  return () -> new AtomicReference<>(getInitial.get());
}
```

Accumulator with a function how to evolve state:

```java
@Override
public BiConsumer<AtomicReference<Entity>, Event> accumulator() {
  return (wrapper, event) -> wrapper.set(evolve.apply(wrapper.get(), event));
}
```

Combiner that'll set the new (evolved) state value:

```java
@Override
public BinaryOperator<AtomicReference<Entity>> combiner() {
  return (left, right) -> {
    left.set(right.get());
    return left;
  };
}
```

Finisher returns the final value, taking the value from our atomic reference wrapper.

```java
@Override
public Function<AtomicReference<Entity>, Entity> finisher() {
  return AtomicReference::get;
}
```

And boom, we created our own reusable left-fold collector, which we can use elsewhere for different entity types or even not for Event Sourcing!

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

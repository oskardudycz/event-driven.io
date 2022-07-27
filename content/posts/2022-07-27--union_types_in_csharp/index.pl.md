---
title: Union types in C#
category: "Event Sourcing"
cover: 2022-07-27-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-07-27-cover.png)

In the article ["How to effectively compose your business logic"](/en/how_to_effectively_compose_your_business_logic/), I explained how explicit types definition can help in making our codebase closer to the business domain, also predictable and secured. I used Java as an example, as its origins from the Object-Oriented paradigm. So it was a choice like with New York: _"if you can make it here, you can make it everywhere"_. I was asked, okay, but how to model that in C#? Fasten seat belts, as this will be a rough ride! Here I come with an answer!

Even though F# supports (discriminated) union types, C# lags behind. It is the feature I'm waiting for the most, but I'm getting more syntactic sugar with each release instead. Java allows to model them via [sealed interface](https://openjdk.org/jeps/409). Let's see if we could model it similarly. We could get close, but not precisely the same.

Let's see how we could express the Shopping Cart that can be either empty (not initialised), pending, confirmed or cancelled.

```csharp
public abstract record ShoppingCart
{
    public record EmptyShoppingCart(): ShoppingCart;

    public record PendingShoppingCart(
        Guid Id,
        Guid ClientId,
        ProductItems ProductItems
    ): ShoppingCart;

    public record ConfirmedShoppingCart(
        Guid Id,
        Guid ClientId,
        ProductItems ProductItems,
        DateTimeOffset ConfirmedAt
    ): ShoppingCart;

    public record CanceledShoppingCart(
        Guid Id,
        Guid ClientId,
        ProductItems ProductItems,
        DateTimeOffset CanceledAt
    ): ShoppingCart;

    private protected ShoppingCart() { }
}
```

I defined the type for each of the possible shopping cart states. 

**We want to limit the following changes made by other devs:**
- instantiating the base shopping cart definition,
- extending it freely (or, in fact, accidentally) to limit hacking.

For that, we need to define the _ShoppingCart_ base type as an abstract and _private protected_ constructor. Let's quote [C# docs](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/private-protected): _A private protected member is accessible by types derived from the containing class, but only within its containing assembly._. It's not ideal, as still some malicious action can be done, but at least we're limiting the assembly scope. It may be a good enough restriction for many cases as typically, we can guard our code with tests, code reviews, etc. If we trust ourselves (a.k.a. _famous last words_), we can skip this constructor restriction.

**We'd also like proper pattern matching to make processing easier.** Let's define events that can happen for our shopping cart to show that better:

```csharp
public abstract record ShoppingCartEvent
{
    public record ShoppingCartOpened(
        Guid ShoppingCartId,
        Guid ClientId
    ): ShoppingCartEvent;

    public record ProductItemAddedToShoppingCart(
        Guid ShoppingCartId,
        PricedProductItem ProductItem
    ): ShoppingCartEvent;

    public record ProductItemRemovedFromShoppingCart(
        Guid ShoppingCartId,
        PricedProductItem ProductItem
    ): ShoppingCartEvent;

    public record ShoppingCartConfirmed(
        Guid ShoppingCartId,
        DateTimeOffset ConfirmedAt
    ): ShoppingCartEvent;

    public record ShoppingCartCanceled(
        Guid ShoppingCartId,
        DateTimeOffset CanceledAt
    ): ShoppingCartEvent;

    private protected ShoppingCartEvent() { }
}
```

As you can see, it's the same tactic. To demonstrate how pattern matching works, let me show it using the example of rebuilding the state from events. 

```csharp
public abstract record ShoppingCart
{
    // (...)
    public static ShoppingCart Empty = new EmptyShoppingCart();

    public static ShoppingCart Evolve(ShoppingCart state, ShoppingCartEvent @event) =>
        @event switch
        {
            ShoppingCartOpened (var shoppingCartId, var clientId) =>
                state is EmptyShoppingCart
                    ? new PendingShoppingCart(shoppingCartId, clientId, ProductItems.Empty)
                    : state,
            ProductItemAddedToShoppingCart (_, var pricedProductItem) =>
                state is PendingShoppingCart pendingShoppingCart
                    ? pendingShoppingCart with
                    {
                        ProductItems = pendingShoppingCart.ProductItems.Add(pricedProductItem)
                    }
                    : state,
            ProductItemRemovedFromShoppingCart (_, var pricedProductItem) =>
                state is PendingShoppingCart pendingShoppingCart
                    ? pendingShoppingCart with
                    {
                        ProductItems = pendingShoppingCart.ProductItems.Remove(pricedProductItem)
                    }
                    : state,
            ShoppingCartConfirmed (_, var confirmedAt) =>
                state is PendingShoppingCart (var shoppingCartId, var clientId, var productItems)
                    ? new ConfirmedShoppingCart(shoppingCartId, clientId, productItems, confirmedAt)
                    : state,
            ShoppingCartCanceled (_, var canceledAt) =>
                state is PendingShoppingCart (var shoppingCartId, var clientId, var productItems)
                    ? new CanceledShoppingCart(shoppingCartId, clientId, productItems, canceledAt)
                    : state,
            _ => state
        };

    private protected ShoppingCart() { }
}

```

In Event Sourcing, we get all the events for a specific entity (stream). Starting from an empty state, we're applying events to it one by one. For instance:

```csharp
var events = new ShoppingCartEvent[]
{
    // (...)
};

var currentState = events.Aggregate(ShoppingCart.Empty, ShoppingCart.Evolve);
```
Then we can use such a state for our business logic. You can read more in [How to get the current entity state from events?](/en/how_to_get_the_current_entity_state_in_event_sourcing/). 

Coming back to our pattern matching. As you can see, it allows pretty sophisticated logic, yet it's not 100% bulletproof. As we cannot fully restrict the number of implementations of the abstract class (only to assembly), we won't get the compiler checks if we use all branches in the switch code. It is possible in Java, but it seems that we C# devs cannot have all the good things. Yet, of course, we could (and should) check that via unit tests. We can also try to write a custom analyser to get it through static code analysis.

**The same pattern we can use for other places.** Not only for domain code. Let's say we have some text formatter that can either take a date or [Unix time](https://en.wikipedia.org/wiki/Unix_time).

We could model the input parameter as a single type:

```csharp
public class TextFormatter
{
    public abstract record FormattedValue
    {
        private protected FormattedValue() { }

        public record DateTime(
            DateTimeOffset Value
        ): FormattedValue;

        public record Milliseconds(
            long Value
        ): FormattedValue;
    }
}
```
Then we could define the formatting method:

```csharp
public class TextFormatter
{
    public static string Format(FormattedValue formatted) =>
        formatted switch
        {
            FormattedValue.DateTime(var value) => value.ToString(),
            FormattedValue.Milliseconds(var value) => value.ToString(),
            _ => throw new ArgumentOutOfRangeException(nameof(formatted), "That should never happen!")
        };
}
```

The method call will look as:

```csharp
TextFormatter.Format(new TextFormatter.FormattedValue.DateTime(dateTime));
TextFormatter.Format(new TextFormatter.FormattedValue.Milliseconds(milliseconds));
```

That doesn't look bad, right? We have strong typing, clear information of where types should be used, pattern matching, etc. Yet, this may be tedious to define a class for each possible parameter's permutation. It may become a dull job to do each time. 

**What else could we do? Is there more help from the C# language?**

Not quite, but let's try to bend it harder!

**We could try to use [Tuples](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples)** They're types that allow providing more than one value for a specific object and defining them in-place. How we could use it in our formatting sample?

```csharp
public class TextFormatter
{
    public static string Format((DateTimeOffset? DateTime, long? Milliseconds) date)
    {
        var (dateTime, milliseconds) = date;

        if (!dateTime.HasValue && !milliseconds.HasValue)
            throw new ArgumentException(nameof(date),
                $"Either {nameof(date.DateTime)} or {nameof(date.Milliseconds)} needs to be set");

        return dateTime.HasValue ?
            dateTime.Value.ToString()
            : DateTimeOffset.FromUnixTimeMilliseconds(milliseconds!.Value).ToString();
    }
}
```

So instead of defining the class, we're just grouping them and making them nullable. Then we could check which parameter is different from _null_ and run the specific format logic.

How to call such a function?

```csharp
TextFormatter.Format((dateTime, null));
TextFormatter.Format((null, milliseconds));
```

That's not great, as we need to provide the null for the other type we're not using.

Of course, we could add some helper methods, like:

```csharp
public static class EitherExtensions
{
    public static (TLeft?, TRight?) Either<TLeft, TRight>(
        TLeft? left = default
    ) => (left, default);

    public static (TLeft?, TRight?) Either<TLeft, TRight>(
        TRight? right = default
    ) => (default, right);
}
```

and use it as:

```csharp
TextFormatter.Format(Either<DateTimeOffset, long>(DateTimeOffset.Now));
TextFormatter.Format(Either<DateTimeOffset, long>(milliseconds));
```

A bit better, but still not great. Let's add some more helpers:

```csharp
public static class EitherExtensions
{
    public static (TLeft? Left, TRight? Right) AssertAnyDefined<TLeft, TRight>(
        this (TLeft? Left, TRight? Right) value
    )
    {
        if (value.Left == null && value.Right == null)
            throw new ArgumentOutOfRangeException(nameof(value), "One of values needs to be set");

        return value;
    }

    public static TMapped Map<TLeft, TRight, TMapped>(
        this (TLeft? Left, TRight? Right) value,
        Func<TLeft, TMapped> mapLeft,
        Func<TRight, TMapped> mapRight
    )
        where TLeft: struct
        where TRight: struct
    {
        var (left, right) = value.AssertAnyDefined();

        if (left.HasValue)
            return mapLeft(left.Value);

        if (right.HasValue)
            return mapRight(right.Value);

        throw new Exception("That should never happen!");
    }
}
```

_AssertAnyDefined_ will ensure that at least one of the values is defined.

_Map_ takes two transformation functions for each type in the tuple. It calls one of them for the defined value and returns the mapped value. Thanks to that, we're getting simplified syntax with compiler checks for pattern matching.

Then our function can look like:

```csharp
public class TextFormatter
{
    public static string Format((DateTimeOffset? DateTime, long? Milliseconds) dateTime) =>
        dateTime.Map(
            date => date.ToString(),
            milliseconds => DateTimeOffset.FromUnixTimeMilliseconds(milliseconds).ToString()
        )!;
}
```

It's not perfect, as we cannot use the native language capabilities, but with a few helper methods, we could provide some mapping code without building byzantine structures. Yet, tuple syntax is still pretty verbose and fragile. 

**What if we need to provide the _null_ value as one of the options?** Our code won't be able to distinguish the difference between present or unset values. C# language won't help us, unfortunately. We must roll up our sleeves and define a type that will allow differentiation between set and unset states. We need to be able to say that this object may or may not have some value. Let's do that!

```csharp
public class Maybe<TSomething>
{
    private readonly TSomething? value;
    public bool IsPresent { get; }

    private Maybe(TSomething value, bool isPresent)
    {
        this.value = value;
        this.IsPresent = isPresent;
    }

    public static readonly Maybe<TSomething> Empty = new(default!, false);

    public static Maybe<TSomething> Of(TSomething value) => value != null ? new Maybe<TSomething>(value, true) : Empty;

    public TSomething GetOrThrow() =>
        IsPresent ? value! : throw new ArgumentNullException(nameof(value));

    public TSomething GetOrDefault(TSomething defaultValue = default!) =>
        IsPresent ? value ?? defaultValue : defaultValue;
}
```

It's a simple class that keeps the current value together with information, whether it's present or not. It also has helper functions to provide basic processing of the value. For inspiration, check [Java Optional](https://www.baeldung.com/java-optional).

How to use it in our code? We could replace the nullable fields in our tuple and use _IsPresent_ to verify if the value was set. Still, if we're already doing magic, then let's try to do already one more step ahead. 

**Let's define the class that will allow us to say that the value is either of one type or another.**

```csharp
public class Either<TLeft, TRight>
{
    public Maybe<TLeft> Left { get; }
    public Maybe<TRight> Right { get; }

    public Either(TLeft value)
    {
        Left = Maybe<TLeft>.Of(value);
        Right = Maybe<TRight>.Empty;
    }

    public Either(TRight value)
    {
        Left = Maybe<TLeft>.Empty;
        Right = Maybe<TRight>.Of(value);
    }

    public Either(Maybe<TLeft> left, Maybe<TRight> right)
    {
        if (!left.IsPresent && !right.IsPresent)
            throw new ArgumentOutOfRangeException(nameof(right));

        Left = left;
        Right = right;
    }

    public TMapped Map<TMapped>(
        Func<TLeft, TMapped> mapLeft,
        Func<TRight, TMapped> mapRight
    )
    {
        if (Left.IsPresent)
            return mapLeft(Left.GetOrThrow());

        if (Right.IsPresent)
            return mapRight(Right.GetOrThrow());

        throw new Exception("That should never happen!");
    }

    public void Switch(
        Action<TLeft> onLeft,
        Action<TRight> onRight
    )
    {
        if (Left.IsPresent)
        {
            onLeft(Left.GetOrThrow());
            return;
        }

        if (Right.IsPresent)
        {
            onRight(Right.GetOrThrow());
            return;
        }

        throw new Exception("That should never happen!");
    }
}
```

As you can see, it has two constructors, one with the first (_left_) type instance and the other with the second (_right_) type. We're using them to set the internal values wrapped with _Maybe_ type. I also defined _Map_ method (accordingly to our tuple example) plus the _Switch_ method, just in case we don't want to return anything.

Let's update our text formatter code:

```csharp
public class TextFormatter
{
    public static string Format(Either<DateTimeOffset, long> dateTime) =>
        dateTime.Map(
            date => date.ToString(),
            milliseconds => DateTimeOffset.FromUnixTimeMilliseconds(milliseconds).ToString()
        );
}
```

and show how to call it:

```csharp
TextFormatter.Format(new Either<DateTimeOffset, long>(dateTime));
TextFormatter.Format(new Either<DateTimeOffset, long>(milliseconds));
```

Of course, we could use union types not only for the input parameters. They're even more helpful if we're using it as result types. See:

```csharp
public enum FileOpeningError
{
    FileDoesNotExist
}

public class FileProcessor
{
    public Either<FileStream, FileOpeningError> ReadFile(string fileName)
    {
        if (!File.Exists(fileName))
            return new Either<FileStream, FileOpeningError>(FileOpeningError.FileDoesNotExist);

        return new Either<FileStream, FileOpeningError>(File.Open(fileName, FileMode.Open));
    }
}
```

Thanks to that, we could run different logic if the processing was successful or failed. Doing that by throwing and catching exceptions is not always the most intuitive way. Read more in Scott Wlaschin's article about [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/).

**Okay, but what if our input parameter would need to be a union of three types?** Then, we need to define the following class:

```csharp
public class OneOf<T1, T2, T3>
{
    public Maybe<T1> First { get; }
    public Maybe<T2> Second { get; }
    public Maybe<T3> Third { get; }

    public OneOf(T1 value)
    {
        First = Maybe<T1>.Of(value);
        Second = Maybe<T2>.Empty;
        Third = Maybe<T3>.Empty;
    }

    public OneOf(T2 value)
    {
        First = Maybe<T1>.Empty;
        Second = Maybe<T2>.Of(value);
        Third = Maybe<T3>.Empty;
    }

    public OneOf(T3 value)
    {
        First = Maybe<T1>.Empty;
        Second = Maybe<T2>.Empty;
        Third = Maybe<T3>.Of(value);
    }

    public TMapped Map<TMapped>(
        Func<T1, TMapped> mapT1,
        Func<T2, TMapped> mapT2,
        Func<T3, TMapped> mapT3
    )
    {
        if (First.IsPresent)
            return mapT1(First.GetOrThrow());

        if (Second.IsPresent)
            return mapT2(Second.GetOrThrow());

        if (Third.IsPresent)
            return mapT3(Third.GetOrThrow());

        throw new Exception("That should never happen!");
    }

    public void Switch(
        Action<T1> onT1,
        Action<T2> onT2,
        Action<T3> onT3
    )
    {
        if (First.IsPresent)
        {
            onT1(First.GetOrThrow());
            return;
        }

        if (Second.IsPresent)
        {
            onT2(Second.GetOrThrow());
            return;
        }

        if (Third.IsPresent)
        {
            onT3(Third.GetOrThrow());
            return;
        }

        throw new Exception("That should never happen!");
    }

```

What if we need more? Then we need to define more classes like that, ending with the maximum number of types we want to support in the union type. Typically our union won't have more than a few of them.

We could also use [OneOf](https://github.com/mcintyre321/OneOf) library from Harry McIntyre. It already provides base classes for that, together with code generation and all that jazz.

## What's my final opinion?

Until we have native support, it won't be great whatever we do. The options we have are verbose. Compare that to the F# definition:

```fsharp
type ShoppingCartEvent =
    | ShoppingCartOpened of {| shoppingCartId: Guid, clientId : Guid|}
    | ProductItemAddedToShoppingCart of {| productId : Guid; quantity : int; unitPrice : decimal |}
    | ProductItemRemovedFromShoppingCart of {| productId : Guid; quantity : int; unitPrice : decimal |}
    | ShoppingCartConfirmed of {| confirmedAt : System.DateTimeOffset |}
    | ShoppingCartCanceled of {| confirmedAt : System.DateTimeOffset |}
```

Nevertheless, those tactics described in the article can be helpful and may be good enough if we get used to them. They may enhance our business logic definition and trust in our type definition. Yet, we need to remember that they won't guard us. They may also be harder to use with frameworks that don't expect to have such type definition.

**Would I use them?**

Yes, but in the places where they can shine the most, like domain code and business logic. The good idea is to use it in public API to clarify the input intention. It's worth ensuring that we're not bikeshedding and that they bring benefits. I'd probably try to start explicitly modelling classes where you see the value and avoid complex construction replacing the native code like _OneOf_. They're helpful, but they may make rewriting the codebase harder when we finally get union types in the language natively.

I encourage you to play with them and see how they suit you. And most importantly **putting pressure on C# language designers to finally deliver it!**.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.

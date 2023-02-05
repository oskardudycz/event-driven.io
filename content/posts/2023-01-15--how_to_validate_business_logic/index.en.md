---
title: How to validate business logic
category: "Event Sourcing"
cover: 2023-01-15-cover.jpg
author: oskar dudycz
---

![cover](2023-01-15-cover.jpg)

**Fox Mulder got advice: "trust no one".** 

I'm claiming that each software developer should define their level of paranoia.

**The thing that we should never trust is the outside world.** At least if we're creating the public API. That includes web requests, messages from the queue, and maybe even data we have in the database.

Can we at least trust ourselves? We'll get to that.

**Let's discuss the classical 3-tiered architecture where we have frontend communication with Web API that's interacting with the database.** Let's look at where the data processing pipeline can go wrong:

1. There was no validation on the frontend, or it didn't check all conditions. We cannot assume that we will be flawless and can standardise everything. The more elements we have in the development pipeline, the greater the chance that our colleagues or we will overlook them.
2. The API has changed its business logic, and the frontend doesn't know about it yet.
3. Frontend validation cannot verify some conditions. For instance, whether the product is still in stock or if the user email is unique. Querying the backend to check these conditions is not enough. Why? I explained that in [Tell, don't ask! Or, how to keep an eye on boiling milk](/en/tell_dont_ask_how_to_keep_an_eye_on_boiling_milk/).
4. Our API is public. Most of the APIs use text-based representations for messages they get. That means anyone can handcraft JSON, XML or plain text and send any data. That means, e.g. empty request, wrong message format (XML instead of JSON), not providing required data, invalid data format (string instead of a number, array instead of single value, etc.).
5. Someone may deliberately perform a malicious action, e.g. sending invalid requests to break our system or steal data by doing [data scraping](https://en.wikipedia.org/wiki/Data_scraping). Anyone can poke our API with a stick, trying to find holes and extract data by analysing the response.

Basically, anything can happen. If we don't [form a wall](/en/form_a_wall/), we might get into real trouble.

**The same can be true of a database.** And that's even dangerous, as we believe that it's our data and we have full control. That can catch us off-guard. Both data structure and its meaning evolve with the software's lifetime. Some fields become required, some become obsolete, and some are dropped. We won't be able from the beginning to provide the end solution. Not speaking about the scenario where we have a big ball of mud, and we're integrating multiple modules/services through the database.

Embracing that the outside world can be evil or just different than we expect is a basis of Ports & Adapters, so [Hexagonal Architecture](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/).

Even if you didn't watch X-Files, you should start agreeing with Fox Mulder's conclusion.

If we should trust no one, then how do we live? We have to trust someone. We can try to trust our own code. Aka, famous last words. Be careful with that. Control is the foundation of trust.

My general flow is as follows:

## 1. I make API request classes as plain objects using primitives.
I assume that I can get anything, null, invalid format, everything can be wrong. I try to [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). The task of such a class is to translate the data from the request to the instance of the class. I usually keep such a class directly in an API project. It may look as follows in C#

```csharp
public record AddProductRequest(
    Guid? ProductId,
    int? Quantity
);
```

## 2. Having parsed the request, I'm mapping it to the real contract (e.g. command or query).
This contract already comes from the domain module. This is where the element of trust comes in. I can trust this code, as I'm instantiating in my code, plus I'm also responsible for defining how to do it. I'm usually creating a static factory method and am not shy to use [value objects](/en/immutable_value_objects/) here to enforce semantic validation. The mapping code could look like:

```csharp
 var command = AddProduct.From(
    id,
    ProductItem.From(
        request?.ProductItem?.ProductId,
        request?.ProductItem?.Quantity
    )
);
```

And types definition:

```csharp
public record AddProduct(
    Guid CartId,
    ProductItem ProductItem
)
{
    public static AddProduct From(Guid cartId, ProductItem productItem)
    {
        if (cartId == Guid.Empty)
            throw new ArgumentOutOfRangeException(nameof(cartId));

        return new AddProduct(cartId, productItem);
    }
}

public record ProductItem
{
    public Guid ProductId { get; }

    public int Quantity { get; }

    private ProductItem(Guid productId, int quantity)
    {
        ProductId = productId;
        Quantity = quantity;
    }

    public static ProductItem From(Guid? productId, int? quantity)
    {
        if (!productId.HasValue)
            throw new ArgumentNullException(nameof(productId));

        return quantity switch
        {
            null => throw new ArgumentNullException(nameof(quantity)),
            <= 0 => throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity has to be a positive number"),
            _ => new ProductItem(productId.Value, quantity.Value)
        };
    }
    // (...)
}
```

As with everything, this pattern also has its name [Smart Constructor](https://wiki.haskell.org/Smart_constructors). It comes from functional programming, but as you see, even in the imperative world, it makes a lot of sense.

**After creating a command or query instance, we know it's correct.** By _correct_, I mean that it fulfils the basic assumptions like: all required fields have assigned values, fields have correct types, validations like product item quantity is positive, etc. It is crucial not to do sophisticated domain logic validation here but semantic one.

You may also notice that I've used [records types](/en/notes_about_csharp_records_and_nullable_reference_types/). That means that instances of these classes will be immutable. Most languages nowadays allow defining such structures, e.g. [Java also has records](https://openjdk.org/jeps/395), TypesScript [readonly types](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype) and functional languages have that by default. Why is it so important? 

**Thanks to immutability, we're getting even better trust with our objects.** We know no one will change them by doing accidental cowboy updates. We can pass them as parameters; they will always be as we created them. 

**That also reduces the amount of duplicated validation. We just do it once.** Of course, we should unit test our smart constructor, but we don't need to repeat it. We're getting fewer tests as the compiler will do a lot of work for us.

Check also more in my other article on [how to make explicit validation simpler with recent C# and .NET improvements](/en/explicit_validation_in_csharp_just_got_simpler/).

You can also consider doing [explicit deserialisation](/en/explicit_events_serialisation_in_event_sourcing/).

## 3. Proper domain validation should be done in business logic.
That's why I like CQRS. Thanks to CQRS, we know that a specific handler will execute the command. Business logic will be routed to a particular function or aggregate method. If we are to change the rule, we don't have to look at the whole code with unsteady eyes. For example, it is worth validating in the command whether the quantity is positive, but all the others, like checking if there are enough product items in the cart should be made in the business logic. Example:

```csharp
public class ShoppingCart: Aggregate
{
    private Guid ClientId { get; private set; }

    private ShoppingCartStatus Status { get; private set; }

    private List<PricedProductItem> ProductItems { get; private set; } = new ();

    public void AddProduct(
        IProductPriceCalculator productPriceCalculator,
        ProductItem productItem)
    {
        if(Status != ShoppingCartStatus.Pending)
            throw new InvalidOperationException($"Adding product for the cart in '{Status}' status is not allowed.");

        var pricedProductItem = productPriceCalculator.Calculate(productItem).Single();

        var newProductItem = @event.ProductItem;

        var existingProductItem = FindProductItemMatchingWith(newProductItem);

        if (existingProductItem is null)
        {
            ProductItems.Add(newProductItem);
            return;
        }

        ProductItems.Replace(
            existingProductItem,
            existingProductItem.MergeWith(newProductItem)
        );
    }

    public void RemoveProduct(
        PricedProductItem productItemToBeRemoved)
    {
        if(Status != ShoppingCartStatus.Pending)
            throw new InvalidOperationException($"Removing product from the cart in '{Status}' status is not allowed.");

        var existingProductItem = FindProductItemMatchingWith(productItemToBeRemoved);

        if (existingProductItem is null)
            throw new InvalidOperationException($"Product with id `{productItemToBeRemoved.ProductId}` and price '{productItemToBeRemoved.UnitPrice}' was not found in cart.");

        if(!existingProductItem.HasEnough(productItemToBeRemoved.Quantity))
            throw new InvalidOperationException($"Cannot remove {productItemToBeRemoved.Quantity} items of Product with id `{productItemToBeRemoved.ProductId}` as there are only ${existingProductItem.Quantity} items in card");

        if (existingProductItem.HasTheSameQuantity(productItemToBeRemoved))
        {
            ProductItems.Remove(existingProductItem);
            return;
        }

        ProductItems.Replace(
            existingProductItem,
            existingProductItem.Subtract(productItemToBeRemoved)
        );
    }

    // (...)
}
```

**The other story is whether to throw exceptions in business logic.** That's highly dependent on the technology you use, team experience and preferences. I'll expand on that in the dedicated post, but for now, I recommend following the conventions and capabilities of your coding environment.

If you're coding in functional programming, Go, or Rust, you won't throw exceptions too much. You'll likely use exceptions if you're into C# or Java. Why? I wrote about it longer in [Union types in C#](/en/union_types_in_csharp/). If you're into swiss-scissor language like TypeScript, you might do one or another. 

The most important thing is to refrain from fighting the language and local conventions because code created that way will be hard to maintain and constantly fight with the tooling. It can be beneficial in some scenarios, but I'd try to avoid it as a general approach.

Also, aggregates are one of many ways to handle business logic. Read more in [How to effectively compose your business logic](/en/how_to_effectively_compose_your_business_logic/) and [Slim your aggregates with Event Sourcing!](/en/slim_your_entities_with_event_sourcing/).

## Summing up

**Being more explicit may seem a bit redundant at first, but thanks to that:**
- we increase trust and the security of our code,
- we make changes in the domain code independent of changes in the API,
- we can cut off edge scenarios one by one: deserialisation, semantic validation of types, and business validation. 
- it is easier to know what, where and how to change, thanks to increasing maintainability and cognitive load.
- we reduce the number of tests needed.

Of course, all of that requires consistency, but once we build it and work carefully on our types, it'll get easier with each new one.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

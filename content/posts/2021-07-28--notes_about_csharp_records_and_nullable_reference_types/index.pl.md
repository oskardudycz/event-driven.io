---
title: Notes about C# records and Nullable Reference Types
category: "C#"
cover: 2021-07-28-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-07-28-cover.png)

In the last months, I spent quite some time playing with C# [records](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) and [Nullable Reference Types](https://docs.microsoft.com/en-us/dotnet/csharp/nullable-references). I was hoping that thanks to them, I would trust my type better than before. I hoped that records will be good for Value Objects.  So, if I created an object, it is immutable and meets the defined rules. From NRT, I expected if a variable type tells me it's not null, then it really is not. What's the result of my investigation?

Let's start with a simple record to represent a money transfer:

```csharp
public record MoneyTransfer(
    decimal Amount,
    Guid FromAccountId,
    Guid ToAccountId,
    // should always be specified and never be null
    string Title,
    // optional, nullable string
    string? Comment = null
)
```

An example of usage looks like this:

```csharp
var anna = Guid.NewGuid();
var john = Guid.NewGuid();
var amount = 100;

var moneyTransfer = new MoneyTransfer(
    amount,
    anna,
    john,
    "Money laundry",
    "Do not tell anyone!"
);
```

So far, everything's great. My transfer is immutable. If I try to assign _null_ value to _Title_, the compiler won't let me. Sweet!

OK, but how to make the record check the type rules. E.g. be sure that an amount is a positive number. Or the accounts identifiers and transfer title are not empty values?

Personally, I like to use the pattern ["Smart Constructor"](https://wiki.haskell.org/Smart_constructors). C# can be modelled as a factory method that creates an object and validates the incoming values. There is no validation in the constructor because it can be used during deserialization. In this case, we just need to accept what we get. 

I could add such a method to the record definition.

```csharp
public record MoneyTransfer(
    decimal Amount,
    Guid FromAccountId,
    Guid ToAccountId,
    // should always be specified and never be null
    string Title,
    // optional, thanks to nullable reference types
    // this can now be defined
    string? Comment = null
)
{
    public static MoneyTransfer Create(
        decimal Amount,
        Guid FromAccountId,
        Guid ToAccountId,
        string Title,
        string? Comment = null
    )
    {
        if (Amount <= 0) throw new ArgumentOutOfRangeException();

        if (FromAccountId == default) throw new ArgumentOutOfRangeException();
        if (ToAccountId == default) throw new ArgumentOutOfRangeException();

        if(Title.Trim().Length == 0) throw new ArgumentOutOfRangeException();

        return new(Amount, FromAccountId, ToAccountId, Title, Comment);
    }
};
```

Then usage will look as:

```csharp
var moneyTransfer = MoneyTransfer.Create(
    amount,
    Anna,
    john
    "Money laundry",
    "Do not tell anyone!"
);
```

That's better, but still not perfect. With the new syntax for records, I can create the derived object using _with_ keyword. It will create a clone of the object with some properties getting new values.

```csharp
var wrongMoneyTransfer = moneyTransfer with {Amount = -100};
```

Of course, I can define a private constructor if I insist or add a validation rule for the property setter. Unfortunately, I am distancing myself more and more from the advantages that are introduced by records.

Let's get back to nulls. After using _Nullable Reference Types_, the compiler will not allow assigning _null_ to a field not marked with a question mark. Well, almost, because I can do this:

```csharp
var evenWorseMoneyTransfer = new MoneyTransfer(
    amount,
    Anna,
    john
    // yes, I can force null to not null...
    null!,
    "Do not tell anyone!"
);
```

And I'll assign null even though I shouldn't be able to do so. Maybe you will say _"OK, nobody will do that explicitly to break the code"_. And that may be true of people, not necessarily for serializers. If someone sends us a request with _null_ and our code expects having it defined then it may crash with Null Pointer Reference if we're not prepared for that.

Unfortunately, it turns out that nullable reference types are just _synctactic sugar_ on top of the language. They're only checked at compilation time. At runtime, they're regular types where you can assign null if you'd like to.

In summary, neither the _records_ nor the _Nullable Reference Types_ are entirely what they appeared in the introductory presentations. Using them reminds me of typing in TypeScript. We seem to have defined types, but it is still JavaScript underneath when we run the code. Same here, deserialization or force by a developer will let us assign _null_. I can imagine the nasty production bug made by misuse.

My recommendation is:
1. Using records as simple _Data Transfer Objects_, e.g. API requests. They are great for this.
2. For types representing API requests, permanently mark all fields as nullable. We can expect anything from the user input. Then parse them into types that do offer those guarantees, applying validation in that process.
3. Records are not the ideal case for the Value Objects. If you want to use simplified syntax without a constructor or factory method, you cannot use primary types. You need to send types that are validated internally for the semantic rules. Because of the _with_ keyword, there cannot be rules between fields, as anyone can always replace the single property value while creating a new object.

Using the ASP.NET endpoints for the request handling can look like:

```csharp
public record RegisterProductRequest(
    string? SKU,
    string? Name,
    string? Description
);

internal static class Route
{
    internal static IEndpointRouteBuilder UseRegisterProductEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("api/products/", async context =>
        {
            var (sku, name, description) = await context.FromBody<RegisterProductRequest>();
            var productId = Guid.NewGuid();

            var command = RegisterProduct.Create(productId, sku, name, description);

            await context.SendCommand(command);

            await context.Created(productId);
        });

        return endpoints;
    }
}
```

Then command handling:

```csharp
internal class HandleRegisterProduct : ICommandHandler<RegisterProduct>
{
    private readonly Func<Product, CancellationToken, ValueTask> addProduct;
    private readonly Func<SKU, CancellationToken, ValueTask<bool>> productWithSKUExists;

    public HandleRegisterProduct(
        Func<Product, CancellationToken, ValueTask> addProduct,
        Func<SKU, CancellationToken, ValueTask<bool>> productWithSKUExists
    )
    {
        this.addProduct = addProduct;
        this.productWithSKUExists = productWithSKUExists;
    }

    public async ValueTask Handle(RegisterProduct command, CancellationToken ct)
    {
        var product = new Product(
            command.ProductId,
            command.SKU,
            command.Name,
            command.Description
        );

        if (await productWithSKUExists(command.SKU, ct))
            throw new InvalidOperationException(
                $"Product with SKU `{command.SKU} already exists.");

        await addProduct(product, ct);
    }
}

public record RegisterProduct
{
    public Guid ProductId { get;}

    public SKU SKU { get; }

    public string Name { get; }

    public string? Description { get; }

    private RegisterProduct(Guid productId, SKU sku, string name, string? description)
    {
        ProductId = productId;
        SKU = sku;
        Name = name;
        Description = description;
    }

    public static RegisterProduct Create(Guid? id, string? sku, string? name, string? description)
    {
        if (!id.HasValue || id == Guid.Empty) throw new ArgumentOutOfRangeException(nameof(id));
        if (string.IsNullOrEmpty(sku)) throw new ArgumentOutOfRangeException(nameof(sku));
        if (string.IsNullOrEmpty(name)) throw new ArgumentOutOfRangeException(nameof(name));
        if (description is "") throw new ArgumentOutOfRangeException(nameof(name));

        return new RegisterProduct(id.Value, SKU.Create(sku), name, description);
    }
}
```

It may still make sense to use records, as we're getting the automatic _ToString_, equality overloads and good looking object deconstruction.

Both functionalities are a decent step, but unfortunately, they seem to be added hastily and not thoroughly thought out. It's nice that they are, but we must be cautious using them as we can get into serious trouble. There are also other issue like:
- collections properties not having built-in value-comparison,
- reordering fields in Record definition can silently break our code as deconstruction is position-dependant. So compiler won't catch that we reordered two properties of the same type. 

I predict that some of that may change in the following .NET versions, and the Records design will get more polished.

Read also more in the article ["Generic does not mean Simple"](/pl/generic_does_not_mean_simple) and see the [full sample in my GitHub repo](https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Sample/Warehouse).

Cheers!

Oskar
---
title: Explicit validation in C# just got simpler!
category: "Coding Life"
cover: 2023-02-05-cover.jpg
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-02-05-cover.jpg)

**Validation is a thriving concept. It enables incredible creativity in developers implementing it in various ways.** I explained my general take on [How to validate business logic](/pl/how_to_validate_business_logic/). This time, let's look at how we could simplify our approach in C# language.

**The typical flow of _Line of business_ web application is:**
- User fills a form data in the UI (e.g. web application),
- Web application serialises it as the web request and calls the Web API endpoint,
- Web API parses data and runs business logic.

On each step, we should perform validation.

**Let's focus on the last step for now. In ASP.NET, the validation is quite often conflated with parsing and [model binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-7.0).** Historically, .NET devs got accustomed to doing all at once. It may sound like a brilliant idea, but it's also a pit of performance issues and nasty production bugs to debug. It all goes well while we remember the conventions and follow them precisely. Yet, the number of permutations we may find makes it hard to tame.

The potential solution could be explicit validation, so break the exact flow into [parse first, then validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). If you have tried that already, you may think I'm suggesting you become a caveman and do a lot of copy-pasting. Also, you may ask how to achieve human-friendly error messages. 

And yeah, I've been there and struggled with those issues. But I learned from it. Plus, new stuff in .NET can make this more accessible.

Let's say we'd like to register a new Product in our product catalogue. We may want to have it strongly typed, like:

```csharp
public record RegisterProduct(
    ProductId ProductId,
    SKU SKU,
    string Name,
    string? Description
)

public record ProductId(Guid Value)

public record SKU(string Value)
```

**I'm using [records and nullable types](/pl/notes_about_csharp_records_and_nullable_reference_types/), as they're a decent way for modelling data transfer objects.**

Yet, they, unfortunately, we can still provide wrong values to our types, e.g.:

```csharp
var validSKU = new SKU("ZS1023");

var forcedNull = new SKU(null!);

var wrongSKU = new SKU("wrong format");
```

What to do, then? We can use the Smart Constructor pattern presented in the [previous post](/pl/how_to_validate_business_logic/). 

```csharp
public record SKU(string Value)
{
    public static SKU From(string sku)
    {
        if (sku== null)
            throw new ArgumentNullException(nameof(sku));
        if (string.IsNullOrWhiteSpace(sku) || !Regex.IsMatch(sku, "[A-Z]{2,4}[0-9]{4,18}"))
            throw new ArgumentOutOfRangeException(nameof(sku));

        return new SKU(sku);
    }
}
```

That can help us to validate SKU creation with the following:

```csharp
// both calls will throw ArgumentException
var forcedNull = SKU.From(null!);
var wrongSKU = SKU.From("wrong format");
```

**Thanks to _nameof(sku)_, we'll get information on which field was wrong. We can also map _ArgumentException_ by convention to _400 Bad Request_ HTTP status.**

It won't guard against such calls:

```csharp
var worseSKU = sku with { Value = "definitely wrong value" };

var theWorstSKU = sku with { Value = null! };
```

To do that, we'll need to implement SKU as:

```csharp
public record SKU
{
    public string Value { get; }

    [JsonConstructor]
    private SKU(string value) =>
        Value = value;

    public void Deconstruct(out string? value) =>
        value = Value;

    public static SKU From(string sku)
    {
        if (sku== null)
            throw new ArgumentNullException(nameof(sku));
        if (string.IsNullOrWhiteSpace(sku) || !Regex.IsMatch(sku, "[A-Z]{2,4}[0-9]{4,18}"))
            throw new ArgumentOutOfRangeException(nameof(sku));

        return new SKU(sku);
    }
}
```

By hiding the public constructor, we're disabling the usage of _with_, keeping [the deconstruction](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/deconstruct#user-defined-types) capabilities, and we also enable proper deserialisation.

**That's a lot of code, and maybe it's better to keep the convention that we're calling Smart Constructor in our code and leave with that tradeoff.**

Still, if we'll need to write such copy-and-paste validation logic, it would quickly become tedious and, thus: error-prone.

Luckily, as promised, we could do better than that. We'll use two techniques to achieve it:
- [Caller Argument Expression](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-10.0/caller-argument-expression?source=recommendations),
- [Attributes for null-state static analysis](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis).

Have a look at the following method:

```csharp
public static class Validation
{
    public static string AssertNotEmpty(
        [NotNull] this string? value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new ArgumentOutOfRangeException(argumentName);
}
```

It's an extension method that takes a nullable _string_ value and checks if it's not null or empty, then returns not null value. It's a classical guard method.

What's unusual is that we're using cryptic _[CallerArgumentExpression("value")] string? argumentName_ syntax. It tells the compiler that it should try to resolve the argument name of the parameter _value_ from the caller context.

If we use it as:

```csharp
string? sku = null;

sku.AssertNotEmpty();
```

Then it'll automatically use the _sku_ as the parameter name for the _ArgumentException_. That's not all!

If we do:

```csharp
string? sku = "ZS1023";

sku.AssertNotEmpty();

string verifiedSku = sku;
```

**Then using the _NotNull_ argument tells the compiler that if this method runs successfully, the variable is not null.**

Note that this will work only for the nullable reference type. For the value types like Guid, we'll need to use the returned value from the method, but that's also neat, isn't it?

```csharp
public static class Validation
{
    public static Guid AssertNotEmpty(
        [NotNull] this Guid? value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        (value != null && value.Value != Guid.Empty)
            ? value.Value
            : throw new ArgumentOutOfRangeException(argumentName);
}

Guid? productId = "ZS1023";

// this will work
Guid verifiedProductId = productId.AssertNotEmpty();

// this won't compile
Guid verifiedProductId = productId;
```

**We can compose those methods and build simple but powerful fleet of validation methods:**

```csharp
public static class Validation
{
    public static Guid AssertNotEmpty(
        [NotNull] this Guid? value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        (value != null && value.Value != Guid.Empty)
            ? value.Value
            : throw new ArgumentOutOfRangeException(argumentName);


    public static string AssertNotEmpty(
        [NotNull] this string? value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new ArgumentOutOfRangeException(argumentName);


    public static string? AssertNullOrNotEmpty(
        this string? value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        value?.AssertNotEmpty(argumentName);

    public static string AssertMatchesRegex(
        [NotNull] this string? value,
        [StringSyntax(StringSyntaxAttribute.Regex)]
        string pattern,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        Regex.IsMatch(value.AssertNotEmpty(), pattern)
            ? value
            : throw new ArgumentOutOfRangeException(argumentName);

    public static int AssertPositive(
        [NotNull] this int? value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        value?.AssertPositive() ?? throw new ArgumentOutOfRangeException(argumentName);

    public static int AssertPositive(
        this int value,
        [CallerArgumentExpression("value")] string? argumentName = null
    ) =>
        value > 0
            ? value
            : throw new ArgumentOutOfRangeException(argumentName);
}
```

Then our final mapping with smart constructors can look as follows:

```csharp
public readonly record struct ProductId(Guid Value)
{
    public static ProductId From(Guid? productId) =>
        new(productId.AssertNotEmpty());
}

public readonly record struct SKU(string Value)
{
    public static SKU From(string? sku) =>
        new(sku.AssertMatchesRegex("[A-Z]{2,4}[0-9]{4,18}"));
}

public record RegisterProduct(
    ProductId ProductId,
    SKU SKU,
    string Name,
    string? Description
)
{
    public static RegisterProduct From(Guid? id, string? sku, string? name, string? description) =>
        new(
            ProductId.From(id),
            SKU.From(sku),
            name.AssertNotEmpty(),
            description.AssertNullOrNotEmpty()
        );
}
```

Then we can use it in the endpoint as follows:

```csharp
endpoints.MapPost(
        "api/products/",
        async (
            ProductsDBContext dbContext,
            RegisterProductRequest request,
            CancellationToken ct
        ) =>
        {
            var (sku, name, description) = request;
            var productId = Guid.NewGuid();

            var command = RegisterProduct.From(productId, sku, name, description);

            await Handle(
                dbContext.AddAndSave,
                dbContext.ProductWithSKUExists,
                command,
                ct
            );

            return Created($"/api/products/{productId}", productId);
        })
    .Produces(StatusCodes.Status201Created)
    .Produces(StatusCodes.Status400BadRequest);


// we're embracing here that we can expect anything from the UI
public record RegisterProductRequest(
    string SKU,
    string Name,
    string? Description
);
```

**The main downside of this approach may be that it's _fail fast_.** It'll throw an exception on the first wrong property. We won't get a listing of all the incorrect values. Still, that will be fine for the UI-based requests, as we should have validations made there. If the request bypassed them, it either means we forgot to align them or someone made something malicious. For the API-first design, that may be a more significant issue if our convention is to return all errors instead of failing fast.

**I believe that such an explicit approach is much safer and clearer.** We're depending on the compiler, getting failures during development, not in runtime. We're making [explicit things that should be explicit](/pl/explicit_events_serialisation_in_event_sourcing/) and have control over what's happening.

There are no redundant allocations, and no reflection magic, which is an obvious win. 

**Keeping validation in the code also creates a better form of documentation, as looking at the class, we see what to expect.** Once we create an instance of an object, we can trust it and don't repeat validation in multiple places.

Of course, such an approach requires consistency and consideration in the types of design, but if we keep it stupidly simple, then such composition can take us pretty far and reduce the headache of unpleasant surprises on production.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
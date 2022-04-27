---
title: CQRS is simpler than you think with .NET 6 and C# 10
category: "CQRS"
cover: 2021-12-15-cover.png
author: oskar dudycz
---

![cover](2021-12-15-cover.png)

.NET and CQRS are well known for the high ceremony and enterprise feeling. You should treat that as superstition. Let me tell you why. 

CQRS is a pattern where we're segregating application behaviours. We're splitting them into command and queries. Commands are intents to do something (e.g. change the state). Queries should return data but do not create side effects. Just like a question should not change the answer. Simple as that. We're slicing our business domain vertically by operations we can do on it. The split can help us to focus on the specific business operation, reduce complexity and cognitive load, enable optimisations and scaling.  Read more in:
- [CQRS facts and myths explained](/en/cqrs_facts_and_myths_explained/),
- [Generic does not mean Simple](/en/generic_does_not_mean_simple/)
- [How to slice the codebase effectively?](/en/how_to_slice_the_codebase_effectively/)

.NET ceremony is a more challenging beast. F# since the beginning was focused on succinct syntax. The community around it took this attitude to their tools. Unfortunately, that didn't get into the mainstream. By mainstream, I mean C# language and .NET. It's undeniable that .NET originates from Microsoft come from. Big enterprise clients. It went a hell of a journey from untestable Windows framework to cross-platform Open Source solution. C# is a language that's quickly changing and adopting trends. It's a Frankenstein. You can love it or hate it, but nowadays, you can write in it in almost any paradigm.

I wrote some time ago that [we should be more concerned about scaling down than scaling up](/en/will_it_scale_down/). It can be visible also in .NET. The core team is highly focused on performance improvements and cutting ceremonies. In .NET 6 they gave us "Minimal APIs". It's a funny name because it seems that what we call _"minimal"_ in the .NET space, it's rather regular in environments like NodeJS, Go, etc. Still, better later than never! Let's see how we can use it to make CQRS great again.

Let's start by defining primitives for our command and query handling:

```csharp
public interface ICommandHandler<in T>
{
    ValueTask Handle(T command, CancellationToken token);
}

public interface IQueryHandler<in T, TResult>
{
    ValueTask<TResult> Handle(T query, CancellationToken ct);
}
```

As you can see, the command handler needs to have a method that takes the command object and performs the operation. _ValueTask_ means that we're unsure if handling will be asynchronous.

The query handler takes the query object and returns the result (also wrapped in _ValueTask_).

We could skip this interface, but C# does not allow function without classes, so we'll still have to create the class even if we use just static handlers and pure functions.  Plus, we don't want to make a revolution here: C# devs love DI, don't they? 

As we're making our services smaller and smaller, sometimes even reaching micro-scale, the approach can be handy. .NET 6 and Minimal APIs enables simplified syntax. We can define our API in a single file. Of course, that won't work well for a massive monolith, but if we focus on the proper boundaries and split our API and modules per feature or domain object, then that could work pretty well. We'll start with defining _Program.cs_ file.

At first, we'll define Web Application and register services:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddEndpointsApiExplorer()
    .AddSwaggerGen()
    .AddDbContext<WarehouseDBContext>(
        options => options.UseNpgsql("name=ConnectionStrings:WarehouseDB"))
    .AddProductServices();

app.UseExceptionHandlingMiddleware();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger()
        .UseSwaggerUI();
}

app.Run();
```

We already may observe two things:
- Minimal APIs support Swagger (that wasn't the case in .NET 5 for Endpoints),
- Minimal APIs support regular middlewares (e.g. for mapping exceptions to HTTP statuses),
- We'll be using Entity Framework, because why not? I'll use the most CRUDish example to focus on CQRS segregation and show that you can benefit from CQRS and vertical slices even there.

Okay, but how to define Minimal APIs? Like that:

```csharp
// Get Products
app.MapGet("/api/products", HandleGetProducts)
    .Produces((int)HttpStatusCode.BadRequest);

ValueTask<IReadOnlyList<ProductListItem>> HandleGetProducts(
    [FromServices] QueryHandler<GetProducts, IReadOnlyList<ProductListItem>> getProducts,
    string? filter,
    int? page,
    int? pageSize,
    CancellationToken ct
) =>
    getProducts(GetProducts.With(filter, page, pageSize), ct);


// Get Product Details by Id
app.MapGet("/api/products/{id}", HandleGetProductDetails)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status404NotFound);

async Task<IResult> HandleGetProductDetails(
    [FromServices] QueryHandler<GetProductDetails, ProductDetails?> getProductById,
    Guid productId,
    CancellationToken ct
) =>
    await getProductById(GetProductDetails.With(productId), ct)
        is { } product
        ? Results.Ok(product)
        : Results.NotFound();

// Register new product
app.MapPost("api/products/",HandleRegisterProduct)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status404NotFound);

async Task<IResult> HandleRegisterProduct(
    [FromServices] CommandHandler<RegisterProduct> registerProduct,
    RegisterProductRequest request,
    CancellationToken ct
)
{
    var productId = Guid.NewGuid();
    var (sku, name, description) = request;

    await registerProduct(
        RegisterProduct.With(productId, sku, name, description),
        ct);

    return Results.Created($"/api/products/{productId}", productId);
}
```

WebApplication builder enables endpoint definition. We can use _MapGet_, _MapPost_ etc., for each of the HTTP methods. They have:
- the same routing capabilities as regular Controllers,
- model binding,
- dependency injection etc.

You can define endpoint using inline lambda, but when we have more parameters (like in filter method), it becomes less readable for me. As we can define OpenAPI specification, it's getting even more blurry. That's why I prefer a separate function put right after the endpoint definition. 
.NET 6 enables to set function without classes in _Program.cs_ file (they're, in fact, local functions). Minimal APIs also provide pretty smart parameters binding. They will automatically match function parameters from query, route or body. 

You can still mark them explicitly by attributes, but you may not need them. You might have noticed that I'm using the _FromServices_ attribute, together with types that we don't know yet:

```csharp
[FromServices] QueryHandler<GetProducts, IReadOnlyList<ProductListItem>> getProducts,
// (...)
[FromServices] QueryHandler<GetProductDetails, ProductDetails?> getProductById,
// (...)
 [FromServices] CommandHandler<RegisterProduct> registerProduct,
```

That's my optimisation. I could just inject _IQueryHandler<GetProducts, IReadOnlyList<ProductListItem>_, but then I'd need to use the weird syntax:

```csharp
handler.Handle(GetProducts.With(filter, page, pageSize), ct);
```

As I'd prefer just to use function then I defined the following delegate and registration extension methods:

```csharp
public delegate ValueTask<TResult> QueryHandler<in T, TResult>(T query, CancellationToken ct);

public static class QueryHandlerConfiguration
{
    public static IServiceCollection AddQueryHandler<T, TResult, TQueryHandler>(
        this IServiceCollection services
    ) where TQueryHandler : class, IQueryHandler<T, TResult>
    {
        services
                .AddTransient<IQueryHandler<T, TResult>, TQueryHandler>();
                .AddTransient<QueryHandler<T, TResult>>(
                    sp => sp.GetRequiredService<IQueryHandler<T, TResult>>().Handle
            );

        return services;
    }
}
```

I'm defined shortened delegate for the handler function that registers both _IQueryHandler_ and handler function delegate. This, in the future, can enable me to decorate handler resolution and provide MediatR-like pipelines. Read more in the [How to register all CQRS handlers by convention](/en/how_to_register_all_mediatr_handlers_by_convention/). The same can be done accordingly for Commands.

```csharp
public delegate ValueTask CommandHandler<in T, TResult>(T query, CancellationToken ct);

public static class CommandHandlerConfiguration
{
    public static IServiceCollection AddCommandHandler<T, TCommandHandler>(
        this IServiceCollection services
    ) where TCommandHandler : class, ICommandHandler<T>
    {
        services
                .AddTransient<IQueryHandler<T>, TCommandHandler>();
                .AddTransient<QueryHandler<T>>(
                    sp => sp.GetRequiredService<ICommandHandler<T>>().Handle
            );

        return services;
    }
}
```

Thanks to that, I can get simple query handling definition:

```csharp
ValueTask<IReadOnlyList<ProductListItem>> HandleGetProducts(
    [FromServices] QueryHandler<GetProducts, IReadOnlyList<ProductListItem>> getProducts,
    string? filter,
    int? page,
    int? pageSize,
    CancellationToken ct
) =>
    getProducts(GetProducts.With(filter, page, pageSize), ct);
```
Using delegate type instead of raw _Fun_ will also help me not accidentally to do wrong function definition or registration. The compiler will help me with that.

Many examples of the Minimal APIs shows all code in the same file. Frankly, I don't see that being maintainable in the production code in the long term. We still should have a split for domain logic and application code. The design should be simple, but not simpler. Thus, I'd prefer to have just pure domain code in command handling. Something around that:

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

public record RegisterProduct(
    Guid ProductId,
    SKU SKU,
    string Name,
    string? Description
)
{
    public static RegisterProduct With(Guid? id, string? sku, string? name, string? description)
    {
        if (!id.HasValue || id == Guid.Empty) throw new ArgumentOutOfRangeException(nameof(id));
        if (string.IsNullOrEmpty(sku)) throw new ArgumentOutOfRangeException(nameof(sku));
        if (string.IsNullOrEmpty(name)) throw new ArgumentOutOfRangeException(nameof(name));
        if (description is "") throw new ArgumentOutOfRangeException(nameof(name));

        return new RegisterProduct(id.Value, SKU.Create(sku), name, description);
    }
}
```

As you see, I don't have direct references to frameworks (like EntityFramework) but pure C# code. I'm injecting functions that are doing specific stuff. If you prefer, you can use Aggregates instead or other DDD structures, but if your domain is relatively simple, just entities and pure function should be fine. As you see, this code is easily testable.

Okay, but how will it be connected to the real application code? We can either do plumbing directly in the endpoints definition or define it in the dedicated registration class. That's what I'd do.

```csharp
internal static class Configuration
{
    public static IServiceCollection AddProductServices(this IServiceCollection services)
        => services
            .AddQueryable<Product, WarehouseDBContext>()
            .AddCommandHandler<RegisterProduct, HandleRegisterProduct>(s =>
            {
                var dbContext = s.GetRequiredService<WarehouseDBContext>();
                return new HandleRegisterProduct(dbContext.AddAndSave, dbContext.ProductWithSKUExists);
            })
            .AddQueryHandler<GetProducts, IReadOnlyList<ProductListItem>, HandleGetProducts>()
            .AddQueryHandler<GetProductDetails, ProductDetails?, HandleGetProductDetails>();

    public static ValueTask<bool> ProductWithSKUExists(this WarehouseDBContext dbContext, SKU productSKU, CancellationToken ct)
        => new (dbContext.Set<Product>().AnyAsync(product => product.Sku.Value == productSKU.Value, ct));
}
```

We're using here also here a few additional extensions:

```csharp
public static async ValueTask AddAndSave<T>(this DbContext dbContext, T entity, CancellationToken ct)
        where T : notnull
    {
        await dbContext.AddAsync(entity, ct);
        await dbContext.SaveChangesAsync(ct);
    }

    public static ValueTask<T?> Find<T, TId>(this DbContext dbContext, TId id, CancellationToken ct)
        where T : class where TId : notnull
        => dbContext.FindAsync<T>(new object[] {id}, ct);

    public static IServiceCollection AddQueryable<T, TDbContext>(this IServiceCollection services)
        where TDbContext : DbContext
        where T : class =>
        services.AddTransient(sp => sp.GetRequiredService<TDbContext>().Set<T>().AsNoTracking());
```

Those simple methods enable us to compose our small pieces into a simple, testable, but scalable and maintainable design. Of course, if you prefer to inject _DbContext_, that's may also be fine. However, I like to keep it that way, as, by that, I can have a clear split between the domain logic and application code. It's easier for me to maintain the order. Also, by injecting specified classes, we're doing design by capabilities. It is more explicit and secure, as I clearly define what I intend to do. If we inject the whole _DbContext_, we can do everything. With great power comes great responsibility. See more in a great Scott Wlaschin's talk [Designing with Capabilities](https://www.youtube.com/watch?v=fi1FsDW1QeY).

Let's get back for a moment to the register product endpoint.

```csharp
// Register new product
app.MapPost("api/products/",HandleRegisterProduct)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status404NotFound);

async Task<IResult> HandleRegisterProduct(
    [FromServices] CommandHandler<RegisterProduct> registerProduct,
    RegisterProductRequest request,
    CancellationToken ct
)
{
    var productId = Guid.NewGuid();
    var (sku, name, description) = request;

    await registerProduct(
        RegisterProduct.With(productId, sku, name, description),
        ct);

    return Results.Created($"/api/products/{productId}", productId);
}
```

You might have noticed that I'm not passing the request contract but mapping it into the command type.

```csharp
public record RegisterProduct(
    Guid ProductId,
    SKU SKU,
    string Name,
    string? Description
)
{
    public static RegisterProduct With(Guid? id, string? sku, string? name, string? description)
    {
        if (!id.HasValue || id == Guid.Empty) throw new ArgumentOutOfRangeException(nameof(id));
        if (string.IsNullOrEmpty(sku)) throw new ArgumentOutOfRangeException(nameof(sku));
        if (string.IsNullOrEmpty(name)) throw new ArgumentOutOfRangeException(nameof(name));
        if (description is "") throw new ArgumentOutOfRangeException(nameof(name));

        return new RegisterProduct(id.Value, SKU.Create(sku), name, description);
    }
}
```

I might have to do that, but then I'd need to validate it in the command handler code. I'm doing here a bit of the Type-Driven Development (again KUDOS to Scott Wlashin and his [Domain Modeling made Functional](https://www.amazon.pl/Domain-Modeling-Made-Functional-Domain-Driven)). In my domain code, I want to be sure that what I get already fulfils the basic semantic rules. I don't want to do multiple times validation if the SKU number is valid or not or if the product name is empty. Having the type that I can trust is a huge benefit, as it means:
- single source of truth,
- fewer IFs,
- less testing,
- predictable code.

We need to remember that Nullable Reference Types and Records are just syntactic sugar on top of regular classes. We cannot trust them unless we create them in our code. Read more in [Notes about C# records and Nullable Reference Types](/en/notes_about_csharp_records_and_nullable_reference_types/).

Even if we're just using primitives, they have limited built-in validations. Thus it's worth defining types like SKU that makes sure that our types are validating themselves and helping us to write concise code:

```csharp
public record SKU
{
    public string Value { get; init; }

    [JsonConstructor]
    public SKU(string value)
    {
        Value = value;
    }

    public static SKU Create(string? value)
    {
        if (value == null)
            throw new ArgumentNullException(nameof(SKU));
        if (string.IsNullOrWhiteSpace(value) || !Regex.IsMatch(value, "[A-Z]{2,4}[0-9]{4,18}"))
            throw new ArgumentOutOfRangeException(nameof(SKU));

        return new SKU(value);
    }
}
```

Interestingly, this is already supported in the Entity Framework, as [Owned Types](https://docs.microsoft.com/en-us/ef/core/modeling/owned-entities). We can use such types even inside our entity definition:

```csharp
internal class Product
{
    public Guid Id { get; set; }
    public SKU Sku { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    private Product(){}

    public Product(Guid id, SKU sku, string name, string? description)
    {
        Id = id;
        Sku = sku;
        Name = name;
        Description = description;
    }
}
```

Unfortunately, the con is that we need to keep the default constructor to make it work. And of course, define it properly in the data model:

```csharp
public class WarehouseDBContext: DbContext
{
    public WarehouseDBContext(DbContextOptions<WarehouseDBContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>()
            .OwnsOne(p => p.Sku);
    }
}
```

Let's get back for the last time to the query handling.

```csharp
ValueTask<IReadOnlyList<ProductListItem>> HandleGetProducts(
    [FromServices] QueryHandler<GetProducts, IReadOnlyList<ProductListItem>> getProducts,
    string? filter,
    int? page,
    int? pageSize,
    CancellationToken ct
) =>
    getProducts(GetProducts.With(filter, page, pageSize), ct);
```

And it's registration:

```csharp
public static IServiceCollection AddQueryable<T, TDbContext>(this IServiceCollection services)
    where TDbContext : DbContext
    where T : class =>
    services.AddTransient(sp => sp.GetRequiredService<TDbContext>().Set<T>().AsNoTracking());

// (...)

 services
    .AddQueryable<Product, WarehouseDBContext>()
    .AddQueryHandler<GetProducts, IReadOnlyList<ProductListItem>, HandleGetProducts>()
    .AddQueryHandler<GetProductDetails, ProductDetails?, HandleGetProductDetails>();
```

Because we know that query won't be doing any changes, we can do automatic optimisations like disabling change tracking. Worth noticing is that CQRS doesn't require a separate data model. You can use the same table for multiple queries, e.g. _GetProducts_ to return a list with a subset of data:

```csharp
internal class HandleGetProducts : IQueryHandler<GetProducts, IReadOnlyList<ProductListItem>>
{
    private readonly IQueryable<Product> products;

    public HandleGetProducts(IQueryable<Product> products)
    {
        this.products = products;
    }

    public async ValueTask<IReadOnlyList<ProductListItem>> Handle(GetProducts query, CancellationToken ct)
    {
        var (filter, page, pageSize) = query;

        var filteredProducts = string.IsNullOrEmpty(filter)
            ? products
            : products
                .Where(p =>
                    p.Sku.Value.Contains(query.Filter!) ||
                    p.Name.Contains(query.Filter!) ||
                    p.Description!.Contains(query.Filter!)
                );

        return await filteredProducts
            .Skip(pageSize * (page - 1))
            .Take(pageSize)
            .Select(p => new ProductListItem(p.Id, p.Sku.Value, p.Name))
            .ToListAsync(ct);
    }
}

public record GetProducts(
    string? Filter,
    int Page,
    int PageSize
)
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 10;

    public static GetProducts With(string? filter, int? page, int? pageSize)
    {
        page ??= DefaultPage;
        pageSize ??= DefaultPageSize;

        if (page <= 0)
            throw new ArgumentOutOfRangeException(nameof(page));

        if (pageSize <= 0)
            throw new ArgumentOutOfRangeException(nameof(pageSize));

        return new (filter, page.Value, pageSize.Value);
    }
}

public record ProductListItem(
    Guid Id,
    string Sku,
    string Name
);
``` 

And _GetProductDetails_ to return a single item with full set of properties:

```csharp
internal class HandleGetProductDetails: IQueryHandler<GetProductDetails, ProductDetails?>
{
    private readonly IQueryable<Product> products;

    public HandleGetProductDetails(IQueryable<Product> products)
    {
        this.products = products;
    }

    public async ValueTask<ProductDetails?> Handle(GetProductDetails query, CancellationToken ct)
    {
        var product = await products
            .SingleOrDefaultAsync(p => p.Id == query.ProductId, ct);

        if (product == null)
            return null;

        return new ProductDetails(
            product.Id,
            product.Sku.Value,
            product.Name,
            product.Description
        );
    }
}

public record GetProductDetails(
    Guid ProductId
)
{
    public static GetProductDetails With(Guid? productId)
        => new(productId.AssertNotEmpty(nameof(productId)));
}

public record ProductDetails(
    Guid Id,
    string Sku,
    string Name,
    string? Description
);
```

Of course, eventually, we may need to optimise that. We can start by defining a custom (materialised) view or moving the endpoint to use different storage (e.g. Elastic Search for advanced search). As we have vertical slices, then this can be done easier.

Minimal APIs are a good starting point for .NET to become lighter and have fewer ceremonies. Each abstraction brings additional cost. We should be trying to cut all the redundant layers to make our code composable and straightforward. CQRS can help with that by giving you the basic rules and skeleton for segregating your application behaviours. Are Minimal APIs and CQRS a perfect match? Nothing is perfect, but I think they're good enough to at least play with it and consider it a building block in your architecture design.

See the full sample code: https://github.com/oskardudycz/EventSourcing.NetCore/pull/92/files.

Cheers!

Oskar

p.s. if you liked this article, then check also similar:
- [CQRS is simpler than you think with .NET 6 and C# 10](/en/cqrs_is_simpler_than_you_think_with_net6/)
- [How to build a simple event pipeline](/en/how_to_build_simple_event_pipeline)
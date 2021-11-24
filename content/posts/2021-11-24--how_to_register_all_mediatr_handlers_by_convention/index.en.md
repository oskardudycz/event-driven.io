---
title: How to register all CQRS handlers by convention
category: "CQRS"
cover: 2021-11-24-cover.png
author: oskar dudycz
---

![cover](2021-11-24-cover.png)

In CQRS, it's common to define interfaces for the handlers to enforce the unified code structure. Such an approach is used, e.g. by [MediatR](https://github.com/jbogard/MediatR) library. It is a simple, in-memory implementation of the Mediator pattern. Even if you're not using any libraries but handmade tools and you're in the .NET or Java land, you may want to walk that way. It's a longer discussion if DI is really needed. I may write a dedicated post around it, but today let's assume that's your desired approach.

Registering handlers manually has benefits. You can use code as documentation of what you're handling. Still, in some cases, it may become tedious, especially when working with a huge monolith. Also, sometimes you just want to have your life easier a bit. [Kristian Hellang](https://twitter.com/khellang) created [Scrutor](https://github.com/khellang/Scrutor) library that makes assembly scanning and DI registration extremely simple. Before we see how Scrutor can help us, have a look at the manual way.

Let's define a few interfaces for handling:

```csharp
public interface ICommandHandler<in T>
{
    ValueTask Handle(T command, CancellationToken token);
}

public interface IQueryHandler<in T, TResult>
{
    ValueTask<TResult> Handle(T query, CancellationToken ct);
}

public interface IEventHandler<T>
{
    ValueTask Handle<T>(T event, CancellationToken token);
}
```

If we did manual registration, we could define the following methods:

```csharp
public static class Config
{
    public static IServiceCollection AddCommandHandler<TCommand, TCommandHandler>(
        this IServiceCollection services
    )
        where TCommandHandler : class, ICommandHandler<TCommand>
    {
        return services.AddTransient<TCommandHandler>()
            .AddTransient<ICommandHandler<TCommand>>(sp => sp.GetRequiredService<TCommandHandler>());
    }
    
    public static IServiceCollection AddQueryHandler<TQuery, TQueryResult, TQueryHandler>(
        this IServiceCollection services
    )
        where TQueryHandler : class, IQueryHandler<TQuery, TQueryResult>
    {
        return services.AddTransient<TQueryHandler>()
            .AddTransient<IQueryHandler<TQuery, TQueryResult>>(sp => sp.GetRequiredService<TQueryHandler>());
    }
    
    public static IServiceCollection AddEventHandler<TEvent, TEventHandler>(
        this IServiceCollection services
    )
        where TEventHandler : class, IEventHandler<TEvent>
    {
        return services.AddTransient<TEventHandler>()
            .AddTransient<IEventHandler<TEvent>>(sp => sp.GetRequiredService<TEventHandler>());
    }
}
```

We could use them like that:

```csharp
internal static class CartsConfig
{
    private static void AddHandlers(IServiceCollection services)
    {
        services.AddCommandHandler<InitializeCart, HandleInitializeCart>()
                .AddCommandHandler<AddProduct, HandleAddProduct>()
                .AddQueryHandler<GetCartById, CartDetails?, HandleGetCartById>()
                .AddQueryHandler<GetCartAtVersion, CartDetails, HandleGetCartAtVersion>()
                .AddEventHandler<CartConfirmed, HandleCartFinalized>();
    }
}
```

That doesn't look bad, but such config, if not appropriately controlled, can grow exponentially (check [How to slice the codebase effectively?](/en/how_to_slice_the_codebase_effectively/) to know how to tame it).

Let's see how we could use Scrutor to register all of our handlers automatically.

```csharp
public static class Config
{
    public static IServiceCollection AddAllCommandHandlers(
        this IServiceCollection services,
        ServiceLifetime withLifetime = ServiceLifetime.Transient,
        AssemblySelector from = AssemblySelector.ApplicationDependencies)
    {
        return services.Scan(scan => scan
            .FromAssemblies(from)
            .AddClasses(classes =>
                classes.AssignableTo(typeof(ICommandHandler<>))
                    .Where(c => !c.IsAbstract && !c.IsGenericTypeDefinition))
            .AsSelfWithInterfaces()
            .WithLifetime(withLifetime)
        );
    }

    public static IServiceCollection AddAllQueryHandlers(
        this IServiceCollection services,
        ServiceLifetime withLifetime = ServiceLifetime.Transient,
        AssemblySelector from = AssemblySelector.ApplicationDependencies)
    {
        return services.Scan(scan => scan
            .FromAssemblies(from)
            .AddClasses(classes =>
                classes.AssignableTo(typeof(IQueryHandler<,>))
                    .Where(c => !c.IsAbstract && !c.IsGenericTypeDefinition))
            .AsSelfWithInterfaces()
            .WithLifetime(withLifetime)
        );
    }

    public static IServiceCollection AddAllEventHandlers(
        this IServiceCollection services,
        ServiceLifetime withLifetime = ServiceLifetime.Transient,
        AssemblySelector from = AssemblySelector.ApplicationDependencies)
    {
        return services.Scan(scan => scan
            .FromAssemblies(from)
            .AddClasses(classes =>
                classes.AssignableTo(typeof(IEventHandler<>))
                    .Where(c => !c.IsAbstract && !c.IsGenericTypeDefinition))
            .AsSelfWithInterfaces()
            .WithLifetime(withLifetime)
        );
    }
}
```

Scrutor allows us to define which assemblies we want to scan by calling the _FromAssemblies_ method. We can select only our application dependencies with _AssemblySelector.ApplicationDependencies_. 

Then we can register implementations by calling _AddClasses_ and selecting which we'd like to use. In our case, those will be not abstract, not generic classes implementing the particular interface (_ICommandHandler_, _IQueryHandler_, _IEventHandler_). We're adding that condition not to register base classes or generic handlers. If we have such, then we should instead set them up manually.

Then we can state that we want to register the handler as itself (so specific class) and all the interfaces it implements. Then we can call those methods in our application setup:

```csharp
services.AddAllCommandHandlers()
    .AddAllQueryHandlers()
    .AddAllEventHandlers();
```

Such an approach will both work for custom handling like, e.g.:

```csharp
public static class CommandBus
{
    public static ICommandHandler<T> GetCommandHandler<T>(this HttpContext context)
        => context.RequestServices.GetRequiredService<ICommandHandler<T>>();


    public static ValueTask SendCommand<T>(this HttpContext context, T command)
        => context.GetCommandHandler<T>()
            .Handle(command, context.RequestAborted);
}
```

You can expand it with decorators, etc., to build your pipelines and decorate handling with middlewares. 

Et voilà! 

Cheers!

Oskar
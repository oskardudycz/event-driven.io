---
title: Generic does not mean Simple
category: "Architecture"
cover: 2021-06-16-cover.png
author: oskar dudycz
---

![cover](2021-06-16-cover.png)

[As you know, I am a fan and practitioner of CQRS.](/en/cqrs_facts_and_myths_explained/). I believe that it is falsely considered as complicated. In my opinion, it can help even with the classic CRUD approach. For example, if we know that a given method is only used to return data, we can optimise it. Even in the [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) (e.g. Entity Framework), knowing that we won't modify the data, by disabling changes tracking, we can make queries run faster.

Minor optimisations are fun, but these strategic changes are worth more. I often refer to *"Clean Architecture"* as *"Onion Architecture"*. Not only because of the layers' abundance. Also, because of the specific smell that hangs around it. In *Onion Architecture*, we divide our code into horizontal layers: API layer, application layer, business layer, data layer, and so on and so forth. Matrioshka called a "decent, enterprise" architecture. Why am I clinging to the scent?

The following things do not smell great to me:
- if we change something in a given layer, it will most likely affect all our business features.
- the barrier to entry to understand such architecture is overwhelming.
- *Onion Architecture* is like a box of chocolates. You never know what's inside. It's hard to guess relationships between layers and components. If we wrap everything up in interfaces, finding what may happen on the API call is challenging.
- When we add or change functionality, we must remember the whole procedure and follow the checklists to not forget any detail.

All of that conveys into [cognitive load](/en/sociological_aspects_of_microservices/) and directly to software development and implementation costs. Moreover, it increases the risk of change. If we are going to change the generic repository, we risk breaking everything by having a bad if. This often leads to abandonment and avoidance of changes, or worse, workarounds with hacks.

By cutting our architecture vertically, we can write more fine-tuned code for a given situation. Of course, I'm not talking about the Copypaste method here, but about writing simple code. Which is not simple at all and requires effort.

While working on my presentation at [the last 4Developers conference](https://4developers.org.pl/lecture_online_2021/#id=65099), I prepared the following code:

```csharp
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

Along with a few simple extensions:

```csharp
public static class HttpExtensions
{
    public static async Task<T> FromBody<T>(this HttpContext context)
    {
        return await context.Request.ReadFromJsonAsync<T>() ??
               throw new ArgumentNullException("request");
    }

    public static Task Created<T>(this HttpContext context, T id, string? location = null)
    {
        context.Response.Headers[HeaderNames.Location] = location ?? $"{context.Request.Path}{id}";

        return context.ReturnJSON(id, HttpStatusCode.Created);
    }

    public static async Task ReturnJSON<T>(this HttpContext context, T result,
        HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        context.Response.StatusCode = (int)statusCode;

        if (result == null)
            return;

        await context.Response.WriteAsJsonAsync(result);
    }
}

public static class CommandHandlerExtensions
{
    public static ICommandHandler<T> GetCommandHandler<T>(this HttpContext context)
        => context.RequestServices.GetRequiredService<ICommandHandler<T>>();


    public static ValueTask SendCommand<T>(this HttpContext context, T command)
        => context.GetCommandHandler<T>()
            .Handle(command, context.RequestAborted);
}
```

It allows us to achieve a short and straightforward code. Additionally, we have full control over whether we want to do specific support for a given endpoint (e.g. some HTTP headers etc.). We don't lose much from the ease of use, as we can inject our handler via IoC. We can wrap it with a decorator or do other stuff if we need it.

We also gain efficiency because we do not do redundant mappings, IFs, etc.

However, the _DRY_ (_Don't Repeat Yourself_) principle has been hammered into our heads over the years. We may want to go further: wrap it up extra to do a one-liner for command registering:

```csharp
endpoints.MapCommand<RegisterProduct>(HttpMethod.Post, "/api/products", HttpStatusCode.Created)
```

Of course we can do this:

```csharp
internal static class EndpointsExtensions
{
    internal static IEndpointRouteBuilder MapCommand<TRequest>(
        this IEndpointRouteBuilder endpoints,
        HttpMethod httpMethod,
        string url,
        HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        endpoints.MapMethods(url, new []{httpMethod.ToString()} , async context =>
        {
            var command = await context.FromBody<TRequest>();

            var commandResult = await context.SendCommand(command);

            if (commandResult == CommandResult.None)
            {
                context.Response.StatusCode = (int)statusCode;
                return;
            }

            await context.ReturnJSON(commandResult.Result, statusCode);
        });

        return endpoints;
    }
}
```
However, it forces us to immediately change the interface to the command:

```csharp
public interface ICommandHandler<in T>
{
    ValueTask<CommandResult> Handle(T command, CancellationToken token);
}

public record CommandResult
{
    public object? Result { get; }

    private CommandResult(object? result = null)
        => Result = result;

    public static CommandResult None => new();

    public static CommandResult Of(object result) => new(result);
}
```

Additionally, problems are popping up:
- Where to generate id? Should we move it to the command handler?
- HTTP status *Created* should return the Location header. How to do it? Add if in the mapping?

As the application grows, we'll have more and more such requirements. The number of tweaks to our generic code will grow. Either we have to add some (auto) mappings or reflection usage. What do we gain from that? Shortening handlers by 10 lines?

We also lose clarity because we cannot directly see top-down what is happening in our codebase. By that, we did a full circle, and we came back to the place we wanted to get away from. A change in such defined *MapCommand* can, in an extreme case, crash all endpoints.

Do you think it's worth it or not?

I prefer *KISS* - *"Keep It Simple, Stupid"* instead of *DRY*.

I encourage you to take a look at:
- the whole sample: https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Sample/Warehouse,
- PR with "the extreme MapCommand makeover": https://github.com/oskardudycz/EventSourcing.NetCore/pull/43.

For more information about CQRS check my other articles:
- ["CQRS facts and myths explained"](/en/cqrs_facts_and_myths_explained/)
- ["How to slice the codebase effectively?"](/en/how_to_slice_the_codebase_effectively/)
- ["Can command return a value?"](/en/can_command_return_a_value/)

Comments are welome!

Cheers!

Oskar
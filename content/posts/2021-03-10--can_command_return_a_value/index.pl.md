---
title: Can command return a value?
category: "CQRS"
cover: 2021-03-10-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-03-10-cover.png)

Last week I [busted common myths and explained facts about CQRS](/pl/cqrs_facts_and_myths_explained). Today I'll continue my effort. I tackle one of the most common questions about CQRS: _"Can command  return a value?"_. 

In programming, using phrases like _"must not"_, _"should not"_, _"never"_, _"it cannot be done"_ is very risky. What we said yesterday may hit us tomorrow. I experienced that more than once. For CQRS, I used a mental shortcut several times, saying _"the command cannot return a value"_. Never ever? It depends.

**What does _"returning a value/result/data"_ mean?** One of the basic concepts of programming is a function. The function takes the input data, performs the logic and returns the result. Simple as that? Not always. 

Things can get more complicated. Some programming languages allow defining the function result as  _void_ or _undefined_. In theory, it means that there is no result. In practice, it means that the operation has been successful. This is, in fact, an equivalent of returning boolean _true_ value.

What happens when an operation was unsuccessful? In many languages: we throw an exception. In functional programming or languages like Go, Rust, it's mandatory to always return the result even in case of failure. Why? Returning the result is explicit. You know what you expect. Using _void_ or throwing an exception is not clear enough. Java forces you to handle all exceptions and declare them on the method's signature. In C# or JavaScript, you have to guess what set of exceptions may be thrown. In fact, throwing an exception is also a type of result, just implicit (as we're expected to handle that somewhere).

**Now we already know that the function from _void_ does not mean that it returns nothing. It returns an implicit result.**

Useful APIs require expressiveness. HTTP-based API has a whole set of return statuses - both successful operations and errors.

So can command return a value ​​or not?

In CQRS, commands and queries segregation is based on the operation behaviour. Query returns data and does not change the application's state. Command modifies the state. Such segregation helps create loosely coupled components, evolving solutions, reducing the programmer's cognitive load by focusing on a specific task, scalability, etc.

**Is there a use case that would justify returning a value from command handling?** For sure, we should not return the information that was sent from the client. The client already knows it. What the client does not know is the data generated/calculated on the server-side. Usually, it is metadata such as modification date, version, sometimes also business data (e.g. new record status).

We know the object identifier during the update. When it's finished, we can query the appropriate read model after executing the command to get new data. New object creation is more complicated. Unless we generate an identifier on the client-side, we won't know which record was created without returning the new record's id.

**We have to remember that we can look at our application from two perspectives:**
- **Logical** - shows how we divide and structure a business code.
- **Technical** - describes how a specific implementation is organised, e.g. the storage structure, deployment etc. 

CQRS represents a logical view, API a technical one. They don't have to be the same, and we might need to map one concept to another. If we are doing a REST API, then after handling a command that creates a new record, we would like to return _201_ status with an identifier. If the error was thrown/returned by the business logic, we would like to get a specific HTTP error type.

**We have to make pragmatic decisions. In my opinion, it's okay to return id or status or any other needed metadata related to the behaviour we triggered.** Of course, we should be careful and always make sure that such compromise is required. If we abuse that, then the critical element of CQRS - Segregation will be contractual at best. This can impact not only the purity and coupling of our code but also performance and scalability. Read models may be handled by different nodes, storage engines, load-balanced etc.

We must remember that the command itself does not tell us what specific change it makes. It does not define whether the record will be added, updated or removed. What's more, it does not determine whether the change will affect one record or more. Even a single change may involve refreshing several read models (e.g. confirming the order updates the user's orders list, administration panel for the seller, notification view, order history, etc.). All of this is defined by the business logic of handling the command, not the command itself. Command represents the intention, not the way it's handled and what's the impact it does.

How am I handling CQRS with REST? Usually, I try to separate WebAPI contracts from the commands and queries definition. I'm treating WebAPI as an anti-corruption layer. In the controller method, I can generate an identifier and create the command based on that. The same identifier can then be returned to the Created status.

See the sample for the creating the cinema seat reservation (sample is in C# but I hope that's also straightforward for non-C# devs):

```csharp
[HttpPost]
public async Task<IActionResult> CreateTentative(
    [FromBody] CreateTentativeReservationRequest request)
{
    Guard.Against.Null(request, nameof(request));

    var reservationId = idGenerator.New();

    var command = CreateTentativeReservation.Create(
        reservationId,
        request.SeatId
    );

    await commandBus.Send(command);

    return Created("api/Reservations", reservationId);
}
```

I do not return any additional data in the case of an update/deletion.  It is straightforward for the client to query the API again.

For error handling, I usually make a processing error by throwing an appropriate exception and mapping it to HTTP status, e.g. via middleware:

```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate next;

    private readonly ILogger logger;

    public ExceptionHandlingMiddleware(RequestDelegate next,
        ILoggerFactory loggerFactory)
    {
        this.next = next;
        logger = loggerFactory.CreateLogger<ExceptionHandlingMiddleware>();
    }

    public async Task Invoke(HttpContext context /* other scoped dependencies */)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        logger.LogError(exception, exception.Message);

        var codeInfo = ExceptionToHttpStatusMapper.Map(exception);

        var result = JsonConvert.SerializeObject(new HttpExceptionWrapper((int)codeInfo.Code, codeInfo.Message));
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)codeInfo.Code;
        return context.Response.WriteAsync(result);
    }
}
```

Check the full sample in my repo: https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Sample/Tickets.

I generally suggest to keep our command handling *"clean"* and actually treat it as a _"void function"_. So the function that's not returning the business result but can return operation status or needed metadata.

Let me know about your approach. I'd love to find out what's your perspective on that.

Cheers!

Oskar
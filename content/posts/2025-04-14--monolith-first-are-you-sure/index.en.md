---
title: Monolith-First - are you sure?
category: Software Architecture
cover: 2025-04-14-cover.jpg
author: oskar dudycz
redirectFrom: /monolith-first-are-you-sure/
---

Welcome to the new week!

**Our industry is highly related to fashion and trends.** Trends set up by the tech influencers promoting some ideas, quite often that they haven’t even tried to apply in the real system. We’re the guinypigs.

**Every few years, our industry rallies around a new architectural approach that promises to solve all our problems.** A few years ago, we all wanted to be micro and distributed. Microservices for the win!

**Lately, the pendulum swung, and we hear the** _**“modular monolith first!”**_**.**

![Al Naslaa: meet Earth's most bizarre geological rock formation - Big Think](2025-04-14-cover.jpg "Al Naslaa: meet Earth's most bizarre geological rock formation - Big Think")

Or: _“If you cannot deal with monolith, microservices won’t work for you!”_.

I wrote an article some time ago about [the hardship of breaking down monoliths into microservices](/en/so-you-want-to-break-down-monolith/) and asked whether that makes sense in most cases. That could look like following the monolith-first gold advice, but actually it was not.

It sounds like our industry is filled with Siths, as we’re dealing with absolute blank statements. They’re nice hot takes to tell on social media, promote on Youtube or use in an online course, but the reality is much more complex.

On paper, it sounds perfect: start with a single codebase divided into clear modules, enjoy the simplicity of a monolith, and preserve the option to split into microservices later. But…

## Simple vs Simplistic

Let’s acknowledge the appeal first. You get a single deployment pipeline, avoiding the distributed systems’ complexity tax. Your developers can navigate the entire codebase without jumping between repositories. Cross-cutting concerns have a single known location. Communication between modules happens through direct method calls rather than over a network.

**Many systems don’t need distribution from day one.** A well-modularized monolith should be easier to achieve than a constellation of small services.

**The simplicity sounds real but can be deceptive.**

Of course, officially, we want to be good citizens, invest in modular design, and avoid chattiness and complexity, but too often, instead of a simple solution, we’re getting a simplistic solution.

**Essentially, we’re lying to ourselves, as the actual reason is that we do it because we want to take shortcuts.**

We want to massage the boundaries with:

-   transactions spanning across multiple features or modules,

-   shared database to query other modules,

-   change multiple modules at once,

-   don’t care about data governance,

-   etc.

Our “modular monolith” is as modular as typical micro-services are “micro”.

**I agree that our solutions should be simple, but they should not be simplistic.**

## The Boundary Problem

**It’s kinda sad that we need to use the “modular” adjective in the “modular monolith”.** It’s like claiming that a monolith, by definition, is not modular. Well, actually, it should be. If it’s not, then it’s not a monolith but just a [big ball of mud](http://www.laputan.org/mud/).

Still, this issue with the name highlights the main challenge. In theory, a modular monolith has clear boundaries between its components. In practice, these boundaries erode fast.

Consider a typical e-commerce platform with “Orders,” “Products,” and “Customers” modules. Without physical separation, developers inevitably create shortcuts:

```csharp
public void ProcessOrder(Order order)
{
    // Direct access to another module's repository
    var customer = this.customerRepository.GetById(order.CustomerId);

    // Logic that belongs in the Customer module
    if (customer.LoyaltyPoints > 1000)
    {
        order.ApplyDiscount(0.1m);
    }

    // ...
}
```

**This happens not because developers are careless but because it’s the path of least resistance.** When working on a feature spanning modules, it’s easier to add a direct dependency than to define interfaces and maintain module autonomy properly.

**The boundary violations compound exponentially.** Each small violation creates a precedent for more violations. The pattern I've seen repeatedly is that modules start with clean boundaries, but as feature development accelerates, these boundaries become increasingly porous. What makes this particularly insidious is that it happens in small increments. A tired developer working too long on a feature adds what seems like a harmless dependency. No alarms go off. Six months later, you've got a monolith that's merely a traditional monolith with extra folders.

Of course, we can try to refactor, and instead of using the repository with direct access to the storage, we can have a “well defined public API” and use it as hexagonal architecture, e.g.

```csharp
public void ProcessOrder(ICustomerService customerService, Order order)
{
    var discount =
        customerService.CalculateDiscountFor(
            order.CustomerId,
            order.TotalAmount
        );

    if (discount > 0)
    {
        order.ApplyDiscount(discount);
    }
}
```

But well, it is actually Potato vs Potahto.

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=Mc3Fn7R9mkE)`

The problem still exists; it’s a bit reduced, as the other team can have a bit more control over it and can set up some anti-corruption layer, but the boundaries are still mixed.

## Release Train

The typical advice is to use [mono-repo](https://en.wikipedia.org/wiki/Monorepo), keeping all modules in the same repo. That should streamline deployment and make it easier to do cross-cutting changes. That sounds great on paper, but… Choo-choo, here comes the release train!

If we have a monolithic deployment, then we need to deploy all modules at the same time. So if one of our friends from the other team merged something in their module, then if we want to deploy our stuff, then we need to deploy everything, including their changes.

I had numerous cases where the other team claimed that they tested everything, that it works, and that it won’t break anything, but then after deployment, it somehow didn’t work. Maybe migration failed, maybe some dependency clashed, maybe other random thing. Then it’s evening, you just wanted to deploy a small thing, and you’re trying to patch other teams’ changes.

Of course, you can and should do the following:

-   feature toggles,

-   avoid breaking changes,

-   version your changes, etc.

But well, are those monolith-first-influencers telling you about that? Read also in [Don't Oversell Ideas: Trunk-Based Development Edition](/en/dont-oversell-ideas-trunk-based-development/).

Of course, the mature solution is to pack each module into the deployment package (NuGet, Maven, Npm, etc.). Then, each package is released independently. Having that, even if the latest code is updated in the repo, you don’t need to bump the dependency and release with the old version.

But then we’re falling into another issue, which is that we need to have a process for aligning dependencies and knowing what version of each module is actually deployed. And that’s how we’re coming to…

## Tooling (im)maturity

One of the advantages showed for modular monolith is that it makes easier deployments and CI/CD process. You don’t need to use Kubernetes, Argo, and all that fancy stuff. But don’t you?

Unfortunately, managing mono-repos is not a common practice in most developed environments. You’re left with configuring pipelines manually and handle packages version and deployments.

Of course, there are tools like [Nx](https://nx.dev/), [Bazel](https://bazel.build/), [TurboRepo](https://turbo.build/) that makes it easier, but frankly even though they can build various development technologies, they’re more optimised for frontend as that’s where they started. Also knowledge about them in environments like .NET, Java, so those leaning towards monoliths are at best low.

Of course there are approaches like [Spring Modulith](https://spring.io/projects/spring-modulith) or [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/aspire-overview) that trying to make that easier, but then, at least with [Aspire it also ends up with simplistic instead of simple solution](/en/nay_to_aspire/).

So, yes, you can have a mature and nicely defined CI/CD process, but it doesn’t come without hassle as it’s advocated; it needs to be well-planned and iterated, as the tooling is just not yet there.

Also, if you look at environments like C# or JavaScript, they weren’t defined for such a modular approach.You cannot restrict easily access and referencing other modules, as C# can only do that for assembly, JavaScript for ES module.

You can trick that with static analysis or architecture tests, but again, those are tricks and not stuff that you can get out of the box.

**Don’t get me wrong; if you’re going with distributed systems like micro-services, you’ll also need to think about it.** The CNCF-related stack can indeed be overcomplicated, but it can also be more mature, as it was built to support those specific scenarios. If you know what you’re doing, you can develop the simpler stack for the monolith, but it’ll still require work and thinking. If you don’t, then you can come up with a more fragile and less organised flow that will require constant tweaking.

**It’s just not as simple as it’s pictured.**

## The Resource Contention Reality

In a microservices architecture, if the "Product Catalog" service has a memory leak, it doesn't affect order processing. If the "Payment" service [is CPU-bound](https://www.architecture-weekly.com/i/159744317/memory-bound-vs-cpu-bound), it doesn't slow down inventory updates. This isolation is a fundamental advantage of distribution.

The problems with resource contention in modular monoliths are very real:

Memory leaks in one module bring down the entire system, requiring a full restart that impacts all business functions.

CPU-intensive calculations in one module make interactive user operations sluggish across the entire application.

A module with improper exception handling can crash the entire application.

One module upgrading a shared library can break other modules that aren't ready for the change.

These issues aren't theoretical—they're daily operational realities for teams with modular monoliths in production.

## The Database Coupling Nightmare

**While we often focus on code-level coupling, the shared database in a modular monolith presents the most intractable problem.** In a true microservices architecture, each service owns its data.

You can also have the same separation per database or schema in a modular monolith. Still, most of the teams are selecting separation module-per-schema. Why? Quite often, because you can spin up transaction across multiple schemas and query data from multiple schemas in the same connections. Cheating, remember?

A shared database creates invisible dependencies between modules. Consider what happens when the "Orders" module needs to change its schema to support a new feature. Since the "Analytics" module directly queries the Orders tables, you now have a cross-module dependency that isn't visible in your code but will break spectacularly at runtime.

**I’m sure that if you tried to distribute a portion of your monolith, taking out some module, you found multiple times such hidden dependencies.**

Of course, you can set up the permission rules for schemas and ensure that other modules can’t access your data. But well, again that’s something that you need to plan and it doesn’t happen out of the box.

## The Generic Unit of Work Trap

And here comes my favourite nightmare: the generic unit of work. Martin Fowler defines it as everything one does during a business transaction that can affect the database. When the unit of work is finished, it will provide everything that needs to be done to change the database as a result of the work.

In modular monolith, even if we cheat, we want to try to decouple our flow into smaller pieces. That can mean:

-   Handling different business operations as different commands,

-   publishing the events to trigger the next step of the workflow,

-   etc.

Most people using monolith are _afraid_ of eventual consistency. They want to process all at once in the same process, most often also in the same transaction.

**As they decoupled pieces logically, they wanted to use a generic mechanism to gather all the changes in the same request.** As the mechanism is generic, we need to expect everything and prepare the implementation for everything.

**It usually starts simply by opening transactions across the whole request,** but that fails as we have more complex flows and start hitting deadlocks and performance issues (as multiple transactions try to modify the same data).

**Then we optimise it, opening transactions only upon save.** Before that, we’re caching our changes in a unit of work changeset, but then the challenge appears, as this data is not stored physically in the database; then, if we try to query it, it won’t be there. Why do we need to query? E.g. to access data stored in command processing in the next step of the workflow triggered by the event.

So we add a 2nd level cache and either load data by ID from the cache or from the DB (if it’s not in the cache). But then we’re hitting discrepancies and are not always able to detect what’s the actual source of truth. Concurrency issues are killing us. Ah, and at some point reading by id is not enough, we need to do more advanced filtering. Try to merge 2nd level cache with data from db…

**I did all of that in past, and frankly, I hate every minute spent working on such a mechanism. It all looks simple when you’re starting, but it’s a long tail of accidental complexity.**

Of course, there are solutions. You can set up a rule that:

-   you storing results, and even handling multiple commands for user facing, synchronous operations (Read more in [How to handle multiple commands in the same transaction](/en/simple_transactional_command_orchestration/)),

-   Each of the messages that are published as an outcome needs to be published through an [Outbox Pattern](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/).

That gives you a proper process isolation, delivery guarantee, simpler to reason flow, but can bring eventual consistency for multiple step workflows. That’s most of the time acceptable by business, can be tricked to be synchronous with [long polling](/en/long_polling_and_eventual_consistency/) but it’s a tradeoff, and something to consider. Plus [implementing outbox on your own doesn’t have to be so simple as it seems](/en/ordering_in_postgres_outbox/).

## Monolith-first? Modular-first!

**I’m not against monolith-first. Moreover, I agree with the general principles, but I wanted to debunk some myths around it.**

**The modular monolith isn't a free lunch.** Like all architectural approaches, it comes with tradeoffs. The problem isn't that these tradeoffs exist but that they're rarely acknowledged by proponents of the "modular monolith first" advice.

If you're a technical leader making architectural decisions, don't fall for the myth that a modular monolith gives you the best of both worlds without the drawbacks of either. Instead, carefully consider your team's capabilities, business requirements, and growth projections.

Sometimes, starting with separate services is genuinely the right choice. Sometimes, a traditional monolith with clear internal structures is simpler and more honest than pretending you're building something modular.

So it’s not precise to say:

> _“If you cannot deal with monolith, microservices won’t work for you!”_.

The actual phrase should be: _**if you can’t deal with modularity, then neither monoliths nor microservices will work for you.**_

If you try to cheat and select modulith-first to cheat using a simplistic solution, it won’t help you; you will probably end up with a big ball of mud.

Monolith-first can give you a gradual process of reaching maturity, but you need to plan it and consider that the DevOps process related to it and tooling is not as simple and mature as glossed.

So, if you’re considering whether to go with microservices-first or monolith-first, you may be thinking the wrong way.

**You should go Modular-First and then think about your deployment strategy.**

Whatever you choose, you’ll need to do exercise and think about how to solve:

-   data isolation (modules, tenantc, etc.),

-   data consistency (transactional, eventual, causal, etc.)

-   modules boundaries,

-   process boundaries and how you model integrations,

-   DevOps process,

-   Code structure,

-   how to fit that with your team experience,

-   how to fit that with your budget and your product,

-   etc.

Saying to go monolith-first or micro-service first won’t give you proper answers and might not even be a strategy but just a blank statement that will hide the real complexity.

As always, be pragmatic and pick your poison!

You may also be interested in:

-   [How to quickly scale a legacy monolith?](/en/how_to_quickly_scale_a_legacy_monolith/)

-   [How (not) to cut microservices](/en/how_to_cut_microservices/)

-   [How to design software architecture pragmatically](/en/how_to_design_software_architecture_pragmatically/)

Cheers!

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).

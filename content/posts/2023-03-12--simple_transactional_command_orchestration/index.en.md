---
title: How to handle multiple commands in the same transaction
category: "Event Sourcing"
cover: 2023-03-12-cover.png
author: oskar dudycz
---

![cover](2023-03-12-cover.png)

**Let's say that we're starting a new project.** It's a small tool for internal needs, maybe even some sort of [shadow IT](https://en.wikipedia.org/wiki/Shadow_IT) project. It may also be the project that won't have massive traffic and won't need to scale significantly. We're more caring about the delivery time, solving the exact issue. So for our case, consistency may also be a more important factor. Yes, contrary to common belief presented in the conference talks, such projects are still run.

**Take project management, for example, Jira-like software.** We'd like to create a workspace for specific company departments where they can manage their projects. Our business wants to have the default project created during workspace creation. That can cut out some keystrokes and make the setup more accessible.

Is this example dumb? Maybe, as it may seem, as the typical _buy-it-from-the-shelve_ option. Yet, the power is in the niche. I was once involved in building a product focused on project management for the construction industry. They have the specific needs to manage big [CAD](https://en.wikipedia.org/wiki/Computer-aided_design) files and manage formal discussions on their changes. Building tools focused on solving a particular niche need may also be a correct decision, as more generic solutions won't fulfil all the needs.

**Nevertheless, the problem I'm going to explain is generic. _How to handle two commands_ or _how to change two aggregates in one transaction_ are one of those questions I'm asked most often.**

The answer is always _it depends_. The classical event-driven way is to use [asynchronous process](/en/saga_process_manager_distributed_transactions/) together with [outbox pattern](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/). **Yet, in some cases, isn't it too much?**

Let's say that the first result of our experimentation looks like that:

```csharp
[ApiController]
[Route("[controller]")]
public class WorkspaceController: ControllerBase
{
    private readonly IDocumentSession documentSession;

    public WorkspaceController(IDocumentSession documentSession) =>
        this.documentSession = documentSession;

    [HttpPost]
    public async Task<ActionResult<WorkspaceDetails>> Post(CreateWorkspaceRequest request)
    {
        var userId = GetUserId(HttpContext);
        var workspaceId = MartenIdGenerator.New();
        var cmd = new CreateWorkspace(workspaceId, request.Name, request.TaskPrefix, userId);

        var (workspaceCreatedEvent, backlogCreatedEvent) = Handle(cmd);

        documentSession.Events.Append(workspaceId, workspaceCreatedEvent);
        documentSession.Events.Append(backlogCreatedEvent.ProjectId, backlogCreatedEvent);
        await documentSession.SaveChangesAsync();

        var workspace = await documentSession.LoadAsync<WorkspaceDetails>(workspaceId);

        if (workspace is null)
            return NotFound();

        return Ok(workspace);
    }
}
```

It's a simple ASP.NET controller that fulfils application layer needs. We're using [Marten](https://martendb.io/) to store the events defined by the business logic.

```csharp
public static class WorkspaceService
{
    public static (WorkspaceCreated, ProjectCreated) Handle(CreateWorkspace command)
    {
        var slug = SlugGenerator.New(command.Name);
        var backlogId = MartenIdGenerator.New();

        return new(
            new WorkspaceCreated(
                WorkspaceId: command.WorkspaceId,
                Name: command.Name,
                TaskPrefix: command.TaskPrefix,
                Slug: slug,
                CreatedById: command.CreatedById
            ),
            new ProjectCreated(
                ProjectId: backlogId,
                Name: "Backlog",
                StartDate: null,
                EndDate: null,
                Status: ProjectStatus.Active,
                Slug: "backlog",
                WorkspaceId: command.WorkspaceId,
                CreatedById: command.CreatedById,
                IsBacklog: true
            )
        );
    }
}
```

**If you're not using Event Sourcing, C# or Marten, bear with me. What I will show will also apply to other logic that we need to orchestrate in a transactional way.**

Getting back to our code, we're not using aggregate or other fancy patterns, as our logic is simple enough; using function will be more than enough. We're just taking command, generating some data and returning events that the workspace and project were created.

The code generally looks alright, but it's already a bit smelly. We see that once it evolves with upcoming requirements, it may not withstand the test of time.

**Especially those three lines look suspicious:**

```csharp
documentSession.Events.Append(workspaceId, workspaceCreatedEvent);
documentSession.Events.Append(backlogCreatedEvent.ProjectId, backlogCreatedEvent);
await documentSession.SaveChangesAsync();
```

It seems that our business logic generates two events that should be stored in different streams. We're crossing the entity boundaries. Calling _SaveChangesAsync_ will ensure that all of the changes will be stored or none. Consistency is guaranteed, but it seems wrong. Why?

**Project and Workspace are separate things with different lifetimes, business rules, etc.** If we keep the default project creation in _WorkspaceService_ and add later on dedicated _ProjectService_ for other operations (e.g. regular creation), then we're not having a single source of truth. 

Let's then move the project creation to a dedicated service. Our _ProjectService_ may look as follows:

```csharp
public static class ProjectService
{
    public record CreateBacklogProject(
        Guid ProjectId,
        Guid WorkspaceId,
        Guid CreatedById
    );

    public static ProjectCreated Handle(CreateBacklogProject command) =>
        new ProjectCreated(
            ProjectId: command.ProjectId,
            Name: "Backlog",
            StartDate: null,
            EndDate: null,
            Status: ProjectStatus.Active,
            Slug: "backlog",
            WorkspaceId: command.WorkspaceId,
            CreatedById: command.CreatedById,
            IsBacklog: true
        );
}
```

Nothing fancy, but it's already prepared for upcoming rules and methods specific to the project. **Notice that we already embraced in the command name that backlog project may differ from a regular one.** It is a small detail, but better not to generalise our business logic too early. We can always do that later when we understand the nuances of our domain better. We could also create a dedicated event for that, e.g. _BacklogProjectCreated_ if we believe that's different enough from the regular one.

The _WorkspaceService_ will look now as:

```csharp
public static class WorkspaceService
{
    public record CreateWorkspace(
        Guid WorkspaceId,
        string Name,
        string TaskPrefix,
        Guid CreatedById
    );
    
    public static WorkspaceCreated Handle(CreateWorkspace command) =>
        new WorkspaceCreated(
            WorkspaceId: command.WorkspaceId,
            Name: command.Name,
            TaskPrefix: command.TaskPrefix,
            Slug: SlugGenerator.New(command.Name),
            CreatedById: command.CreatedById
        );
}
```

Our business logic didn't change much, but we already see explicitly that those are different operations:

```csharp
var workspaceCreated = Handle(new CreateWorkspace(workspaceId, request.Name, request.TaskPrefix, userId));
var backlogCreated = Handle(new CreateBacklogProject(backlogId, workspaceId, userId));

documentSession.Events.Append(workspaceId, workspaceCreated);
documentSession.Events.Append(backlogId, backlogCreated);

await documentSession.SaveChangesAsync();
```

If we know already that we'll need this _pattern_ more often, we could also add a helper method to handle such scenarios.

```csharp
public static class CommandHandling
{
    public static Task ComposeAsync(this IDocumentSession documentSession, params (Guid, object)[] events)
    {
        foreach (var (streamId, @event) in events)
        {
            documentSession.Events.Append(streamId, @event);
        }

        return documentSession.SaveChangesAsync();
    }
}
```

And use it as such:

```csharp
await documentSession.ComposeAsync(
    (workspaceId, Handle(new CreateWorkspace(workspaceId, request.Name, request.TaskPrefix, userId))),
    (backlogId, Handle(new CreateBacklogProject(backlogId, workspaceId, userId)))
);
```

If we'd like to make this process explicit, we could even set up a Domain Service to orchestrate this process.

```csharp
using static WorkspaceService;
using static ProjectService;

public static class WorkspaceCreationScenario
{
    public static (WorkspaceCreated, ProjectCreated) CreateWorkspace(
        Func<Guid> generateId,
        Guid userId,
        string name,
        string taskPrefix
    )
    {
        var workspaceId = generateId();
        var backlogId = generateId();

        return new(
            Handle(new CreateWorkspace(workspaceId, name, taskPrefix, userId)),
            Handle(new CreateBacklogProject(backlogId, workspaceId, userId))
        );
    }
}

```

We can also define an explicit code to orchestrate that with storage:

```csharp
public static class WorkspaceCreationScenarioHandler
{
    public static async Task<Guid> CreateWorkspace(
        this IDocumentSession documentSession,
        Guid userId,
        string name,
        string taskPrefix
    )
    {
        var (workspaceCreated, projectCreated) =
            WorkspaceCreationScenario.CreateWorkspace(MartenIdGenerator.New, userId, name, taskPrefix);

        await documentSession.ComposeAsync(
            (workspaceCreated.WorkspaceId, workspaceCreated),
            (projectCreated.ProjectId, projectCreated)
        );

        return projectCreated.WorkspaceId;
    }
}
```

Then our controller method can look like this:

```csharp
[HttpPost]
public async Task<ActionResult<WorkspaceDetails>> Post(CreateWorkspaceRequest request)
{
    var workspaceId = await documentSession.CreateWorkspace(
        GetUserId(HttpContext),
        request.Name,
        request.TaskPrefix
    );

    var workspace = 
        await documentSession.LoadAsync<WorkspaceDetails>(workspaceId);

    if (workspace is null)
        return NotFound();

    return Ok(workspace);
}
```

**Didn't we just create more code?** Yes, we did; what's the reason, then?

It could be helpful if your scenario evolves. Let's say that besides the default project, you'd like to also:
- create a default project manager,
- send an email,
- setup some storage for project files,
- etc.

**In that case, you might just need to change the parts that should be moving.** It'll only involve updating the orchestration code in Scenario by adding integration with another logic. You won't need to touch other command handlers or API endpoint.

**Of course, you need to make a sanity check.** At some point, the write amplification may be too big. Modifying too many entities in the same transaction is asking youurself for concurrency conflicts and deadlocks. Asynchronous processing wasn't invented just to make our life harder. At least, not only.

**Still, we already made things explicit; we distilled the business logic from coordination and drawing boundaries.** If it appears that we're doing too much, we can replace our scenario with [Saga or another asynchronous coordination style](/en/saga_process_manager_distributed_transactions/). We focused on composition instead of adding new layers, as [generic does not mean simple](/en/generic_does_not_mean_simple/).

You could notice that I didn't include returning data in our scenario class. Why? I'm a huge fan of separating business logic from queries. A clear split of which classes are responsible for running business logic and querying makes code more predictable. We may decide to orchestrate that on the application layer and still return the data from the controller method, but we should keep the split layer down. I wrote longer on those considerations in [Can command return a value?](/en/can_command_return_a_value/).

**What if we do one more step and isolate the data retrieval from command handling but still give the client application a similar experience?** We could use [Location header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) for that. It tells where's the newly created resource. The client will need to do one more call, but typically it's not an issue as browsers, and most of the mature HTTP client libraries do it automatically after seeing [201 CREATED](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201) status. 

How to do it? Simple as that:

```csharp
[ApiController]
[Route("[controller]")]
public class WorkspaceController: ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<WorkspaceDetails>> Post(
        [FromServices] IDocumentSession documentSession,
        CreateWorkspaceRequest request
    )
    {
        var workspaceId = await documentSession.CreateWorkspace(
            GetUserId(HttpContext),
            request.Name,
            request.TaskPrefix
        );

        return Created($"/workspace/{workspaceId}", workspaceId);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkspaceDetails>> GetById(
        [FromServices] IQuerySession querySession,
        Guid id
    )
    {
        var workspace = await querySession.LoadAsync<WorkspaceDetails>(id);

        return workspace is not null ? Ok(workspace) : NotFound();
    }
}
```

**It is also a good practice not to do redundant roundtrips, especially by default, assuming the client will need this data.** Most of the time, the client already knows what they submitted. Of course, some data may be generated on the backend, but will the client immediately need them? We should always try to define the UI in that way to make the user flow the most effective, but we also take other considerations. Smart UX can also cut off a lot of complexity from the technical solution.

**So, how far can you go with this pattern?** There's no obvious answer. Going down that path is always a tradeoff and potential _design smell_. We should be careful applying that and avoid getting too attached to it. I suggest using it as a pragmatic choice, a way to experiment and deliver business value.

**All models are wrong, but some of them are useful.** Don't treat your model as set in stone but as a living thing that should evolve when you learn more about your business or requirements change. 

Build the code that's explicit about intention and removable. I hope this article gives you a decent food for thought on how to achieve that.

You can also check [this PR and follow commits](https://github.com/oskardudycz/EventSourcing.NetCore/pull/209/commits) to see the refactoring step by step.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
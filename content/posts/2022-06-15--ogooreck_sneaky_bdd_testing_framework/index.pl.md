---
title: Ogooreck, a sneaky testing library in BDD style
category: "Testing"
cover: 2022-06-15-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-06-15-cover.png)

Some time ago, I saw an excellent presentation of Dylan's Beattie presentation - [The Art of Code](https://www.youtube.com/watch?v=6avJHaC3C2U). It reminds us of what we are here for. By _here_ I mean in front of the computer. **It shows the forgotten fun of discovering that computers can do what we tell them to**.

I sometimes forget about it in my daily routine. Our work can be very repetitive, HTML form here, HTML form there. Some time ago, I [wrote about examples I did in Java](/pl/12_things_I_learned_on_last_pull_request_review/). I wrote them using (in my opinion) an interesting approach to testing. Based on **Behavior-Driven Development**. It is an approach to testing similar to TDD, but the accent lies elsewhere. Instead of technical tests (_Arrange / Act / Assert_), we're focusing on the process, so business logic (_Given / When / Then_). This small change also allows us to better think about the API of the code we are writing.

Many people think about them as writing UI tests (using tools such as [Cucumber](https://cucumber.io/) using [Gherkin](https://cucumber.io/docs/gherkin/) syntax). Some people believe that business people will write such tests. I consider it a pipe dream. I have never seen it working out in the long term. It usually ends with art for art's sake. However, this does not change the fact that BDD principles are vital to me. I like when the tests focus on business (even when we test a purely technical class), so I'm concentrating on why we're changing this code. I also like when my tests are a form of code documentation. I have not found a better form.

**So, where is the fun I mentioned?**

Tests are rarely associated with fun. I buy it, but writing your test tool is another beast. I sat down once on Friday night and Saturday morning and produced something like this:

```csharp
public class Tests: IClassFixture<ApiSpecification<Program>>
{
    [Fact]
    public Task GetProducts() =>
        API.Given()
            .When(GET, URI("/api/products"))
            .Then(OK);

    [Fact]
    public Task RegisterProduct() =>
        API.Given()
            .When
            (
                POST,
                URI("/api/products"),
                BODY(new RegisterProductRequest("abc-123", "Ogooreck"))
            )
            .Then(CREATED);

    private ApiSpecification<Program> API;
    public Tests(ApiSpecification<Program> api) => API = api;
}
```

...and I liked it!

**I created the tool and named it: Ogooreck. A Sneaky Testing Library.**

My idea is not to create an entire BDD framework but a tool that will allow you to write tests in this form. Not a tool that will replace others, but rather something simple but specific to specific usage scenarios. So, on the one hand, it is a general usage tool that can be expanded, but with a set of shortcuts that will allow you to write tests quickly and make them self-explanatory. For example, API tests, Event Sourcing, or just unit tests.

Having that idea and base implementation, I decided to baptise it in fire, by refactoring my [EventSourcing.NET samples to use it](https://github.com/oskardudycz/EventSourcing.NetCore/pull/136). That was a hell of a work, but it was worth it, as I wasn't happy with them. Plus, it was a great chance to see how Ogooreck will play with the real world.

To sum up. Main assumptions are :
- write tests seamlessly,
- make them readable,
- cut needed boilerplate by the set of helpful extensions and wrappers,
- don't replace testing frameworks (works with all, so XUnit, NUnit, MSTests, etc.),
- testing frameworks and assert library agnostic,
- keep things simple, but allow compositions and extension.

[It also supports testing business logic for multiple scenarios like](/pl/testing_event_sourcing/):
- CQRS,
- Aggregate,
- Event Sourcing,
- etc.

It's available on:
- GitHub: https://github.com/oskardudycz/Ogooreck,
- NuGet: https://www.nuget.org/packages/Ogooreck.

OK, so how to use it?

## API Testing

Ogooreck provides a set of helpers to set up HTTP requests, Response assertions. I recommend adding such _usings_ to your tests:

```csharp
using Ogooreck.API;
using static Ogooreck.API.ApiSpecification;
```

Thanks to that, you'll get cleaner access to helper methods.

See more in samples below!

### POST

Ogooreck provides a set of helpers to construct the request (e.g. _URI_, _BODY_) and check the standardised responses.

```csharp
public Task POST_CreatesNewMeeting() =>
    API.Given()
        .When
        (
            POST
            URI("/api/meetings/),
            BODY(new CreateMeeting(Guid.NewGuid(), "Event Sourcing Workshop"))
        )
        .Then(CREATED);
```

### PUT

You can also specify headers, e.g. _IF_MATCH_ to perform an optimistic concurrency check.

```csharp
public Task PUT_ConfirmsShoppingCart() =>
    API.Given()
         .When
         (
            PUT
            URI($"/api/ShoppingCarts/{API.ShoppingCartId}/confirmation"),
            HEADERS(IF_MATCH(1))
         )
         .Then(OK);
```

### GET

You can also do response body assertions, for instance, out of the box check if the response body is equivalent to the expected one:

```csharp
public Task GET_ReturnsShoppingCartDetails() =>
    API.Given()
        .When(GET, URI($"/api/ShoppingCarts/{API.ShoppingCartId}"))
        .Then(
            OK,
            RESPONSE_BODY(new ShoppingCartDetails
            {
                Id = API.ShoppingCartId,
                Status = ShoppingCartStatus.Confirmed,
                ProductItems = new List<PricedProductItem>(),
                ClientId = API.ClientId,
                Version = 2,
            }));
```

You can also use _GET_UNTIL_ helper to check API that has eventual consistency.

You can use various conditions, e.g. _RESPONSE_SUCCEEDED_ waits until a response has one of the _2xx_ statuses. That's useful for new resource creation scenarios.

```csharp
public Task GET_ReturnsShoppingCartDetails()
    API.Given()
        .When(GET, URI($"/api/ShoppingCarts/{API.ShoppingCartId}"))
        .Until(RESPONSE_SUCCEEDED)
        .Then(
            OK,
            RESPONSE_BODY(new ShoppingCartDetails
            {
                Id = API.ShoppingCartId,
                Status = ShoppingCartStatus.Confirmed,
                ProductItems = new List<PricedProductItem>(),
                ClientId = API.ClientId,
                Version = 2,
            }));
```

You can also use _RESPONSE_ETAG_IS_ helper to check if ETag matches your expected version. That's useful for state change verification.

```csharp
public Task GET_ReturnsShoppingCartDetails() =>
    API.Given()
        .When(GET, URI($"/api/ShoppingCarts/{API.ShoppingCartId}"))
        .Until(RESPONSE_ETAG_IS(2)
        .Then(
            OK,
            RESPONSE_BODY(new ShoppingCartDetails
            {
                Id = API.ShoppingCartId,
                Status = ShoppingCartStatus.Confirmed,
                ProductItems = new List<PricedProductItem>(),
                ClientId = API.ClientId,
                Version = 2,
            }));
```

You can also do more advanced filtering via _RESPONSE_BODY_MATCHES_. That's useful for testing filtering scenarios with eventual consistency (e.g. having _Elasticsearch_ as storage).

You can also do custom checks on the body, providing expression.

```csharp
public Task GET_ReturnsShoppingCartDetails() =>
    API.Given()
        .When
        (
            GET,
            URI($"{MeetingsSearchApi.MeetingsUrl}?filter={MeetingName}")
        )
        .Until(
            RESPONSE_BODY_MATCHES<IReadOnlyCollection<Meeting>>(
                meetings => meetings.Any(m => m.Id == MeetingId))
        )
        .Then(
            RESPONSE_BODY<IReadOnlyCollection<Meeting>>(meetings =>
                meetings.Should().Contain(meeting =>
                    meeting.Id == MeetingId
                    && meeting.Name == MeetingName
                )
            ));
```

### DELETE

Of course, the delete keyword is also supported.

```csharp
public Task DELETE_ShouldRemoveProductFromShoppingCart() =>
    API.Given()
        .When
        (
            DELETE,
            URI(
                $"/api/ShoppingCarts/{API.ShoppingCartId}/products/{API.ProductItem.ProductId}?quantity={RemovedCount}&unitPrice={API.UnitPrice}"),
            HEADERS(IF_MATCH(1))
        )
        .Then(NO_CONTENT);
```

### Scenarios and advanced composition

Ogooreck supports various ways of composing the API, e.g.

**Classic Async/Await**

```csharp
public async Task POST_WithExistingSKU_ReturnsConflictStatus()
{
    // Given
    var request = new RegisterProductRequest("AA2039485", ValidName, ValidDescription);

    // first one should succeed
    await API.Given()
        .When
        (
            POST,
            URI("/api/products/"),
            BODY(request)
        )
        .Then(CREATED);

    // second one will fail with conflict
    await API.Given()
        .When
        (
            POST
            URI("/api/products/"),
            BODY(request)
        )
        .Then(CONFLICT);
}
```

**Joining with _And_**

```csharp
public Task SendPackage_ShouldReturn_CreatedStatus_With_PackageId() =>
        API.Given()
            .When(
                POST,
                URI("/api/Shipments/"),
                BODY(new SendPackage(OrderId, ProductItems))
            )
            .Then(CREATED)
            .And(response => fixture.ShouldPublishInternalEventOfType<PackageWasSent>(
                @event =>
                    @event.PackageId == response.GetCreatedId<Guid>()
                    && @event.OrderId == OrderId
                    && @event.SentAt > TimeBeforeSending
                    && @event.ProductItems.Count == ProductItems.Count
                    && @event.ProductItems.All(
                        pi => ProductItems.Exists(
                            expi => expi.ProductId == pi.ProductId && expi.Quantity == pi.Quantity))
            ));
```

**Chained Api Scenario**

```csharp
public async Task Post_ShouldReturn_CreatedStatus_With_CartId()
    {
        var createdReservationId = Guid.Empty;

        await API.Scenario(
            // Create Reservations
            API.Given()
                .When
                (
                    POST,
                    URI("/api/Reservations/"),
                    BODY(new CreateTentativeReservationRequest { SeatId = SeatId })
                )
                .Then(CREATED,
                    response =>
                    {
                        createdReservationId = response.GetCreatedId<Guid>();
                        return ValueTask.CompletedTask;
                    }),

            // Get reservation details
            _ => API.Given()
                .When(
                    GET,
                    URI($"/api/Reservations/{createdReservationId}")
                )
                .Then(
                    OK,
                    RESPONSE_BODY<ReservationDetails>(reservation =>
                    {
                        reservation.Id.Should().Be(createdReservationId);
                        reservation.Status.Should().Be(ReservationStatus.Tentative);
                        reservation.SeatId.Should().Be(SeatId);
                        reservation.Number.Should().NotBeEmpty();
                        reservation.Version.Should().Be(1);
                    })),

            // Get reservations list
            _ => API.Given()
                .When(
                    GET,
                    URI("/api/Reservations/")
                )
                .Then(
                    OK,
                    RESPONSE_BODY<PagedListResponse<ReservationShortInfo>>(reservations =>
                    {
                        reservations.Should().NotBeNull();
                        reservations.Items.Should().NotBeNull();

                        reservations.Items.Should().HaveCount(1);
                        reservations.TotalItemCount.Should().Be(1);
                        reservations.HasNextPage.Should().Be(false);

                        var reservationInfo = reservations.Items.Single();

                        reservationInfo.Id.Should().Be(createdReservationId);
                        reservationInfo.Number.Should().NotBeNull().And.NotBeEmpty();
                        reservationInfo.Status.Should().Be(ReservationStatus.Tentative);
                    })),

            // Get reservation history
            _ => API.Given()
                .When
                (
                    GET,
                    URI($"/api/Reservations/{createdReservationId}/history")
                )
                .Then(
                    OK,
                    RESPONSE_BODY<PagedListResponse<ReservationHistory>>(reservations =>
                    {
                        reservations.Should().NotBeNull();
                        reservations.Items.Should().NotBeNull();

                        reservations.Items.Should().HaveCount(1);
                        reservations.TotalItemCount.Should().Be(1);
                        reservations.HasNextPage.Should().Be(false);

                        var reservationInfo = reservations.Items.Single();

                        reservationInfo.ReservationId.Should().Be(createdReservationId);
                        reservationInfo.Description.Should().StartWith("Created tentative reservation with number");
                    }))
        );
    }
```

### XUnit setup

Although Ogooreck is testing framework agnostic, the initial tests were made for XUnit. If you're using it, here are some hints on how to use it.

### Injecting as Class Fixture

By default, I recommend injecting _ApiSpecification<YourProgram>_ instance as _ClassFixture_ to ensure that all dependencies (e.g. _HttpClient_) will be appropriately disposed.

```csharp
public class CreateMeetingTests: IClassFixture<ApiSpecification<Program>>
{
    private readonly ApiSpecification<Program> API;

    public CreateMeetingTests(ApiSpecification<Program> api) => API = api;

    [Fact]
    public Task CreateCommand_ShouldPublish_MeetingCreateEvent() =>
        API.Given()
            .When
            (
                POST,
                URI("/api/meetings/),
                BODY(new CreateMeeting(Guid.NewGuid(), "Event Sourcing Workshop"))
            )
            .Then(CREATED);
}
```


### Setting up data with _IAsyncLifetime_

Sometimes you need to set up test data asynchronously (e.g. open a shopping cart before cancelling it). You might not want to pollute your test code with test case setup or do more extended preparation. For that XUnit provides _IAsyncLifetime_ interface. You can create a fixture derived from the _APISpecification_ to benefit from built-in helpers and use it later in your tests.

```csharp
public class GetProductsFixture: ApiSpecification<Program>, IAsyncLifetime
{
    public List<ProductListItem> RegisteredProducts { get; } = new();

    public GetProductsFixture(): base(new WarehouseTestWebApplicationFactory()) { }

    public async Task InitializeAsync()
    {
        var productsToRegister = new[]
        {
            new RegisterProductRequest("ZX1234", "ValidName", "ValidDescription"),
            new RegisterProductRequest("AD5678", "OtherValidName", "OtherValidDescription"),
            new RegisterProductRequest("BH90210", "AnotherValid", "AnotherValidDescription")
        };

        foreach (var registerProduct in productsToRegister)
        {
            var createdId = await Given()
                .When(POST, URI("/api/products"), BODY(registerProduct))
                .Then(CREATED)
                .GetCreatedId<Guid>();

            var (sku, name, _) = registerProduct;
            RegisteredProducts.Add(new ProductListItem(createdId, sku!, name!));
        }
    }

    public Task DisposeAsync() => Task.CompletedTask;
}

public class GetProductsTests: IClassFixture<GetProductsFixture>
{
    private readonly GetProductsFixture API;

    public GetProductsTests(GetProductsFixture api) =>
        API = api;

    [Fact]
    public Task ValidRequest_With_NoParams_ShouldReturn_200() =>
        API.Given()
            .When(GET, URI("/api/products/"))
            .Then(OK, RESPONSE_BODY(API.RegisteredProducts));

    [Fact]
    public Task ValidRequest_With_Filter_ShouldReturn_SubsetOfRecords()
    {
        var registeredProduct = API.RegisteredProducts.First();
        var filter = registeredProduct.Sku[1..];

        return API.Given()
            .When(GET, URI($"/api/products/?filter={filter}"))
            .Then(OK, RESPONSE_BODY(new List<ProductListItem> { registeredProduct }));
    }

    [Fact]
    public Task ValidRequest_With_Paging_ShouldReturn_PageOfRecords()
    {
        // Given
        const int page = 2;
        const int pageSize = 1;
        var pagedRecords = API.RegisteredProducts
            .Skip(page - 1)
            .Take(pageSize)
            .ToList();

        return API.Given()
            .When(GET, URI($"/api/products/?page={page}&pageSize={pageSize}"))
            .Then(OK, RESPONSE_BODY(pagedRecords));
    }

    [Fact]
    public Task NegativePage_ShouldReturn_400() =>
        API.Given()
            .When(GET, URI($"/api/products/?page={-20}"))
            .Then(BAD_REQUEST);

    [Theory]
    [InlineData(0)]
    [InlineData(-20)]
    public Task NegativeOrZeroPageSize_ShouldReturn_400(int pageSize) =>
        API.Given()
            .When(GET, URI($"/api/products/?pageSize={pageSize}"))
            .Then(BAD_REQUEST);
}
```

Read also:
- [Behaviour-Driven Design is more than tests](/pl/behaviour_driven_design_is_not_about_tests/)
- [How to test event-driven projections](/pl/testing_event_driven_projections/)
- [Writing and testing business logic in F#](/pl/writing_and_testing_business_logic_in_fsharp/)
- [Testing business logic in Event Sourcing, and beyond!](/pl/testing_event_sourcing/)
- [I tested it on production and I'm not ashamed of it](/pl/i_tested_on_production/)

## Credits

Last but not least, special thanks go to:
- Simon Cropp for [MarkdownSnippets](https://github.com/SimonCropp/MarkdownSnippets) that I'm using for plugging snippets to markdown,
- Adam Ralph for [BullsEye](https://github.com/adamralph/bullseye), which I'm using to make the build process seamless,
- [Babu Annamalai](https://mysticmind.dev/) that did a similar build setup in [Marten](https://martendb.io/) which I inspired a lot,
- Dennis Doomen for [Fluent Assertions](https://fluentassertions.com/), which I'm using for internal assertions, especially checking the response body.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

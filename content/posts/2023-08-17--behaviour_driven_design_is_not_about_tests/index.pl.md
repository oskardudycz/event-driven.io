---
title: Behaviour-Driven Design is more than tests
category: "Testing"
cover: 2023-08-17-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

**Why did I name the testing library _[Ogooreck](https://github.com/oskardudycz/Ogooreck)_?** Between my friends, I'm well known for my lame jokes. [Ogooreck](https://github.com/oskardudycz/Ogooreck) is one of them. 

Ogooreck is a phonetical written Ogórek. Seeing the vowel, you may be already guessing it's a Polish word, and you're correct. Ogórek in Polish means Cucumber. The intriguing part is that it's one of the rare Polish words that succeeded and got into other languages. [German also took the phonetic and named this delicious vegetable Gurke](https://en.wiktionary.org/wiki/Gurke). And the small one is called [gherkin](https://en.wiktionary.org/wiki/gherkin). 

**Still, fondness for the terrible jokes wasn't the only reason I named Ogooreck like that.** It was also a way to express that I don't want to build yet another [Cucumber](https://cucumber.io/) clone. 

**I like Behaviour-Driven Design. Focusing on the behaviour of our system is one of the foundations of my software design.** That's also a reason why I'm a big fan of [modelling by events](/pl/how_to_effectively_compose_your_business_logic/),  [CQRS](/pl/cqrs_facts_and_myths_explained/), [Vertical Slices](/pl/vertical_slices_in_practice/) and [Feature Folders](en/how_to_slice_the_codebase_effectively/). They all help keep an eye on the problem we need to solve.

In my world, the behaviour of the system should be reflected in all the places. So design, backend, frontend and tests. 

Let's check the main points behind BDD that Dan North wrote when [introducing it in his article](https://dannorth.net/introducing-bdd/): 

> Test method names should be sentences
>
> A simple sentence template keeps test methods focused
>
> An expressive test name is helpful when a test fails 
>
> "Behaviour" is a more useful word than "test" 
>
> JBehave emphasizes behaviour over testing
> 
> Determine the next most important behaviour
> 
> Requirements are behaviour, too
>
> BDD provides a "ubiquitous language" for analysis
> 
> Acceptance criteria should be executable

Even though you can read between those lines that Behaviour-Driven Design is more than just about testing, the initial context related to tests puts it into a corner. Dan North, years later, gave a talk with a very telling title:

`youtube: https://www.youtube.com/watch?v=6nSwRSbc27g`

**Not only tests took over the perspective.** Also, trying to streamline work between the business and developers. Many people hoped we could just talk with business, write behaviours in the form given/when/then and automatically translate that to tests. That's a noble idea, but...

**In reality, what was supposed to be a connector between the business, became an excuse.** Developers took it as a chance to outsource the responsibility of the behaviour to domain experts, business analysts and testers. Now developers could continue what they liked the most, typing on the keyboard and doing that their way. _"QA will handle that"_. What's worse, too often, those tests became flattened to testing User Interface and not even User Experience. 

There were (and still are) frameworks trying to build [Domain Specific Languages](https://en.wikipedia.org/wiki/Domain-specific_language) and use them in testing. We have an even bigger graveyard of those who tried and failed, as many projects tried to use them in tests. 

**I think that one of the reasons why they fail is that they're mostly not part of the design and development process.** If we keep them aside and do not have behaviour as ubiquitous in all aspects of the process, they will never be a priority. It will always be easy to postpone them _for later_ a.k.a _never_. Don't get me wrong, I can see that work, especially now with [the help of the tools like Large Language Models](en/chat_gpt_revolution_or_not/). Yet it requires consistency and trust.

**That's also why Ogooreck is not an ambitious tool but focused.** No Domain Specific Language, separate testing environment, and no delusion that non-dev people will use it. 

I think that one of the reasons why dev people didn't use BDD tooling was that they had a lot of ceremonies. They weren't easy to debug and cluttered. They were also not focused on the stuff devs typically need to test.

Is Ogooreck better? For me, yes! I created it because I wanted to be able to write tests in my Open Source projects quickly. As I was making contributions after hours, time was a critical factor. I also wanted to make them more expressive in their structure, with a consistent shape/style that makes it easy to infer the behaviour.

Tests for business logic thanks to that can look like:

```csharp
    [Fact]
    public void GivenInitiatedGroupCheckout_WhenRecordGuestCheckoutCompletionTwice_ThenIgnores()
    {
        var guestStaysIds = new[] { Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid() };

        Spec.Given(
                new GroupCheckoutInitiated(groupCheckoutId, clerkId, guestStaysIds, now),
                new GuestCheckoutsInitiated(groupCheckoutId, guestStaysIds, now),
                new GuestCheckoutCompleted(groupCheckoutId, guestStaysIds[0], now)
            )
            .When(state => state.RecordGuestCheckoutCompletion(guestStaysIds[0], now).IsPresent)
            .Then(false);
    }

    [Fact]
    public void GivenInitiatedGroupCheckout_WhenRecordLastGuestCheckoutCompletion_ThenCompletes()
    {
        var guestStaysIds = new[] { Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid() };

        Spec.Given(
                new GroupCheckoutInitiated(groupCheckoutId, clerkId, guestStaysIds, now),
                new GuestCheckoutsInitiated(groupCheckoutId, guestStaysIds, now),
                new GuestCheckoutCompleted(groupCheckoutId, guestStaysIds[0], now),
                new GuestCheckoutCompleted(groupCheckoutId, guestStaysIds[1], now)
            )
            .When(state => state.RecordGuestCheckoutCompletion(guestStaysIds[2], now).GetOrThrow())
            .Then(
                new GuestCheckoutCompleted(groupCheckoutId, guestStaysIds[2], now),
                new GroupCheckoutCompleted(groupCheckoutId, guestStaysIds, now)
            );
    }
```

And tests for API integration testing:

```csharp
[Fact]
public Task Put_Should_Return_OK_And_Confirm_Shopping_Cart() =>
    API
        .Given(
            "Shopping cart with product item",
            OpenShoppingCart(ClientId),
            AddProductItem(ProductItem, expectedVersion: 1)
        )
        .When(
            "Confirm shopping cart",
            PUT,
            URI(ctx => $"/api/ShoppingCarts/{ctx.OpenedShoppingCartId()}/confirmation"),
            HEADERS(IF_MATCH(2))
        )
        .Then(OK)
        .And()
        .When
        (
            "Get Updated shopping cart details"
            GET, 
            URI(ctx => $"/api/ShoppingCarts/{ctx.OpenedShoppingCartId()}")
        )
        .Until(RESPONSE_ETAG_IS(3))
        .Then(
            OK,
            RESPONSE_BODY<ShoppingCartDetails>((details, ctx) =>
            {
                details.Id.Should().Be(ctx.OpenedShoppingCartId());
                details.Status.Should().Be(ShoppingCartStatus.Confirmed);
                details.ProductItems.Count.Should().Be(1);
                details.ProductItems.Single().ProductItem.Should()
                    .Be(Carts.ShoppingCarts.Products.ProductItem.From(ProductItem.ProductId, ProductItem.Quantity));
                details.ClientId.Should().Be(ClientId);
                details.Version.Should().Be(3);
            }));

    public static RequestDefinition OpenShoppingCart(Guid? clientId = null) =>
        SEND(
            "Open ShoppingCart",
            POST,
            URI("/api/ShoppingCarts"),
            BODY(new OpenShoppingCartRequest(clientId ?? Guid.NewGuid()))
        );


    public static RequestDefinition AddProductItem(ProductItemRequest productItem, int expectedVersion = 1) =>
        SEND(
            "Add new product",
            POST,
            URI(ctx => $"/api/ShoppingCarts/{ctx.OpenedShoppingCartId()}/products"),
            BODY(new AddProductRequest(productItem)),
            HEADERS(IF_MATCH(expectedVersion))
        );                
```

As you see, it already has naming and terms related to the web requests. Some may say that they should not be visible here, and I disagree, as we should be explicit in what we're doing and how we're doing it. That cuts the number of translations needed back and forth to understand what is this actually verifying.

Check more in [Ogooreck documentation](https://github.com/oskardudycz/Ogooreck).

Of course, syntax is a personal preference. For me, it's readable; for you, it may be ugly. 

**What's most important is that tooling is focused on the specific part of the design, software and testing it.** It's ubiquitous in all sorts of development _exercises_. Nothing even stops you from using some DSL for the acceptance tests.

So our tooling should not be just touching the tip of the iceberg but allow us to reflect behaviour in all places keeping them focused and helping to ease development pain, not increase it.

**I see Behaviour-Driven Design not as a way to write tests but how to keep the focus on the behaviour in our system.** Tests are only part of it. Other parts are not less important.

Read also:
- [I tested it on production and I'm not ashamed of it](/pl/i_tested_on_production/)
- [Ogooreck, a sneaky testing library in BDD style](/pl/ogooreck_sneaky_bdd_testing_framework/)
- [Testing business logic in Event Sourcing, and beyond!](/pl/testing_event_sourcing/)
- [How to test event-driven projections](/pl/testing_event_driven_projections/)
- [Writing and testing business logic in F#](/pl/writing_and_testing_business_logic_in_fsharp/)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

---
title: Is the Strategy Pattern an ultimate solution for low coupling?
category: "Architecture"
cover: 2023-10-01-cover.png
author: oskar dudycz
---

![cover](2023-10-01-cover.png)

**Having a single source of truth and _data point_ is a sweet spot for running business logic.** We check the data from one place and update it. Easy peasy. The challenge is when we become a juggler and run in based on multiple sources.

**I'm a sports fan. One of the most exciting things about being a fan is trade rumours.** Last week's NBA fans were interested in where Damian Lillard will be traded. Most were saying that he'll go to the Miami Heat, others noted that the Toronto Raptors are interested, and others claimed that he'll stay in Portland. Trail Blazers fans were probably refreshing the news, hoping the last part would become true and their idol wouldn't go anywhere. And then boom, [he was traded to the Milwaukee Bucks](https://www.espn.com/nba/story/_/id/38506274/damian-lillard-traded-bucks-big-questions-most-shocking-deal-nba-offseason).

**Now, it seems that most journalists were wrong; some were close to the truth but not quite. The final consistency and the source of truth was the Portland Trail Blazers that finally made the move.** Still, they also needed the data from outside, so agreement with Milwaukee Bucks. They had to trust that Milwaukee wouldn't change their mind and confirm the trade to the NBA to accept the trade formally.

The same happens in our code. We should try to make the decision-making as autonomous as possible, but that's hard to achieve in real life.

**What if we'd like to build an application like [NBA Trade Checker](https://basketball.realgm.com/tradechecker/)?** If we'd like to model that in code, trade offer could look as:

```csharp
record PlayerContract(
    Guid PlayerId,
    DateOnly ValidFrom,
    DateOnly ValidTo,
    decimal Amount,
    bool CanVoteTrade
);

record TeamOffer(
    Guid TeamId,
    PlayerContract[] PlayerContracts
);

record BilateralTradeOffer(
    TeamOffer Gives,
    TeamOffer Gets
);

record TradeOffer(BilateralTradeOffer[] TeamsOffers)
{
    public PlayerContract[] PlayersToGive(Guid teamId) =>
        TeamsOffers
            .Select(t => t.Gives)
            .Where(t => t.TeamId == teamId)
            .SelectMany(t => t.PlayerContracts)
            .ToArray();

    public PlayerContract[] PlayersToGet(Guid teamId) =>
        TeamsOffers
            .Select(t => t.Gets)
            .Where(t => t.TeamId == teamId)
            .SelectMany(t => t.PlayerContracts)
            .ToArray();
}
```

The implementation of the trade could look as follows:

```csharp
class TeamRoster
{
    private readonly Guid teamId;
    private PlayerContract[] currentContracts;

    public TeamRoster(Guid teamId, PlayerContract[] currentContracts)
    {
        this.teamId = teamId;
        this.currentContracts = currentContracts;
    }

    public void TradePlayers(TradeOffer tradeOffer, int maxSalaryCap)
    {
        var playersToGive = tradeOffer.PlayersToGive(teamId);

        if (playersToGive.Any(p => !currentContracts.Contains(p)))
            throw new InvalidOperationException("Offer cannot include players that are not in the team roster");

        var playersToGet = tradeOffer.PlayersToGet(teamId);

        var newRoster = currentContracts
            .Where(e => !playersToGive.Contains(e))
            .Union(playersToGet)
            .ToArray();

        if (newRoster.Sum(c => c.Amount) > maxSalaryCap)
            throw new InvalidOperationException("New roster contracts cannot go above maximum salary cap");

        currentContracts = newRoster;
    }
}
```

The implementation is quite naive; to make it production-ready, we'd need to either model the full [distributed process](/en/saga_process_manager_distributed_transactions/) or at least [orchestrate changes to multiple teams as batch](/en/simple_transactional_command_orchestration/). Yet, let's focus today on dealing with the complex, changing requirements.

So far, trade logic looks simple; you select teams, then players, and ensure such a trade can happen. Still, it's not that simple. Contracts need to match; the team's overall salary cannot go above a certain level, some players can have trade veto in their contract, etc. What's more, those rules tend to change. Even to have a look at the [recap of this year's changes](https://www.cbssports.com/nba/news/nba-cba-101-everything-to-know-about-new-agreement-from-salary-cap-to-free-agency-and-beyond/) takes a lot of time to process that.

Let's say that we'd also like to model player veto. We could add player's preferences and include them in our validation logic:

```csharp
record PlayerVetoPreferences(
    Guid PlayerId,
    Guid[] AcceptableTeamsAsTradeDestination
);

record TradeOffer(BilateralTradeOffer[] TeamsOffers)
{
    // (...)

    public Guid TradeDestination(Guid playerId) =>
        TeamsOffers
            .Where(t => t.Gets.PlayerContracts.Any(c => c.PlayerId == playerId))
            .Select(t => t.Gets.TeamId)
            .Single();
}

public void TradePlayers(
    TradeOffer tradeOffer,
    int maxSalaryCap,
    Dictionary<Guid, PlayerVetoPreferences> playersVetoPreferences
)
{
    var playersToGive = tradeOffer.PlayersToGive(teamId);

    if (playersToGive.Any(p => !currentContracts.Contains(p)))
        throw new InvalidOperationException("Offer cannot include players that are not in the team roster");

    var playersWithVetoRules = playersToGive.Where(p => p.CanVoteTrade).ToList();

    if (playersWithVetoRules.Any())
    {
        if (playersWithVetoRules.Any(p => !playersVetoPreferences.ContainsKey(p.PlayerId)))
            throw new InvalidOperationException("Cannot risk trade for unknown veto preferences");

        if (playersWithVetoRules.Any(p =>
                !playersVetoPreferences[p.PlayerId].AcceptableTeamsAsTradeDestination
                    .Contains(tradeOffer.TradeDestination(p.PlayerId)))
           )
            throw new InvalidOperationException("Player will veto the trade");
    }

    // (...)
}
```

**We just added basic rules, and the method is already pretty big. We can already see that this method will tend to grow exponentially.** We could try to deal with that by breaking down processing and validation parts into dedicated methods and group parameters into one object. That would make it more understandable but wouldn't help us deal with the changing trade rules. 

As mentioned earlier, those rules change regularly and quite often significantly. Yet, the general mechanism from the team roster remains the same:
1. Ensure that the proposed trade contains players currently under contract.
2. Update the roster by replacing players included in the trade.

**That creates an impedance mismatch. The general rules won't change much, but the validation rules quite often.** If we keep the code responsible for both at the same place, we'll get a lot of noise in the change management. 

How to handle that? There are a few options; let's go through that.

## Injecting strategy

We could define the following interface:

```csharp
interface ICheckTrade
{
    Result CanTradeTo(Guid teamId, PlayerContract[] currentContracts, TradeOffer tradeOffer);
    
    enum Result
    {
        Ok,
        UnknownPlayerVetoPreferences,
        PlayerWillVetoTrade
    }
}
```

And define the current implementation there:

```csharp
class TradeChecker: ICheckTrade
{
    private readonly NBATradeParameters nbaTradeParameters;
    private readonly Dictionary<Guid, PlayerVetoPreferences> playersVetoPreferences;

    public TradeChecker(
        NBATradeParameters nbaTradeParameters,
        Dictionary<Guid, PlayerVetoPreferences> playersVetoPreferences
    )
    {
        this.nbaTradeParameters = nbaTradeParameters;
        this.playersVetoPreferences = playersVetoPreferences;
    }

    public ICheckTrade.Result CanTradeTo(Guid teamId, PlayerContract[] currentContracts, TradeOffer tradeOffer)
    {
        var playersToGive = tradeOffer.PlayersToGive(teamId);

        var playersWithVetoRules = playersToGive.Where(p => p.CanVoteTrade).ToArray();

        if (AreAnyPlayerWithVetoRightsThatHaveUnknownPreferences(playersWithVetoRules))
            return ICheckTrade.Result.UnknownPlayerVetoPreferences;

        if (WillAnyPlayerVetoTrade(playersWithVetoRules, tradeOffer))
            return ICheckTrade.Result.PlayerWillVetoTrade;

        if (IsNewRosterAboveMaximumSalaryCap(teamId, playersToGive, currentContracts, tradeOffer))
            return ICheckTrade.Result.PlayerWillVetoTrade;

        return ICheckTrade.Result.Ok;
    }

    private bool AreAnyPlayerWithVetoRightsThatHaveUnknownPreferences(IEnumerable<PlayerContract> playersWithVetoRules) =>
        playersWithVetoRules.Any(p => !playersVetoPreferences.ContainsKey(p.PlayerId)));

    private bool WillAnyPlayerVetoTrade(IEnumerable<PlayerContract> playersWithVetoRules, TradeOffer tradeOffer) =>
        playersWithVetoRules.Any(p =>
            !playersVetoPreferences[p.PlayerId].AcceptableTeamsAsTradeDestination
                .Contains(tradeOffer.TradeDestination(p.PlayerId));

    private bool IsNewRosterAboveMaximumSalaryCap(
        Guid teamId,
        PlayerContract[] playersToGive,
        PlayerContract[] currentContracts,
        TradeOffer tradeOffer
    )
    {
        var playersToGet = tradeOffer.PlayersToGet(teamId);

        var newRoster = currentContracts
            .Where(e => !playersToGive.Contains(e))
            .Union(playersToGet)
            .ToList();

        return newRoster.Sum(c => c.Amount) > nbaTradeParameters.MaxSalaryCap;
    }
}
```

The important part is that the trade checker is self-contained. All external parameters are injected via the constructor, so the calling class won't need to know the implementation details.

**Trade checker implements [Strategy design pattern](https://en.wikipedia.org/wiki/Strategy_pattern).**

We can now inject trade checking strategy as a parameter to the _TradePlayers_ method, reducing its complexity and making it focused on the core logic. 

```csharp
class TeamRoster
{
    private readonly Guid teamId;
    private PlayerContract[] currentContracts;

    public TeamRoster(Guid teamId, PlayerContract[] currentContracts)
    {
        this.teamId = teamId;
        this.currentContracts = currentContracts;
    }

    public void TradePlayers(TradeOffer tradeOffer, ICheckTrade tradeChecker)
    {
        var playersToGive = tradeOffer.PlayersToGive(teamId);

        if (playersToGive.Any(p => !currentContracts.Contains(p)))
            throw new InvalidOperationException("Offer cannot include players that are not in the team roster");

        var checkResult = tradeChecker.CanTradeTo(teamId, currentContracts, tradeOffer);

        if (checkResult != ICheckTrade.Result.Ok)
            throw new InvalidOperationException(checkResult.ToString());

        var playersToGet = tradeOffer.PlayersToGet(teamId);

        var newRoster = currentContracts
            .Where(e => !playersToGive.Contains(e))
            .Union(playersToGet)
            .ToArray();
        
        currentContracts = newRoster;
    }
}
```

The service method could look as follows:

```csharp
class TradePlayersHandler
{
    private readonly IAmYourFavouriteDatabase database;
    private readonly ICheckTrade tradeChecker;

    public TradePlayersHandler(IAmYourFavouriteDatabase database, ICheckTrade tradeChecker)
    {
        this.tradeChecker = tradeChecker;
        this.database = database;
    }

    public async Task Handle(Guid teamId, TradeOffer tradeOffer, CancellationToken ct)
    {
        var teamRoster = await database.GetById(teamId, ct);

        teamRoster.TradePlayers(tradeOffer, tradeChecker);

        await database.Store(teamId, teamRoster, ct);
    }
}
```

We removed impedance mismatch by that. Now, we can just change or even provide a new checking strategy, keeping both business logic and application service intact.

Can we call it a day, then? We could, but hold your horses and discuss that a bit more.

## Is using strategy always a good strategy?

**Let's have a look again at our trade checker. What it does is the pre-condition check.** We're injecting it just to validate criteria, passing the internal aggregate state, but not using the result for anything other than validation. Of course, we could say that all is fine; our aggregate drives the business logic, so it should also ensure that all validation was made. 

Yet, our intention was not to move just code from one place to another but to keep business logic focused and unrelated to rapidly changing conditions. We still have a direct connection here; the aggregate needs to know about the external world. 

**For me, strategies that don't return any result that's used by business logic are always a design smell that we should investigate.**  They're not necessarily bad but can indicate coupling and leaking abstractions. 

How can we do it differently? We can move the strategy outside and call it in the application service.

```csharp
class TradePlayersHandler
{
    private readonly IAmYourFavouriteDatabase database;
    private readonly ICheckTrade tradeChecker;

    public TradePlayersHandler(IAmYourFavouriteDatabase database, ICheckTrade tradeChecker)
    {
        this.tradeChecker = tradeChecker;
        this.database = database;
    }

    public async Task Handle(Guid teamId, TradeOffer tradeOffer, CancellationToken ct)
    {
        var teamRoster = await database.GetById(teamId, ct);

        var checkResult = tradeChecker.CanTradeTo(teamId, teamRoster.CurrentContracts, tradeOffer);

        if (checkResult != ICheckTrade.Result.Ok)
            throw new InvalidOperationException(checkResult.ToString());

        teamRoster.TradePlayers(tradeOffer);

        await database.Store(teamId, teamRoster, ct);
    }
}
```

As you see, we also had to publicly expose some needed external state. That's fine to do if it's just a getter that doesn't allow external modifications. As we're using array and records, we're safe. See:

```csharp
class TeamRoster
{
    public Guid TeamId { get; }
    public PlayerContract[] CurrentContracts { get; private set; }

    public TeamRoster(Guid teamId, PlayerContract[] currentContracts)
    {
        TeamId = teamId;
        CurrentContracts = currentContracts;
    }

    public void TradePlayers(TradeOffer tradeOffer)
    {
        var playersToGive = tradeOffer.PlayersToGive(TeamId);

        if (playersToGive.Any(p => !CurrentContracts.Contains(p)))
            throw new InvalidOperationException("Offer cannot include players that are not in the team roster");

        var playersToGet = tradeOffer.PlayersToGet(TeamId);

        var newRoster = CurrentContracts
            .Where(e => !playersToGive.Contains(e))
            .Union(playersToGet)
            .ToArray();

        CurrentContracts = newRoster;
    }
}
```

If you're afraid of totally removing the connection between aggregate and check, you can also add such a [proxy](https://en.wikipedia.org/wiki/Proxy_pattern).

```csharp
static class TradeCheckProxy
{
    public static void TradePlayers(this TeamRoster teamRoster, TradeOffer tradeOffer, ICheckTrade tradeChecker)
    {
        var checkResult = tradeChecker.CanTradeTo(teamRoster.TeamId, teamRoster.CurrentContracts, tradeOffer);

        if (checkResult != ICheckTrade.Result.Ok)
            throw new InvalidOperationException(checkResult.ToString());

        teamRoster.TradePlayers(tradeOffer);
    }
}

class TradePlayersHandler
{
    private readonly IAmYourFavouriteDatabase database;
    private readonly ICheckTrade tradeChecker;

    public TradePlayersHandler(IAmYourFavouriteDatabase database, ICheckTrade tradeChecker)
    {
        this.tradeChecker = tradeChecker;
        this.database = database;
    }

    public async Task Handle(Guid teamId, TradeOffer tradeOffer, CancellationToken ct)
    {
        var teamRoster = await database.GetById(teamId, ct);

        teamRoster.TradePlayers(tradeOffer, tradeChecker);

        await database.Store(teamId, teamRoster, ct);
    }
}
```

**By that, we're making things that should be explicit, keeping low coupling and high cohesion.** We're also making our code more testable as we can:
- validate business logic without mocks,
- see the result of our changes through the exposed read-only state,
- test strategy with unit tests,
- check the integration of the trade checker and aggregate with proxy.

Can we call it a day now? Of course not!

## Chain of responsibility

**We already did a lot, but if we look back at our trade checker implementation, it already does a lot.** And we just started implementing the rules! Soon, it may become a maintenance nightmare.

The trade checker verifies several conditions, taking input data and returning a bool if the check isn't successful, stopping processing further rules. 

We could break our _TradeChecker_ class into two smaller.

See the player's veto check

```csharp
class PlayerVetoTradeCheck: ICheckTrade
{
    private readonly Dictionary<Guid, PlayerVetoPreferences> playersVetoPreferences;

    public PlayerVetoTradeCheck(Dictionary<Guid, PlayerVetoPreferences> playersVetoPreferences) =>
        this.playersVetoPreferences = playersVetoPreferences;


    public ICheckTrade.Result CanTradeTo(Guid teamId, PlayerContract[] currentContracts, TradeOffer tradeOffer)
    {
        var playersWithVetoRules = tradeOffer.PlayersToGive(teamId).Where(p => p.CanVoteTrade).ToArray();

        if (AreAnyPlayerWithVetoRightsThatHaveUnknownPreferences(playersWithVetoRules))
            return ICheckTrade.Result.UnknownPlayerVetoPreferences;

        if (WillAnyPlayerVetoTrade(playersWithVetoRules, tradeOffer))
            return ICheckTrade.Result.PlayerWillVetoTrade;

        return ICheckTrade.Result.Ok;
    }

    private bool
        AreAnyPlayerWithVetoRightsThatHaveUnknownPreferences(IEnumerable<PlayerContract> playersWithVetoRules) =>
        playersWithVetoRules.Any(p => !playersVetoPreferences.ContainsKey(p.PlayerId));

    private bool WillAnyPlayerVetoTrade(IEnumerable<PlayerContract> playersWithVetoRules, TradeOffer tradeOffer) =>
        playersWithVetoRules.Any(p =>
            !playersVetoPreferences[p.PlayerId].AcceptableTeamsAsTradeDestination
                .Contains(tradeOffer.TradeDestination(p.PlayerId)));
}
```

And maximum salary cap check:

```csharp
class MaximumSalaryCapTradeCheck: ICheckTrade
{
    private readonly NBATradeParameters nbaTradeParameters;

    public MaximumSalaryCapTradeCheck(NBATradeParameters nbaTradeParameters) =>
        this.nbaTradeParameters = nbaTradeParameters;

    public ICheckTrade.Result CanTradeTo(Guid teamId, PlayerContract[] currentContracts, TradeOffer tradeOffer)
    {
        var playersToGive = tradeOffer.PlayersToGive(teamId);
        var playersToGet = tradeOffer.PlayersToGet(teamId);

        var newRoster = currentContracts
            .Where(e => !playersToGive.Contains(e))
            .Union(playersToGet)
            .ToList();

        if (newRoster.Sum(c => c.Amount) > nbaTradeParameters.MaxSalaryCap)
            return ICheckTrade.Result.PlayerWillVetoTrade;

        return ICheckTrade.Result.Ok;
    }
}
```

**The classes are smaller, easier to grok, and more focused.** Now, they only inject the needed parameters, which can be changed separately. We removed the next impedance mismatch.

That's sweet, but we also need to make one more change. Update our proxy to take a list of checks instead of a single one.

```csharp
static class TradeCheckProxy
{
    public static void TradePlayers(
        this TeamRoster teamRoster,
        TradeOffer tradeOffer,
        IEnumerable<ICheckTrade> tradeCheckers
    )
    {
        foreach (var tradeChecker in tradeCheckers)
        {
            var checkResult = tradeChecker.CanTradeTo(teamRoster.TeamId, teamRoster.CurrentContracts, tradeOffer);

            if (checkResult != ICheckTrade.Result.Ok)
                throw new InvalidOperationException(checkResult.ToString());
        }

        teamRoster.TradePlayers(tradeOffer);
    }
}
```

Foreach is a simple implementation of [Chain-of-responsibility pattern](https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern). We call all checks until the first fail and call business logic only if all succeed.

Are we good now? Can we call it a day now? Yes, we finally can.

**Is the final version the best solution? Of course, it depends.**

Each step I presented in the article can be your final step. We should start with a simple solution and then evolve. 

**I intended to show you the thought process for designing business logic that's more complicated than just basic input validation and state updates.**

I wanted to show how to tackle scenarios, when you need to base your decision on potentially stale data, and how to approach that, finding the right consistency tradeoff.

I hope I also showed you the impedance mismatch and how to deal with it using a few simple patterns to keep business logic focused, keeping it cohesive instead of coupled.

Cheers!

Oskar

p.s. Check also an article [The Lowly Strategy Pattern is Still Useful](https://jeremydmiller.com/2023/10/05/the-lowly-strategy-pattern-is-still-useful/) from Jeremy D. Miller. Accidentally we decided to write at the same time on this topic. But that's for good, as those are different perspectives and examples. The more, the merrier!

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

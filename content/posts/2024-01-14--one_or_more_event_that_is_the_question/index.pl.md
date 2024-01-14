---
title: Should you record multiple events from business logic?
category: "Event Sourcing"
cover: 2024-01-14-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2024-01-14-cover.png)

**Asking people for feedback is an intriguing story.** I like to get constructive criticism for my work, as that allows me to learn something new. When I prepare some new samples or have some new ideas, I like to crunch them with the people. Getting feedback is not easy, and good feedback is even more challenging.

Preparing samples and learning materials takes work. You want to make them precise. Showing too much will blur the main idea, and introducing too many pieces will confuse people and make it harder for them to grasp what you want to convey. If you show too little, you'll hear _"That's nice but show me real code."_. And that's fair, as the example needs to be relatable to be transferable into real projects.

**The solution is to be precise and provide a complex case around the stuff you want to explain but simplify the _side story_.** Here's the danger, of course, as one may ignore the essence and take oversimplification as best practice. So you better be explicit. But then, if you're explicit too much, you start to rumble, like I do right now. So let's try to pull into shore!

For some reason, I'm getting feedback on my Event Sourcing sample: _"Why are you not returning multiple events from business logic?"_. And that question always catches me off guard. It's surprising that that's so important for so many people. Why would I use multiple events? Let's discuss that, then!

**It may be counterintuitive, but returning multiple granular events may be less precise than returning one bigger one.** Let's say that our stream looks like that:

```
1. RoomReserved
2. GuestsInformationUpdated
3. GuestCheckedIn
```

When I looked at such an event stream, the story would look to me as follows: the user reserved the room, then provided the guest's details or changed the number of people, and eventually checked in. Of course, I need to look at the event data to understand the details, but I expect the overall story to be seen from my events.

Tho! What if someone optimised the event model on the code size and reusability? What if someone thought:

> "Hmm, I'll have to support guest information updates; I'll have the _GuestsInformationUpdated_ event eventually. I also heard that events should be small and precise. Then maybe when I get a reservation, I'll append two events _RoomReserved_ and _GuestsInformationUpdated_. 

Thanks to that, this person could reuse the events. Potentially optimise the message size, which could make it a bit faster when this event is propagated. You could also keep less code, as in the projection you could do:

```csharp
class ReservationProjection
{
    Reservation Apply(RoomReserved roomReserved) =>
        new Reservation(roomReserved.Id, roomServerd.Number);

    Reservation Apply(Reservation reservation, GuestsInformationUpdated guestInfoUpdated) =>
	reservation with 
	{
	    GuestsCount = guestInfoUpdated.GuestsCount,
	    MainGuest = guestInfoUpdated.MainGuest,
        }
}
```

Instead of:

```csharp
class ReservationProjection
{
    Reservation Apply(RoomReserved roomReserved) =>
        new Reservation(
            roomReserved.Id, 
            roomServerd.Number,
            roomReserved.GuestsInfo.Count,
            roomReserved.GuestsInfo.MainGuest,
        );

    Reservation Apply(Reservation reservation, GuestsInformationUpdated guestInfoUpdated) =>
	reservation with 
	{
	    GuestsCount = guestInfoUpdated.GuestsCount,
	    MainGuest = guestInfoUpdated.MainGuest,
        }
}
```
Same for other projections and handlers. Yet, is it such a big optimisation? Especially since now, for each handler, we need to handle those two events instead of a single one when we're just interested in starting the reservation process. So, what are we getting out of it? 

**We're definitely losing clarity on what has happened from the business process.** Of course, we could use [telemetry data like correlation id](/pl/set_up_opentelemetry_wtih_event_sourcing_and_marten/) and see that by checking metadata:

```
1. RoomReserved (CorrelationId: '19n8')
2. GuestsInformationUpdated (CorrelationId: '19n8')
3. GuestCheckedIn (CorrelationId: '9f873')
```

But that only gives us a clue that they were stored in the same process. And what if we also did other optimisation and ran [multiple commands in the same transaction](/pl/simple_transactional_command_orchestration/)? Then, this correlation ID may mean that they just happen to be stored in the same request, and we need to do more detective work.

[One of the biggest advantages of using Event Sourcing is keeping the business context](/pl/never_lose_data_with_event_sourcing/). We're trading it here for potentially less code. I already said that's disputable, as that can only be true if we have read models representing 1:1 our write model. This may happen, but it's again different from the premises of Event Sourcing.

**What about adding a common interface or base class?** Same story. Things tend to look similar at the beginning, but as our system evolves, they become more and more distinct. Adding something to the base class is too easy. You start adding data that some of the derived classes don't need. Your code starts to drive your event model. 

**Reusing code in the events model just adds more coupling and increases cognitive load.** Events are facts; business logic stores them as information about what has happened. It should not assume too many subscribers or projection needs. We can do tradeoffs and try to guess, but the more we do it, the less precise our model becomes. 

Having interfaces and base classes also destroys another benefit of the event model: documentation as code. We need to continuously switch between events and base classes/interfaces. That's not a great experience.

**Don't optimise for code size; optimise for the right model to fulfil your business process well.** Code is a liability, a tool to achieve that, nothing more than that. A little bit of healthy copy/paste won't harm you. It'll make your code cohesive and less coupled.

Also, if your process has multiple inputs, for instance, UI, import from an external system, or another background process, keeping different event types is okay. You could have them as such:
- _RoomReserved_
- _RoomReservedTentatively_
- _RoomReservedFromBookingComImported_
- _GroupRoomReservationMade_

As long as they're meaningful for business that's perfectly fine. Again, the closer your event model is to business, the better. Of course, I'm not encouraging you to create numerous event types and be too creative. I encourage you to be close to your business.

**The most important thing is to see a clear business intention and have all the information about what has happened.** Whether to keep separate events or group them, providing different events for potentially the same one is highly dependent on the specific business use case.

**I'd add two events if there were separate parts of the processes.** Let's take the guest's group checkout we modelled in [webinar about implementing distributed processes](https://www.architecture-weekly.com/p/webinar-3-implementing-distributed)

[![webinar](./2023-09-22-webinar.png)](https://www.architecture-weekly.com/p/webinar-3-implementing-distributed)

Group checkout can be run as a series of single guest checkouts. We can complete it when all single ones are completed. Thus, we must record and accrue the information in the main process. We do that by subscribing to _GuestCheckoutCompleted_ events and storing _GuestCheckoutCompletionRecorded_ in the group checkout stream. When the last checkout for the group was made from this action, you will also get the _GroupCheckoutCompleted_ event. It doesn't make much sense to group those two events into _GuestCheckoutRecordedAndGroupCheckoutCompleted_ event. We're recording information about two different business facts.

**I'd use multiple events if they represent different parts of the business process, especially if they're optional.**

Of course, it’s a grey matter. My safe default is to record a single event. From my experience, most cases are like that. We should double check if there's no benefit of having multiple events. Yet, I understand that someone may have a different perspective, so think for yourself.

I started with base classes, super granular events, and sharing data between events, but I evolved from that. And I regret that I did that because it took me a lot of time to refactor that. The hidden coupling is a big enabler for accidental complexity and [overly complicated solutions](/pl/how_to_solve_complicated_problems/).

[Events should be as small as possible but not smaller](/pl/events_should_be_as_small_as_possible/). And remember to have a split between [internal and external events](/pl/internal_external_events/). Thanks to that, you can keep the internal events precise and enrich them for external subscribers who need more context. [Event transformations can help you](/pl/event_transformations_and_loosely_coupling/) to keep your processes loosely coupled.

Cheers!

Oskar

p.s. Check also [Internal and external events, or how to design event-driven API](/pl/internal_external_events/)

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

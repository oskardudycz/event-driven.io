---
title: Is keeping dates in UTC really the best solution?
category: "Coding Life"
cover: 2022-07-06-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-07-06-cover.png)

**In many projects, the approach to dates is quite nonchalant.** People do as they want. When on-premise systems were king, the common problem was that it was hard to know precisely when something happened. The consistency of the configuration depended on how meticulous ops people were. It wasn't shocking to find out that the server had a different time zone, the application had a different one, and the user had a different time zone. At one point, the development community found a compromise that _"maybe we would use the same time zone everywhere, for instance [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)"_.

**This solution makes sense as we don't do back-and-forth time conversions.** The only thing we need to remember is to convert from local time to UTC somewhere on the frontend or when generating time on the server. Such an approach solves many problems but is quite romantic. It's a typical example of programmers trying to find a generic solution to rule them all. We want a beautifully organized but artificial world in our code. Why an artificial one? Because users usually think in the context of local time. If I ordered an Uber drive to the airport in Wrocław, I flew to New York, and I order an Uber from the airport, I want to ensure that my application on the phone correctly selects the time zone and context in which I am.

**What if time changes?** What if the time zone changes? Will it never happen? Are you sure?

https://twitter.com/maz_jovanovich/status/1444524436548296705

As you can see in the tweet above, it happened even last year in Australia. Moreover, it also occurs in Poland every year when we change the winter time to summer time. Can you predict Daylight saving time change? Yes, you can. Yet, soon the countries in the European Union may not have a time change. So far, there is no consensus on when and how this will happen. One of the considered options is that each country can choose whether to stay in the summer or the winter time. If that comes true, we'll have a loooot of time zone changes.

**What could the consequences of this be?** You book a cinema ticket for 10 o'clock. You order it in Poland, i.e. UTC + 2. So the reservation is made at 8 UTC. Let's assume that our time zone will change (for example, by choosing summer or winter time). Let it change to +3. So our reservation converted from 8 o'clock UTC will be 11 o'clock local time. We're doomed. We will come to the screening, and the film has been on for an hour (because its starting time has not changed, it goes at 10).

Of course, not every business domain will have serious consequences. For example, if we arrive an hour late at the hotel, they will probably let us check-in. If any scheduled task is completed an hour later or earlier, it will probably not be a significant problem. Well, unless it is. If we do not predict it and don't protect ourselves, even with a _dummy_ time change, it may turn out that after withdrawing the hint, the task will be completed again (e.g. cyclical transfer).

**Is this really a problem?** It depends; it may or may not be. If your domain is based on scheduling and time is essential (e.g. reservations, transport, hotel industry, financial services), it is worth checking if we are prepared for this situation. We don't want to end up with [Y2K problem](https://en.wikipedia.org/wiki/Year_2000_problem). It is, of course, still an edge case, but contrary to common belief, it happens much more often than we think.

**How can you deal with it?** Keeping UTC for past timestamps is fine. We can deduce time from historical knowledge. Yet, for future dates, it's important to keep the local time zone or local date-time. Using tools like [NodaTime](https://nodatime.org/), [Joda time](https://www.joda.org/joda-time/) (or alternatives) can be definitely helpful.

It is worth considering and ensuring that our dates are as safe and straightforward as we think. We should aim to build simple solutions, but not simplistic ones.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

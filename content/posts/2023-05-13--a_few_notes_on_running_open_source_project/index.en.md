---
title: A few notes on running open source project after Marten v6 release
category: "Coding Life"
cover: 2023-05-13-cover.png
author: oskar dudycz
---

![cover](2023-05-13-cover.png)

Last week we released [the next major Marten release](https://github.com/JasperFx/marten/releases/tag/6.0.0), and I'd like to share some of my lessons learned and insights with you. And by "you", I don't mean only you, my great reader, but also future me getting back to this article, as I'm blogging not to forget.

## Sometimes postponing things is fine

Initially, we wanted a quick release to align our codebase with .NET 7 and Npgsql 7 releases. Those are our _[diamond dependencies](https://en.wikipedia.org/wiki/Dependency_hell)_. Even though .NET 7 upgrade should work by itself, breaking changes to Npgsql 7 and System.Text.Json are always giving us a hard time. Especially since people also use them explicitly in other places and not always can use _frozen_ version from our code. We got the alpha release quickly to unblock people. It was the point when we could do a release. Yet, we didn't.

It appeared that most people who wanted to use the latest stuff were also fine with using the Alpha release. That shouldn't be surprising if we take into account the typical technology adoption life cycle presented by [Geoffrey A. Moore in Crossing the Chasm](https://www.goodreads.com/book/show/61329.Crossing_the_Chasm) book.

People immediately upgrading the tooling are also more open to being early adopters and face some challenges, but have the benefit of being first and iterating quickly.

That's why we decided to make a few more changes and cleanup to make our codebase for the new challenges, e.g. [the upcoming Wolverine 1 release](https://jeremydmiller.com/2023/05/11/marten-v6-is-out-and-the-road-to-wolverine-1-0/).

## Don't be _sainter_ than the pope

Open Source is something between passion, madness, philanthropy and duty. We're non-paid labour; we don't charge for licences etc. Of course, we'd like to build a sustainable model around our work, but that's not easy.

In Marten, we're strict around semantic versioning because we believe that's a basis for building trust. We try to avoid breaking changes, but when we do, we always try to make them explicit.

Still, avoiding breaking changes at all costs is not the best idea. Especially if they're only technically breaking. In recent years, .NET team has been iterating pretty fast, encouraging users to migrate .NET version to the latest tooling. They defined [the Official .NET Support Policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

We could try to support older versions of .NET, but if Microsoft is not doing that, why should we make our non-paid live harder?

Of course, the decision is not easy, as we don't want to let down our users, but we also want the majority to get more features faster and with better quality. Yet, if someone cannot upgrade immediately, that's fine. They can continue to use older versions.

## Release notes and smooth migration path are important

Open Source work is not only about playing with technology. It's about working with the community. You also need to do stuff that's tedious but, in the end, helpful for the community. For instance: release notes.

I spend several hours working on [the Marten v6 release notes updates](https://github.com/JasperFx/marten/releases/tag/6.0.0). This time I grouped them by the area and type of change (breaking, new, changed) and added more context.

GitHub autogeneration is helpful, but I don't feel that's enough to give the usability context to the people. It's still focused on the PRs and issues, which usually give context to the people knowing the changing scope, but not for the whole community.

I believe that preparing proper release notes is a must-have for building mutual trust between maintainers and users. On showing that "you care about them". Those are small things that can create a snowball effect.

Also, it's useful for maintainers, as to not have the need to support all the past versions, we should encourage people to use the most recent one. It makes maintenance easier.

Of course, release notes are not all; that stuff should also get into docs. That's why we also have a dedicated section in our docs for [the migration guide](https://martendb.io/migration-guide.html).

We also try to do a two-step removal. At first, we're marking old features as obsolete together with the information on how to migrate. Thanks to that, people can see that in their IDE. Then in the next major release, we're removing old stuff. That gives people a graceful period to perform the migration with a smooth transition.

Of course, we try to avoid breaking stuff where we can.

### Having a team is crucial

We've been working with Jeremy and Babu for a few years together. During that time, we had spans where life got into our way, and we were less active. You can see that clearly in the [GitHub contributors chart](https://github.com/JasperFx/marten/graphs/contributors).

Having a team allowed us to avoid being hit by the bus factor. And that also helped us to spread the work.

This time I was driving the v6 release, which let Jeremy focus on Wolverine and Babu to improve our docs.

If you're planning to build an open source project, think in advance about how to encourage others to contribute because...

### Building community is also critical

[I started as a Marten community member before joining the core team](https://event-driven.io/en/how_to_start_with_open_source/). And that's an example of how vital community can impact the project.

Want more? In this release, we had 12 external contributors, and we have 155 in general. That's a lot!

We're pretty lucky that we have such an open and vital community. We extremely rarely get snarky or toxic comments. It might be that we're still in a niche, but I prefer to think that our work with the community just pays off.

Our maxim is _"We take pull requests!"_ and we encourage people to contribute and try to make that accessible.

What was staggering when I read [Sean Kileen's .NET OSS Maintainer Support Survey results](https://seankilleen.com/2022/06/announcing-net-oss-survey-results/) was that most of the maintainers don't care about building community. What's more, they don't even want to do it.

That's fine, as long as you want to just play with code, but if you want your project to be adopted, you must invest your time building relationships with people.

Recently we also migrated to [Discord](https://discord.gg/WMxrvegf8H) from Gitter. We were afraid to do that, but we were forced by [unexpected merge with Matrix](https://blog.gitter.im/2023/02/13/gitter-has-fully-migrated-to-matrix/). And that was a great decision!

Our community was already active on Gitter, and we try to help there as much as possible, but it's even more active on Discord. Which can be, of course, overwhelming sometimes, but we're super happy about that. It's also motivating to see all those people (at the time of writing, almost 500) interested in our product, sharing their feedback and helping us to see the real usage.

Using public groups and channels is important in the beginning to reach people, but building your own channels is also essential. Not having them will eventually become limiting. Public groups have their own rules. Usually, you cannot promote your work and ask for feedback explicitly. Also, some users want to avoid joining big, general communities when they're only interested in your project. They don't want to be overwhelmed or interact with all the others if they want to interact with your team explicitly.

### Trial the features

Together with Jeremy, we're quite active also in blogging about Marten (check the [great Jeremy's blog](https://jeremydmiller.com/)). It gives the possibility to share more context to users but also trials new stuff and usages.

My article about [integrating Marten with other tools](/en/integrating_Marten/) is a decent example of that. I wrote it to explain how to do it using current features, but we noticed that people were referring to it, applying this pattern and linking it to each other.

That gave us the certainty that this feature is needed and that the proposed solution matches people's expectations. 

Based on that, we're planning to deliver a proper, formal and optimised Subscription mechanism.

The other idea is to get feedback from people and not be limited by the [breaking changes policy](/en/lets_take_care_of_ourselves_thoughts_about_comptibility/) is to introduce ideas as the _experimental_, for instance, add registration like _options.Projections.Experimental.UseSomeIdea()_. That should make clear to users that it's experimental stuff suited for the feedback from the early adopters.

### Be transparent with users

All of that has to be communicated transparently with users. Best if you try to use different channels, as you should expect that only some people are active on certain communication channels. Most people are silent if all is working.

If you're clear and proactive, it's much easier to build trust and get feedback.

**I hope those insights were interesting to you.** OSS _work_ is a long-term game.

If you'd like to start your own project, check: [How to get started with Open Source?](/en/how_to_start_with_open_source/).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

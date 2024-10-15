---
title: Pongo behind the scenes
category: "TypeScript"
cover: 2024-10-11-cover.png
author: oskar dudycz
---

![](2024-10-11-cover.png)

**If you want to make God laugh, tell him about your plans.**

My plans were simple: recharge during summer, take a break in July, and then return to the regular writing cadence. As you may have noticed, the last part didn't go entirely as expected.

Okay, I also had another plan to bootstrap two projects: 
- [Emmett](https://github.com/event-driven-io/emmett),
- [Pongo](https://github.com/event-driven-io/Pongo).

It's going okay in terms of the ongoing work, okayish in terms of adoption, and not so well yet in making it sustainable, so earning money from it to pay for the effort.

I also wanted to do less speaking, as it takes time, energy, and travelling, but then I got a few invitations to conferences and webinars that I couldn't reject.

**And that is how we got to Pongo Internals.** That's what I showed last week during [YugabytDB Community Hours](https://www.youtube.com/watch?v=p-6fpV_GDEs)

`youtube: https://www.youtube.com/watch?v=p-6fpV_GDEs`

And earlier on [FerretDB Document Database Community](https://www.youtube.com/watch?v=P4r19rv4vOg).

`youtube: https://www.youtube.com/watch?v=P4r19rv4vOg`

It was tiring, as I was doing between [flood](https://notesfrompoland.com/2024/09/19/floods-prompt-polands-first-ever-state-of-natural-disaster-what-does-this-mean/), [AxonIQ Conference](https://www.axoniq.io/axoniq-conference-2024) and having Tonsillitis. But I've made it.

**It's heartwarming that tools like FerretDB and YugabyteDB are open to collaboration.** I'm all for that, so I hope you'll see more of it.

**I showcased their recent additions to Pongo like:**
- fresh new Pongo shell for accessing and manipulating data without setting up the project,
- filtering and updating Pongo documents with custom SQL,
- built-in optimistic concurrency without the typical MongoDB retries,
- [typed client](/en/pongo_strongly_typed_client/),
- [migrations](/en/pongo_strongly_typed_client/).

I also shared how it's working internally, so here's a bit about the PostgreSQL JSONB magic and other decisions I've made.

Check out if you want to see how sausages are made. And drop your thoughts afterwards!

**I think the Pongo concept is unique and can streamline the development of new products.** If you're interested in using it or sponsoring some work, [contact me](mailto:oskar@event-driven.io). I'm happy to jump on the call with you, showcase what's already possible, and discuss how to help your project!

**Pongo is a community project, and I believe it is a decent place to start your journey in Open Source.** If you'd like to do it, join our [Discord server](https://discord.gg/fTpqUTMmVa), and I'll help you jumpstart your contribution.

**Read more in:**
- [Pongo - Mongo but on Postgres and with strong consistency benefits](/en/introducting_pongo/)
- [Pongo gets strongly-typed client, migrations, and command line tooling](/en/pongo_strongly_typed_client/)
- [Running a regular SQL on Pongo documents](/en/sql_support_in_pongo)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

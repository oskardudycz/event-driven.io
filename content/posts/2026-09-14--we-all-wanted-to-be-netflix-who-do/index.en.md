---
title: We all wanted to be Netflix, who do we want to be next?
category: Software Architecture
cover: 2026-09-14-cover.jpg
author: oskar dudycz
redirectFrom: /we-all-wanted-to-be-netflix-who-do/
---

![Teenage Mutant Ninja Turtles: 10 Things You Need To Know About Krang](2026-09-14-cover.jpg "Teenage Mutant Ninja Turtles: 10 Things You Need To Know About Krang")

**I recently realised that there’s an aspect of GenAI tooling that’s not spoken about much**, and I think that’s important to where we are going as an industry. Before I get into the details, let me start with some background.

**For a long time, our industry was (over) focused on following big tech’s practices.** _**“Let’s be like Netflix!”**_ **\- that was a common phrase.** Even if we weren’t saying it out loud, our discussions, directions, design, and tooling choices said it.

Of course, there was always a group of people saying: _“well, it depends; we’re not Netflix, aye? So maybe we do stuff simpler?”_. Still, even they were saying stuff like _“I don’t like microservices, but there are valid scenarios for it”_. The soft power of big tech was strong.

To some degree, blind copying of their practices led to overengineering, over-staffing, and overly complex operational stuff (hey, Kubernetes!). It even impacted recruitment and staffing with weird practices like LeetCode or System Design interviews.

Yet, undeniably, it also had a good impact. Cloud computing commoditization enabled companies without enough internal skills to build better, more secure products. It also enabled models like pay-as-you-go. Plus, those edgy problems that big tech had ended up with useful, mature open-source projects.

Of course, those “insightful blog articles” included a lot of marketing. They shaped our industry narratives. Companies wrote about the problems they had, which were mostly problems of scale, and those became the problems everyone talked about. They were success stories. Even when they were doing post mortems, or other fuck ups, they ofc presented it as _“hey, but we eventually to solve it, so we’re good right?”._ Also, some practices attributed to them weren’t actually used. Google didn’t use Angular; Spotify didn’t use the Spotify Model, etc. Still they carried a set of good intentions: explaining how stuff can be done bigger, faster, or just a bit of bragging on what they do. On its own, I consider that a good thing.

It was also a good thing because of the form it took. A blog post is an argument. You can read it, disagree with it, take the idea and drop the implementation, or tell your team it solves a problem you don’t have. It caused discussions and new ideas. Sometimes backslashes, sometimes maturity. Those ideas had a positive impact, because there was something on the table to point to. We could say, that’s what we’re going to try, or we could say: no, it’s not for our scale. That led to answering questions of why. Of course, many didn’t ask why and just blindly followed, causing more issues than benefits.

**Now, here’s what’s bothering me.**

We all wanted to be like Netflix. Do we want all of our development processes and practices to be like OpenAI’s or Anthropic’s?

Some would say _“yeah, why not, they’re big and successful”_ ([whether they are is a different story](https://www.wheresyoured.at/premium-the-haters-guide-to-circular-financing-part-one/)), but…

**But what you get is not an OpenAI or Anthropic way. It’s the way they think engineers like us should, or** _**“could”**_**, do our work.**

I don’t have insider info from those companies, so this is more my bet: knowing they’re the “Ivy League” of devs, my bet is they don’t think we’re capable of doing it all right. They may optimise the solutions and the engineering workflow for us at the “average Joe engineer” level.

**This is a much different dynamic than we had with “Let’s be like Netflix”.**

Copying Netflix meant copying someone who had solved (or at least claimed to solve) a problem in a specific context. Of course, Netflix and likes were selling something too. Those posts were recruitment, reputation, sometimes a push for their own open source. But their revenue didn’t depend on whether we adopted any of it, and the practice travelled together with the reasoning, because the reasoning was most of what they published.

With the LLM tooling, the practice comes embedded in a product, the reasoning stays inside the vendor, and that vendor’s revenue depends on how much we use it. We can’t read the thinking the way we could read a blog post. We can’t measure thre consequences.

I’m not even talking about coding. Many people let LLM tooling to break down problem, define what counts as done. And those decisions were always the slow part, and they are where development cost, quality and delivery time actually come from. Nobody outside our industry cares how we code; they care about those three. So when the deciding moves into the tool, what stays on our side? If we’re betting that all can be outsourced, then what’s our role?

With all this generated code, specs, and whatever else you get from Genie, you’re commoditising the knowledge harvested (or, um, stolen) by OpenAI, Anthropic and Google. <em>That can be fine if you'</em>re below average in your engineering practices or you’re lacking certain skills. I've seen teams that, thanks to that, were able to survive with an inherited maze created by other people. For plenty of teams and plenty of tasks, the average answer is better than what would have been shipped otherwise. We already see obvious choices like React for frontend and PostgreSQL for the database.

I’m all for choosing a boring tech stack. As a default choice, the issue is whether that’s the only choice or if we’re making our solution simplistic instead of simple. Or complicated instead of complex.

LLM training is as biased as the people who trained it, through weights, training data and whatever tuning sits on top. Same with the harness, or even more, as it’s the code someone put there. [I wrote about it some time ago in the pre-LLM AI era.](/en/computer_says_no_we_may_have_an_issue_with_ai_soon/)

GenAI tools are statistical parrots; they repeat the most probable answer, which most of the time means either mediocre or good, decided by the person who set the weights during training. Training is always subjective. If you ship one default to everybody, you tune it for the widest audience, which lands in roughly the same spot.

Some can say, that we could use open source models instead. Personally, I don’t consider open models or custom workflows per se as something changing this dynamic. I think that’s better, but not a solution. They change who holds the defaults, not the fact that defaults are now doing the arguing for us. Plus the cost of servers is still super high compared to the value.

With GenAI tooling we’re not only getting data and ideas on how to solve our design challenge or fix a bug. We’re also getting the workflow we’re forced to work with. This is impacting us from both angles. We ask and work on the design with this tooling and also let it do the final work. Harness is not only for getting and interpreting your needs through a model. It actually also harnesses your code and the design you get.

And now the question is: who’s putting the leash? Are we on our chosen design to ensure it’s as we want. Or is the GenAI harness putting the leash on us to provide the design it’s capable of or fine-tuned for?

[I wrote about my vision of the harness](/en/vibing_harness_and_ooda_loops/). I see it more as a way to ensure our process is reproducible and follows our intention: tests, automation, traces, a setup. We design it to be able to iterate fast, but not just for going fast, but to get quickly feedback loop and validate our assumptions. Going fast, in my opinion, shouldn’t be ever a goal on it’s own.

The vendor harness is a different animal. It’s created by vendor with the masses in mind. It has its own system prompt and tool definitions; it decides what gets pulled into context and what doesn’t, when the agent decides it’s done, and whether it asks you something or just guesses. It reflects the vision of authors on how the process look like. It’s not optimised for our approach; we need to fit into it if we want to get the benefit. Just like with application frameworks: we can benefit as long as our approach aligns with the framework’s author's vision; otherwise, we’ll struggle by not doing things idiomatically. The challenge with LLMs is that we don’t necessarily know the idioms, since big vendors aren't sharing them. They only provide guides as they see us working with their tools. And those guides don’t have to be optimised for doing things right, but for using those tools more. And we never know, as internals are hidden.

So, we don’t know the weights or vendors training data; we don’t know how those harnesses work internally, and even if we did, they could change at any time. Between one release and the next, the tool making decisions inside our workflow can start behaving differently, and you won’t necessarily be told.

**I’m not saying to drop using them. On my own I’m using those tools everyday, with mixed results.** Till this day what works best for me is the process I described in [Interactive Rubber Ducking with GenAI](/en/interactive_rubber_ducking_with_gen_ai/):

-   I’m using GenAI tool to ask me questions about my idea,

-   Then letting me answer and make decision without making them for me,

-   Then summarising into spec, that I work on,

-   Doing the work on my direction and review.

None of the workflow, automated multiagents etc. didn’t work for me in a proper, reliable way.

I also believe that’s also more aligned with how LLMs are build, they’re great in text processing. They’re not thinking, they’re just processing.

What to do about it? The first step is to realise it we have a problem, but frankly, I don’t have clear solution.

**I don’t know.**

I think that’s also why we have blogs, to share, put a seed, have a discussion. It’s fine to just don’t know all answers.

What I know is that we shouldn’t be outsourcing our thinking, as that’s the role of engineer, if we lose it, then indeed our profession is doomed. Do we want to truly bet on that?

I also believe that's a more important discussion than whether we should code or not, or what's the latest and greatest model today at 12:37 AM.

Thoughts?

Cheers!

Oskar

p.s. You may be also interested on my other articles on GenAI

-   [Vibing, Harness and OODA loop](/en/vibing_harness_and_ooda_loops/)

-   [Requiem for a 10x Engineer Dream](/en/requiem-for-a-10x-engineer-dream/)

-   [The End of Coding? Wrong Question](/en/the_end_of_coding_wrong_question/)

-   [Interactive Rubber Ducking with GenAI](/en/interactive_rubber_ducking_with_gen_ai/)

-   [Computer says no! Why we might have an issue with Artificial Intelligence soon](/en/computer_says_no_we_may_have_an_issue_with_ai_soon/)

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

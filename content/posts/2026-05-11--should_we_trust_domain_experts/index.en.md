---
title: Don't overestimate domain expertise
category: "Software Architecture"
cover: 2026-05-11-cover.png
author: oskar dudycz
---

![cover](2026-05-11-cover.png)

**I was toying with LLM-based domain research. It reminded me of the common mistake we make when we try to practice DDD: overreliance on what domain experts are telling us.**

I wanted to remind myself of the domain I used to know: hospitality management, to adjust my upcoming [workshop](/en/training/#event-driven-architecture-the-light-and-the-dark-side). I selected LLM (Claude Opus) as a sparing partner. And boy, I got a loooot of details. I was swamped by them. The LLM modelled everything: marketing consent, loyalty timing, inventory management, revenue posting, regulatory submissions, data retention policies, all at the same level of detail, which buried the core checkout flow under noise, the thing I asked about.

That's not much different from initial work with domain experts. When we're starting discovery, people tend to start by explaining everything they do and feel is important. Quite often, that means you'll get more domain-expert pet peeves in the surroundings than in the process descriptions. 

You also get a lot of jargon, words that sound familiar but mean something different.

That's also what I got from LLM, I asked it to review reference sources like:
- popular tools documentation,
- open specifications from the hospitality organisations,
- some laws like GDPR related stuff,

I researched how different tools handle the guest checkout process. I knew it, and implemented it in past; it's a surprisingly complex process, as you need to:
- verify if the stay is fully paid and close the financial account,
- generate invoice
- mark guest's stay as completed,
- schedule full room cleanup,
- mark in the inventory that the room will be available soon (unless the maid finds that it's broken),
- cleanup GDPR-related data that's not needed to keep,
- adjust loyalty points and update CRM,
- etc.

I remembered how it works, but not all the details, and I would like to double-check whether anything in the industry has changed. 

I wanted to get the overall vision first, then gradually dive deeper. As mentioned, I was overwhelmed with naming like:
- Folio, 
- Drain Pending postings, 
- Property, 
- Account Receivables, 
etc.

Don't get me wrong, those were valid names in these domains. Sounds plausible if you've never worked in hospitality. Sounds plausible if you have, too. So what's wrong with it?

They're valid terms, as people actually use them, but weird, as they don't tell "how the process works" but "how people do stuff," and that's not the same thing.

For instance, Property is a hotel, kind of makes sense. But Folio?

This name comes from the Oracle Opera. Yes, Oracle has a system in this domain, a dominating one. At some point, authors decided to name things this way, and now 30 years later, that vocabulary is baked into how thousands of hoteliers talk about their work. "Drain pending postings" is a phrase real cashiers say. 

"Settle the folio" is a thing real cashiers do.

The problem: none of it explains how our system should work. It only tells what current systems do.

Also, when I asked about the business rules and policies, I got stuff like: 

> The system immediately posts room and tax charges for day-use reservations upon opening the Billing screen.

Why are transactions such as night stay charges or taxes added when we open the billing screen? That sounds counterintuitive, but maybe it was a fair tradeoff 30 or 20 years ago for an on-premises system installed in the specific hotel (ekhm "property|). Yes, Opera had (and maybe still had) consultants, similar to SAP. They'd go to the hotel, go to the back office, log in to the server and hack stored procedures in the Oracle database to fine-tune Opera behaviour. 

Also, is there really a "Draining Pending Postings" option before doing checkout nowadays? Maybe it is, but in modern systems, we shouldn't manually check all bills, etc., and explicitly pull them from integrated payment solutions. Nowadays, all the accommodation charges should already be recorded on the bill. The financial module continuously collects charges from payment gateways throughout the stay. There's no separate moment of "draining". The LLM invented a coordination command to match a phrase ("drain the interfaces") that real cashiers use as shorthand for "let me check that nothing's outstanding."

As I asked, LLMs researched systems in this space: OPERA, Mews, Apaleo, and Cloudbeds. Each has its own vocabulary and mechanics, and the training data heavily favours OPERA because its documentation is everywhere. When I pushed back on terminology, the model would just swap in different OPERA jargon instead of actually thinking about what's modern. The blending happened invisibly, mixing vocabulary from one system with mechanics from another, all delivered with equal confidence.

**To be fair, the same happens quite often when talking to domain experts. They explain how it works now and what people do.** Quite often, they bring us [solutions instead of problems](/en/bring_me_problems_not_solutions/). Usually, solutions are based on their experience and how they see the updated version. This can be fine as a brain dump, but it's not enough to translate it directly into the software design. 

In Domain-Driven Design, finding and understanding the ubiquitous language is considered the most important aspect. **Yet, Ubiquitous Language is not the source of truth.** It's the way to keep our heads from exploding due to the constant split-brain situation. It's a tool to reduce cognitive load and the need for additional translation. That's why we separate domain contexts and bind them to specific departments, people, and the language they use.

It's fine to start with the current state of the art. Understanding how people do their job. We need to understand, though, that what we get is a mixture of habits (both good and bad), tribal knowledge, jargon, etc. If you ask different tribes, each will tell you something different.

Domain language is a cognitive tool, not gospel. LLMs compound this problem by reiterating competitor vocabulary without understanding the reasoning behind those systems, and they tend to align with whatever the prompter already believes. 

Domain experts also struggle to define what they want and how it should work. That's also why they hire us. It's our job to help them and to transfer those sometimes contradicting visions into working software. That's what we're learning and what we do when modelling and step-by-step shaping the working software. That's our work as engineers. We should work together to have a proper outcome. Collaborate.

And I'm not making the bold statement here that we're smarter or we know better. We're not; we have different expertise and different roles in the software development process.

**Contrary to what many people believe in the DDD community, in my opinion, we're not here to become domain experts; we're here to build software.**

The model we built doesn't have to reflect the whole universe; it's a way to take part of the business, understand, and automate it in the form of a software system. A software system is a tool for the business make more money. So software needs to be useful in a certain, defined way. Not all possible ways.

We need to learn [how to communicate](/en/a_few_words_on_communication/) with business people, for instance:
- Don’t use jargon or acronyms or assume someone should know something.
- Understand that what someone wants to tell us might not be what they hear.
- Do not take others’ behaviour personally.
- Be assertive, critical and sceptical. Also, to our own judgments.
- Be curious about the business domain. Don't assume too much.
- [Don't use "business won't let me" as an easy excuse](https://www.architecture-weekly.com/p/business-wont-let-me-and-other-lies).

For some people, that's too much. That's probably why they try to ask LLM instead of Domain Experts, hoping that we won't need to learn that, and we'll get a solution for free.

We're sometimes annoyed by being pushed hard by business people, I get that, but if we want to build something useful, that's also where LLM will fail, as they will just agree eventually to what we believe. And that'll probably be even worse than the skewed reality shown by the domain expert, since this will be Artificial Reality.

**I keep hearing blank statements that "LLMs are great for research". Blank because they usually are not followed up with what the author means by "great".** LLMs have many inherent limitations here. We're anthropomorphising them too much. They don't reason; they're statistical machines. We should constantly remind ourselves of that.

I think people who claim that “LLMs are great at research” are just conflating their own skills and projecting them onto LLMs.

Hence, in my opinion, that’s why we’re getting those hot takes. Might be that they just have the skills to drill down, organise research, evaluate it, and model system design.

And I think this narrative is dangerous.

Because I, too, could sit down and say that I iteratively arrived at a solution thanks to LLMs. Write this article in a much different narrative, praising LLMs. I could say that if someone couldn’t get the same result, then that’s a skill issue.

But that wouldn’t be true, because someone without my experience in the domain and in modelling probably wouldn’t pick up on it.

Furthermore, it’s not necessarily true that I did it well; that would just be my perspective.

In practice, in this context, “LLM does it well” means “LLM does it the way I wanted it to.” And if the outcome is right, it is more likely that the “operator” had the necessary skill and used an LLM as a tool to speed it up.

The research I did looked at what our competition does and how they name things, but without internal knowledge of why those systems got to where they are. If our goal is to provide additional value to users, then just doing a blind copy won't take us far. Instead of doing Lift and Shift, building something that has the same features but does better, we'll get Lift and Shift with silent f.

Yes, LLMS can gather and compile multiple sources into a summary. That's actually impressive and can spare us a lot of time. They're also taught in the public documents, so some of their knowledge is built in. They look impressive on the surface, but not so if you look deeper. In the mentioned research, I got disconnected pieces of information, the techniques were randomly assembled with muddled technical and business language, and the whole thing didn't tell a coherent story. Because of the randomness, you never know where the knowledge came from, what was omitted and what was skewed. With domain experts, you can at least understand the origin of their biases.

LLM also has limitations. The biggest is the context size, and being a yes-man. If we ask for the big picture, usually, we'll end up with a swamp of information instead. If we don't know how to sort this knowledge, what we're looking for, and do a proper drill-down, then we won't be able to untangle it. If we don't have domain experts and don't know the domain, how will we challenge issues like the ones I gave above?

I also keep hearing that LLMs are really useful in modelling. Sure, I tried that. I also asked LLM to try to model, and well, even after numerous iterations and using modelling tools, the results were mediocre. Mostly cliches and bad modelling practices.

The output muddied what we had before. The context was lost, and the process was oversimplified. When asked to apply specific tools like the C4 model, EventStorming, and Context Maps, it was forcing DDD patterns instead of describing actual processes. Even with precise instructions, it was building models with broken notation where rules floated outside the command-event chains, leaning on clichéd solutions, losing context between iterations. The domain was also presented as a big ball of mud. Concepts from room reservation bleed into the cashiering module. It was a recurring pattern across different versions of the same mistakes.

If you give too much context, they'll mix and blend multiple conflicting vocabularies from different operational tribes trying to satisfy you. If you give it too little, it will come with simplistic hallucinations.

Is it hopeless then? Not at all, we can get help from LLM, but when we use it as a tool, not a replacement. We should not outsource thinking.

LLMs are useful for grasping the big picture and identifying known unknowns that we may miss as we get into the domain. We can learn about the language specifics, as mentioned in the Folio, Postings, Account Receivables, etc. LLMs can help us drill down into interesting aspects. We can get a brief understanding of domains we don't know at all. But then we need to dive deeper and collaborate with our domain experts, real stakeholders. We need to understand what we want to build, organise our findings and focus on a certain context.

If we want to model our system, then LLMs can help us do boring work.  It can organise our findings and create rapid text-based transitions with a defined format (including modelling practices). This can work. Yet it's still our job to do domain discovery, refine the knowledge, evaluate and test it. We still need to focus on the [feedback loop with real world](/en/vibing_harness_and_ooda_loops/).

We won't hide from gathering modelling skills, we won't skip the process of translating the domain into technical design, and we'll still need to drive how and when to drill down. Those are engineering skills that were needed and will still be needed. And that's fine, as if they wouldn't, why would someone want to hire us?

I see that (for unknown reasons) collaboration is not discussed anymore. Working collaboratively with fellow humans has become something people dread rather than embrace. Maybe some people hope that they won't need to talk to "domain experts" and "fight them", because they "have everything here in LLM".

And yes, they have all.

All the same issues they would have with domain experts. 

As much as we shouldn't trust domain experts blindly, but work with them, we shouldn't blindly trust LLMs. We shouldn't drop our engineering and design skills and outsource them.

If we want our software products to be better than the competition, simply blending their experience isn't enough. We should focus on finding our special sauce, and I don't see any other way to make it right than to work together and collaborate. We can use LLMs to help us do it faster, but as tools, not as solutions or replacements.

Check also:
- [Bring me problems, not solutions!](/pl/bring_me_problems_not_solutions/),
- [A few words on communication](/en/a_few_words_on_communication/),
- [How to design software architecture pragmatically](/en/how_to_design_software_architecture_pragmatically/),
- [Business Won't Let Me and other lies we tell to ourselves](https://www.architecture-weekly.com/p/business-wont-let-me-and-other-lies)
- [Vibing, Harness and OODA loop](/en/vibing_harness_and_ooda_loops/),
- [Interactive Rubber Ducking with GenAI](/en/interactive_rubber_ducking_with_gen_ai/),
- [The End of Coding? Wrong Question](/en/the_end_of_coding_wrong_question/),
- [Requiem for a 10x Engineer Dream](https://www.architecture-weekly.com/p/requiem-for-a-10x-engineer-dream),
- [Tech Debt doesn't exist, but trade-offs do](https://www.architecture-weekly.com/p/tech-debt-doesnt-exist-but-trade)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

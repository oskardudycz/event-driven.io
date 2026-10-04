---
title: On getting the meaningful discussions, and why that's important
category: Software Architecture
cover: 2024-12-16-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

Welcome to the next week!  

**This time, I’d like to go less techy and focus more on the soft part of being an architect.** As much as I like to show code and explain the application of the technologies and patterns, I don’t want to make this newsletter Yet Another System Design Interview Preparation. I think it’s important to know patterns and technologies, but I also think it is more important to apply them in practice.

**To put our design into practice, we need to be able to persuade our colleagues, stakeholders, and other peers.** Without the ability to explain and persuade, even the best design will not be applied. And we’re doing ourselves harm if we spend hours, days, or even weeks and then don’t make additional effort to _sell_ our idea.

**So yes, being an architect is also about talking.**

Some may even cynically say that it’s only about talking.

I disagree with that. I think Architects should be hands-on, and I even wrote a (not-so?) humble [Architect Manifesto](/en/architect_manifesto/).

**Yet, let’s focus today on how to strike the right balance between talking and not talking and on how to talk to achieve the outcome.** Let me show you a few rules that work for me. I hope they can also help you. Let’s start with points and then follow up on each of them:

1.  **Ask and listen more often than tell.**

2.  **It’s okay to agree to disagree.**

3.  **Split the discussions on facts from discussions on feelings.**

4.  **Focus on similarities, not differences.**

5.  **Avoid jargon at all costs.**

![Why Did The Office End? - Cast & Crew Comment](2024-12-16-cover.jpg "Why Did The Office End? - Cast & Crew Comment")

Source: https://couchpotatoshop.com/blogs/the-office-news/why-did-the-office-end

## 1\. Ask and listen more often than tell

Too often, we’re not listening; we’re just waiting for the prepared statement that’s in the back of our heads. Whatever other people say doesn’t matter. We’re just waiting because we think we’re polite and _giving others a space to speak_. But actually, if we could, we’d just speak our idea. We could even wear earplugs, as we only adjust how we connect our phrase to what others just spoke. Not the idea; it’s great.

**I’m not sure how about you, but I don’t always have the best ideas in the room.** Unfortunate but true. Still, I have prepared statements about my _great_ ideas. Even more unfortunate and even more true.

**Jokes aside, listening to others and asking for clarification is a must.** It’s our due diligence. Even if we’re the smartest person in the room, we could overlook some details and miss the important perspective.

**Having the last word is not only a sign of power.** It’s also a smart move. If we spoke first and gave the solution, we wouldn’t learn about potentially better solutions. If our (not-so) great idea failed, then we’d be last to blame. If a cynical argument speaks to you, then we can always say _“that’s also what was our idea”,_ to the best thing we have heard so far.

Also, last, but not least, it’s about transparency, building camaraderie, and a safe space for discussion. In the longer term, that’ll pay off.

Won’t that lead to _analysis-paralysis_? That can happen, but…

## 2\. It’s okay to agree to disagree

**I had one IT Department Director who always tried to persuade us.** He always wanted our agreement on his idea. He didn’t stop even if we said:

> _"We don’t think that’s optimal solution, but we can do it this way.”_.

Sometimes, a not-optimal decision is better than no decision, so he could say:

> Ok, then do it and we’ll evaluate the outcome.

Still, he wanted to persuade us. Initially, we spent hours discussing his solutions, knowing that we would eventually go his way. His way or highway was the rule. But, after discussions. Then we became sneaky, and nodded much quicker, just not to waste time. But that wasn’t as sneaky as we thought. When we did it, and that didn’t work (surprise!), he was saying:

> Why didn’t you challenge my ideas?

**Sometimes, there’s no best way. And we need to embrace that.**

We need to choose something. And we shouldn’t be doing that blindly, but still make the choice. I wrote about it longer [Why are we afraid of our decisions?](/en/why_are_we_afraid_of_our_decisions/)

We need to note the alternatives and write explicitly why we selected a specific way. And suggest when to reevaluate our decision.

If we’re leaders, then it’s great if we give our people the possibility to discuss that, but if we’re not allowing them to win, then it’s actually not a battle but a rigged fight. Yeah, I know fight analogies in programming don’t suit you well, but I hope you get the gist.

**It’s better to explicitly state that we disagree and explain why.** We don’t need to agree as long as we can come up with an acceptable solution for all of us.

We should prefer consensus over compromise, but that’s not always possible. We’re also hired to make hard decisions. [Somebody’s Gotta Do It!](https://www.youtube.com/watch?v=M0SjU95U3-k)

## 3\. Split the discussions on facts from discussions on feelings

**Mixing feelings and facts leads nowhere. Or actually, it leads somewhere: to endless, heated discussions.** You saw that on socials, right? You were even part of it, aye? How to avoid it?

**Unsurprisingly, we need to prepare a bit**—a bit can be a whole a lottta work. We should start by breaking down our problem and finding its essence. One possible way is to Follow the Money. We need to know WHY we’re doing it and WHAT the biggest challenge is. **That’s hard, but just the starting point.** Then we can start to discuss HOW.

**Knowing facts, we can talk about specific solutions.** It’s easier to avoid the impressions sphere. Facts are facts; we can’t dispute them but can dispute the interpretations. And usually, we will, but we should keep such discussions on a leash.

Embracing that, we should give someone room for subjective evaluation. **So again, ask and listen more often than tell.** Then, you can always agree to disagree.

**I always try not to assume that I need to convince someone.** I’m more focused on presenting and explaining my ideas rather than persuading. That helps to focus first on facts. If I present the current state and my ideas in a way as:

> _Listen, my understanding is that this works this and that._

Or

> _In my opinion, if we choose X over Y, then we’ll get the advantage Z because of ABC._

And yes, that’s weird, as I just presented facts as personal opinion or understanding. But this helps to highlight, that we already embraced that our interpretation of facts can be skewed.

Those are _our facts_. As long as we don’t go _my facts are the myty_, then we’re good.

Now, we’re leaving the space for personal evaluation for others. They can judge if our biases didn’t impact the presentation and think about whether they like it or not.

If they agree, fine; if not, we can discuss it. It's easier to discuss why someone doesn't like it.

**If we mix these two levels, it's hard to reach an agreement.**

Besides, you already know that someone when someone agrees with us doesn't mean we've convinced them. They could agree with us because:

-   they wave their hand and don't care,

-   they want us to leave them alone,

-   they objectively see that someone is right, but it doesn't matter because they subjectively don't like it anyway.

I’m sure that you had cases where you thought:

> Well, yes, it may be a bike with the best parameters, but I won't buy it because it's ugly and if I had to look at it every day I would puke.

## 4\. Focus on similarities, not differences

That’s also related to using adjectives such as [better, faster, stronger](https://www.youtube.com/watch?v=gAjR4_CbPpQ). When we come up with a much different proposal, we immediately put people in a defensive position. Their first thought is that we don’t like their solution. That’s probably true, but will it help if we highlight that?

Especially if we start to say that our solution is **simpler, less complicated, and easier to maintain; all those are meaningless adjectives.** They all mean different things to each person. We usually use them to hand-waist other people’s arguments.

And you know what happens if we put other people into defensive positions? They will strike back, and now we must defend our position. And doing that one against the other is usually a lost battle.

**That’s why we should focus on working together instead of fighting and battling.** When explaining your solution and letting others speak, try to show points in which your solution matches other people's principles. You don’t need to lie; your solution is probably not as revolutionary as you may perceive it. It’s probably similar in many ways to others, just the pin points are located in different places. For differences, focus on facts and discuss others' feelings on them.

Important note is please, please, don’t tell phrases like:

> I like your solution, **BUT**…

Or

> My solution is similar to yours, **BUT…**

Do you know that BUT has a second name? It does; they call him Invalidator. It invalidates any kind words used before it in the sentence.

If you do it well, then you can enhance your solution by including other people, and you’ll again build camaraderie.

## 5\. Avoid jargon at all costs

**I’m trying to avoid using jargon and acronyms or assuming someone should know something.** Using terms like aggregate, bounded context, subdomain, value stream doesn’t get us closer to mutual understanding.

Better be precise and explain your assumptions using simple words. Even if you’re talking to technical people, you may be surprised that they may not know or understand terms differently.

Instead of discussing the real issue, we can start arguing on terms that don't matter. Then you may get annoyed, even if you made a false assumption.

When explaining, start by explaining what issue you want to solve. Then, after discussing potential solutions, you can name the pattern, like

> "Hey, by the way, this is called aggregate.”

Not the other way around.

People that don’t know jargon will be lost when you use it. And those that know those terms, probably don't have to hear those terms, they will get it.

* * *

I’m sure that there’s more advice to that, but you can start from that. Please drop me a note if that was helpful or if you want me to come up with soft skills content here from time to time.

**Please also share your piece of advice with me!**

Check also more in my related blogs:

-   [A few words on communication](/en/a_few_words_on_communication/)

-   [Bring me problems, not solutions!](/en/bring_me_problems_not_solutions/)

-   [15 tips on how to run meetings effectively](/en/fifteen_tips_on_how_to_run_meetings_effectively/)

-   [Follow the money to get a better design](/en/follow_the_money/)

-   [How to design software architecture pragmatically](/en/how_to_design_software_architecture_pragmatically/)

Cheers!

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).

---
title: What texting your Ex has to do with Event-Driven Design?
category: "Event Sourcing"
cover: 2021-01-27-cover.png
author: oskar dudycz
---

![cover](2021-01-27-cover.png)

We sometimes feel melancholic, blue and a bit messy. When we enhance those feelings with "gummy berry juice" then various dubious ideas come to our minds. We grab the phone, we bash out a few brilliant sentences. Bam! Here we go! Usually right after we hit "send" we realise that it was a bad idea. Sometimes we have to wait until morning to understand embarrassment:
- "Did I really text my ex?!"
- "Maybe she didn't read it?"
- "Maybe I can remove it or at least edit it?", 

Sometimes we are lucky, e.g. we can delete a message on WhatsApp, or edit it on Skype. However, we aren’t sure if the message was read or not. Usually, the best thing to do is apologize or write "I was just kidding!". You cannot retract a bad situation, but you can try to fix it. 

Why am I writing this to you? People often ask me, what will happen in event-driven systems when we publish a wrong event (e.g., missing data, incorrect data, etc.). The recipe is similar to the scenario when texting your ex: 
1. **Think upfront:** This can save you a lot of trouble and difficulties. Make sure that you correctly understood the logic with the Business, then write tests. Such an approach can protect you from bad consequences.
2. **If you've sent the message through Skype, edit it:** let's make it clear, sending a message to an ex after a "gummy berry juice" is never a good idea, even if it seemed like it at the time. However, if the message has not been read yet, there is an escape route: editing it. If we have an event-driven system and send events with a delay (e.g. with the "Outbox Pattern" pattern, read more [in my previous post](https://event-driven.io/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/)), we can still edit it. If we use, e.g. relational database as storage (e.g. using [Marten](https://martendb.io/)), we can do it with a migration. Is this "best practice"? Not really, but it works as long as the event wasn't published yet. Besides, we are not talking here about best practices, but about saving the situation. 
3. **If we sent a WhatsApp message, try to delete it:** most message buses (e.g. Kafka) allow you to delete messages sent to them. To put it mildly, this is not a recommended solution and has far-reaching consequences. But it can be done. It might not be sufficient, because the message could already be read and deletion won't help, but it won't be reread. This is certainly not what I would suggest, but Huston, we have a problem to solve. 
4. **Apologise:** you can say sorry, you can try to say that someone else got to your phone and did that ("if you were caught red-handed, claim that it is not your hand"). Generally perform the so-called "compensating operation". It's just like an invoice. After we've issued it, we can't edit it. We can only correct it. If we transfer too little money to someone, we do not edit the transfer, but we send the second one with the missing amount. Contrary to what "business" used to say, there is always an emergency exit in the process. In an ordinary world, you can always call someone, possibly write an email, to verify they accept your apology. We should do the same in our systems, and we can usually perform a corrective action. This is the only reliable way of making sure that our actions were compensated.

And you know, the basic rule - if you drink, you don't write!

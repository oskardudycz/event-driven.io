---
title: Tell, don't ask! Or, how to keep an eye on boiling milk
category: "Coding Life"
cover: 2021-10-27-cover.png
author: oskar dudycz
---

![cover](2021-10-27-cover.png)

Some time ago, I thought about writing a cookbook for guys, a set of essential tips on surviving in the kitchen. I thought of starting with brewing coffee and making tea, then going to advanced one like how to heat the milk so that it does not boil over and make a soft-boiled egg. 

I don't know about you, but I must be extraordinarily patient and vigilant in these matters. Let's take boiling milk, for instance. It is a very malicious individual. Before heating, you should obtain matches. Don't you have a gas stove at home? Never mind, these matches are not for lighting gas. They are from holding drooping eyelids. Milk usually boils for a few minutes. It is challenging to have enough self-control not to blink. Because when you blink, then... The milk has boiled over!

You look once - cool. You put your finger in - still lukewarm. Suddenly you sneeze, your eyes close and you screech! The pot and stove are whole in boiled milk.

It's the same with a soft-boiled egg. The recipe is simple. Pour water into a pot and put eggs in it. Wait for the water to boil. When the water boils, cook the eggs thoroughly: S - 3.5 minutes, M - 4 minutes, L - 5.5 minutes. And here there is the issue that somehow this egg never fits into S, M or L. Moment passes, and we already have an egg too hard for being soft and too soft for being hard.

As I have this book ready, the second volume will be about programmers and their IFs waiting and verifying whether a record can be saved or not. Surely you know this code:

```csharp
if (invoiceService.Exists(invoiceNumber))
{
    return false;
}
invoiceService.Add(new Invoice { InvoiceNumber = invoiceNumber });
```

When I see such a code, I can recite from memory how the dialogue will proceed:

- **Me**: Why do you need this if?
- _**Interlocutor:** Because an invoice with the same number cannot be added, what do you not understand?_
- **Me:** And this if will provide you with this?
- _**Interlocutor:** Yeah._
- **Me:** What if someone adds an invoice with the same number while you're waiting for the check result?
- _**Interlocutor:** This is not gonna happen._
- **Me:** Well, how not? After all, it can happen technically.
- _**Interlocutor:** Okay, but very rarely._

Curtain.

It often turns out that there is a unique constrain on the database that will guard uniqueness constraint. The IF is added either _"just in case"_ or _"just to have a chance for nasty bug"_.

Worse as a developer despises adding database constraints. Who defines keys or indexes these days? SQL in the 21st century? Ugh!

Then we are dealing with mild schizophrenia. Because business says that it is required, the programmer thinks so too, but in fact, it's only a little, as much as they are comfortable with.

When writing such a code, we behave as when heating milk. This time you will succeed! I won't blink now, and nothing terrible will happen. I'll even try not to breathe! Milk cannot boil over in a split second.

However, the problem is not with the "constraints" themselves. It also applies to shaping the API itself. I think you've also seen situations where we had to call _"Validate"_, _"CheckPermissions"_, _"Exist"_ while writing the code. Check if the milk has boiled over yet, put your finger in and check the temperature. If it's M, then cook 4m. If L then 5.5m.

The more we have to remember to use our API correctly, the more likely we will forget about some steps.  According to Murphy rule, if people can forget to call the _Validate_ method before doing Save, then for sure, they will. 

**That is why our API should be built according to the _"tell, don't ask"_ principle.**

Our API should let us tell what we want to achieve and handle necessary checks internally. We should not be asking on each request, just in case, _"can I do it?". In our example, the _Add_ method should verify if there is no other invoice with the same number. We should not require to remember to call _Exists_ before that.

By doing this, we gain:
- more straightforward and predictable API, especially if we map, for example, a database exception to some more readable domain error and return it as a result.
- reliability. If we encapsulate the check, we don't need to be afraid that someone forgets about calling it.
- more efficient API - if you do not always have to do an additional query _"and is there such a record"_, we gain better performance. We don't need to do additional calls, open new connections or have hanging threads causing deadlocks.

Win-win!

If we have tools like databases with unique constraints that can make our code more performant, reliable, and less clunky, we should take advantage of that. Some people say that _"Having the check, in code is more explicit and you see the business rules"_. That's true, but I take the tradeoff in 99% time. I prefer to have a simpler, more reliable code that works as it should than code that is more explicit but wrong.

So the next time you do such a check, remind yourself of boiling milk and **tell, don't ask!**

Cheers!

Oskar

p.s. check also [Optimistic concurrency for pessimistic times](/en/optimistic_concurrency_for_pessimistic_times/), it should help you on telling instead of asking. 

Read also [What does Mr Bean opening the car have to do with programming?](/en/what_does_mr_bean_opening_the_car_have_to_do_with_programming/) to continue hunt on redundant abstractions.
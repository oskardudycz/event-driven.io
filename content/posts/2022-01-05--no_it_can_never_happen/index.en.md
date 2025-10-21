---
title: No, it can never happen!
category: "Coding Life"
cover: 2022-01-05-cover.png
author: oskar dudycz
---

![cover](2022-01-05-cover.png)

*"No, it can never happen!"*. Have you heard this sentence before? For example, a user with the same e-mail address may not register, or the shipment won't be delivered.

I want to tell you about a specific requirement and a situation that had no right to occur. I was working once on the financial module of the system in the hospitality industry. We had the requirement that guests couldn't check out if they didn't pay for the stay.

The process of checking out a guest is quite complex. We need to calculate the balance and make sure that it's zeroed, so if all charges were paid. You should notify the person who will clean the room and ensure that the guest is not there yet. If everything is correct, you can mark the room as available so that another person can check-in. 

Technically, the process was started in the financial module. We blocked the guest's account during the checkout so that its status would not change during the checkout. When payments didn't match charges, the process finished with an error. Someone from the front desk had to ask the guest for a surcharge. We informed the guest accommodation module when everything went fine. This module had to do stay summaries, update availability, etc. It sent back the event with a confirmation that all processing succeeded. Then, the financial module could close the checkout process.

According to the requirements, if the financial module stated that the guest could be checked out, no other module was allowed to deny that fact. All it had to do was accept it and run its internal business logic.

So much for the theory. In practice, it was different. There were many reasons it could fail—from the most prosaic programming errors to changing or sometimes contrary requirements. 

An extreme case was as follows:
1. The financial module started the process of checking out the guest. It blocked the guest's financial account and sent the event to the guest accommodation module.
2. Some error occurred in the guest accommodation module. Because of that, no event was sent back to the financial module. 

Because of that, the check out process was stuck. Thus:
1. No operation on the blocked guest's financial account could be performed.
2. There was a discrepancy. The financial module stated that checkout had started, but the guest accommodation module didn't acknowledge that fully.

In the hospitality industry, there is a [night audit process](https://www.hotelogix.com/blog/2021/05/19/night-audit-procedure-in-hotels-with-cloud-hotel-pms/). Its major functions:
- Ensures rollover from one business day to the next day
- Reconciles all front office cash counters/accounts
- Verifies posted entries to guest/non-guest accounts
- Resolves room status and rate discrepancies
- Generates several reports called night audit reports.

If one of the business rules is not fulfilled, you cannot finish the process until the discrepancy is not resolved. You should probably see where I'm going. Yup, when the checkout process was stuck, it created discrepancies blocking the night audit process. There was no way of fixing them without doing migrations or code fixes. You couldn't do a manual fix through the application (e.g. manually check out guest) because you couldn't check out the blocked account. That's the worst case that you could end up. You don't want to be the person telling the customer that they cannot do anything and be fully operational until we update the software.

Someone may say: _"Okay, there were some bugs in the requirements or in the code. We need to improve and they won't happen again."_ But that's not going to happen, we cannot assume that we won't have a bug, or our hardware or network won't have any random failure. Assuming that, it's a romantic vision.

Also, the reality is much more complex. It's pretty common that one guest did a checkout but is still in the room. How? E.g. the door wasn't closed, and the guest got back to the room to wait for a train, or there were a few people in the room. One was doing checkout; the other still stayed there.

Or when we have a requirement, we have to check in a guest if we have an available room. What if it turns out that, in the meantime, the toilet broke and the room looks like a mess? What if we don't have any other room available? How do we fulfil this requirement?

Apart from Decalogue, only a few rules were carved in stone. Even Decalogue's ten rules are not always applied properly in real life. 

Most computer systems rely on the automation of the already established "analogue" procedures. Such procedures usually allow many different options. There is a lot of grey area. We should design our systems accordingly. We should be asking the business:
- How is it being done now?
- What are you doing if this didn't happen?
- How do you fix this issue?
It often turns out that alternative flows exist.

We, as programmers, try to create ideal systems, except that our definition of the ideal is somewhat distorted. The ideal system reflects the expected business process. It should embrace that things fail, and unforeseen scenarios will pop out. Therefore, in our systems, we should not treat the error as persona non grata.

The memorable image of "this is not a bug, this is a feature" has a lot of truth in it. We should expect and prepare for many unexpected things in the real world. If we treat these scenarios as possible, we can also start talking to the business about handling them and treating them as requirements. Thanks to this, our software will be more convenient because it will have fewer dead ends. Users may be able to perform the corrective operation without being blocked. It will also be better for us, as we won't need to be sending hotfixes in a rush (or at least less often).

Therefore, when a business tells us that something will never happen, let's answer: Okay, so how often?

Cheers!

Oskar

p.s. If you liked this article, check [Bring me problems, not solutions!](/en/bring_me_problems_not_solutions/).
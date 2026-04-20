---
title: Yoda Principle for better integrations
category: "Event Sourcing"
cover: 2026-04-20-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![cover](2026-04-20-cover.png)

> Try not. Do. Or do not. There is no try!

I'm calling this the Yoda Principle. 

[Master Yoda said that to Luke Skywalker a long time ago in a galaxy far, far away](https://www.youtube.com/watch?v=BQ4yd2W50No). He was teaching Luke how to name commands properly while trying to untangle some legacy enterprise mess. 

I'm sure you've also seen a death star of weirdly-named stuff. Some of them have already tripped you hours of thinking whether someone named this thing badly, or there's some hidden truth behind it.

**Let's discuss that by the example: E-Commerce order fulfilment.**

The order is placed automatically once the customer confirms the items in the shopping cart. We're not making any product reservations before the shopping cart is confirmed, as this would lock it for other customers, and, as you know, they tend to drop items from their carts.

Once we receive the event notification that the cart has been confirmed, we'll start the order fulfilment process. It starts (as mentioned) with the order initiation, which acknowledges and initiates the multi-step fulfilment process.

The first step is checking product availability before confirming the order. We need to determine whether we can proceed with completing the shipment and initiating product payment. If the product is unavailable, we need to either ask the customer to wait until we have it again or cancel the order.

We have dedicated modules for order fulfilment and for inventory. Fulfilment is the orchestrator, and inventory is responsible for tracking the state in warehouses.

The ordering module would need to call the inventory module to verify product availability. We could send a command (through the messaging system or web api). How would we name it? 

What about **_VerifyProductExists_**? We'd send the product id and quantity from the order information, and return true if we have enough products, false otherwise. Sounds fair, right?

Well, it may seem nice at first glance, but what happens if more than one order verifies the same product availability, and we're running short?

Then we're vulnerable to race conditions I described in [Tell, don't ask! Or, how to keep an eye on boiling milk](/pl/tell_dont_ask_how_to_keep_an_eye_on_boiling_milk/). The information we get is only valid at the time of querying. If we don't lock the product quantity, it can change before we get a response (think: Black Friday-like demand).

**Naming our command like _VerifyProductExists_ is a mistake**. 

_VerifyProductExists_ is not even a command; it's a query. Command is a request (intention) to run business logic. Query is a request to return data. 

Of course, pragmatically, our [command can return status information about the result of our operation](/pl/can_command_return_a_value/). But the intention is different.

**What's our real intention here?**

The real intention is that we'd like to reserve products so we can ship them and get payment for them, not to verify if they exist. It'd be better to name our command as ReserveProducts or LockProducts.

Why does it matter? 

If we're naming our commands with Verify/Validate/Check prefixes, we're putting ourselves into the wrong mindset. We're not focused on actions and integrations, but just brief checking. If we're in such a mode, it's easy to handwave the integration complexity.

Locking for shipment may require sending someone to double-check that the product is in the warehouse and hasn't been stolen, damaged, or other steps. It may be an async process on its own. Still from the ordering module, we should not care, as we're telling what our intention is and expect to get events informing us whether the reservation succeeded, failed, or timed out (we don't want to lock products forever in case of order fulfilment issues, but only for some time).

**Prefixes like Verify/Validate/Check, etc., are just synonyms for trying.** And well, commands are always a form of trying. The handling module can reject the command, as its business rules and state are the source of truth.

We should always assume that the command processing can fail. We should not be discouraged by that, and we should double-check everything. We should not be intimidated by the potential failure, but prepared for it.

**We should try not. Do or do not. There is no try.**

What if we have both? So _VerifyProductExists_ and _LockProducts_? It can work if the first one is a query used by the Shopping Cart module, without any guarantee that the data isn't stale, on a best-effort basis.

If we're always requiring VerifyProductExists from the handling module before LockProducts, we're making our communication chatty. I described that in [What does Mr Bean opening the car have to do with programming?](/pl/what_does_mr_bean_opening_the_car_have_to_do_with_programming/) that this is not only a bad developer experience, but also just redundancy. Locking should already verify whether the product exists, so why require someone to memorise those scenarios instead of checking it internally?

The same goes for cases like:
- verify payment has been made,
- check if the order wasn't already fulfilled,
- validate if the shipment has been completed,
- etc.

All of them either hide a missing business concept or should be a business rule verified within the specific action (e.g., confirming an order). 

I recognise this may seem nitpicky, but big things are built on small details.

If we don't think about such things, we'll not only end up with misnamed integrations but also fight [race conditions](/pl/dealing_with_race_conditions_in_eda_using_read_models/) and incorrect boundaries. 

Then [we'll be doomed](https://www.youtube.com/watch?v=cTwZZz0HV8I).

So better think twice and do or do not. 

May the force be with you!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

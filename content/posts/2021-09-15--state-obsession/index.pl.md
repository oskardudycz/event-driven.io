---
title: Anti-patterns in event modelling - State Obsession
category: "Event Sourcing"
cover: 2021-09-15-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-09-15-cover.png)

Some time ago, I tackled the first event modelling anti-pattern: ["Property Sourcing"](/pl/property-sourcing/). Today I'd like to tackle the next one: _"State Obsession"_.

I have already written [that Bank Account this is not the best example](/pl/bank_account_event_sourcing/), but let's try again. Let's assume that we would like to model financial transactions. We may have different transaction types: cash deposit, debit card payment, foreign or crypt currency, even a check. In the end, the most noticeable effect is the change in account balance. Deposits increase it; withdrawals decrease it.

We may conclude that we could do a _BalanceUpdated_ event that would store information on how much the balance changed. Positive value for deposits, negative for withdrawals, e.g.:

**BalanceUpdated** {_Amount_: 50}

**BalanceUpdated** {_Amount_: -50}

**BalanceUpdated** {_Amount_: 100}

**BalanceUpdated** {_Amount_: -20}

We could use those events to calculate the total balance (_80 = 50 - 50 + 100 - 20_).

Such event structure can look like a reasonable idea. We made our processing [generic and simple, right?](/pl/generic_does_not_mean_simple/) However, by trying to standardise processing, we flattened business information. Ignoring the specifics of those operations and not creating detailed events like _DepositRecorded_, _CashWitdhrawnFromATM_, _TransactionVoided_, we're risking the loss of important business information. Events are business facts and should be focused on the outcome of the operation. Ultimately, withdrawing cash from an ATM will have different properties than paying by a credit card. When modelling events, it's important not to think about the state change but about what exactly has happened. We should keep things simple but not oversimplified.

Therefore, in my opinion, it is better to replace the generic event with more specific ones, even if they seem very similar at the design time. It is much more valuable to have this sequence instead of the previous one:

**DepositRecorded** {_Amount_: 50}

**CashWithdrawnFromATM** {_Amount_: -50}

**IncomingTransferRecorded** {_Amount_: 100}

**CreditCardPaymentMade** {_Amount_: -20}

Just by looking at them already, we can see what was happening.

An even worse problem would be if we modeled the _BalanceUpdated_ event as storing the current account balance after the transaction was registered, for example:

**BalanceUpdated** {_Balance_: 50}

**BalanceUpdated** {_Balance_: 0}

**BalanceUpdated** {_Balance_: 100}

**BalanceUpdated** {_Balance_: 80}

There is no information about the type of transaction. We also lost the only specific information: transaction amount. We need to know the current and previous balance to be able to calculate the transaction amount. 

In the case of these events, the specific information is that you deposited 50$ at the bank and then withdrawn them at the ATM. In the case of the transaction processing, the account balance is derived information. It's not specific for the transaction that happened but calculated based on them. We should not overlook critical details. It is the direct way to losing data. If the algorithm or taxes change, how will you know what the transaction amount was?

Of course, life is not only black and white. Sometimes we need to make pragmatic decisions. For instance, we must remember that the most common use case for events is (re)building read models. Projections that are used for that should be relatively simple code, without much business logic. In our sample case, we would not like to duplicate the logic of calculating the account balance in many different places. Especially since they don't have to be so trivial as subtract here, sum there. The calculation might get complex with taxes, bank commissions, currency conversions, etc. We should try to keep such business logic on the write model. Sometimes it's worth adding a little redundancy to our events. In our sample case, it could be adding an information about the current balance. They could look like this:


**DepositRecorded** {_Amount_: 50, _Balance_: 50}

**CashWithdrawnFromATM** {_Amount_: -50, _Balance_: 0}

**IncomingTransferRecorded** {_Amount_: 100, _Balance_: 100}

**CreditCardPaymentMade** {_Amount_: -20, _Balance_: 80}

It gives us several advantages:
- we maintain the business logic in the write model. Read models do not have to be aware of it.
- we have frozen information about the balance, even if the balance calculations (e.g. taxes) change. Thanks to that, we can avoid the need to version the calculation formulas.
- generating the reading model is more manageable, and more importantly, easier to deal with idempotency. If we have an ordering guarantee, applying the event multiple times will have the same effect. If we only have the transaction amount, we must have a dedicated mechanism to avoid charging the same transaction multiple times.

This not only apply to read models, but equally about any downstream consumers. Events can trigger other workflows as well (e.g. fraud detection, etc.). They don't have to be only to update the reading models. Events are facts. How they are interpreted depends on the subscribers.

It is a bit grey matter when to allow redundancy and where not. You have to analyse the pros and cons each time. We should avoid putting a derivative state in our events (e.g. balance) when possible. We should try to [keep them as concise and small as possible, but not smaller](/pl/events_should_be_as_small_as_possible/).

We can pragmatically add additional information or make transformations to help subscribers, but that should not be the basis of our considerations. It should be an optimisation that we have carefully crafted.

In an event-based approach, we don't have to think about everything at once. First, we should focus on how to preserve a business fact best, then how to use it. We can create new read models based on already existing events. As long as we register all the essential information, we will be able to use it later. If we follow these rules, we don't even have to design read models while working on the business logic. Primarily, by combining the read model with the event model, we lose the autonomy of these models.

One of the most significant benefits of using Event Sourcing is not losing data. We should focus on recording all information related to the business operations results. Read models or other modules should take it from there. 

**To get it right, you have to change your mindset of thinking "what is" to "what happened".**

**Read also other article in Anti-patterns in event modelling series:**
- [Property Sourcing](/en/property-sourcing/),
- [I'll just add one more field](/en/i_will_just_add_one_more_field/).

Cheers!

Oskar
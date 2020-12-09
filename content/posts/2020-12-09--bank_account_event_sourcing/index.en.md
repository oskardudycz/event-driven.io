---
title: Why a bank account is not the best example of Event Sourcing?
category: "Event Sourcing"
cover: 2020-12-09-cover.jpg
author: oskar dudycz
---

![cover](2020-12-09-cover.jpg)

While explaining the Event Sourcing, bank account balance calculation is a common starting point. **I claim that even though it sounds right, then it's not the best example to show at first.**

Term **"Event Sourcing"** directly means that **events are the source of truth**. We keep the system state as a series of consecutive events. That means that if you're modifying the state of your system, for each change you log (store) the event representing the result of the action. 

It's like when describing your day to someone: "You know, the bus was late for me, so I was late at the job. That's why I had to stay longer, and I was late for our meeting". After all, we rarely say "I'm late, why to go on about it". There must be an excuse. Similarly, it usually turns out that the business expects to build the system with the ability to tell the story of what has happened.

Getting back to the banking example. In such a case, we record all transactions for a given account, so inflows (e.g. salaries, payments, etc.) and expenses (e.g. card withdrawals, fees, etc.). Each of these transactions:

carries specific business information,
occurs within a particular time,
follows one another,
is immutable (we cannot undo a money transfer once it has been made).

Everything seems okay, why am I picking on it? I am not a saint myself. I also give such an example: https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Sample/BankAccounts.

Why am I saying then that this example is problematic? In my opinion, it's not a typical problem solved in Event Sourcing. Providing Bank Account as an example makes it easy to accuse it of performance problems. It's easy to generalise that the whole Event Sourcing is not efficient. 
Let's try to do a small calculation. Let's say we do three transactions a day, milk in the store, pipes in the kiosk, transfer from auntie. 3 times 365 = 1095. This number is the sum of the annual transactions. I have a bank account, which I set up at the age of 18. It is 17 years old now. 17 x 1095 = 18615, plus four days for leap years. What is this math for? 

In Event Sourcing, the current state of our model/entity is aggregated by applying events one by one. For a bank account, if we have earned 1000 EUR, we add it to the account balance, if we have withdrawn 257 EUR, we subtract it, and receive the final account balance of 743 EUR. Taking the example of my account, we would have to download 5840 events and then apply them one by one? Crazy! It can't be efficient, and it won't!

Typically, objects in our systems do not have so many events and do not live that long. Helpdesk ticket - 2 weeks, several changes (received, verified, triaged, closed). E-commerce orders, 2-3 days and a few changes (sent, handed over to a courier, dispatched, sent to another city, etc.). Usually downloading a few simple events (even 20) is not a big deal. Most applications don't have such high-performance needs.

**However, if performance is a critical factor**, then **you can use** some of the optimisation techniques as, e.g. **snapshots**. What is a snapshot? **It is the state of our model at a given time**, e.g.:

- The current state of the object - it can be stored, e.g. in a relational table, where each field of the is a separate column. The other option is to store it in the form of a key-value. The key is the entity identifier, and the value is, e.g. JSON. That's how Marten is doing - see more in https://martendb.io/documentation/events/projections/. All the document, key/value databases also apply here,
- The state at a given point in time - e.g. the account balance at the beginning of the month, we can then get, e.g. snapshot from the beginning of the month, then get all the events that happened later and apply them,
- The state after each transaction - then we get the history and all state changes of our model.
- The con of snapshot is that you need to maintain it and keep the same lifetime strategies as in the regular systems, e.g. migrations.

Another option is to send a "summary event", which will contain the state of the object for a given moment. What does it mean in practice? Even in the financial domain, data is kept with some cadence. Usually, such systems are interested in a specific period - e.g. billing period. Even financial data do not have to be kept forever - e.g. five years for invoices in Poland. Having that, we can send a "Finished Financial Year" event for the account. It will contain the current state and other needed information. After that, we're free to and archive old events (e.g. move to another database from where we can get the full history on demand). Thanks to this we have complete information and can still keep the advantages of Event Sourcing. 
Take a look at an excellent description of Mathias Verras Verras with the "Summary Event" pattern - http://verraes.net/2019/05/patterns-for-decoupling-distsys-summary-event/. 
I also encourage you to do the exercises from my "Built your own event store Self-paced kit" https://github.com/oskardudycz/EventSourcing.NetCore/tree/master/Workshop/01-EventStoreBasics.

To sum up. Bank Account as an example is sufficient for a basic introduction, but it can quickly derail discussion with going to early performance optimisations. You can present those two of the potential solutions, but it can make the Event Sourcing seem more complicated than it is. 

What could be a **better example**? It could be a tedious but well-known **Order** example or **Helpdesk ticket**. Another one could be the meetup of a programming group. These are things that are closer to the everyday problems solved in Event Sourcing. They do not differ at all from the typical programmer's topics. What makes Event Sourcing different from traditional programming is what Greg Young said:

_**"When you start modelling events, it forces you to think about the behaviour of the system. As opposed to thinking about the structure of the system."**_

Do you know better examples? Or maybe you know even worse ones? Do you agree or disagree? Feel free to comment - I'd like to know your perspective!

Oskar
---
title: Bring me problems, not solutions!
category: "Agile"
cover: 2021-01-06-cover.jpg
author: oskar dudycz
---

**_"Bring me solutions, not problems!"_** I've heard this sentence multiple times from Business and management. You've heard it too, haven't you?

We should shout back **_"Bring me problems, not solutions!"_**

![meme](2021-01-06-cover.jpg)

Imagine you're working on the HR system: holidays, contracts, that sort of thing. "Business" comes to you and says:

**_"Listen, let's make a web app where employees will be recording their working hours. We talked in the kitchen lately about those "Reacts" and "Angulars" of yours. We could use them to make it look good. Will you do it?"_**

So the planning begins: severe discussions about whether we should put the form here or a grid there. Fierce negotiations with the backend, whether we are doing a rest API or maybe GraphQL. Whether a contract should look like this or the other way discussed in a separate meeting.

After the fights, in the end, it turns out that we even managed to complete the project on time, even with the requirements in Jira (woohoo!). The system has only a few bugs. We needed multiple sprints, but the job is done!

If it is so beautiful, why is it so bad?

It turns out that system users are not happy to type in their working hours, manually, every day. Previously, they entered their hours into an Excel sheet and sent them to their supervisor once a week. The supervisor then mixed it into one large Excel file and sent it on to the HR department.

These unhappy users will nag you to add or correct something in the system you have cleverly designed to solve the problem presented to you. In such a situation, where an unhappy user meets a solution they do not like, there will eventually be a confrontation. Confrontations can be painful, but they can also be helpful; they can expose the real problem that needs to be solved, rather than the solution handed to you by someone else. 
**In this situation, it turned out that the user's ability to fill out their time sheets wasn't the actual problem to solve.**

It was the solution to the problem, as decided by someone else. The real problem was that the HR department needs to know how many days each person worked to verify the schedules and calculate the fees.. The perpetually busy Team leaders, buried with their other work, were late putting these Excel files together. They also treated it as a tedious duty and made a lot of copy/paste mistakes. The staff also wasted time verifying this data and prosecuting them later to correct the entries' errors.

**If we were to ask what the actual problem is, we might conclude that you may not need to create a new web application.** Maybe you don't need to make new APIs; perhaps it would be enough to:
- create a collective email account for sending and receiving the Excel spreadsheets,
- integrate these with the e-mail system, grab emails from that account, import attachments and parse them,
- if the Excel did not contain errors, the data will be saved to the HR system. After that, it will send the answer with confirmation to the employee,
- if the email was incorrect (e.g. it did not contain an attachment, it was impossible to parse it or the entries were wrong), the system will send an email with a request to correct it.

It might turn out to be much more plausible, faster to do and more convenient for each party.

We programmers usually have **two attitudes**:

1. _"Business won't be telling us how to write code"_: we are Programmers with a capital P, and we know everything best.
2. _Business knows how the system is supposed to work_: I won't ask for clarifications. I'll code what I was asked to.

Both attitudes can be considered irresponsible and dangerous.

As programmers, we know technology: that's why we're being paid. Therefore, "business" shouldn't come and tells us what framework to use, or how to create API endpoints. Of course, assuming that the application with our design:
- does what it should,
- is delivered on time,
- maintenance costs are roughly the same as an alternative solution,
- it does not increase project risks (e.g. higher development costs).

The technical decisions should be entirely ours. Of course, the consequences of our choices should also be ours.

However, we must remember that we are not business specialists, even if we are a well-paid profession. Let's make it clear: we are well-paid artisans, not artists. We are supposed to do our work to help the Business efficiently earn money. We are not specialists in the business processes in a given field.

But! 

We cannot assume that Business knows everything. If our business domain is HR and payroll, will the "Business" understand what the authorization administration panel should look like? Or will they know what options we have to integrate with external systems? Will they know what the login screen should look like? Or which form will be prettier?

Maybe they will, but most likely they will honestly not know it, because it is not the "core" business domain. Business people are specialists in, e.g., human resources and payroll. They will be probably guessing how other features should work.

**It is often the case that "Business" wants to help us solve a problem and automatically suggest a solution.** When we ask _"why should it be like that?"_ then we will often get the answer _"I don't know, I thought it would make it easier for you."_.

I recently had such a case, when my Product Owner wanted us to block the record's use for all users when some background operation is working on it.

We have to be proactive and ask to determine if we're getting a description of the actual problem or just the solution presented to us by someone else (a potential business solution). When we're trying to understand a business process, we do not question its validity. It is, de facto, our duty to help the Business solve the problem. By taking the requirements blindly, we do not help them at all: we can even make it worse!

I predict that the time when software companies and business companies were separate things will soon be gone. It is a relic of the past where IT systems duplicated what people were doing to make it faster. Now with growing SasS solutions, IT is Business. Therefore, close cooperation between Business and IT is no longer "nice to have",​​it is a "must-have".

Henry Ford once said:

**_"If I had asked people what they wanted, they would have said faster horses."_**

**I'll leave some homework for you. Consider whether the following cases are a problem or a solution?**

- licensing system in SASS systems
- user administration panel
- authentication and authorization
- unique invoice number
- development of a shipment handling system

Let me know what came out of it, and what are your thoughts!

Greetings!

Oskar
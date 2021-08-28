---
title: Anti-patterns in event modelling - Property Sourcing
category: "Event Sourcing"
cover: 2021-08-18-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-08-18-cover.png)

The first time I got down to work at Event Sourcing, I was very energized. Book knowledge almost fell out of me. However, when I sat down to programming, I was looking like [the dog from meme](https://miro.medium.com/max/1200/1*snTXFElFuQLSFDnvZKJ6IA.png).

This is usually the case when we realize that putting theory into practice is not as easy as it may seem.

When we learn a new pattern, we subconsciously try to translate our previous habits into it. It is a human way of getting familiar with the unknown. Looking for similarities isn't bad by itself. It allows us to move forward. Worse, when we stick to these clichés and kill our curiosity. Each pattern can become an anti-pattern when used in a context other than it was invented. When you hold a hammer in your hand, it is not difficult to see nails in everything.

When we start modelling our system with events, we can easily fall into the trap. We are used to looking at our functionalities from the perspective of the data model. When you hold a relational database in your hands, you will see tables everywhere. Because we have read that [events should be as small as possible](/pl/events_should_be_as_small_as_possible/) the first idea for an event can be, e.g. *FirstNameChanged*. Another *LastNameChanged*, etc. We also see the use immediately, that is, a straight history of changes to our entity. Those events may look as: 

```csharp
public class FirstNameChanged
{
    public string FirstName { get; }
    public DateTime ChangedAt { get; }

    public FirstNameChanged(string firstName, DateTime changedAt)
    {
        FirstName = firstName;
        ChangedAt = changedAt;
    }
}

public class LastNameChanged
{
    public string LastName{ get; }
    public DateTime ChangedAt { get; }

    public LastNameChanged(string lastName, DateTime changedAt)
    {
        LastName = lastName;
        ChangedAt = changedAt;
    }
}
```

We may also come up with brilliant the idea of having both previous and new ones. Then we could directly create a history of changes to an audit trail in the UI.

```csharp
public class FirstNameChanged
{
    public string PreviousFirstName { get; }
    public string NewFirstName { get; }
    public DateTime ChangedAt { get; }

    public FirstNameChanged(string previousFirstName,  string newFirstName, DateTime changedAt)
    {
        PreviousFirstName = previousFirstName;
        NewFirstName = newFirstName;
        ChangedAt = changedAt;
    }
}

public class LastNameChanged
{
    public string PreviousLastName { get; }
    public string NewLastName { get; }
    public DateTime ChangedAt { get; }

    public LastNameChanged(string previousLastName,  string newLastName, DateTime changedAt)
    {
        PreviousLastName = previousLastName;
        NewLastName = newLastName;
        ChangedAt = changedAt;
    }
}
```
Even by looking at those events, we can sniff the unpleasant smell. It's easily visible that this approach will not be maintainable. When our model grows, we'll get many tiny, copy/pasted, meaningless events.

The critical aspect of event modelling is to have them close to the business. Events should correspond directly to the result of business operations in the system. To achieve this, the event should be derived from a specific request/command processing. Based on the values ​​sent in the command, we know what data was transferred. Based on them and the business logic, we can fill in the event data.

The fact that the name has changed is not usually a factor affecting the business logic. Usually, we just accept the change, fill in the data, and that's it. Therefore, we can pass this information in an event and use it in a projection to build a read model. However, even if we have a Jiralike form to edit a specific field, it is worth grouping such changes according to characteristics.

We can, among others, have *PersonalDataUpdated* event triggered by updating first name, last name, etc. These fields may have the *Option*  type to check if they have been changed. An example implementation of such a type in C# might look like this:

```csharp
public struct Option <T>
{
    public static Option <T> None => default;
    public static Option <T> Some (T value) => new Option <T> (value);

    readonly bool isSome;
    readonly T value;

    Option (T value)
    {
        this.value = value;
        isSome = this.value is {};
    }

    public bool IsSome (out T value)
    {
        value = this.value;
        return isSome;
    }
}
```

then the usage as follows:

```csharp
public class PersonalDataUpdated
{
    public Option<string> FirstName { get; }
    public Option<string> LastName { get; }
    public DateTime ChangedAt { get; }

    public PersonalDataUpdated(string firstName,  string lastName, DateTime changedAt)
    {
        FirstName = previousLastName;
        LastName = newLastName;
        ChangedAt = changedAt;
    }
}

var onlyLastNameUpdated = 
    new PersonalDataUpdated(
        Option<string>.None, 
        Option<string>.Some("Smith"),
        DateTime.UtcNow
    );
```

With this, we do not have hundreds of minor events but business-significant events. They still contain details of what has changed. We can create the read models based on them. Suppose we want to build an audit trail with information about the previous and the current value. In that case, we can retrieve the last state of the model in the projection, compare it with changes in events and save the difference as a new line.

**Publishing events like _LastNameChanged_ is called _Property Sourcing_.** This is an anti-pattern. The events themselves tell us nothing about the operation that performed them. They have no business value. Due to the number of event types we have to generate, it is also challenging to manage them. It's also not convenient for other modules to consume them.

Of course, sometimes it makes sense to create field change events. For example, *EmailUpdated*, *MaritialStatusChanged*, *AccountBalanceUpdated*, *InvoiceNumberSet*. These are significant business fields and can trigger other workflows.

The basis of good event modelling is in cooperation with business. Discussion and understanding what we want to achieve is the foundation. Of course, sometimes, it is worth cutting the design discussions and getting coding. When we see them in action, it's more accessible to find the weak spots. Still, we should not try to save the four hours of discussion time by two weeks of coding.

It's also important to not treat our initial event model as set in stone. We should embrace that our model will change. We'll understand our domain better. The business will also change as time goes. We should continue to drill down and make our event model closer to the real world.

Cheers!

Oskar

p.s. If our events are only about the fields updates. If they are not related to the specific business operations. In that case, we should evaluate if simple CRUD wouldn't be better for us (read more on that in ["When not to use Event Sourcing?"](/pl/when_not_to_use_event_sourcing/)).
---
title: How to create projections of events for nested object structures? 
category: "Event Sourcing"
cover: 2020-04-07-cover.png
author: oskar dudycz
---

![cover](2020-04-07-cover.png)

Did you ever feel so encouraged so much that you immediately thought, "This is great, let's do it!". I'm sure you did. I'm also sure that few times you got backslash immediately after facing the more advanced scenario. I felt like that with Event Sourcing. I quickly realised that's the way to go, but I found that I don't know what I'm doing when I started coding. 

Events projections may get tricky. Let's discuss today one of the non-trivial cases. As a reminder, projection is the interpretation of a certain set of events. It is usually used to build a read model.  For example, cinema ticket reservation may include the following events _Tentative Reservation Created_, _Reservation Seat Changed_, _Reserved Confirmed_. By applying them one by one, we know if the reservation was confirmed and what was the final seat number. We can save this result as an entry in the database (e.g. relational). We can also produce an event and save it to a separate stream. Then the last event in this stream represents the current read state of the model.

It does not seem particularly difficult, and it does not have to be. However, when we go deeper into that, it may turn out that it is not always that simple. **What if we have relationships between different projections results?** For example, if we have a School with Students and their parents? How to create a projection in which we have the school and all the children with their parents' names? How to handle nested relations?

```csharp
class SchoolDashboard
{
    string SchoolId;
    string Name;
    StudentWithParents[] Students;
}

class StudentWithParents
{
    string Id;
    string Name;
    Parent Mother;
    Parent Father;
}

class Parent
{
    string Id;
    string Name;
}
```

In my opinion, there are three main options for approaching this topic. Plus grey matter:

1. **Publish a bigger event** (_"fat event"_), which has all the data needed to build a read model by projection. For example, _StudentAddedToSchool_ with _StudentId_, _SchoolId_, but also whole student data together with nested parent data.
    ```csharp
    class StudentAddedToSchool
    {
        string SchoolId;
        StudentWithParents Student;
    }

    class SchoolDashboardProjection : Projection<SchoolDashboard>
    {
        SchoolDashboardProjection()
        {
            // Select dashboard view with Id equal to SchoolId from event
            Project(event => event.SchoolId, Handle);
        }

        void Handle(StudentAddedToSchool event, SchoolDashboard view)
        {
            view.Students.Add(event.Student);
        }
    }

    // query by name
    var name = "John Smith";
    var students = database.Students.Where(s => s.Name == name).ToList();
    ```
2. **Publish the event with only identifiers of dependent objects.** E.g. _StudentAddedDoSchool_ with from  _StudentId_, _SchoolId_, but also the student's data with the parents' identifiers. In this case, if we want to have a denormalised reading model, we can load dependent data (e.g. parents' names) at the moment of applying the projection.
    ```csharp
    class StudentWithParentIds
    {
        string Id;
        string Name;
        string MotherId;
        string FatherId;
    }

    class StudentAddedToSchool
    {
        string SchoolId;
        StudentWithParents Student;
    }

    class SchoolDashboardProjection : Projection<SchoolDashboard>
    {
        Database database;

        SchoolDashboardProjection(Database database)
        {
            this.database = database;
            // Select dashboard view with Id equal to SchoolId from event
            Project(event => event.SchoolId, Handle);
        }

        void Handle(StudentAddedToSchool event, SchoolDashboard view)
        {
            var mother = database.Load<Parent>(event.Student.MotherId);
            var father = database.Load<Parent>(event.Student.FatherId);

            var student = new StudentWithParents
            {
                Id = event.Student.Id;
                Name = event.Student.Name;
                Mother = mother;
                Father = father;
            }

            view.Students.Add(student);
        }
    }

    // query by name
    var name = "John Smith";
    var students = database.Students.Where(s => s.Name == name).ToList();
    ```
3. **Publish the event as in point 2, but do not read the dependent data.** Then we keep the normalised data. So classically like in relational databases. Thus we'll join data (or "do lookup" if we are using the document database) while reading.
    ```csharp
    class StudentWithParentIds
    {
        string Id;
        string Name;
        string MotherId;
        string FatherId;
    }

    class StudentAddedToSchool
    {
        string SchoolId;
        StudentWithParents Student;
    }

    class SchoolDashboard
    {
        string SchoolId;
        string Name;
        StudentWithParentIds[] Students;
    }
    
    class SchoolDashboardProjection : Projection<SchoolDashboard>
    {
        SchoolDashboardProjection()
        {
            // Select dashboard view with Id equal to SchoolId from event
            Project(event => event.SchoolId, Handle);
        }

        void Handle(StudentAddedToSchool event, SchoolDashboard view)
        {
            view.Students.Add(event.Student);
        }
    }

    // query by name
    var name = "John Smith";
    // two joins needed
    var students = database
        .Join(database.Parents,
            student => student.Mother.Id,
            mother => mother.Id,
            (student, mother) => { 
                student.Mother = mother;
                return student;
            })
        .Join(database.Parents,
            student => student.Father.Id,
            father => father.Id,
            (student, father) => { 
                student.Father = father;
                return student;
            })
        .ToList();
    ```

Each of these options has pros and cons:

1. The first option is the fastest in processing because all data is already available in events. However, the redundancy of data in events makes them _"heavier"_ to store and transport. Additionally, such events are more challenging to maintain since their schema is more likely to change. The more information they have, the greater the chance that their structure will change.
2. The second scenario makes the events smaller, but the projection itself will take longer due to the need to load additional data. Asynchronous processing (and thus eventual consistency) should be considered here. Like the first solution, this solution's advantage is that the end-user read will be fast because the data is denormalised. However, there is also a greater chance of hitting situations when, for example, the parent's surname changes, and we will have to update multiple records in the _ParentNameChanged_ event. We always have to analyse the structure of our data. It will not be costly for school and parents because one parent rarely has more than 1-3 children in one school. However, in a scenario where, e.g. tax changes and you need to recalculate a lot of transactions, this may be meaningful.
3. The third solution is the fastest in terms of processing and data transfer but the slowest in reading. Both the events and the projections themselves won't have redundant data. For this reason, we will have to correlate data when reading. It is not always a big problem, but database joins always have a negative performance impact. However, if we have good data distribution and index it well, this should also be a good enough solution for many scenarios.


Between these cases, there is also grey matter. Unfortunately, we won't escape the classic *"it depends"* answer. Each case is different, and if we want a good, efficient yet sustainable solution, we need to consider the final usage scenarios. The above points are heuristics and advice that I hope can help you to design your solution.

Cheers!

Oskar

p.s. I encourage you to read my blog post ["How to (not) do event versioning"](/en/how_to_do_event_versioning/), which I think is an excellent complement to this one you just read.
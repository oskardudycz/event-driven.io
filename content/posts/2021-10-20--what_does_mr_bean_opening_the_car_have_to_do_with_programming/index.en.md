---
title: What does Mr Bean opening the car have to do with programming?
category: "Coding Life"
cover: 2021-10-20-cover.png
author: oskar dudycz
---

Before reading the article, please watch the video below:

[![Mr Bean](2021-10-20-play.png)](https://www.youtube.com/watch?v=GOd7oj1AT00)

Mr Bean wants to add a new business feature to the project. First, the entity class, then the repository (and registers its generic version in Dependency Injection container), then the application service, request validator, mapping from request classes to entities. He is about to run it, but he reminds himself that it won't work because he forgot to add a new controller. Time goes quickly, the controller is here, he's firing it up and boom! It does not work because he forgot to register something else in the IoC container. Once that is done, only unit tests are left for each of the added classes, some integration tests and finally, endpoint adding a dictionary entity with two fields works.

Boy, that escalated quickly!

The more advanced code structures were used, the more Mr Bean can feel fulfilled. Generic factories, reflection-based aspect programming, fancy providers integrated with generators, that's how serious enterprise architecture looks like.

I used to think so once. Once, during the team building, my colleague came to me and said, _"Oskar, you know what, it took me about three months to understand our architecture. In the beginning I was totally lost, but now, once I understood it, I think it's great!"_. At first, I felt proud that I had designed such sophisticated architecture. I thought that has to be good if it requires a lot of time for understanding, but then it pays off. Then I realised that's not complex. It's just complicated. There was a lot of magical, generic code that could do anything, even brew coffee. Absolute champion was a class with 14 generic parameters to fill in. Well, we were making a serious business application after all!

Is complex or complicated really that cool? Is this whole ceremony really needed? I used to think that. Now I think the best code is the one that when we see, we'll say, _"Hell, how easy it is, why didn't I come up with that"_. Contrary to appearance, such code requires a lot of work. Designing upfront, a few iterations and cutting every redundant abstraction. Sometimes these are small things, such as adequately placed IFs. Sometimes these are slightly larger things, such as learning about new patterns, paradigms - e.g. functional programming, architectural patterns such as Event Sourcing, CQRS. Sometimes sideways, jumping on the neighbour's lawn in a different language or technology gives us new insights and ideas.

I am not a dogmatist. I come from the .NET world - this is my lair, which I orbit, but I like to learn other technologies. There are times where I'm writing more in other than C# languages,  e.g. in the last project, I coded much more in TypeScript and Node.JS. Working with different languages ​​and programming environments allows you to look at your code from a different angle. For example, [I used to hate JS](/en/partial_typescript). I was calling it _"shitty language"_. Now, I think I just didn't understand it and couldn't write in it well at that time. When I changed my thinking, it made a lot of sense, and its dynamics, simplicity, and functional flair taught me a lot.

So, for example, when I come back to Visual Studio and .NET, I think, _"why is it so heavy?!"_. That's why I'm happy about the improvements in C#9 (check also [Notes about C# records and Nullable Reference Types](/en/notes_about_csharp_records_and_nullable_reference_types)), I'm glad that the main method is not required, or the ability to do endpoints without a controller. The fewer ceremonies, the better.

I also often come across the statement, _"a programmer should know this and remember it"_. The more a programmer has to know and remember, the more likely they will forget and make stupid mistakes. In my opinion, such necessary routine repetition causes the programmer to stop thinking and start copying and pasting, which is the best way to get stupid bugs that are hard to detect.

Therefore, homework for you:
- think over how many classes and layers the request goes through until it is saved in the database,
- how many generic classes do you have, especially with a few parameters, and what problems do you have with it,
- do you know why composition is better than inheritance?

Consider whether it must be so and whether these structures do not resemble, by chance, Mr Bean's car opening. Feel free to send your conclusions in the comments.

Cheers!

Oskar

p.s. if you like that article, check also [Generic does not mean Simple](/en/generic_does_not_mean_simple)!
---
title: What does a construction failure have to do with our authorities?
category: "Coding Life"
cover: 2021-10-13-cover.png
author: oskar dudycz
---

![cover](2021-10-13-cover.png)

Through my window, I see the result of good plans but poor execution. Opposite my flat, there is a partially completed construction place. Buildings were supposed to be eye-catching Mediterranean style apartments.  Delivery date? Two years ago. Actual? More and more unknown.

Some time ago, I heard that using Event Sourcing makes creating Event-Driven Architecture easier. The arguments were correct, that if we're already publishing events to trigger business workflows, then at some point, we may want to also store events to not lose information. Agreed. However, I also heard that keeping the state as events will simplify things. We'll have a source of truth with a record of the system behaviour. This will allow, e.g. to confront the results of the operations with the recorded state. I'd agree with that, with one distinction. It's easier as long as you already know Event Sourcing.

Many people in the DDD community claim that the essential is to properly break down the system into autonomous parts called bounded contexts. . Once we have it, the rest is secondary and will sort itself out. For sure.

Many seasoned programmers speak similarly about new technologies. They claim that they can translate past experience into new technologies. That's true that by analogy, they can catch the big picture quicker. But isn't it a bold assumption to say that Win.Forms specialist will learn Angular quickly?

The end result may differ a lot from the initial ideas. I saw the plan of those buildings next to me. Now I can see the effects of the execution. Or actually, the lack.

I believe that we should carefully acknowledge not only the point of view of our authorities but also their seating point. If we want to find out how to form a wall, do we ask an architect or a foreman? An architect may know the theory, but the practice is what we're looking for. On the other hand, if you want to know where to put the wall, you prefer the architect to do measurements. At least if you don't want to have the roof falling to your head.

After I had torn a ligament in my knee, I went to two qualified orthopedists. One said I should have surgery and do a reconstruction. The second stated that there is no need for that; rehabilitation should be enough. Guess which one had a specialization in surgery and which in rehabilitation?

People usually give us advice from the point where they're currently standing. They are entitled to a biased view. An architect who rarely does programming will tend to downplay the value of implementation and tactical patterns. Midlevel developers will focus on technicalities instead of the global system impact. The team manager or consultant will emphasize the importance of soft skills (or esoteric techniques known only to them). 

The truth is that we need all of them. The excellent plan will fall on the bad execution. The best execution for the wrong case will be just a waste of time. We should carefully evaluate the advice considering what we need and what an expert can give us. 

Therefore, when we're reading an article, watching a talk, let's also pay attention to the place where the person is standing. The perspective from there may be much different from where we are right now. That can be good, as it may push us in the right direction. But it may also be misleading, as we accidentally take biases of this person without understanding the tradeoffs. Personally, I prefer to follow not only people from pedestal but also those that are closer to my position. A bit further in the journey, but not too far. That helps me to calibrate my view as those people are more relative to my daily struggles.

Polish historical leader [Józef Piłsudzki](https://en.wikipedia.org/wiki/J%C3%B3zef_Pi%C5%82sudski) reportedly used to say: _"Right is like an ass, everyone has its own"_. 

Cheers!

Oskar
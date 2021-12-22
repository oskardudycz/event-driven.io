---
title: Architect Manifesto
category: "Architecture"
cover: 2020-11-29-cover.png
author: oskar dudycz
---

![cover](2020-11-29-cover.png)

_"Architects are not needed anymore. Those days are gone!"_

_"We're agile - we're not doing waterfall, so we're not designing upfront."_

_"We have autonomous teams that drive their design."_

_"We have DevOps team."_

Have you heard or made such statements? Over the years we have create an enormous set of architect subtypes - _Software Architect_, _Enterprise Architect_, _Solution Architect_, _Chief Architect_, _DevOps Architect_, _Junior Architect_. I'm sure, somewhere on the web, you will find one of those bullshit title generators for architect titles. The title architect has been so abused recently that I find it difficult to refer to myself as an architect.

For many of us, architects are just a bunch of middle-aged white dudes sitting in their Ivory Tower. Like a Mage Guild - throwing around ideas that are out of context with the work being done. Detached from the real work at hand and the real development struggles.

In the perfect world with the perfect teams - the "A" Teams - we may be able to adhere to the principals of the microservice and DevOps movements in that our teams are autonomous, making their own decisions. We can resigned from having architects.

Our world is rarely perfect, usually [it's a mad world](https://www.youtube.com/watch?v=4N3N1MlvVc4). Teams are struggling with Conway's Law . Knowledge sharing rarely happens. It's challenging to maintain consistency. Designs go off into tangents. Teams become islands onto themselves. DevOps quite often appears to be just rebranded ops team or group of people holding Continuous Integration tools 

Some of us, on up to and including the enterprise have found that breaking our development out into distinct efforts working autonomously is not always the best approach. Uber evolved from a "rewrite everything" mode to one based on ["Domain-Oriented Microservice Architecture"](https://eng.uber.com/microservice-architecture/). The work of Matthew Skelton and Manuel Pais provided us with the concept of [Team Topologies](https://teamtopologies.com) to [reduce the cognitive load](https://www.youtube.com/watch?v=haejb5rzKsM) and impact of Conway's Law. We are discovering that autonomy may not be as much of a benefit as we once thought.

Having said all of that, I still believe that having an architect makes sense, even within the DevOps and microservice development cultures. We might not call them architects, but they are architects none the less. From my perspective, my vision, depending on the project size and diverse needs within the project it should be a group of people rather than dependence on a single individual. A group has the ability to address many associated issues and domains without creating a bottleneck within the project. Potentially, truly allowing the development teams to work with greater autonomy without impacting the project adversely. Preventing or at a minimum reducing the impact of Conway's law. 

Some time ago, I decided to write down the vision I foresaw for such a team of architects. I was basing this upon a project I was involved in that held many of the characteristics for which I spoke of above. Its size and scope seem to justify the need. I want to share my thoughts with you. Although, they may seem a tad bit idealistic, maybe even naïve, in my opinion they are a worthwhile endeavor to undertake, possibly even something that we should aim for. I called this writing the "Architect Manifesto"

---

1. **Architecture team should be either a group of people that are responsible for the shape of the system architecture or an advisory board with direct responsibility with the success of the project.** In my opinion, the first option is the preferred one, as an advisory board could lead to greater project confusion and objective blur - e.g., whether the teams must or should apply the recommendation of the advisory board.

2. **Architecture team should provide clear guidance and documentation** (written form, diagrams etc.) of the overall architecture vision and the assumptions that were taken into account while choosing the exact solution. Those decisions and vision should be transparent and openly available for all developers. Architecture team should review with the developers if the way of presenting that information is clear enough (eg. which database to chose, why and when using the event queue, how to write the acceptance tests etc.)

3. **Architecture team should have strong authority and mandate from the management.** As company can have other strong skilled and experienced developers then it should be clearly expressed by the management and explained to developers what are the Architecture Team responsibilities. The interactions and rules should be clearly defined (so eg. said that dev teams are obliged to contact the architect team while doing the new design). That will reduce the chance for confusion and disagreements.

4. **Architecture team shouldn't block the teams' creativity and not be a bottleneck in the design process.** Teams should be responsible for the design of the features, but they should consult in the early phases of the design architecture team to earlier catch some obvious flaws in the designs. If the design review is prepared then sometimes it's too late to reject the design as a lot of time was spent on that and it makes the confusion and put people into defensive mode. I think that having clear recommendation and best practices will help teams to provide their own design that is properly put into the architecture boundaries. If the designed feature is more complex then the architect may join the team to work with the team closely.

5. **Architecture team should have an official time to work on the architecture.** The design needs to be made in focus and with patience. I think that at least one member of the architecture team should be made the head architect that's fully dedicated to the work on architecture. Rest may work part-time depending on the needs but they should have the set number of days that they can do to work on the architecture (they may be included into the regular feature work if the design is made for the development team). Work of all architecture team members should be planned and scheduled and transparent for the development teams. Architecture team should have also some dedicated time for the ongoing questions from the teams or management. It should be probably more than 1 day per week. Especially right now the main focus should be on reviewing the current state of the design and prioritize needed changes.

6. **Architecture team should work closely with management, PMs, POs to understand the product priorities** (and potentially be able to help to shape them). Architecture is not created in the vacuum, without the context it's not possible to create good design. Architecture needs also thinking upfront, so without the knowledge of what will come next, it's not possible to provide durable architecture.

7. **Architecture team should proactively work with the developers to understand their pain points, explain and present the architecture decisions** (eg. through the meetups). They should also actively ask for constructive criticism from the developers.

8. **Architecture team should be responsible for continuously reviewing the application of the designed patterns.** They should review designs, verify the PRs and make random checks of the codebase (eg. to catch that there are multiple implementations of the Graph API code). Architecture team should also verify that features are properly documented (eg. common libraries, samples, features in the code).

9. **Architecture team should not assume that once designed architecture will be always up to date.** Architecture team should reevaluate if the design assumptions are still applicable. They should make sure that architecture is evolving together with the business requirements.

10. **Architecture team should also work on the business features** (at least once per some period of time). Architects that are not doing any regular work on designed by them architecture tend to not understand the struggles of the development team and not catch the pain points.

11. **Architecture team should make sure (together with DevOps team) that continuous integration and delivery process are fluent** and it's helping to effectively deliver the new features (so if it's reliable, fast enough, secure, etc.). They should also work with the System Teams to understand the production systems configurations to be able to make recommendations and make sure that investigation of the production bugs is effective.


---


Thoughts?

Oskar

p.s. if you liked this article, check also ["How using events helps in a teams' autonomy"](/pl/how_using_events_help_in_teams_autonomy/).
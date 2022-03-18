---
title: Architect Manifesto
category: "Architecture"
cover: 2020-11-29-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
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

2. **Architecture team should provide clear guidance and documentation** (written form, diagrams etc.) into the overall architecture vision and the assumptions that influenced the decisions made in finalizing said solution. The architectural solution and all the key decisions concerning it should be transparent and openly available for all developers. The architecture team should review with the developers the architectural solution so as to ensure clarity in understanding  (eg. which database is to be used, why and when to use an event queue, unit test and how to write the acceptance tests etc.)

3. **Architecture team should have strong authority and mandate from the management.** As company can have other strong skilled and experienced developers then it should be clearly expressed by the management and explained to developers what are the Architecture Team responsibilities. The interactions and rules should be clearly defined (so eg. said that dev teams are obliged to contact the architect team while doing the new design). That will reduce the chance for confusion and disagreements.

4. **Architecture team shouldn't block the teams' creativity and not be a bottleneck in the design process.** The development teams should be responsible for the design of the features. However,  they should consult in the early phases of the design with the architecture team to ensure compliance with architecture and catch early any obvious flaws in the designs. If the development team puts off the architecture team's design review until the final feature design then sometimes it may be too late to reject the design as development team put already too much effort into it. It can cause confusion in what is to be the design of the feature and put people on the defensive. An early review as the feature is being designed can lead to an over all clearer picture of the features intent in the overall architecture. I think that having clear recommendations and an organizations defined best practices will help the development teams to provide a feature design that is properly mitered into the architecture boundaries. If the feature to be designed is exorbitantly complex then an architect may join the development team as a member of the team, not taking a leadership role, in their design efforts to provide a hands-on working relationship.

5. **Architecture team should have an official time to work on the architecture.** The design needs to be constructed as a focused effort and done with patience. I think that a head/lead architect should be assigned to the architectural design work and be fully-time, dedicated contributor. The rest of the architectural team assigned to the design can be part-time, defined as to the needs of the effort,  with a set commitment of time to do the work. This time allotment should include direct work with the development teams on the assigned feature work as a advisor to ensure the transfer from architectural plan to actual feature development. The work of all architecture team members should be transparent for all the development teams. The architecture team should be allocated some dedicated time, at least one day a week, for consultation for the ongoing questions that arise from the development teams or management. The architecture team should participate, as advisors, in the planning, scheduling and resource allocations of each of the features to be developed. They should be should be reviewing the current state of the design and prioritize needed changes.

6. **Architecture team should work closely with management, PMs, POs to understand the product priorities** (and potentially help in the shaping of them). An architecture, or a working one at minimum, cannot be created in the vacuum, without context from which to design it is not practical to build quality software. Architecture, in order to be applicable, needs to be forward thinking, without the knowledge of what is to come it is not feasible to furnish/supply durable architecture.

7. **Architecture team should proactively work with the developers to understand their pain points, explain and present the architecture decisions** (eg. through the meetups). They should also actively ask for constructive criticism from the developers.

8. **Architecture team should be responsible for continuously reviewing the application of the designed patterns.** In their role as architects and development team advisors the architecture team should review designs, verify the PRs, ensure unit testing is implemented and complete and make random checks of the codebase (eg. to catch that there are NOT multiple implementations of the Graph API code). The architecture team should also verify that features are properly documented (eg. common libraries, samples, features in the code). In this review capacity the architect responsible for a particular feature implementation along with the architecture lead should work with the development team lead(s) to discuss variants from the architecture and code base duplicity and/or potential misdirection. The architecture team should NOT play the role of code police and be a deterrent to software development

9.  **Architecture team should not assume that once designed architecture will be always up to date.** Architecture team should reevaluate if the design assumptions are still applicable. They should make sure that architecture is evolving together with the business requirements.

10. **Architecture team should also work on the business features** (at least once per some period of time). Architects that are not doing any regular work on designed by them architecture tend to not understand the struggles of the development team and not catch the pain points.

11. **Architecture team should make sure (together with DevOps team) that continuous integration and delivery process are fluent** and it's helping to effectively deliver the new features (so if it's reliable, fast enough, secure, etc.). They should also work with the System Teams to understand the production systems configurations to be able to make recommendations and make sure that investigation of the production bugs is effective.

---


Thoughts?

Oskar

p.s. if you liked this article, check also ["How using events helps in a teams' autonomy"](/pl/how_using_events_help_in_teams_autonomy/).
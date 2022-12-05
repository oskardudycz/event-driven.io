---
title: Should you generate the client code from the API?
category: "Coding Life"
cover: 2022-06-29-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-06-29-cover.png)

I'm often told that dull, repetitive tasks should be automated. However, there are times when it is better not to do this. I regularly see that people want to generate client code from API. Especially typed ones, for instance, in TypeScript. When they ask me, _"Is it worth it?"_ then, I often reply that I did it twice: the first one and the last one.

There are many ideas that we find tempting at first. Later on, we regret that we have started to implement them. A lot of our decisions are made when we're dumbest. We don't know the business domain and nitty-gritty details of our technologies. Because of that, we tend to ignore the complexity of the problem. Unfortunately, later on, it doesn't get better. Once we have done it, we instantly conclude that we will not make the same mistakes twice.

What kills us most is the accidental complexity. It's the one that we didn't foresee. Usually related to some critical detail that's blocking us. It's a classic example of the [Pareto principle](https://en.wikipedia.org/wiki/Pareto_principle): we'll do 80% of our work, spending 20% of the time. Then the remaining 20% will take us 80% of the time.

Before I move on to the issues with client code generation from the API, let me discuss the potential benefits:
1. **Single source of truth.** We change the API definition in one place, which is then propagated to client applications.
2. **Less copy/paste.** Since we will generate the code automatically, we will no longer have to copy and paste it everywhere. We can close it in a package (e.g. NPM) and update it when the API changes.
3. **We get rid of responsibility.** This is especially true for backend developers. Lots of them believe that exposing an endpoint ends their work. They consider generating a client code as a bonus for which they should get a medal from the frontend team. New endpoint is exposed, deployed, TypeScript client code packaged, job done. Now all is left for the frontend team.

If it is so beautiful, why is it so bad?

1. **It turns out that there is no single source of truth.** We realise that we have different API versions between dev, test, and production environments. The matter becomes even more complicated if we add parallel work. We rarely can always create API at first and then the work on the frontend. Usually, the works go in parallel. When we have part of the API from the feature branch and part of the main one, versioning becomes more and more difficult. How to version pre-release packages? How to know which one we should use? Should we use the package _1.0.0-beta + exp.sha.5114f85_ or _1.0.0-beta + exp.sha.ae27z32_? If we add a microservices environment where each module can have its API, the brain starts spinning around.
2. **The number of conflicts and typing fine-tuning becomes overwhelming.** It's splendid that the types have been generated, and we can easier call API. However, we'll quickly start to get compilation errors after bumping the generated client package. That can be a benefit, as we immediately see what's broken. Yet, too often, we get bonus updates from other colleagues changing the API. If a client is generated from the unified API Gateway, we may get bonus updates from other colleagues changing the API. In addition to the new field we wanted to add, we got a lot of changes from another module in the client package. The code doesn't compile, we don't know how to fix it, and another team doesn't have time to do it yet. Then the first to update the client package becomes the lucky one. That's not all. Updating the API behaviour is not only about modifying the contract. We usually do that together with the business logic changes. Those are even more challenging to track and fix. Especially if communication between teams doesn't work well. It can quickly become a hot potato problem.
3. **We can end up with a distributed monolith.** A common practice in a distributed system is setting up a unified API Gateway. This allows client applications to use a unified interface for all APIs. Underneath, the call may be routed to a specific service. If we generate a standardised customer package from such an API, we will have the problems described that can escalate into unexpected directions. When we are overwhelmed by the magnitude of errors and unable to resolve constant conflicts after implementing the API, crazy ideas can come to mind. Although the backend is, in theory, ready for continuous delivery of changes, we start to panic mode. Suddenly, someone will shout: _"let's introduce the release schedule!"_ or _"let's make code freeze!"_. We freeze implementations, set up the release train, etc. Of course, that won't help but create even more issues. We solve the problem, not the root cause of it. We end up with microservices inside but a monolith as a whole. Our unified API and client generation will be the lowest common denominator pushing us into this dark place.
4. **We still don't have the guarantee that we are using the proper contract.** If we have generated a new package, that doesn't mean it is already used on the frontend. Even if it's used, it doesn't mean all endpoints are used and updated. There will never be a situation where the API will be unified with the client immediately. Even if we do über automation, which will automatically bump packages after API release, send PR, or event merge if tests pass, it will still be delayed. We never know if we have the current code until we bump the package. What's more, we can't be sure even if we do it. In the meantime, another one might have been published. There could also be an error in publishing the client package, and even though we have API changed, the package was not released.
5. **Writing your own generator is fighting windmills.** It will never be a high priority in maintenance. The use of someone else's generator is, in turn, a fight against someone's ideas and mismatches with our problem.

When we use the generated code, we tend to subconsciously think the contract is valid. Manually changing contracts will not solve the problem magically. However, it already positions us into thinking that something may not be up-to-date.

When generating client code make sense?

1. **When we are not doing breaking changes**. I wrote about that in [Let's take care of ourselves! Thoughts on compatibility](/pl/lets_take_care_of_ourselves_thoughts_about_comptibility/). The basic principle that should guide us is [Primum non nocere](https://en.wikipedia.org/wiki/Primum_non_nocere). When can you do breaking change? Never. 
2. **If we have a stable API or connect to an external API.** _My API is stable_ can be one of the famous last words, yet sometimes it's stable enough to make client code generation manageable. External APIs always put us into downstream relations, so we must adapt and assume that we have to keep our clients up to date.
3. **When we talk to each other.** Nothing can replace a decent discussion about a contract's definition. No code generation can replace the lack of design when teams don't cooperate. As programmers, we must remember that making a functionality ends when the client starts using it. It does not end when we merge our code. It's best to set a contract before starting development. Then many things are more manageable. Take a look at my article [Sociological aspects of Microservices](/pl/sociological_aspects_of_microservices/). Implementing automated contract testing to catch accidental breaking changes is also substantial.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

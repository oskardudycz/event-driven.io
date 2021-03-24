---
title: How to successfully do documentation without a maintenance burden?
category: "Documentation"
cover: 2021-03-24-cover.png
author: oskar dudycz
---

![cover](2021-03-24-cover.png)

Developers like to complain about the lack of documentation. They complain even more when they have to write it. No programmer wants to do this - neither do I! Rarely, projects manage to keep the documentation up to date. It's rarely a high priority comparing to other tasks. Quite often, it's left for "later on" that never comes. Even though it might be tiring, I love the documentation. There is nothing better than well-kept documentation when you join a project. Moreover, there is nothing better than descriptive documentation when you return to an old topic you didn't touch for months.

I'll share some ideas that can help in keeping your documentation up to date:

1. **Keep your documentation in the repository:** - no Confluence, no Sharepoint, no network share! What's more, keep things simple, so no Word documents etc. The most straightforward approach is to user Markdown (_.md_) files. It allows text formatting in a simplified way that should be good enough for docs. Tools like GitHub and GitLab can show you a formatted view. They also allow editing and co-authoring it through the user interface. Additionally, contrary to Word (and other binary formats), it can be easily versioned and diffed. Many free tools allow generating static HTML sites that can be hosted even on the simplest web server. If you use Github, you also get free hosting for free with GitHub pages. You can also use [Netlify](https://www.netlify.com/), an excellent free static HTML hosting service. We're using it in Event Store and Marten. I'm also using it for my personal blog. In Event Store, we're using [VuePress](https://vuepress.vuejs.org/), in Marten,  [Storyteller](https://storyteller.github.io/documentation/docs/). Both tools allow allows us to dynamically attach code snippets directly from source code. For the blog you're reading, I'm using [GatsbyJS](https://www.gatsbyjs.com/). You can also use, e.g. [Jekyll](https://jekyllrb.com/),  [Hugo](https://gohugo.io/).
2. **Include documentation in the Code Review process:** Just putting the documentation together with the source code will not be enough. What is the actual advantage of this over, e.g. Confluence? If it's in the repository, then it allows you to verify whether the changed logic is updated in the documentation. You can view the history of changes and check what code change triggered the update or how documentation evolved. It's much easier to maintain documentation regularly than from time to time with batches. Especially retrofitting is a nightmare process. Using the code review tools gives us the option to have efficient async discussions. I don't know if it's just me, but for me, commenting (having a thread conversation) on Confluence is a tragedy. It is much easier to refer to a specific line of code in Github or Gitlab. Keeping all discussion in the same place improves discoverability by having a single source of truth about both technical and business decisions.
3. **Create immutable documentation:** A few years ago, Michael Nygard wrote an article  ["Documenting architectural decisions"](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). He presented the Architecture Decision Record idea. It's a concise record of our architectural decisions. It should include:
   - **Title:** what is the change about.
   - **Context:**  where the need came from. We describe here the background for the decision and facts about the current state. It can describe both your business case and technical one.
   - **Decision:** proposed solution for our issue.
   - **Status:** e.g. proposed, accepted, rejected - yes, we also catalogue rejected ideas. They carry a substantive value about our thought process. We can also get back to rejected ideas when the context changes, and we can analyze them again.
   - **Consequences** - positive and negative effects of the decision. It is essential not to be putting lipstick on a pig. We should show the proposed solution's opposing sides and risks.

    It's also important to do it transparently and invite all the stakeholders to review it. In my previous project, we were sending such items to the general forum (slack channel). Everyone was informed and invited to add their two cents in the review. It is advisable that people from other teams also speak. This change may often concern them directly (e.g. changes in shared contracts) or indirectly (a global architectural change, e.g. authorization). An additional aspect is that we may fall into tunnel thinking in a team. A fresh look can spot mistakes or missing pieces. It's not about patting your back when making decisions but about making the best decision we can.
    Now the final, crucial part. The approved document cannot be changed. If we found out that we need to update the decision, we should send a new ADR. Thanks to that, once added, the documentation does not have to be updated and maintained. We're just recording the next set of decisions.
4. **Automate the process** - As I mentioned already, there are so many cool and simple tools that can make the process painless. There is no need to write some custom scripts or do it all on your own.

Having good documentation is also crucial if you're building the tool that you'd like to be used by others (e.g. library or framework). I can guarantee you that the chance that it'll be used is close to zero without good docs.

I also encourage checking my [Architect Manifesto](/en/architect_manifesto/) in which I describe how to put it into the overall architecture process.

I hope that helped. What's your approach?

Cheers! 

Oskar
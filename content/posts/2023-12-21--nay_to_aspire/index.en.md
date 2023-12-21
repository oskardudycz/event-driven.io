---
title: Why I won't use .NET Aspire for now
category: ".NET"
cover: 2023-12-21-cover.png
author: oskar dudycz
---

![cover](2023-12-21-cover.png)

**When you're angry, take a breath, take your time and then talk. So I did after I tested .NET Aspire yesteday.** I hoped it could be a decent tool for local development with a decent synergy to Marten and Wolverine, and...

**Unfortunately, I think that Aspire is not even usable for local development.** Unless you go full Windows + Visual Studio.

I was going back and forth on whether to write it, but I think people should see different opinions to make a proper judgement. That's why I decided to balance the mostly hyped comments I saw. So let's go.

**The setup is overcomplicated.** You need to [add two additional projects](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/build-your-first-aspire-app?tabs=visual-studio#create-the-template-solution), one for the host and the other for "defaults". 

**You need to have all projects in a single solution.** And reference all startup projects to the .NET Aspire Host (or provide the relative paths to them). Ah, and add default project to all of them. That could be fine for a small monolithic solution but unrealistic for a bigger system. 

**Plus, cherry on top: I didn’t manage to configure the local environment on Ubuntu after spending a few hours on it.**

Aspire tries reinventing the wheel instead of adapting to existing standard tools like Kubernetes. They came up with their own Control Plane, which you cannot just use by adding a NuGet package or running a Docker image. Nope, [you need to install that on your local dev with _"dotnet workload install"_](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/setup-tooling?tabs=visual-studio#install-net-aspire). Yes, there's such a command.

I don't see myself as a total noob, but rather as an "average Joe", but I didn't manage to properly install Aspire tooling on my PopOS (Ubuntu-based) distro. Some may say that I just don't know how to use it properly, but if that's true, then that's also true for most devs.

[Anthony Simmon made a great job investigating](https://anthonysimmon.com/exploring-microsoft-developer-control-plane-core-dotnet-aspire-dotnet-8) and describing how bizarrely _Microsoft Developer Control Plane_ works internally.

Martin Thwaites experimented and [created the NuGet package that self-hosts .NET Aspire Dashboard](https://github.com/martinjt/aspire-app-extension). Which is how it should be done since the beginning. Yet, it's unknown if .NET team will take this direction. If they don't, we all know how using frameworks in unintended way always ends up.

Of course, I could try it on my Windows machine, but if the DevOps tool doesn't work easily on non-Windows boxes, that speaks a lot. It means that it's not production-ready. I could probably spend more time trying to hack it, but then I'd need to consider how to make it repeatable on other people's machines, automated setup in CI/CD, etc. That's the opposite of what I'd expect from such a tool.

Documentation is far from great, and the only way to troubleshoot is to try to skim through the source code, and hey, only part of it is open; [the rest is closed](https://github.com/dotnet/aspire/pull/941).

I wasn't a fan of [Tye project](https://github.com/dotnet/tye), whose successor is Aspire. For me, it was too bold to try to replace already established and working standards with something else. Unsurprisingly, it failed. And no, it wasn't an experiment as it's pictured now. [I remembered how it was presented](https://www.youtube.com/watch?v=prbYvVVAcRs), the same way as Aspire now. It seems that the .NET team took some lessons but made similar general mistakes. 

**Unfortunately, it looks like a demoware and project detached from the current development standards.** I still have some (but small) hope that the .NET team will learn from the feedback and change it. Still, based on the current state, it would need to change fundamentally, which is hard to do at the time of the public preview.

**I think that making it less ambitious in terms of revolution would work, so making .NET Aspire a "Spring Boot for .NET".** That'd be already a big win for a lot of projects.

Currently, for hobby or small projects, it's a no-go as the setup is overly complicated, and you can spend more time trying to make it work than it's worth it; for the real project, it's too buggy and detached from the open standards even to consider it. 

**TLDR. I didn't have huge expectations, but I still got disappointed.**

Cheers!

Oskar

p.s. To balance that check also a really good and concise [introduction by Layla Porter](https://www.youtube.com/watch?v=J02mvcEKrsI).  You can see a draft of my try to apply [.NET Aspire on Marten sample appplication](https://github.com/JasperFx/marten/pull/2871). 

p.s.2 Note to future reader: I wrote this article at the time [Preview 2 was just released](https://devblogs.microsoft.com/dotnet/announcing-dotnet-aspire-preview-2/).

p.s.3. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

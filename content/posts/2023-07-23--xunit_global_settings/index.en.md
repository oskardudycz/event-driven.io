---
title: How to set global setting for XUnit tests
category: "Tests"
cover: 2023-07-23-cover.png
author: oskar dudycz
---

![cover](2023-07-23-cover.png)

**XUnit is not my favourite testing tool; I already mentioned that in [How to set up a test matrix in XUnit?](/en/how_to_setup_a_test_matrix_in_xunit/).** To be fair, none of the .NET test tooling is my favourite. They're hard to customise and run more advanced configurations or performance exhausting tasks. 

I heard good things about [Fixie](https://github.com/fixie/fixie), but I'm not even sure if it's actively maintained. And here's the thing, testing framework is rarely the hill you'd like to die on. We should select it based on the team's preferences, as they said: _"When in Rome, do as the Romans do"_. Although, in this case, it's more [walking like Egyptians](https://www.youtube.com/watch?v=Cv6tuzHUuuk).

Still, enough of this rant; let's look at the customisation I brought you today.

**Let's say we'd like a global setup before running all tests in XUnit; for instance, set some settings or environment variables.**

To do that, we need to follow the best object-oriented practices and create the following class:

```csharp
namespace Your.Test.Project.Namespace;

public sealed class AssemblyFixture : XunitTestFramework
{
    public AssemblyFixture(IMessageSink messageSink)
        :base(messageSink)
    {
        // Do your setup here
    }
}
```

We also need to align with the best C# practices and sprinkle that with a bit of attributes magic, and add that before the class declaration:

```
[assembly: TestFramework("Your.Test.Project.Namespace.AssemblyFixture", "Your.Test.Project.AssemblyName")]
```

Then place this file in the test project.

**Could I show you a real-world example?" Yes, I can! Last week [I explained how Marten code generation works](/en/marten_and_docker/). We call it through the command line. Marten uses [Oakton](https://jasperfx.github.io/oakton/guide/getting_started.html) for command line handling, so the last line in our application has to look like that. 

```csharp
return await app.RunOaktonCommands(args);
```

That'll automatically start the web application, but unfortunately, not in tests. To do that, we need to instrument Oakton to autostart the host. We can do that by setting the following variable:

```csharp
OaktonEnvironment.AutoStartHost = true;
```

You could use another project from the Critter Stack [Alba](https://jasperfx.github.io/alba/guide/gettingstarted.html) that'd do it for you. 

**But I'm not using it, as I'm using my own [Ogooreck](https://github.com/oskardudycz/Ogooreck), which is a thin wrapper on .NET testing tooling that helps you cut boilerplate in Behaviour-Driven Design style.**  

What to do, then? Of course, I could use the class defined above to set this variable. The whole code would look like

```csharp
[assembly: TestFramework("Your.Test.Project.Namespace.AssemblyFixture", "Your.Test.Project.AssemblyName")]

namespace Your.Test.Project.Namespace;

public sealed class AssemblyFixture : XunitTestFramework
{
    public AssemblyFixture(IMessageSink messageSink)
        :base(messageSink)
    {
        OaktonEnvironment.AutoStartHost = true;
    }
}
```

This code will ensure the setting is applied once at the beginning of tests.

**Be careful with it!** This approach works well for the basic global setup that should apply to all tests. You should not do exhaustive initialisation like database setup. As you see, it allows only synchronous code, and we're plugging into the XUnit bare bones. This code will be run during test discovery in the IDE etc. As it's global code, remember it may impact your test isolation. This is fine for our case, as we want to change the global setting for all tests, but it might not be fine for your case.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

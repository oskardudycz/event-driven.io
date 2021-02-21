---
title: How to set up a test matrix in XUnit?
category: "Tests"
cover: 2021-02-21-cover.png
author: oskar dudycz
---

![cover](2021-02-21-cover.png)

Each country has the go-to place for hiding from daily struggles. In Poland, we have [Bieszczady](https://www.youtube.com/watch?v=wea2dvx0pEU). It's a mountain range that's also the wildest part of our country. You will find there: solitude, forests, wolves,  bobcats and all that wild nature stuff. Beautiful place with a mysterious vibe similar to Twin Peaks. We have a running joke in Poland, *"Fuck that! Let's go breed sheep in Bieszczady!"*. That was precisely the feeling I had while adding [System.Text.Json](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-overview) support to [Marten](https://martendb.io/).

If you're [following me on Twitter](https://twitter.com/oskar_at_net), then you probably saw a few of my rants about that. I'll spare you my frustration and summarise: it was an unpleasant surprise. STJ is not covering many basic scenarios, and its design decisions are at least debatable (e.g. the need to use attributes everywhere).

**Still, we decided to support System.Text.Json, as:**
- the limited feature-set may not hit users that need only simple [POCO](https://en.wikipedia.org/wiki/Plain_old_CLR_object),
- it may give performance improvement,
- Newtonsoft Json.NET seems not to be supported enough and might get obsolete soon.

Adding a new serialiser to the library like Marten is a challenge. **Marten, thanks to [Postgres JSON capabilities](https://scalegrid.io/blog/using-jsonb-in-postgresql-how-to-effectively-store-index-json-data-in-postgresql/) uses it as a document database and an event store.** JSON serialisation and translation is a centrepiece of our actions. 

We have a big set of unit and integration tests (a few thousand) to ensure that all edge cases are covered. We are taking the free CI/CD engines spinning to their limits.
- GitHub Actions - to run against .NET Core 3.1,
- AzureDevops - for .NET 5.

Both environments are running build matrix tests for Postgres versions ranging from 9.6 to 12. That's a hellova test runs and permutations.

As I mentioned, JSON serialisation and mapping (e.g., constructing SQL queries from LINQ) are critical in Marten. I could take a similar approach as I did in adding NodaTime support - dedicated tests. However, I wanted to make sure that we can precisely know what's working and what's not. That's why I decided to add matrix tests to run for both serialisers. 

That appeared harder than I thought. **Both AzureDevops and GitHub Actions have decent support for the build matrix. However, this approach is against the XUnit conventions.** It's recommended to have explicit test data. It is a reasonable approach, but as I described, sometimes you have bigger needs. Tuning a framework to your needs is always hard. It took me a lot of googling, and a few tries to achieve that. That's why I decided to share the solution with you.

In the samples below, I'll be using, for clarity, sample project: https://github.com/oskardudycz/XUnit.MatrixTests/. I extracted part responsible for setting up the matrix tests with XUnit. 

If you prefer, you can check the full Marten's Pull Request: https://github.com/JasperFx/marten/pull/1685.

**The first case to solve was passing information about the selected serialiser type for the test suite run.** XUnit doesn't support any test settings file. That's why I followed KISS and used a good old environment variable. Based on it, I'm setting the default serialiser. To do that, I created two classes:

Factory to be able to select default serialiser:

```csharp
public enum SerializerType
{
    NewtonsoftJsonNet = 1,
    SystemTextJson = 2
}

public static class SerializerFactory
{
    public static SerializerType DefaultSerializerType { get; set; } = SerializerType.NewtonsoftJsonNet;

    public static ISerializer New(SerializerType? serializerType = null)
    {
        serializerType ??= DefaultSerializerType;

        return serializerType switch
        {
            SerializerType.NewtonsoftJsonNet => new NewtonsoftSerializer(),
            SerializerType.SystemTextJson => new SystemTextJsonSerializer(),
            _ => throw new ArgumentOutOfRangeException(nameof(serializerType), serializerType, null)
        };
    }
}
```

Test setting class that, based on the environment variable, gets the serialiser type.

```csharp
public static class TestsSettings
{
    private static SerializerType? serializerType;

    public static SerializerType SerializerType
    {
        get
        {
            if (serializerType.HasValue) 
                return serializerType.Value;
            
            var defaultSerializerEnv = Environment.GetEnvironmentVariable("DEFAULT_SERIALIZER");

            serializerType = Enum.TryParse(defaultSerializerEnv, out SerializerType parsedSerializerType)
                ? parsedSerializerType
                : SerializerType.NewtonsoftJsonNet;
            
            return serializerType.Value;
        }
    }
}
```

Having those classes, the only issue left was initialising the test settings automatically before the XUnit test run. It's possible by creating your own **XunitTestFramework**. 

```csharp
using Weasel.Serialization;
using Xunit;
using Xunit.Abstractions;
using Xunit.Sdk;

[assembly: TestFramework("XUnit.MatrixTests.TestSetup", "XUnit.MatrixTests")]

namespace XUnit.MatrixTests
{
    public class TestSetup : XunitTestFramework
    {
        public TestSetup(IMessageSink messageSink)
            :base(messageSink)
        {
            SerializerFactory.DefaultSerializerType = TestsSettings.SerializerType;
        }

        public new void Dispose()
        {
            // Place tear down code here
            base.Dispose();
        }
    }
}
```

You can do a lot of customisation there, but for our case, it was enough to connect the dots and set the default serialiser type. Besides deriving from **XunitTestFramework** it's also needed to put the assembly attribute. Beware - you need to use the magical strings with the name of your tests project assembly and defined test framework name with a namespace. The wrong copy&paste can hurt a lot!

**That's all to have the XUnit build matrix!**

**Well, almost.** I knew already that some of the test scenarios wouldn't work. System.Text.Json is not working correctly with the anonymous and dynamic types, classes hierarchies etc. **I wanted to have an option to mark some tests as only supported for Newtonsoft.** I used the pattern that we already had for skipping features unsupported in the older Postgres versions (e.g. full-text search below version 10). I implemented the custom **XUnit Fact** for that with information about the selected serialiser.

```csharp
[AttributeUsage(AttributeTargets.Method)]
[XunitTestCaseDiscoverer("XUnit.MatrixTests.Extras.SerializerTargetedFactDiscoverer", "XUnit.MatrixTests")]
public sealed class SerializerTypeTargetedFact: FactAttribute
{
    public SerializerType RunFor { get; set; }
}
```

Besides that, I needed to implement a custom fact discoverer to skip the test if the serialiser used in the test run is different than selected in **SerializerTypeTargetedFact**.

```csharp
public sealed class SerializerTargetedFactDiscoverer: FactDiscoverer
{
    private readonly SerializerType serializerType;

    public SerializerTargetedFactDiscoverer(IMessageSink diagnosticMessageSink): base(diagnosticMessageSink)
    {
        serializerType = TestsSettings.SerializerType;
    }

    public override IEnumerable<IXunitTestCase> Discover(ITestFrameworkDiscoveryOptions discoveryOptions, ITestMethod testMethod,
        IAttributeInfo factAttribute)
    {
        var runForSerializer = factAttribute.GetNamedArgument<SerializerType?>(nameof(SerializerTypeTargetedFact.RunFor));
        
        if (runForSerializer != null && runForSerializer != serializerType)
        {
            yield return new TestCaseSkippedDueToSerializerSupport($"Test skipped as it cannot be run for {serializerType} ", DiagnosticMessageSink, discoveryOptions.MethodDisplayOrDefault(), discoveryOptions.MethodDisplayOptionsOrDefault(), testMethod);
            yield break;
        }
        
        yield return CreateTestCase(discoveryOptions, testMethod, factAttribute);
    }

    internal sealed class TestCaseSkippedDueToSerializerSupport: XunitTestCase
    {
        [Obsolete("Called by the de-serializer", true)]
        public TestCaseSkippedDueToSerializerSupport()
        {
        }

        public TestCaseSkippedDueToSerializerSupport(string skipReason, IMessageSink diagnosticMessageSink, TestMethodDisplay defaultMethodDisplay, TestMethodDisplayOptions defaultMethodDisplayOptions, ITestMethod testMethod, object[] testMethodArguments = null) : base(diagnosticMessageSink, defaultMethodDisplay, defaultMethodDisplayOptions, testMethod, testMethodArguments)
        {
            SkipReason = skipReason;
        }
    }
}
```

Then I could use it as:

```csharp
[SerializerTypeTargetedFact(RunFor = SerializerType.NewtonsoftJsonNet)]
 public void TestWithCustomFact()
 {
     var session = new DocumentSession();

     var doc = session.Load<dynamic>("1");
     
     Assert.Equal("1", (string)doc.Id);
     Assert.Equal("test", (string)doc.Name);
 }
```

You can implement the custom **XUnit Theory**. But, I'll let you check it directly on GitHub: https://github.com/oskardudycz/XUnit.MatrixTests/blob/main/XUnit.MatrixTests/Extras/SerializerTypeTargetedTheory.cs.

As the final touch for this blog post, I'll show you how to configure such a test matrix in GitHub Actions:

```yml
name: ASP.NET Core CI

on: [push]

jobs:
    build:
      runs-on: ubuntu-latest
      strategy:
        matrix:
          serializer: [Newtonsoft, SystemTextJson]

      steps:
        - name: Check Out Repo
          uses: actions/checkout@v1

        - name: Setup .NET Core
          uses: actions/setup-dotnet@v1
          with:
            dotnet-version: '5.0.100'

        - name: Build with dotnet
          run: dotnet build --configuration Release 
          
        - name: Test with dotnet
          run: dotnet test --configuration Release 
          env:
            DEFAULT_SERIALIZER: ${{ matrix.serializer }}

```

Yes, it's so simple. You need to define the set of matrix variables (**serializer: [Newtonsoft, SystemTextJson]**). And pass them to the build step environment variable. 

**Magic! Smoke and Mirrors!**

Breeding sheep in Bieszczady is a decent idea. But programming still can be fun. I hope that this post will help you and save you some of the head-banging-on-desk experience.

Cheers!

Oskar

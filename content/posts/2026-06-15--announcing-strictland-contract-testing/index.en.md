---
title: Announcing Strictland - new contract testing library for message compatibility
category: "Testing"
cover: 2026-06-15-cover.png
author: oskar dudycz
---

![cover](2026-06-15-cover.png)


**I just released something. It's called Strictland.** And it's a contract testing library. Why did I do it?

Before I go further, if you can’t wait, you can check it on:
- GitHub - [https://github.com/event-driven-io/strictland](https://github.com/event-driven-io/strictland)
- Maven Central - [https://github.com/event-driven-io/strictland](https://central.sonatype.com/artifact/io.event-driven/strictland)
    

**So now you already know that it’s a JVM (Java, Scala, Kotlin, etc.) Open Source library.**

Let me first show you a sneak peek. Stop for a moment and have a look on this:

```java
@Test
void ensureOrderPlacedCompatibilityWithNewerVersion() {
    // Strictland specification
    MessageContract.specification(Json.Jackson.of(yourObjectMapper))
        .given(new OrderPlaced(orderId, "Alice"))
        .whenDeserializedAs(OrderPlacedWithCoupon.class)
        .thenBackwardCompatible();
}
```

What would you say if you saw such a test? Think about it, we’ll get back to it.

## What’s Strictland?

But again, why did I do it if there are mature solutions like [Pact](https://pact.io/), [Spring Cloud Contracts](https://spring.io/projects/spring-cloud-contract), or [Confluent Schema Registry](https://github.com/confluentinc/schema-registry)?

If you've used consumer-driven contract testing, the usual approach is to run both the provider and the consumer, record the consumer's expectations against a mock, verify the provider against those expectations, and share those contracts through a broker.  
  
In Strictland, I took a smaller, simpler approach. It serialises the message in a standard unit test and saves the output as a snapshot file that you commit alongside your code.  
  
The test fails when the serialised shape changes, or when it contains a breaking change - up to you to specify expectations. A check confirms that an older and a newer version of the message can still read each other's data (or the other way round).

**Because it's only serialisation and a file, the setup stays small:**
- The checks are ordinary unit tests in your existing suite, so there's no broker, schema registry, or mock service to run, and nothing to start in Docker.    
- The contract is the serialised JSON committed alongside the test, so any format change appears in a normal diff and is reviewed like any other code.    
- You write the check beside the message it covers and get the answer in the same fast feedback loop as the rest of your tests. The check uses your application's own serializer, so the snapshot is the exact bytes you ship.    
- Strictland checks the serialised shape of a message and whether its versions stay compatible. It doesn't exercise a live exchange between running services, so it complements that kind of tooling rather than replacing it.
    

**Strictland checks the serialised shape of a message and whether its versions stay compatible.** It doesn't exercise a live exchange between running services, so it complements that kind of tooling rather than replacing it.

It's not as powerful as popular tooling, but it's also much simpler to start catching our mistakes. Traditional solutions allow you to mock protocols, put a man in the middle, and even generate client code. All of that is great if you need it and have experience with it.

Most of the [customers I’m helping through consultancy and training](https://event-driven.io/en/training/) aren't there yet. Setting up those tools is a lot of heavy lifting for them and adds additional complexity. And well, maybe they don’t need to be, as this approach served me well in my past projects. I always handcrafted such a tool in my projects, but finally decided to make it properly.

## Why such a name?

I’m putting (too?) much effort into my projects’ names. It's a word game. Contract testing rewards a strict approach to your message shapes, and [Mr. Strickland](https://backtothefuture.fandom.com/wiki/Stanford_S._Strickland) was strict enforcer in _Back to the Future_. That puts it in good company next to its sibling [Emmett](https://github.com/event-driven-io/emmett), named after Doc Emmett Brown. I also didn’t want to collide with the older [JS validation package](https://github.com/jeffhandley/strickland).

## How to use it?

Getting back to the essence… How to use it?

**You write a small unit test that locks down a message’s format.** Later, you rename a field, change a type, or adjust how a value serialises; the code still compiles and your other tests pass, but that one fails and points at what changed. You fix it in your build before a consumer or a stored event has hit the old format in production.

When a message changes by accident, a snapshot check shows you exactly what moved. When you evolve a message on purpose, a compatibility check confirms an old and a new version can still read each other’s data.

You can start by installing it from Maven Central, by adding dependency.

```xml
<dependency>
  <groupId>io.event-driven</groupId>
  <artifactId>strictland</artifactId>
  <version>0.3.0</version>
  <scope>test</scope>
</dependency>
```

Then adding such test:

```java
MessageContract.specification(Json.Jackson.defaults())
    .given(new OrderPlaced(orderId, "Alice", placedAt))
    .whenSerialized()
    .thenContractIsUnchanged();
```

The first run serializes the message and writes the result to an approved file named after the class, `OrderPlaced.approved.txt`, saved next to the test:

```json
{"orderId":"00000000-0000-0000-0000-000000000001","customer":"Alice","placedAt":"2024-01-01T12:00:00Z"}
```

You review that file and commit it. From then on the check compares against it and fails if the format drifts, so a later change to the format shows up in the same pull request as the code that caused it.

A message under contract goes through one of two checks.

A **snapshot check** confirms the message still serializes exactly as it did when you last approved it, so nothing reading it downstream breaks. A failure means the format changed: a field renamed, a date format switched, a value newly dropped or added.

A **compatibility check** is for the version you evolve on purpose, so changing a message doesn’t leave the ones already in your store or on the wire stranded. Use `thenBackwardCompatible()` to confirm the newer version still reads a message the older one wrote, the events you stored last year, or a request already sent. Use `thenForwardCompatible()` to confirm a reader that hasn’t upgraded yet still reads a message the newer version writes, so you can ship the new shape before everyone reading it has caught up. Both compare the fields the two versions share and fail if a required one is missing or a shared value has changed.

```java
@Test
void ensureOrderPlacedCompatibilityWithNewerVersion() {
    // Strictland specification
    MessageContract.specification(Json.Jackson.of(yourObjectMapper))
        .given(new OrderPlaced(orderId, “Alice”))
        .whenDeserializedAs(OrderPlacedWithCoupon.class)
        .thenBackwardCompatible();
}
```

You review that file and commit it. From then on the check compares against it and fails if the format drifts, so a later change to the format shows up in the same pull request as the code that caused it.

As you see, in the specification, you pass your serializer.

```java
var spec = MessageContract.specification(Json.Jackson.of(yourObjectMapper))
```

I encourage you to use your application's object mapper and pass the same `ObjectMapper` it uses, so the test checks the exact bytes you ship. That’ll help you avoid nasty surprises, where tests are using a different format than your framework or tooling.

Strictland provides an implementation of a sensible Jackson setup: ISO-8601 dates, nulls kept, unknown properties ignored on read. You can use it with `Json.Jackson.defaults()`. But it’s more of an accessible thing to get you started quickly.

You can also define your own serializer if you’re using an unsupported (yet?) format or serializer type. See basic examples in:
- [CsvMessageSerializer](https://github.com/event-driven-io/strictland/blob/main/src/jvm/src/test/java/io/eventdriven/strictland/CsvMessageSerializer.java) and its [tests](https://github.com/event-driven-io/strictland/blob/main/src/jvm/src/test/java/io/eventdriven/strictland/CsvMessageSerializerTests.java) or,
- [SimpleBinaryMessageSerializer](https://github.com/event-driven-io/strictland/blob/main/src/jvm/src/test/java/io/eventdriven/strictland/SimpleBinaryMessageSerializer.java) and its [tests](https://github.com/event-driven-io/strictland/blob/main/src/jvm/src/test/java/io/eventdriven/strictland/SimpleBinaryMessageSerializerTests.java).
    

## Should you use it?

![Yes, you do!](./2026-06-15-yes-you-do.gif)

Strictland is young and pre-1.0, so the API can still move between versions. The checks themselves are small and well covered, and the snapshots they produce are just files in your repository, so trying it out costs little and commits you to nothing.

I’d genuinely like your feedback. If something is missing or awkward, tell me through comments, on [Discord](https://discord.gg/fTpqUTMmVa) or open an [issue](https://github.com/event-driven-io/strictland/issues/new).

Currently, I’m working on making snapshot location more organised and configurable, not to end up with a bloated snapshots tests folder.

I also need to rethink the _given_ name; it’s from Behaviour-Driven Design, but it appears to be a [reserved word in Scala 3](https://docs.scala-lang.org/scala3/reference/contextual/givens.html). Cross-language and cross-stack libs are much fun!

For now, for JVM, as the Java-based customers I’m helping also needed that, but soon want to add .NET and TypeScript/Javascript (and maybe more).

Tell me your honest thoughts, give it a try and a star if you liked it. Play with it, and pass me your feedback. It’ll motivate me to continue working on it!

**Would you like to learn more about consumer-driven tests and how Strictland can be used for them?**

**And read in the event versioning series:**
- [Simple patterns for events schema versioning](/en/simple_events_versioning_patterns/)
- [Explicit events serialisation in Event Sourcing](/en/explicit_events_serialisation_in_event_sourcing/)
- [Fun with serial JSON](/en/fun_with_json_serialisation/)
- [Mapping event type by convention](/en/how_to_map_event_type_by_convention/)
- [Event Versioning with Marten](/en/event_versioning_with_marten/)
- [Let's take care of ourselves! Thoughts on compatibility](/en/lets_take_care_of_ourselves_thoughts_about_comptibility/)
- [Internal and external events, or how to design event-driven API](/en/internal_external_events/)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

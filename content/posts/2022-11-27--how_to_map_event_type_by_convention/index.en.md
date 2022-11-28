---
title: Mapping event type by convention
category: "Event Sourcing"
cover: 2022-11-27-cover.jpg
author: oskar dudycz
---

![cover](2022-11-27-cover.jpg)

**Events are an essential block of Event-Driven Architecture. They represent business facts that happened in our system.** We can use them to integrate business workflow steps, store them to use them later in our business logic, or get insights about our process. They’re both business concepts representing the checkpoints of our workflow, and technical messages changed back and forth into a series of ones and zeros. This process is called (de)serialisation. We have plenty of options to choose from in serialisation formats. The major split is for text-based and binary formats. Text-based are, e.g. JSON and XML. Their advantage is that you can read them in any text editor, are (more or less) human-readable, popular and have much tooling around them; they’re also standardised. Yet, they have flaws, like the inability to easily express precise numeric, date and time formats; they take more space. That’s where binary formats can help. The most popular are [Protobuf](https://developers.google.com/protocol-buffers) and [Avro]( https://avro.apache.org/).

**No matter your choice, you’ll still need to define the mapping between the code type representing your event and serialised message.** This part is also essential in maintaining the evolution/versioning of events. I wrote about that in my other articles: [Simple patterns for events schema versioning](/en/simple_events_versioning_patterns/) and [Event Versioning with Marten](/en/event_versioning_with_marten/). Check also Greg Young book [Versioning in an Event Sourced System](https://leanpub.com/esversioning/read).

**When serialising type to bytes, you need to store the type name. You can do that explicitly by manually defining mapping or using a convention-based approach.** Both have pros and cons. Manual can be a bit repetitive and yet another thing to remember. Convention-based is more magical, and if we forget how it works, then surprisingly, we can break our mapping. How? The most straightforward approach in languages like C# or Java is to use the full class name.  We can get the text name from our event class. It contains both namespace/package paths so that we won’t mistake it with other events named the same but in different locations. Yet, if we’re refactoring and moving code from one place to another or fixing an accidental typo, we can change the event type name. Once we did that, our mapping was broken, as the stored event type name won’t match the new location.

Of course, we can fix it by introducing manual mapping and telling our mapping logic that for this event type name, we’d like to use the new class name (or just a different class if we want to map the old event payload to the new version). 

**Let’s see how we can get the best out of those worlds and possibly use conventions by default but also have the option to switch to manual mapping.** We need to define maps containing class-to-event type name mapping and the other way round. In C# this could look as follows:

```csharp
public class EventTypeMapper
{
    private static readonly EventTypeMapper Instance = new();

    private readonly ConcurrentDictionary<string, Type?> typeMap = new();
    private readonly ConcurrentDictionary<Type, string> typeNameMap = new();
}
```
We also defined a singleton instance, as we’d like to have it as a global store to increase the performance (read more in [Memoization, a useful pattern for quick optimization](/en/memoization_a_useful_pattern_for_quick_optimisation/)).

As I mentioned, we’d like to have option to define the custom, explicit mappings. We can do that as:

```csharp
public class EventTypeMapper
{
    // (…)
    public static void AddCustomMap<T>(string mappedEventTypeName) =>
        AddCustomMap(typeof(T), mappedEventTypeName);

    public static void AddCustomMap(Type eventType, string mappedEventTypeName)
    {
        Instance.typeNameMap
            .AddOrUpdate(eventType, mappedEventTypeName, (_, _) => mappedEventTypeName);
        Instance.typeMap
            .AddOrUpdate(mappedEventTypeName, eventType, (_, _) => eventType);
    }
}
``` 
We’re assigning mapping for both ways by providing the class type and event type name.

How to define the resolution methods? We can do it like that:

```csharp
public class EventTypeMapper
{
    // (…)
    public static string ToName<TEventType>() => ToName(typeof(TEventType));

    public static string ToName(Type eventType) =>
        Instance.typeNameMap.GetOrAdd(eventType, _ =>
        {
            var eventTypeName = eventType.FullName!;

            Instance.typeMap
                .AddOrUpdate(eventTypeName, eventType, (_, _) => eventType);

            return eventTypeName;
        });

    public static Type? ToType(string eventTypeName) => 
        Instance.typeMap.GetOrAdd(eventTypeName, _ =>
        {
            var type = 
                GetFirstMatchingTypeFromCurrentDomainAssembly(eventTypeName);

            if (type == null)
                return null;

            Instance.typeNameMap
                .AddOrUpdate(type, eventTypeName, (_, _) => eventTypeName);

            return type;
        });

    private static Type? GetFirstMatchingTypeFromCurrentDomainAssembly(string typeName) =>
        AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes()
                .Where(x => x.AssemblyQualifiedName == typeName || x.FullName == typeName || x.Name == typeName)
            )
            .FirstOrDefault();
}
```

**The logic for mapping is simple, we’re either using already existing one or trying to resolve type by convention.** _GetFirstMatchingTypeFromCurrentDomainAssembly_ method is responsible for that. We can define any other convention if we’d like to. I'm using _ConcurrentDictionary_ instead of regular _Dictionary_ to make operations [Thread safe](https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2?view=net-7.0#thread-safety).

Note that the _GetFirstMatchingTypeFromCurrentDomainAssembly_ is an expensive operation that will be called for each event type. Yet, it will be only called once, then resolved type will be cached, and you won't get further performance hits.  If you're afraid of that and know the event types upfront, then you can preload types at the startup. If you're in the .NET space, you can also consider using [ImHashMap](https://github.com/dadhi/ImTools) which is also thread safe and much faster than regular _ConcurrentDictionary_.

The final mapper class will look as follow:

```csharp
public class EventTypeMapper
{
    private static readonly EventTypeMapper Instance = new();

    private readonly ConcurrentDictionary<string, Type?> typeMap = new();
    private readonly ConcurrentDictionary<Type, string> typeNameMap = new();
    
    public static void AddCustomMap<T>(string mappedEventTypeName) =>
        AddCustomMap(typeof(T), mappedEventTypeName);

    public static void AddCustomMap(Type eventType, string mappedEventTypeName)
    {
        Instance.typeNameMap
            .AddOrUpdate(eventType, mappedEventTypeName, (_, _) => mappedEventTypeName);
        Instance.typeMap
            .AddOrUpdate(mappedEventTypeName, eventType, (_, _) => eventType);
    }

    public static string ToName<TEventType>() => ToName(typeof(TEventType));

    public static string ToName(Type eventType) =>
        Instance.typeNameMap.GetOrAdd(eventType, _ =>
        {
            var eventTypeName = eventType.FullName!;

            Instance.typeMap
                .AddOrUpdate(eventTypeName, eventType, (_, _) => eventType);

            return eventTypeName;
        });

    public static Type? ToType(string eventTypeName) => 
        Instance.typeMap.GetOrAdd(eventTypeName, _ =>
        {
            var type = 
                GetFirstMatchingTypeFromCurrentDomainAssembly(eventTypeName);

            if (type == null)
                return null;

            Instance.typeNameMap
                .AddOrUpdate(type, eventTypeName, (_, _) => eventTypeName);

            return type;
        });

    private static Type? GetFirstMatchingTypeFromCurrentDomainAssembly(string typeName) =>
        AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes()
                .Where(x => x.AssemblyQualifiedName == typeName || x.FullName == typeName || x.Name == typeName)
            )
            .FirstOrDefault();
}
```

In Java, we could define that accordingly:

```java
public final class EventTypeMapper {
  private static final EventTypeMapper Instance = new EventTypeMapper();

  private final Map<String, Optional<Class>> typeMap = new HashMap<>();
  private final Map<Class, String> typeNameMap = new HashMap<>();

  public static <T>void AddCustomMap(Class<T> eventType, String mappedEventTypeName)
  {
    Instance.typeNameMap.put(eventType, mappedEventTypeName);
    Instance.typeMap.put(mappedEventTypeName, eventType);
  }

  public static String toName(Class eventType) {
    return Instance.typeNameMap.computeIfAbsent(
      eventType,
      c -> c.getTypeName()
    );
  }

  public static Optional<Class> toClass(String eventTypeName) {
    return Instance.typeMap.computeIfAbsent(
      eventTypeName,
      c -> {
        try {
          return Optional.of(Class.forName(eventTypeName));
        } catch (ClassNotFoundException e) {
            return Optional.empty();
        }
      }
    );
  }
}
```

We can use such a mapper directly in the serialiser:

```csharp
public class EventSerializer
{
    private readonly EventTypeMapping mapping;
    private readonly EventTransformations transformations;

    public EventSerializer(EventTypeMapping mapping, EventTransformations transformations)
    {
        this.mapping = mapping;
        this.transformations = transformations;
    }

    public object? Deserialize(string eventTypeName, string json) =>
        transformations.TryTransform(eventTypeName, json, out var transformed)
            ? transformed
            : JsonSerializer.Deserialize(json, mapping.Map(eventTypeName));
}
```

You can use those classes in a serialiser as follows.

```csharp
public class EventSerializer
{
    public (string, string) Serialize<T>(T @event)
    {
        var typeName = EventTypeMapper.ToName<T>();

        return (typeName, JsonSerializer.Serialize(@event));
    }
    
    public object? Deserialize(string eventTypeName, string json)
    {
        var type = EventTypeMapper.ToType(eventTypeName);

        if (type == null)
            throw new InvalidOperationException();

        return JsonSerializer.Deserialize(json, type);
    }
}
```

Is it the best approach? It depends on personal preferences. My experience is that tedious, repetitive code leads to stupid mistakes. A bit of magic can create bugs that are harder to find, so you need to pick your poison. What’s most important is that such mapping is not blocking you in any way from changing your approach in the future.

If you don’t like magic, I’ll cover full-explicit mode in the next article.


Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.

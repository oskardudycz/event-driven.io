---
title: Memoization, a useful pattern for quick optimization
category: "Design Patterns"
cover: 2020-05-05-cover.png
author: oskar dudycz
---

![cover](2020-05-05-cover.png)

Today I would like to show you a simple programming pattern that can be useful for quick code optimization. This pattern is called Memoization. It comes from the functional language and is used to remember the result of the function. The main idea behind it is to execute function only once. Follow up calls should not run the logic but return the cached result.

The example will be in C#, but it should be translatable into other prefered programming language.

We will create a static class that has the ["extension method"](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods) _Memoize_. Thanks to that, we will be able to call it more conveniently for the function we choose.

The Memoize method has a single input parameter: the function that will run the business logic. The result of Memoize method is also a function. As described above, the idea is that we pass a function that does some sort of computation and returns it wrapped with a cache logic.

```csharp
public static class Memoizer
{
    public static Func<TInput, TResult> Memoize<TInput, TResult>(this Func<TInput, TResult> func)
    {
        // create cache ("memo")
        var memo = new Dictionary<TInput, TResult>();

        // wrap provided function with cache handling
        return input =>
        {
            // check if result for set input was already cached
            if (memo.TryGetValue(input, out var fromMemo))
                // if yes, return value
                return fromMemo;

            // if no, call function
            var result = func(input);
            
            // cache the result
            memo.Add(input, result);

            // return it
            return result;
        };
    }
}
```

We're using function scope (_closure_) here. We define a dictionary (variable _memo_) in which we will remember the results of the function.

Next, we generate a wrapping method that will check if there is already a cached result for the given input parameter. If it is, it returns the result from the cache and does not call the function itself. If not, it calls the function, adds the result to the cache, and returns it.

What is important is that the function that we are going to "memoize" should be deterministic and not cause side effects. What does it mean in practice? This means that it will always return the same result for the given input parameter and will not make any changes. For example, for the same postal code, we will always get the same city. A given insurance number corresponds to a specific person, and so on. We also call this method a "Higher Order Function".

A more real-life example can be, e.g. slow but deterministic operations such as the reflection mechanism. For example, memoization could be useful to check whether a given type has a specific attribute (annotation).

Let's define a method to verify whether a given type has a given attribute as:

```csharp
Func<Type, Type, bool> hasAttribute =
    (type, attributeType) => type.GetCustomAttributes(attributeType, true).Any();
```

Unfortunately, we cannot memoize this method in its present form because our Memoize method assumes that the function will have one input parameter. The above has two.

We need to curry this function. How can this be done? The feature of higher-order functions is that they can be composed. For example, as follows:

```csharp
Func<Type, bool> hasSomeCustomAttribute = 
    type => hasAttribute(type, typeof(SomeCustomAttribute));
```

We create an additional function that takes a specific parameter as the type of attribute - corresponding to the type of attribute we choose.

We can memoize this function by:

```csharp
Func<Type, bool> hasSomeCustomAttributeMemo = hasSomeCustomAttribute.Memoize();
```

If we use it several times now, thanks to the memoization for the given type of the attribute, the function _hasAttribute_ will be called only once.

Of course, our implementation is quite naive, e.g. it's not thread-safe. We could enhance and simplify that by using [ConcurrentDictionary](https://docs.microsoft.com/en-us/dotnet/standard/collections/thread-safe/how-to-add-and-remove-items) class:

```csharp
public static Func<TInput, TResult> Memoize<TInput, TResult>(this Func<TInput, TResult> func)
{
    // create cache ("memo")
    var memo = new ConcurrentDictionary<TInput, TResult>();

    // wrap provided function with cache handling
    // get a value from cache if it exists
    // if not, call factory method
    // ConcurrentDictionary will handle that internally
    return input => memo.GetOrAdd(input, func);
}
```

**When is it worth using memoization?** Especially where we have to call the same code many times in one operation. If this code is deterministic, then you can cut a lot of execution time. You can also use it with, e.g. a cache in Redis. When we invalidate it, it will just get us a new value. The basis for optimization is to start with operations that are performed very often. This is simple math:
* If we cut 0.1 seconds on an operation performed 1000 times on each call, we will gain 100 seconds. 
* If the operation is performed 10 times and we cut 1 second, we will gain 10 seconds in total.

It is a straightforward technique, but it can bring very tangible results. Additionally, it is an example that functional programming is not so abstract but also practical.
 
You can check the full sample in my GitHub repository: https://github.com/oskardudycz/Memoization.

I hope I helped!

Cheers!

Oskar

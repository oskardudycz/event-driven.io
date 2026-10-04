---
title: 'TypeScript Migrates to Go: What''s Really Behind That 10x Performance Claim?'
category: Software Architecture
cover: 2025-03-24-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

Welcome to the new week!

**Almost two weeks ago, [Microsoft announced they're porting the TypeScript compiler from JavaScript to Go, promising a staggering 10x performance improvement](https://devblogs.microsoft.com/typescript/typescript-native-port/).** This news spread like wildfire across tech communities, with everyone from TypeScript fans to language war enthusiasts chiming in.

**The announcement leads with impressive performance numbers and ambitious goals, though some intriguing details remain unexplored.** We’ll tackle those today. Why today and not a week ago? Well, in Architecture Weekly, we don’t want rushy clickbaits, aye? I intentionally wanted to wait for the noise to calm down.

Beneath the headline figures lies a story worth unpacking about design choices, performance trade-offs, and the evolution of developer tools.

**Even if you’re not interested in compilers, there are suitable lessons learned for your system’s design, like:**

-   Looking beyond headline performance claims

-   Matching your technology to your problem domain

-   Understand your runtime model.

-   Reconsidering foundations as projects evolve.

Let’s tackle that step by step, starting from the Microsoft article headline.

## "A 10x Faster TypeScript" – Well, Not Exactly

First, let's clarify something that might be confusing in Microsoft's announcement title:

> _"A 10x Faster TypeScript."_

Is it really faster? Would your application written in TypeScript be 10x faster once MS releases the new code rewritten in Go?

![Not Really GIFs | Tenor](image-2.gif "Not Really GIFs | Tenor")

**What's actually getting faster is the TypeScript compiler, not the TypeScript language itself or the JavaScript's runtime performance.** Your TypeScript code will compile faster, but it won't suddenly execute 10x faster in the browser or Node.js.

It's a bit like saying,

> _"We made your car 10x faster!"_

and then clarifying that they only made the manufacturing process faster—the car itself still drives at the same speed. It's still valuable, especially if you've been waiting months for your car, but not quite what the headline suggests.

## Beyond the "10x Faster" Headline

Anders Hejlsberg's announcement showcased impressive numbers:

![](image-3.png)

Such remarkable stats deserve a deeper look, as this 10x speedup has multiple contributing factors. It's not simply that _"Go is faster than JavaScript"_.

**Let's be honest: whenever you see a "10x faster" claim, you should view it with healthy scepticism.** My first reaction was, "OK, what did they do suboptimal before?" Because 10x improvements don't materialize from thin air—they typically indicate that something wasn’t made well enough in the first place. Be it implementation or some design choices.

There's a widespread belief that "Node.js is slow,” which is more of a repeated stereotype than a truth. In some instances, it can be true, but it is not a general statement.

If someone says, "Node.js is slow” is slow, it’s almost like they’d say that C and C++ are slow. Why?

### The Architecture of Node.js

Node.js is built on Google's [V8 JavaScript engine](https://v8.dev/), which is the same high-performance engine that powers Chrome. The V8 engine itself is written in C++, and Node.js essentially provides a runtime environment around it. This architecture is key to understanding Node.js performance:

1.  **V8 Engine**: Compiles JavaScript to machine code using Just-In-Time (JIT) compilation techniques

2.  **[libuv](https://libuv.org/)**: A C library that handles asynchronous I/O operations

3.  **Core Libraries**: Many written in C/C++ for performance. That’s also why there are few significant performance differences between performance of database connectors used in Node.js, Go and Rust.

4.  **JavaScript APIs**: Thin wrappers around these native implementations

When people talk about Node.js, they often don't realize they're talking about a system where critical operations are executed by highly optimized C/C++ code. Your JavaScript often just orchestrates calls to these native implementations.

Fun fact: Node.js has been among the fastest web server technologies available for many years. When it first appeared, it outperformed many traditional threaded web servers in benchmarks, especially for high-concurrency, low-computation workloads. This wasn't an accident—it was by design.

### Memory-Bound vs. CPU-Bound

Node.js was specifically architected for web servers and networked applications, which are predominantly **memory-bound and I/O-bound** rather than CPU-bound:

**Memory-bound operations** involve moving data around, transforming it, or storing/retrieving it. Think of:

-   Parsing JSON payloads

-   Transforming data structures

-   Routing HTTP requests

-   Formatting response data

**I/O-bound operations** involve waiting for external systems:

-   Database queries

-   Network requests

-   File system operations

-   External API calls

For typical web applications, most of the time is spent waiting for these I/O operations to complete. A typical request flow might be:

1.  Receive HTTP request (memory-bound)

2.  Parse request data (memory-bound)

3.  Query database (I/O-bound, mostly waiting)

4.  Process results (memory-bound)

5.  Format response (memory-bound)

6.  Send HTTP response (I/O-bound)

In this workflow, actual CPU-intensive computation is minimal. Most web applications spend 80-90% of their time waiting for I/O operations to complete.

Node.js was optimised for precisely for this scenario because:

1.  **Non-blocking I/O**: While waiting for I/O operations, Node.js can handle other requests

2.  **C++ Foundation**: Memory operations delegate to efficient C++ implementations

3.  **Event Loop Efficiency**: Great at coordinating many concurrent operations with minimal overhead

Here's what many people miss: **I/O-intensive operations in Node.js work at nearly C-level speeds**. When you make a network request or read a file in Node.js, you're essentially calling C functions with a thin JavaScript wrapper.

This architecture made Node.js revolutionary for web servers. When properly used, a single Node.js process can efficiently handle thousands of concurrent connections, often outperforming thread-per-request models for typical web workloads.

It came essentially from the idea that multitasking, like in human tasks, is not always the optimal way of handling tasks. Synchronising multiple tasks and context switching adds overhead and does not always give better results. It all depends on whether a task can be split into smaller pieces that can be done concurrently.

## Where Node.js Faces Challenges: CPU-Bound Operations

The real performance challenges for Node.js are CPU-intensive tasks—like (welcome again!) compiling TypeScript. These workloads have fundamentally different characteristics from the web server scenarios for which Node.js was optimized.

**CPU-bound operations** involve heavy computation with minimal waiting:

-   Complex algorithms and calculations

-   Parsing and analyzing large files

-   Image/video processing

-   Compiling code

In these scenarios, the bottleneck isn't waiting for external systems—it's raw computational power and how efficiently the runtime can execute algorithms.

### The Single-Threaded Limitation

JavaScript was designed with a single-threaded event loop model. This model works best for handling concurrent I/O (where most time is spent waiting) but becomes problematic for CPU-intensive operations:

```typescript
// Pseudocode of how the Node.js event loop works
while (thereAreEvents()) {
  const event = getNextEvent();

  processEvent(event);  // If this takes a long time,
                        // everything else waits
}
```

When a CPU-intensive task runs, it monopolizes this single thread. During that time, Node.js can't process other events, handle new requests, or even respond to existing ones. It's effectively blocked until the computation completes.

This is why running a complex algorithm in Node.js can make your entire web server unresponsive—the event loop is busy with computation and can't handle incoming requests.

### The Event Loop

Writing efficient CPU-intensive code in JavaScript requires understanding and respecting the [event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#the-nodejs-event-loop). The code must be structured to yield control, allowing other operations to proceed periodically:

```typescript
//////////////////////////////////////////////
// Naive approach - blocks the event loop
/////////////////////////////////////////////

function processLargeData(data) {
  for (let i = 0; i < data.length; i++) {
    // Heavy computation that might take seconds
    processItem(data[i]);
  }
  return results
}
```

```typescript

//////////////////////////////////
// Event-loop friendly approach
//////////////////////////////////

async function processLargeDataChunked(data) {
  const results = []
  const CHUNK_SIZE = 1000

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE)
    // Process one chunk
    for (const item of chunk) {
      results.push(processItem(item))
    }
    // Yield to the event loop before processing the next chunk
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return results
}
```

This "chunking" approach works but introduces complexity and fundamentally changes how you structure your code. It's a very different programming model from languages with native threading, where you can write straightforward CPU-intensive code without worrying about blocking other operations.

For a complex application like the TypeScript compiler, this dance with the event loop becomes increasingly difficult to manage as the codebase grows.

Read also more:

-   [Node.js docs: the Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#the-nodejs-event-loop)

-   [MDN - JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)

## Compilers: The CPU-Intensive Beast

A compiler is practically the poster child for CPU-intensive workloads. It needs to:

1.  Parse source code into tokens and abstract syntax trees

2.  Perform complex type-checking and inference

3.  Apply transformations and optimizations

4.  Generate output code

These operations involve complex algorithms, large memory structures, and lots of computation—exactly the kind of work that challenges JavaScript's execution model.

For TypeScript specifically, as the language grew more complex and powerful over the years, the compiler had to handle increasingly sophisticated type checking, inference, and code generation. This progression naturally pushed against the limits of what's efficient in a JavaScript runtime.

## Threading Models Matter: Event Loop vs. Native Concurrency

The performance gap between the JavaScript and Go implementations isn't just about raw language speed—it's fundamentally about threading models and how they match the problem domain.

As mentioned, Node.js operates on an event loop model:

```text
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

This single-threaded approach means that for CPU-intensive work like compiling TypeScript, you need to write code that doesn't monopolize the thread. In practice, this involves breaking work into smaller chunks that can yield control back to the event loop.

For a compiler, this creates significant design challenges:

1.  **Artificial Fragmentation**: The natural flow of compiler phases (parse → analyze → transform → generate) needs to be broken into small steps that can yield.

2.  **Complex State Management**: Since processing is fragmented across event loop iterations, the compiler state must be carefully managed and preserved between yields.

3.  **Locality Disruption**: When the event loop processes unrelated tasks between compiler operations, CPU cache locality benefits are lost, hurting performance.

4.  **Dependency Challenges**: Compilers have complex interdependencies between components. Breaking a naturally sequential process to accommodate an event loop often requires complex coordination logic.

### Go: Native Concurrency with Goroutines

Go, by contrast, offers goroutines—lightweight threads managed by the Go runtime:

```text
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Goroutine│ │Goroutine│ │Goroutine│ │Goroutine│ ...  more
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     └───────────┴───────────┴───────────┘
                       │
              ┌────────┴────────┐
              │   Go Scheduler  │
              └────────┬────────┘
                       │
                ┌──────┴──────┐
                │  OS Threads │
                └─────────────┘
```

This model allows compiler phases to be naturally parallelized with minimal coordination overhead:

1.  **Natural Parallelism**: Different files can be parsed and type-checked concurrently.

2.  **Direct Thread Access**: CPU-intensive operations can run directly on threads without yielding.

3.  **Efficient Coordination**: Go's channels and synchronization primitives are designed to coordinate concurrent work.

4.  **Memory Efficiency**: Goroutines use minimal memory (a few KB each) compared to OS threads (MBs each).

In this model, file parsing, type checking, and code generation can all happen concurrently without explicit yield points. The code structure can more naturally follow the logical flow of compiler phases.

Read also more in:

-   [Goroutines: the concurrency model we wanted all along by Jay Conrod](https://jayconrod.com/posts/128/goroutines-the-concurrency-model-we-wanted-all-along)

-   [Threads and Goroutines by Shane Hansen](https://shane.ai/posts/threads-and-goroutines/)

## Same Code, Different Execution Model

**Anders Hejlsberg said they evaluated multiple languages, and Go was the easiest to port the code base into.** The TypeScript team has apparently created a tool that generates Go code, resulting in a port that's nearly line-for-line equivalent in many places. That might lead you to think the code is "doing the same thing," but that's a misconception.

![Theyre The Same Picture The Office GIF - Theyre The Same Picture The Office  Pam - Discover & Share GIFs](image-4.gif "Theyre The Same Picture The Office GIF - Theyre The Same Picture The Office  Pam - Discover & Share GIFs")

**The code may look the same but can behave very differently across languages due to their execution models.**

In JavaScript:

-   All code runs on a single thread with an event loop,

-   Long-running operations need to be broken up or delegated to worker threads,

-   Concurrent execution requires careful handling to avoid blocking the event loop.

In Go:

-   Code naturally runs across multiple goroutines (lightweight threads),

-   Long-running operations can execute without blocking other work,

-   The language and runtime are designed for concurrent execution.

When you port code from JavaScript to Go without changing its structure, you implicitly change how it executes. Operations that would block the event loop in JavaScript can run concurrently in Go with minimal effort.

This can lead to a conclusion: **when a direct port yields dramatic performance improvements, it might indicate that the original implementation wasn't fully optimized for JavaScript's execution model**.

Writing truly performant JavaScript means embracing its asynchronous nature and event loop constraints—something that becomes increasingly challenging in complex codebases like a compiler.

## But What About Worker Threads?

Some of you might be thinking:

> "Doesn't Node.js have [Worker Threads](https://nodejs.org/api/worker_threads.html) now? Couldn't they have used those instead of migrating to Go?"

It's a fair question. Node.js introduced the `worker_threads` module in v10 as an experimental feature became stable in v12 (mid-2019). Worker threads provide true parallelism in Node.js, allowing CPU-intensive tasks to run on separate threads without blocking the main event loop.

### How Worker Threads Work in Node.js

Unlike the single-threaded event loop that characterizes most Node.js applications, worker threads allow JavaScript to be executed in parallel:

```typescript
// main.js
const { Worker } = require('worker_threads')

function runWorker(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

// Run multiple CPU-intensive tasks in parallel
Promise.all([
  runWorker({ chunk: data.slice(0, middleIndex) }),
  runWorker({ chunk: data.slice(middleIndex) })
]).then(results => {
  // Combine results
})
```

```typescript
// worker.js
const { parentPort, workerData } = require('worker_threads')

// Perform CPU-intensive work
const result = processData(workerData.chunk)

// Send the result back to the main thread
parentPort.postMessage(result)
```

Each worker runs in its own V8 instance with its own JavaScript heap, allowing true parallelism. Workers communicate with the main thread (and each other) by sending and receiving messages, which can include transferring ownership of certain data types to avoid copying.

### Why Weren't Worker Threads the Solution for TypeScript?

So why might the TypeScript team have chosen to Go over retrofitting the existing codebase with worker threads? That we don’t know, but there are several plausible reasons:

1.  **Legacy Codebase Challenges**: The TypeScript compiler has been developing for over a decade. Retrofitting a large, mature codebase designed for single-threaded execution with a multi-threaded architecture is often more complex than starting fresh. Workers communicate primarily through message passing. Restructuring a compiler to operate this way requires fundamentally reimagining how components interact. The video showed that even single-threaded Go was faster, so the code would probably still require modification to better take care of event loop characteristics.

2.  **Data Sharing Complexity**: Workers have limited ability to share memory. A compiler manipulates complex, interconnected data structures (abstract syntax trees, type systems, etc.) that don't neatly divide into isolated chunks for parallel processing.

3.  **Performance Overhead**: While worker threads provide parallelism, they come with overhead. Each worker has its own V8 instance with separate memory, and data passed between threads typically needs to be serialized and deserialized. They are not as lightweight as threads or goroutines.

4.  **Timeline Mismatch**: When the TypeScript compiler was designed and implemented (around 2012), worker threads didn't exist in Node.js. The architecture decisions made early on would have assumed a single-threaded model, making later parallelization more difficult.

5.  **Dead-End Assessment**: The team may have concluded that even with worker threads, JavaScript would still impose fundamental limitations for their specific workload that would eventually become bottlenecks again.

6.  **Skill Set Alignment**: The decision may have partly reflected organizational expertise and strategic alignment with other developer tools.

### Go's Approach vs. Worker Threads

Go's approach to concurrency offers several advantages over Node.js worker threads for compiler workloads:

1.  **Lightweight Goroutines**: Goroutines are extremely lightweight (starting at ~2KB of memory) compared to worker threads (which require a separate V8 instance), making fine-grained parallelism more practical.

2.  **Shared Memory Model**: Go allows direct shared memory between goroutines with synchronization primitives, making working with complex, interconnected data structures easier.

3.  **Language-Level Concurrency**: Concurrency is built into Go at the language level with goroutines and channels, making parallel code more natural to write and reason about.

4.  **Lower Overhead Communication**: Communication between goroutines is significantly more efficient than the serialization/deserialization required for worker thread communication.

5.  **Mature Scheduler**: Go's runtime includes a mature, efficient scheduler for managing thousands of goroutines across available CPU cores.

Also, I think the migration to Go wasn't just about _"multithreading vs. single-threading"_ but about adopting a programming model where concurrency is a first-class concept, deeply integrated into the language and runtime.

## The Evolution Problem

When TypeScript started in 2012, the team made reasonable technology choices based on the context at that time:

-   TypeScript was a Microsoft project extending JavaScript, so using JavaScript made sense

-   The initial scope and complexity were much smaller

-   Alternatives like Go and Rust were still in their early days

-   The performance demands were more modest

Over time, TypeScript evolved from a relatively simple superset of JavaScript into a sophisticated language with advanced type features, generics, conditional types, and more. The compiler grew accordingly but remained built on foundations designed for a simpler problem.

This is a classic example of how successful software often faces scaling challenges that weren't anticipated in its early design. As the TypeScript compiler became more complex and was applied to larger codebases, its JavaScript foundations became increasingly restrictive.

Don’t you know that on your own?

**How is legacy code created? Day by day.**

## Outstanding Questions and Future Considerations

While the performance improvements from the Go migration are impressive, several important questions haven't been fully addressed in Microsoft's announcement:

### What About Browser Support?

TypeScript doesn't just run on servers and development machines and's used directly in browsers via various playground implementations and in-browser IDEs. How will Microsoft address this use case since Go doesn't run natively in browsers?

There are a few potential approaches:

1.  **WebAssembly (WASM)**: Compiling the Go implementation to WebAssembly could allow it to run in browsers. While WASM performance has improved dramatically, there would still be overhead compared to native Go.

2.  **Dual Implementation**: Microsoft might maintain a JavaScript version for browsers alongside the Go version for everything else. This would create challenges for feature parity and maintenance.

3.  **Browser-Specific Alternative**: They might create a streamlined browser-specific implementation with reduced functionality optimized for common playground scenarios.

4.  **Cloud Compilation**: Browser-based tools might send code to cloud endpoints running the Go compiler instead of performing compilation locally.

The announcement doesn't clarify their approach, and it's an important detail that will affect the TypeScript ecosystem.

### Feature Parity vs. Performance Trade-offs

It's worth noting that achieving performance improvements often involves trade-offs. One common approach is to reduce feature scope or complexity. While Microsoft claims they're maintaining full feature parity, we should watch carefully to see if any subtle behaviours change or if certain edge cases are handled differently.

Historical examples from other language migrations show that 100% identical behaviour is challenging to achieve. Some questions to consider:

-   Will all existing TypeScript error messages remain exactly the same?

-   Will every edge case in type inference behave identically?

-   Will compilation options and flags have the same effects?

-   How will performance optimizations affect type system corner cases?

The TypeScript team has a strong track record of backward compatibility, but a ground-up rewrite inherently carries risks of subtle behavioural changes.

### Extensibility and Plugin Ecosystem

TypeScript has a rich ecosystem of plugins and tools that extend the compiler. The migration to Go raises questions about the future of this ecosystem:

-   Will the plugin API remain compatible?

-   Will JavaScript/TypeScript-based plugins need to be rewritten in Go?

-   How will this affect the barrier to entry for creating TypeScript tooling?

These considerations will affect the broader TypeScript ecosystem beyond just compilation performance.

## Why This Matters Beyond TypeScript

This case study has broader implications for technology choices:

1.  **Match your technology to your problem domain**. CPU-bound tasks like compilers benefit from languages designed for computation and native threading. IO-bound tasks like web servers often work well with event-loop models.

2.  **Reconsider foundations as projects evolve**. What worked for a small project might become a constraint at scale. Be willing to revisit fundamental architecture decisions. Nothing’s wrong with a bold move, like rewriting if it’s needed. [But before you do it, read that first](/en/so-you-want-to-break-down-monolith/).

3.  **Look beyond headline performance claims**. A "10x improvement" often has multiple contributing factors beyond just the change in the technology stack.

4.  **Understand your runtime model**. Whether you use Node.js, Go, Rust, or any other environment, understanding how code executes is crucial for performance optimization.

## Looking Forward

As a TypeScript user, building Emmett and Pongo is good news. If I can get the compiler working faster “for free”, that’s sweet. But on the other hand, I don’t see why we make such noise and use clickbait as a way of bringing that to the development community.

Focusing on 10x without giving enough context just created friction (I mercifully skipped C# developers' cries of “why not C#?!“…).

That’s why I wanted to expand on this use case, as it offers valuable lessons about technology, language choices, performance optimization, and the evolution of successful projects.

The move from JavaScript to Go shouldn’t be taken as a confirmation that “Node.js is slow”. It’s better to look on that as a recognition that different problems call for different tools. JavaScript and Node.js continue to be good at what they were designed for: IO-intensive web applications with high concurrency needs.

Of course, it’d be better if Microsoft explained that in more detail, rather than making a clickbait claim, but this is the world we live in.

Check also previous releases on performance:

-   [Talk is cheap, show me the numbers! Benchmarking and beyond!](/en/talk-is-cheap-show-me-the-numbers/)

-   [On Performance Testing with Jarosław Pałka](/en/webinar-22-on-performance-testing/)

What do you think? Have you faced challenges similar to technology evolution in your projects? How did you tackle them? Did you ever get a 10x surprising improvement? How did you deal with that?

I'd love to hear your thoughts in the comments!

Cheers!

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).

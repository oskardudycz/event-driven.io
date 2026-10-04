---
title: 'When Logs and metrics are not enough: Discovering Modern Observability'
category: Software Architecture
cover: 2024-09-16-cover.jpg
author: oskar dudycz
redirectFrom: /when-logs-and-metrics-arent-enough/
---

![Catherine Coulson Dead: 'Twin Peaks' Log Lady Dies at 71](2024-09-16-cover.jpg "Catherine Coulson Dead: 'Twin Peaks' Log Lady Dies at 71")

**It's 2 a.m., and your phone rings. Your system is experiencing performance degradation.** Tasks are piling up in the queues, users are seeing timeouts, and your monitoring dashboard shows that the connection pool is at its limit. Your first instinct? Check the logs. But traditional logging gives you just a fragmented picture: messages without the broader context.

You're left wondering: What's really going on? Why are queues growing? Why are requests taking longer to process? Are there specific queries or requests that are slowing things down? And crucially, how do all these isolated problems connect?

**This is typically the moment when we realise that our system condition is not the easiest to diagnose.** It'd be great if we had more data and could understand the context and causation of what has happened.

**Understanding not just what went wrong but why and how is one of the foundational features of an observable system—and a system that's not a nightmare to run in production.** Nowadays, that's even more challenging. The complexity of our distributed systems is at its peak. Our problems are rarely isolated to one part of the stack. We need to correlate information from various places to diagnose the issues.

In the last two releases, we took a break and analysed how S3 could be used for more than storing files and how much it costs. Today, let's return to the previous series and discuss the typical challenges of distributed systems.

We'll continue to use managing a connection pool for database access as an example and discuss the issues and potential troubleshooting using modern observability tools and techniques like Open Telemetry, Grafana Tempo, etc.

See more:

-   [#189 - Mastering Database Connection Pooling](/en/architecture-weekly-189-mastering/)

-   [#190 - Queuing, Backpressure, Single Writer and other useful patterns for managing concurrency](/en/architecture-weekly-190-queuing-backpressure/)

-   [#191 - Is It Production Ready?](/en/architecture-weekly-191-is-it-production/)

-   [#192 - Talk is cheap, show me the numbers! Benchmarking and beyond!](/en/talk-is-cheap-show-me-the-numbers/)

**We'll explore how traditional monitoring approaches like logs and metrics fail and how observability—through traces, spans, metrics, and span events—gives you the full picture and helps you understand your system deeply.**

## **Connection Pool**

[As discussed in details earlier](/en/architecture-weekly-189-mastering/), a connection pool manages reusable database connections shared among multiple requests. Instead of opening and closing a connection for each request, we borrow a connection from the pool and return it after database operation.

Thanks to that, we're cutting the latency required to establish a connection and get a more resilient and scalable solution.

That's okay, but how do you know if it's working correctly? Let's start with the traditional approach to monitoring this setup: metrics and logs.

## **Traditional Monitoring with Metrics and Logs**

### **Metrics**

In a traditional system, metrics provide real-time, aggregated data that helps you track the overall health of your system. For example, in a connection pool, you could monitor the following key metrics:

1.  **Active connections:** This tells you how many database connections are currently in use out of the total available in the pool. It shows you whether the pool is nearing its maximum capacity.

2.  **Queue size:** The number of tasks waiting for a connection when all the active connections are in use. If the queue size starts growing rapidly, it's a sign that your system is under stress and tasks are getting delayed.

3.  **Connection wait time:** The average time a task spends waiting in the queue before acquiring a connection. This helps you understand the latency introduced by your connection pool and gives you a signal when tasks are waiting too long.

You can imagine the basic metrics dashboard:

```
Active connections: 95/100
Queue size: 12 tasks
Connection wait time: 200ms
```

It could be updated in real-time, brighter and shinier, with colours and animations, etc. Still, the value will be similar to those three lines of text.

Such a dashboard gives you an aggregated view of how your system is performing right now. If the queue size is growing or the wait time for acquiring connections increases, it's a red flag that something's wrong. However, these metrics are often too high-level to diagnose the root cause. You know what happened and that you need to take action, but you don't understand why.

### **Logs**

Along with metrics, logs are traditionally used to track events in real-time. You'd log information like:

1.  When a task enters the queue.

2.  When a connection is opened.

3.  When a query is executed.

4.  When a connection is released.

Example log entries for a connection pool might look like this:

```
INFO: Task enqueued at 12:01:03, queue size: 10
INFO: Connection acquired by Task 101 at 12:01:05
INFO: Query executed for Task 101 at 12:01:10, query time: 500ms
INFO: Connection released by Task 101 at 12:01:12
```

Logs give you granular details about what's happening in the system at a specific point in time. They allow you to trace individual events, but because they're fragmented, you often must piece them together manually to understand how a task moves through the system. And if you tried to correlate logs on production for a complex system, you're no longer laughing in the circus.

## **The Pitfalls of Metrics and Logs: Why They're Not Enough**

At first glance, metrics and logs seem sufficient for monitoring these systems, but they often don't give enough context to solve the problem quickly. They show you what's happening but not why or how. Let's break down some specific real-world challenges you might face with traditional metrics and logs.

### **Issue 1: Connection Pool Exhaustion**

You're monitoring a connection pool with a limit of 100 active connections, and suddenly, your metrics dashboard shows that all 100 connections are in use. The queue size is growing, and users are experiencing delays.

**Traditional metrics and logs might show you:**

-   All connections are in use.

-   The queue size is growing.

-   Connection wait times are increasing.

**You now know the symptoms, but you still don't know the root cause:**

-   Are there certain queries that are holding onto connections longer than expected?

-   Which tasks are being delayed in the queue, and how long have they been waiting?

-   Are there specific requests taking unusually long to complete?

**To diagnose the problem with logs, you would need to stitch together events for each task manually:**

1.  Find the log where the task entered the queue.

2.  Find the log where the connection was acquired.

3.  Track the query execution time from separate logs.

4.  Cross-reference multiple logs to figure out which requests are slow.

This manual process is slow and inefficient, especially in high-concurrency systems.

### **Issue 2: Long Query Execution Time**

You notice that queries take longer than expected to execute, contributing to the exhaustion of the connection pool. The logs show when a query was started and completed, but they don't tell you why it took so long. You might have logs that say:

```
INFO: Query executed for Task 102 at 12:02:00, query time: 2000ms
INFO: Connection released by Task 102 at 12:02:03
```

**But what's missing from this?**

1.  Why did the query take so long?

2.  Is it related to specific database tables or queries?

3.  Is it a systemic issue or just a one-off slow query?

The logs provide fragmented data, but they don't let you see the entire request lifecycle—how long the task spent waiting in the queue, how long it held the connection, and why the query was slow.

### **Issue 3: Task Starvation in Queues**

Imagine your system is queuing incoming requests, and you notice specific tasks get stuck in the queue for long periods. You're tracking queue size and connection usage, but something isn't adding up. Some tasks are being processed almost immediately, while others are waiting far too long.

**With metrics, you know the queue size is growing, but you can't see:**

1.  Which tasks are stuck in the queue the longest?

2.  Are certain tasks being prioritised incorrectly?

3.  What's the actual delay for each individual request?

Logs only show you when tasks entered the queue and when they were processed. They don't provide real-time visibility into why tasks are being delayed.

## **Moving Beyond Logs and Metrics with Observability**

You need observability to solve these problems and understand your system's entire lifecycle of requests. Observability goes beyond just gathering data - it's about understanding how different components interact and why things are happening. With observability tools like traces, spans, metrics, and span events, you can get a complete, real-time picture of what's happening inside your system.

Let's explain how observability tools like traces, spans, and span events give you this deeper insight.

## **What Is a Trace?**

A trace is like a call stack for distributed systems. It follows a request as it travels through multiple services and components, recording every important interaction along the way.

For example, in a connection pooling system, a trace would capture:

1.  When a request enters the queue.

2.  When the request acquires a connection.

3.  When the request makes a database query.

4.  When the connection is released back to the pool.

Instead of isolated events, a trace links them together to show the complete lifecycle of a request.

## **What Is a Span?**

A span represents a single step in that trace—a unit of work. Each span captures:

1.  **Start and end times:** When did the operation start and finish?

2.  **Attributes:** Metadata that adds context to the span (e.g., query type, queue size).

3.  **Events:** Milestones or important events that happen within the span (e.g., query failed, connection acquired).

Think of spans as the building blocks of a trace. They give detailed insights into specific parts of the request lifecycle.

The basic open telemetry setup can look as follows.

```
import { trace } from "@opentelemetry/api";

// setup tracer for connection pool
const tracer = trace.getTracer("connection-pool-tracer");

export class SimpleConnectionPool {
  // (...) rest of the code

  connect(): Promise<PooledConnection> {
    // start new span
    const span = tracer.startSpan("connect-to-database");

    return this.queueBroker
      .enqueue(({ ack }) => {
        const connection = this.openConnection(ack);
        // add attributes
        span.setAttribute("pool-size", this.activeTasks);
        return Promise.resolve(connection);
      })
      .then((connection) => {
        span.end(); // End span when connection is acquired
        return connection;
      })
      .catch((error) => {
        span.setStatus({ code: 2, message: error.message });
        span.end();
        throw error;
      });
  }
}
```

Don't worry. We'll get into the full instrumentation in the next article, but for now, let's focus on how we can use this data to investigate one of the issues outlined above.

Let's walk through a detailed example of how to slice and dice data using OpenTelemetry and [Grafana Tempo](https://grafana.com/docs/tempo/latest/) to diagnose a connection pool exhaustion issue. Tempo allows you to query traces and see the filtering results. Why Grafana Tempo? It's one of the most popular, mature OSS tooling, and I had to choose one for this article's needs. Other tools like Honeycomb are also capable of doing a similar investigations.

I'll guide you step-by-step through drilling into the traces, correlating spans, and finding the root cause. I'll try to showcase to you the interactive troubleshooting session on how to discover and fix problems using observability tooling.

### **Scenario: Diagnosing Connection Pool Exhaustion**

You're noticing intermittent slowdowns in your system, and the connection pool is hitting its limit. Users are seeing delays, and your logs show that the queue size is growing. Traditional logs and metrics show some insights, but you're unsure which queries or tasks are causing the connection pool to be exhausted.

### **Step 1: Visualising the Connection Pool Usage in Grafana**

You've already instrumented your connection pool and database queries with OpenTelemetry, and all the traces are being sent to Grafana Tempo. Your first task is visualising the traces related to connection pool usage and identifying unusually long connections.

**We can start by finding long-lived connections by querying all spans where the** _**connection-acquired**_ **span took longer than 1 second to release the connection.**

```
span.duration > 1000ms and name = "connection-acquired"
```

**You may find that several tasks are holding onto connections for longer than 1 second, particularly during peak times.**

The longest connection duration was around 5 seconds, which is likely contributing to the pool exhaustion.

These results suggest that some tasks are holding onto connections longer than they should. However, you still don't know why these tasks are taking longer to release connections or what is causing the delay.

### **Step 2: Drilling Down Into Specific Tasks**

Next, you want to see which specific tasks are holding connections for too long. You'll need to slice the data based on spans that are part of the _connect-task_ span (which wraps the connection lifecycle).

**We can drill down into specific tasks with long connection durations and correlate these long-lived connections by task ID to understand what operations are performed while the connection is being held.**

```
span.duration > 1000ms and name = "connection-acquired" | group_by task-id
```

**You see a list of tasks with their** `task-id` **and corresponding connection durations.**

One of the tasks _(task-id: 12345)_ stands out—it held onto the connection for 5 seconds. Now you know which task is problematic, but you need to dig deeper to understand what's causing the delay.

### **Step 3: Correlating with Query Execution Spans**

To understand what this task was doing while holding the connection, you'll need to correlate the task ID with the database query execution spans.

We need to find the long-running queries for _(task-id: 12345)_ by querying the `db-query` spans related to this task to see what queries were executed.

```
task-id = "12345" and name = "db-query"
```

You find that task 12345 executed a SELECT query on the orders table:

```
SELECT * FROM orders WHERE order_date > '2023-01-01'
```

**The span shows that this query took 3.5 seconds to execute, which is far longer than typical queries in your system.**

### **Step 4: Slicing the Query Data Further**

Next, you want to understand why this query is taking so long. To do this, you can drill down into attributes related to the query execution.

**You can analyse query duration and rows returned** by looking at the _db.rows\_returned_ attribute to see how many rows this query returned, as returning too many rows could be causing the slowdown.

```
task-id = "12345" and name = "db-query" | select db.rows_returned
```

**The query returned 50,000 rows, which explains why it took 3.5 seconds.** This query is pulling back far more data than expected, contributing to the connection being held longer.

### **Step 5: Correlating Connection Pool Exhaustion with Query Behavior**

Now that you've identified the problematic query, you want to check if this is a systemic issue or an isolated issue. You can run another query to see if similar queries are being run frequently and whether they're contributing to connection pool exhaustion.

We can try to find all long-running SELECT Queries on the orders table

```
name = "db-query" and db.table = "orders" and span.duration > 2000ms
```

**You may see that several tasks over the past few days have run similar** `SELECT` **queries on the** `orders` **table, each taking between 2-4 seconds.**

These queries are frequently executed during peak hours, leading to multiple tasks holding onto connections longer than expected.

### **Step 6: Identifying the Systemic Issue**

Now that you know the query pattern causing the problem, you can check if these long-running queries correlate with the times when the connection pool is fully utilised.

### **Query 6: Correlate Long-Running Queries with High Pool Utilization**

You can correlate the timing of these long-running queries with connection pool usage by querying for spans where the pool was under pressure.

```
span.duration > 2000ms and name = "db-query" and connection.pool.activeConnections > 90
```

**You may find a direct correlation: during peak usage, long-running SELECT queries on the orders table are causing the connection pool to hit its limit.**

### **Step 7: Solving the Problem**

Now that you've identified the root cause of connection pool exhaustion, the next step is to take action.

### **Solution: Optimise the Query**

You can optimise the query on the `orders` table by:

1.  Adding appropriate indexes to speed up retrieval.

2.  Limiting the number of rows returned by using pagination reduces the execution time significantly.

3.  Etc.

### **Summary**

The goal of this article was to showcase why traditional logging and metrics may no longer be sufficient for today's complex systems. Through the example of diagnosing connection pool exhaustion, we explored how observability 2.0—with traces, spans, and detailed metrics—can provide deeper insights into system behavior.

Of course, this is just a brief example, but I hope it gives you a sense of what's possible when you apply observability from the ground up and leverage modern tools like Grafana Tempo. While traditional metrics and logs show you the symptoms, observability lets you correlate data across services, pinpoint bottlenecks, and understand the context behind performance issues.

We've only scratched the surface here. This was a quick walkthrough, but it highlights the power of observability in real-world scenarios. In upcoming articles, we'll dive deeper into the exact setup, instrumentation techniques, and the trade-offs of adopting observability practices. Stay tuned for more detailed explorations on how to build a highly observable system from the ground up and how to make informed decisions about when to deploy it.

**And hey, dear reader, I'd like to learn where you'd like to go next. Your thoughts mean much to me, and I'd like to make it engaging for you! Please respond to this email, comment, or fill out this short survey: [https://forms.gle/1k6MS1XBSqRjQu1h8](https://forms.gle/1k6MS1XBSqRjQu1h8)!**

Cheers

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

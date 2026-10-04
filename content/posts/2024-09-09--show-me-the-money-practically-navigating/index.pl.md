---
title: Show me the money! Practically navigating the Cloud Costs Complexity
category: Software Architecture
cover: 2024-09-09-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

**[In my last article, I explored how Amazon S3’s new conditional writes feature can be used to implement a strongly consistent event store.](/en/using-s3-but-not-the-way-you-expected/)** I think that this feature opens up powerful architectural possibilities for distributed systems. But as much as we’d love to dive right into the code, there’s a bigger question to answer first: how much will it cost?

This article cannot be started in any other way than one of my favourite movie scenes:

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=IpwSXWq1wwU)`

_Show you the money! Not you, show me the money!_

We’ve all seen cloud bills get out of hand, often because the true infrastructure costs are harder to predict than they seem at first glance.

**Today, we’ll grab a calculator to discuss the costs of building an event store on S3.** I’m not an expert here; there are smarter and more skilled people than me. It might be that you’re one of them.

That’s why I’m counting on your feedback, not only the money. I will show you the money and me the money so you can see how I typically calculate, manage, and optimize the costs in the Cloud. That can be food for thought.

**You’ll see that this is not your typical “pay for storage and requests” breakdown.** We’ll examine the specific challenges of request patterns, working set size, DELETE operations, and load spikes and how to make smarter decisions based on AWS pricing models. I’ll use AWS, but similar calculations can and should be done for other cloud providers.

* * *

### **Using S3 Conditional Writes for Event Stores**

**Before we dive into the math equation, an [event store is a key-value database](/en/event_stores_are_key_value_stores/) where all business operations results are recorded as immutable events.** A traditional record is represented as a sequence of events called an event stream. Each operation loads all events from the stream, builds the state in memory and appends a new fact-event.

As event stores are databases, they should give strong consistency guarantees like supporting [optimistic concurrency](/en/optimistic_concurrency_for_pessimistic_times/). The new conditional writes feature was triggered if S3 can give such guarantees now, and it can! The _If-None-Match_ header support in S3 ensures that only a single event can be appended with a specific stream (record) version.

**As** _**If-None-Match**_ **header works only during the file creation, we need the following naming schema (or similar) to guarantee that:**

```
{streamPrefix}/{streamtType}/{streamId}/{streamVersion}.{chunkVersion}
```

Effectively, the new event is a new file in the S3 bucket. And S3 is not optimised for such usage, as it favours smaller amounts of bigger files. We discussed how to overcome that.

**The key design is around active chunks.** In this system, new events are written to a chunk (file) that remains active while being appended. A chunk can contain:

-   one or more events as a result of business operations,

-   stream metadata (id, version, etc.)

-   snapshot - full representation of our entity/aggregate.

Replaying all events from the beginning to rebuild an entity’s state can be costly regarding GET requests (as we’re paying for each request). To reduce this, the design incorporates snapshots, which store a full representation of the current state within a chunk. By fetching the latest snapshot, the system can avoid replaying the entire event history, minimizing the number of GET operations.

We also need to pay for PUT operation to append each event.

As each chunk will be named with an autoincremented stream version, we must pay for LIST to find the latest one.

**We also discussed compacting event stream data to reduce storage costs.** Chunks can be compacted periodically, meaning old events are merged and unnecessary chunks are deleted, further lowering storage and request costs. Sealed chunks can be deleted or moved to lower-cost storage tiers like S3 Intelligent-Tiering or S3 Glacier, reducing storage costs.

This approach leverages S3's conditional writes to ensure consistency and manages costs by strategically using snapshots, chunking, and storage tiers.

**So ok, how much will it cost?**

## Basic costs calculations

* * *

**When designing an event-sourced system, it’s easy to assume that keeping track of system changes is a cheap and neglectable cost nowadays.** You just log some events and store them, right? But what happens when your event payloads grow larger than expected? Suddenly, those small changes to event size can greatly impact your storage costs. Let’s break down three scenarios, starting with a common size of the events, then looking at what happens if things go wrong.

### **4KB Events: The Lean and Efficient System**

Let’s start with an efficient design. In this system, each event logs essential information about an **insurance claim**—claim creation, adjustments, approvals, and payments. It includes the necessary details like timestamps, customer info, and claim data. In such a case, 4KB on average should be enough to also keep snapshot and stream metadata (as snapshots should be trimmed to keep only data used in business logic; they don’t need complete information).

Here’s what the system could look like:

-   **500,000 active insurance policies**.

-   Each policy generates **1 claim per year**.

-   Each claim has **ten events** (e.g., submission, review, payment).

-   Total: **5 million events per year**.

-   1000 **GET** Requests: **$0,0004**

-   1000 **POST/PUT/DELETE/LIST** Requests: **$0,005**

#### **Costs for 4KB Events**

Let’s ignore the free tier and other promotions (for now). The costs could look as follows.

1.  **Storage**:

    -   5 million events per year × 4KB = **20GB of data per year**.

    -   417 thousand events per year × 4KB = **1,67 GB of icrement data per month**.

    -   S3 Standard storage: **$0.023 per GB per month**.

    -   Monthly increment cost: **$0.038** _(storage cost of new events within a month)_.

    -   Total accumulated yearly storage cost: **$2.99** _(we only pay for what we accumulate: 16.67 GB in the first month, 33.33 GB in the second, etc)_.

2.  **Requests**:

    -   **5 million GET requests** (one per event) = **$2**.

    -   **5 million PUT requests** (one per event) = **$25**

    -   **5 million LIST requests** (one per event) = **$25** (we need it to find the active stream chunk)

**Total Year 1 Costs**:  
Storage: **$2.99**  
Requests: **$52**  
**Total**: **$54,99**

### **40KB Events: things start to escalate**

While 4KB events are a more reasonable size for most event sourcing systems, it’s possible that due to poor design, additional (meta)data, or overly verbose data formats, events could balloon to 40KB. I wrote about this in [Anti-patterns in event modelling - I'll just add one more field](/en/i_will_just_add_one_more_field/).

#### **Costs for 40KB Events**

1.  **Storage**:

    -   5 million events per year × 4KB = **20GB of data per year**.

    -   417 thousand events per year × 4KB = **1,67 GB of icrement data per month**.

    -   S3 Standard storage: **$0.023 per GB per month**.

    -   Monthly increment cost: **$0.38** _(storage cost of new events within a month)_.

    -   Total accumulated yearly storage cost: **$29.90** _(we only pay for what we accumulate: 16.67 GB in the first month, 33.33 GB in the second, etc)_.

2.  **Requests**:

    -   **5 million GET requests** (one per event) = **$2**.

    -   **5 million PUT requests** (one per event) = **$25**

    -   **5 million LIST requests** (one per event) = **$25** (we need it to find the active stream chunk)

**Total Year 1 Costs**:  
Storage: **$29.90**  
Requests: **$52**  
**Total**: **$81,90**

It’s visible that the request costs stay the same, and that’s a significant power of S3. You don’t pay the transfer cost as long as you stay inside the AWS network.

Still, it’s visible that storage costs went ten times higher, going above the request cost. Let’s check the next scenario.

* * *

### **400KB Events: The Worst-Case Scenario**

Now, let’s assume something went **wrong** in the design process. Instead of storing references to large documents (like PDFs or images), someone **included** the entire file **within each event**. The event size skyrockets to **400KB**—an inefficient bloat.

As with S3, math is relatively simple; we can multiply previous results by 10 and get:

**Total Year 1 Costs**:

Total Storage: 200GB  
Storage: **$299**  
Requests: **$52**  
**Total**: **$351**

Now, the storage costs skyrocketed.

## Optimising storage costs

* * *

**The key lesson is that storage costs grow with event size, but request costs stay flat.** Also, the event number adds to both the request and storage costs.

Notice that the request costs remain the same no matter how much the event size increases. AWS charges for requests based on the number of PUT, GET or LIST operations, not the size of the data being sent or retrieved. This means your **request costs remain flat**, but your **storage costs balloon** as your event size grows.

If you stick with 4KB events, storage costs are tiny. However, as we saw in the 40KB and 400KB examples, larger events can increase your storage costs by 10x or even 100x.

Here are the things we can learn from it:

1.  **Bad Design Leads to Huge Cost Jumps.** What if you miscalculate or don't optimize your event sizes early on? A seemingly small design oversight—like storing entire PDFs or unnecessary metadata within the event—can turn into a massive cost later. Going from 40KB to 400KB isn't just bad practice; it’s a 100x increase in storage costs. This is why it's critical to validate event sizes early and often.

2.  **Ask the Business for Real-World Examples.** Before designing your event-sourced system, get real-world data from the business. What kind of events are you storing? How much data really needs to be captured? Without examples, you might overestimate how much data each event needs to carry, which could lead to inflated storage costs.

3.  **Use the Claim Check Pattern for Large Files.** In cases where you need to store large files (e.g., PDFs or high-resolution images for an insurance claim), you should never store them directly inside the event. Instead, use the Claim Check Pattern. Store the file in a separate S3 bucket and include a reference (such as a URL or ID) in the event. This keeps your event payloads small and your storage costs under control.

    For example, instead of embedding a **400KB PDF** in the event, store the PDF in a separate bucket and add a link like this:

    ```
    {
      "document_url": "s3://insurance-bucket/claim12345/document.pdf"
    }
    ```

    This approach dramatically reduces the size of your events and saves you from the inflated costs we saw in the **400KB scenario**.

**Never Underestimate the Impact of Event Size.** Event size is more than a technical detail—it’s a cost driver that can make or break your budget. A well-designed system with small events will keep costs low, but if you let event sizes balloon due to poor design choices, your storage costs can spiral out of control.

That's okay, but what do we do about that? What if we choose a data storage format other than JSON?

### Dropping JSON format

While we've been using JSON for our event storage examples so far, it's important to understand that JSON, while widely used, isn't always the most optimal format for storage efficiency and performance. Let's break down why JSON is commonly chosen and why you might consider switching to something more efficient, like [Parquet](https://parquet.apache.org/).

#### **Why JSON is Popular**

JSON is often the default choice for event sourcing because:

-   **Human-readable**: It’s easy to read and write, which makes debugging and inspecting data simple.

-   **Flexible**: It can handle nested structures (like objects within objects) without much effort, making it a good choice for complex event payloads.

-   **Widely supported**: Almost every modern language, framework, and tool can handle JSON.

However, **JSON comes with significant downsides**, especially when it comes to **storage size** and **efficiency**:

-   **Inefficient use of space**: JSON stores data in a very lengthy manner. Every field name is repeated for each event, and there’s no compression, which leads to **significant storage bloat**.

-   **Slow to parse**: JSON can be slow to read and write at scale, especially when dealing with large event payloads.

#### **Parquet: A More Efficient Format**

**On the other hand, Parquet is a columnar storage format highly optimized for both storage efficiency and query performance.** Parquet is especially useful when dealing with large datasets and doesn’t need the events to be human-readable. Here’s why you might want to use Parquet instead:

-   **Compressed and space-efficient**: Parquet compresses your data, which can **significantly reduce storage costs**. You often see **3x to 10x** reductions in storage compared to JSON.

-   **Optimized for queries**: Since Parquet is a columnar format, it’s very fast to query specific fields across large datasets. This makes it perfect for analytics or batch processing.

-   **Great for structured data**: If your events follow a consistent structure, Parquet excels at storing them compactly and efficiently.

However, Parquet has its downsides:

-   **Not human-readable**: Unlike JSON, Parquet is not easy to inspect manually, which makes it more difficult to debug or directly read the data without using specific tools.

-   **Overhead for small files**: Parquet is optimized for large-scale data. Using it for small, individual event files can introduce overhead, so it’s best to batch events together or handle large data sets in a query-friendly way.

See also example benchmarks:

-   [Artemiy Kzr - File formats comparison: CSV, JSON, Parquet, ORC](https://gist.github.com/kzzzr/837645284f8dfe879193997fa9632a65)

-   [Norbert Orzechowicz - Parquet vs Json - PHP Benchmark](https://gist.github.com/norberttech/fa00afa021520be34299f3a2b8f164b3?permalink_comment_id=4752698)

-   [Athena Performance Comparison: Avro, JSON, and Parquet](https://medium.com/data-engineering-chariot/athena-performance-comparison-avro-json-and-parquet-2b13c5090cc)

Still, our data is structured; we don’t need to make it human-readable (if we do, we can use, e.g. [DuckDb S3 with Parquet support](https://duckdb.org/docs/extensions/httpfs/s3api.html)). We need to cut costs, right?!

* * *

### **Redoing the Cost Analysis with Parquet Format**

Let’s now see how switching from JSON to Parquet affects your costs. For simplicity, we'll assume that Parquet offers 5x compression compared to JSON, which is a typical figure when dealing with structured data.

Let’s do some math again. The request cost will stay the same (obviously), but the storage cost will become five times smaller:

**4KB events - Total Year 1 Costs**:  
Storage: **$0,60**  
Requests: **$52**  
**Total**: **$52,60**

**40KB events - Total Year 1 Costs**:  
Storage: **$5,98**  
Requests: **$52**  
**Total**: **$57,98**

**400KB events - Total Year 1 Costs**:  
Storage: **$59,80**  
Requests: **$52**  
**Total**: **$111,80**

**Switching to Parquet for your event storage provides significant cost savings, especially when dealing with large event payloads.** The storage cost reduction is dramatic because Parquet compresses data efficiently, and the larger the payload, the more you save. This should also decrease the costs as time goes.

It sounds like we have a winner! Ok, but didn’t we forget about something?

## **Hot, Warm, and Cold Storage: Why It Matters**

Ok, so we understand the basic costs from our previous analysis, and it's clear that storage costs are one of the highest factors to manage. Let’s now explore optimising those costs by leveraging different S3 storage tiers. But before we get into the specific strategies for our case, let's first explain the concept of **hot, warm, and cold storage and why it matters in (cloud) architecture.**

We can categorise data into hot, warm, and cold storage based on access frequency and retrieval speed. Understanding this categorization is crucial for optimizing both **performance** and **cost**:

-   **Hot Storage** is the storage tier for frequently accessed data, usually for business logic and UI. It requires low-latency retrieval and updates, which is essential for real-time data. Because of its low latency needs and frequent updates, it usually costs the most.

-   **Warm Storage**: Warm storage is a middle ground for data accessed occasionally but not frequently enough to justify the high cost of hot storage. It balances cost and retrieval speed, making it ideal for data that are needed periodically but not constantly. This can be data kept for legal reasons (e.g. it won’t be typically updated, but we should allow someone to do it).

-   **Cold Storage**: This tier is for infrequently accessed data, such as archives or backup data, needed only for audits or legal compliance. Cold storage is the cheapest option but comes with longer retrieval times and slower performance.

**Why It’s Important**: By segmenting your data into these storage tiers, you can significantly reduce your costs without compromising on the performance where it’s needed. Let’s see how these concepts apply to our specific **event-sourced system**.

### **Stream Compaction Further Reduce Costs**

In the previous article, we introduced the concept of **active chunks** in the context of our event-sourced system built on S3.

Here’s how it works:

-   **Active Chunk**: Each time a new event is appended, it is written to an **active chunk**. This chunk is regularly accessed for both reads and writes, so it needs to be stored in a tier that supports fast access. It remains “active” as long as new events are added.

-   **Sealed Chunks**: Once an active chunk is **sealed** (i.e., a new active chunk is added), it becomes less frequently accessed. However, it may still be accessed if we need to replay historical events (for example, to rebuild the state after a snapshot is invalidated). Sealed chunks are the perfect candidates to move to warm storage, where the cost is lower, but access is still reasonably fast.

-   **Archived Chunks**: Over time, chunks that are never accessed (e.g., past data needed only for legal or audit purposes) can be moved to **cold** storage. This allows us to archive the data at the lowest possible cost while keeping it available.

As we manage the event streams, chunks grow over time. This can lead to increased costs without proper strategies due to the volume of GET requests required to replay events or retrieve historical data. **To address this, we can use a technique called stream compaction (or tombstoning).**

I talked about it in:

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=7NGlYgobTyY)`

And explained in my article: [How to deal with privacy and GDPR in Event-Driven systems](/en/gdpr_in_event_driven_architecture/). But let’s give a short TLDR.

**Stream compaction** refers to merging multiple older chunks into one larger chunk. This reduces the number of objects stored in S3, leading to fewer GET requests when accessing historical data.

In some business contexts, such as financial data or **claims processing**, we can use a **Closing the Books** strategy to summarize the state of a stream at regular intervals (e.g., annually). After this summary, new events are kept only for the next time period, reducing the amount of historical data needed.

**Instead of keeping all historical data accessible, you can summarize older data and archive it, reducing both storage costs and access costs.** We could create a summary of the claim at the end of each fiscal year. Then, we can move the data from the previous year into cold storage and only access it if an audit or a legal request is made.

### **Cost Optimization Using S3 Storage Tiers**

Let’s explore each chunk type's different S3 storage tiers (active, sealed, and archived) and calculate the potential savings.

#### **1\. Hot Storage: Active Chunks in S3 Standard**

Active chunks must be kept in **S3 Standard** because they require **fast, low-latency access** for frequent writes and reads. Storing active chunks in S3 Standard ensures that our system remains responsive during real-time operations.

-   **Cost**: $0.023 per GB/month.

-   **Access**: Low-latency, frequent reads and writes.

Assume that our active chunk holds **200GB** of data at any time.

-   **Storage cost**: 100GB × $0.023 = **$4.60/month**.

This cost is manageable for the active chunk, but if the data remained in S3 Standard long-term, it would become inefficient. That’s why moving sealed chunks to more cost-effective tiers is critical.

#### **2\. Warm Storage: Sealed Chunks in S3 Intelligent-Tiering**

Once a chunk is sealed, we can reduce costs by moving it to **S3 Intelligent-Tiering**. Intelligent-Tiering automatically shifts data between the frequent and infrequent access tiers based on usage patterns. It helps lower costs for data that isn’t accessed often but still provides reasonable access speeds.

-   **Cost**: $0.023 per GB for frequent access and $0.0125 per GB for infrequent access.

-   **Access**: Automatic tiering depending on access patterns.

Assume you have **200GB** of events, and 90% of this data becomes infrequently accessed over time (so sealed).

-   **Frequent access**: 20GB × $0.023 = **$0,46/month**.

-   **Infrequent access**: 180GB × $0.0125 = **$2,25/month**.

-   **Total storage costs**: **$2.71/month**.

This represents a **41% reduction** in storage costs compared to keeping everything in S3 Standard.

#### **3\. Cold Storage: Archived Data in S3 Glacier or Deep Archive**

Archived event streams that we need to retain for auditing or compliance but rarely access can be moved to **S3 Glacier** or **S3 Glacier Deep Archive**. These tiers offer the lowest storage costs but longer retrieval times, which is acceptable for long-term archival data.

-   **Cost**: $0.004 per GB/month for Glacier, and $0.00099 per GB/month for Glacier Deep Archive.

-   **Access**: Long retrieval times (minutes to hours), suitable for rarely accessed data.

Assume you archived the last year's data of **100GB** of data in **S3 Glacier**.

-   **Storage cost**: 200GB × $0.004 = **$0.8/month**.

If you move some of this data to **S3 Glacier Deep Archive** for even lower costs, you can further reduce the expense:

-   **Storage cost for 200GB in Deep Archive**: 200GB × $0.00099 = **$0.198/month**.

This dramatically reduces storage costs for long-term data that rarely needs access.

* * *

### **DELETE Requests vs. Moving Data to Lower Tiers**

Why don’t we just delete data? We could do it if we don’t need them for legal reasons, but… Here is the warning: we may fall into unexpected costs. We already included the LIST request in our calculations. It can be easily overlooked as a detail, but it can cost a lot. The same goes for DELETE operations.

S3 charges **$0,005 per thousand DELETE requests**, which is the same cost as appending a new event. Effectively, that doubles the append cost. However, frequent deletions can add up if you regularly compact and clean old chunks. Even if we do batch operations, it’ll charge us per chunk.

What if we just let it sink into cheaper storage (S3 Glacier or S3 Intelligent-Tiering)? We’ll also need to pay for that. The **transition** costs are —**$0.05 per 1,000 objects** when moving to Glacier. So, it’s ten times higher than deletion.

As always, pick your poison.

* * *

## **Handling Traffic Spikes and Partitioning Strategy**

**S3’s pricing model works in your favour during spikes. It’s request-based and storage-based, so you're not hit with additional costs just because traffic increases.** However, the real risk during traffic spikes is S3 throttling—where too many requests in a short time can lead to _503 Slow Down_ errors. This won’t increase your costs directly, but it’s an operational challenge you need to manage.

Previously, we discussed the importance of structuring object keys to manage concurrency and versioning. The same approach can help you handle traffic surges without hitting throttling limits.

Here are some **partitioning strategies** to distribute your load more effectively:

#### **1\. Partition by Tenant**

If you run a **multi-tenant** system, separating each tenant’s data reduces the chances of one tenant’s spike affecting others. For example:

```
s3://tenantA-bucket/orders/ORD-293e/001.parquet
s3://tenantB-bucket/orders/ORD-293e/002.parquet
s3://tenantB-bucket/orders/ORD-f354/001.parquet
```

By isolating tenants in separate partitions, you ensure better performance and avoid **hot partitions** during surges.

#### **2\. Partition by Module or Feature**

For systems that manage **multiple business areas** (e.g., orders, payments, and shipments), partitioning by module helps spread the load. For example:

```
s3://policies-bucket/tenantA/POL-mmc6/001.parquet
s3://claims-bucket/tenantB/CLA-9jnvj/001.parquet
s3://payments-bucket/tenantA/PAY-12f3/001.parquet
s3://payments-bucket/tenantB/PAY-fk98/001.parquet
s3://payments-bucket/tenantB/PAY-fk98/002.parquet
```

This approach ensures that spikes in one module (say, orders during Black Friday) don’t overwhelm the entire system.

#### **3\. Time-Based Partitioning**

For systems with heavy **batch processing** or time-sensitive data, partitioning by time (year/month/day) is an effective way to reduce hot spots and organize data logically:

```
s3://2023-bucket/tenantA/POL-mmc6/001.parquet
s3://2024-bucket/tenantA/POL-mmc6/002.parquet
s3://2024-bucket/claims/tenantB/CLA-9jnvj/001.parquet
s3://2025-bucket/budget/tenantB/BUD-gdh83/002.parquet
```

* * *

## Cutting the number of requests

**We cannot easily cut the number of GET and PUT requests without using a cache.** But in our case, that won’t help much as the typical case for transactional operation is that you get the state, run business logic and update it. Each update invalidates the previous state. Even though in Event Sourcing you don’t update the state but append the event, then in our case, we’ll be appending to the new chunk, invalidating the previous one. If we had much more reads than writes, we could benefit from the connection of AWS Cloudfront caching to S3, but it costs 0.0075$ per 1000 HTTP requests, so even more than regular S3. It’d work if we had a huge payload, but our chunks will be small.

If we have a stateful backend or frontend, we can cache the information about the latest chunk (so the record plus its version). For example, when a new event is appended, cache the name of the active chunk and the version, setting a time-to-live (TTL) for the cached value. If we frequently update the same record, the LIST requests could be lowered, as we could go directly to the active chunk. Even if our cache is invalid, the conditional writes mechanism won’t allow us to modify the state with a stale version.

We could also use DynamoDb to store the information about the active chunk. If data is small, then an additional request to DynamoDB can be cheaper than a LIST request to S3.

* * *

### **Future Cost Improvements: IF-MATCH and Beyond**

We’re currently working within the limitations of **If-None-Match** conditional writes, which work well for creating new versions of objects but complicate updating existing ones. If AWS introduces **IF-MATCH** support (which lets us update an object only if it matches a specific version), this could simplify the architecture dramatically.

Here’s how:

-   **Lower LIST costs:** We wouldn’t need to append a new file each time. We could just update the same file representing the stream. We could benefit from [built-in S3 versioning capabilities](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html). Our ID wouldn’t be built from stream ID and autoincremented version, but just stream ID, making it fully predictable.

-   **Lower DELETE costs**: No more need for frequent cleanup of old event chunks. We could just decommission older versions.

-   **Easier caching**: Fewer invalidations since you’d have more control over updates.

This would reduce request costs significantly, allowing for a cleaner and more efficient event store design.

**While we don’t have this feature yet, it’s worth watching, as it could lead to substantial cost savings.**

### **Load Testing FTW**

Even with all the math, you’ll never know the true costs of running an S3-based event store until you **test it in the real world**. **Load testing** will give you the hard data you need to make better decisions.

Set up tests to simulate **peak traffic**, **high-write scenarios**, and **spikes in reads**. This will help you:

-   Identify **hidden costs** that aren’t obvious in theoretical calculations.

-   Fine-tune your architecture for both performance and cost.

-   Avoid **unexpected bills** by catching inefficiencies early.

For example, a load test might reveal that your caching strategy is insufficient, causing unnecessary GET requests that drive up your costs. Or, it might show that your DELETE operations are happening more frequently than expected, increasing the operational overhead.

* * *

### Wrapping Up: Cost Management as an Ongoing Process

**Estimating cloud costs is inherently challenging.** As we’ve seen in this article, **even a seemingly straightforward system like an event store on S3 involves multiple cost drivers—from storage and request operations to data access patterns and lifecycle management.** This example illustrates a broader point: cloud cost management requires a deep understanding of how architectural decisions impact expenses.

Here are some guiding principles to help you approach cost management strategically:

1.  **Request Costs vs. Storage Costs**: In our example, we found that request costs (PUT, GET, LIST, DELETE) can often outpace storage costs, especially as traffic increases. This holds true for many cloud architectures. Understanding when and where your system generates the most requests is crucial to keeping costs under control. Design systems that optimize for storage efficiency and operational cost rather than focusing on one aspect in isolation.

2.  **Optimize Storage Based on Access Patterns**: The investigation into S3 tiers (Standard, Intelligent-Tiering, Glacier) shows how access frequency affects cost. This concept of “hot,” “warm,” and “cold” data can be applied to many systems beyond event stores. Choose your storage tiers based on actual usage patterns to avoid paying for unnecessary performance.

3.  **Lifecycle Management and Data Cleanup**: Managing data deletions, compaction, and tiering—like we discussed with event stream compaction—are crucial to keeping long-term costs down. Automating transitions between storage classes or deleting obsolete data can dramatically reduce storage overhead, but these decisions need to be weighed against the potential cost of requests and transitions. Every architectural choice, like managing DELETE requests or deciding when to compact data, affects the bottom line.

4.  **Test for Real-World Conditions**: Load testing is a key practice for understanding true cost drivers in cloud environments. As our exploration shows, the theoretical calculations are only part of the picture—testing reveals hidden costs, whether they stem from unexpected GET requests, cache inefficiencies, or the need to scale up for traffic spikes. Simulating realistic traffic is essential to accurately predicting your system’s long-term costs.

5.  **Continuous Cost Monitoring**: Cloud platforms evolve, as do workloads and traffic patterns. As our investigation shows, even small architectural changes (e.g., switching from JSON to Parquet) can lead to significant cost savings. Regularly monitoring and revisiting your cloud strategy is key to staying efficient, whether by adopting new services or optimizing existing ones.

**The goal of this article was not just to analyze the cost of a specific event store design on S3 but to demonstrate how to approach cloud cost management more generally.** Each architectural decision, from choosing data formats to managing storage tiers and optimizing requests, directly impacts your cloud expenses.

By applying the same thought process—identifying key cost drivers, modeling different scenarios, testing under load, and continuously refining your strategy—you can tackle cost optimization across any cloud-based architecture. Cloud cost management is not a one-time effort but an ongoing adaptation, testing, and refinement process.

**In the end, understanding the real cost of cloud services requires a holistic view, one that balances performance, scalability, and efficiency.** This ensures that your infrastructure not only meets your operational needs but does so cost-effectively.

**You can also check my small spreadsheet with calculations: [https://docs.google.com/spreadsheets/d/1GeMM3C8EYpSQJMFjcXt-xa4xp61LQ3E1dHEzWraErZ0/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1GeMM3C8EYpSQJMFjcXt-xa4xp61LQ3E1dHEzWraErZ0/edit?usp=sharing)**

As I said in the beginning. Feel free to share your thoughts and ideas and discuss them under the article or in our community Discord channel!

**I’m happy to be proven wrong!**

Cheers

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

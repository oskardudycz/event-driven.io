---
title: PostgreSQL partitioning, logical replication and other Q&A about PostgreSQL Superpowers
category: Software Architecture
cover: 2025-09-15-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

Welcome to the new week!

Last Tuesday, I did a new version of the “PostgreSQL Superpowers” webinar, thanks to the invitation from the good folks at [Particular](https://particular.net/). It’s available here:

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=cGy2XinTbkQ)`

Or check:

-   [The previous version I did here for our webinar](https://www.architecture-weekly.com/p/webinar-10-postgresql-superpowers),

-   [The article going through the same narrative](/en/postgres_superpowers/),

-   [complete source code of what I showed during the webinar](https://github.com/oskardudycz/postgres-for-dotnet-dev).

I’m happy with how it went, as looking at the number of questions, I managed to pique people's curiosity about this topic!

**Curious enough, that I didn’t manage to cover all the questions during the webinar, which is why I decided to answer them today as part of my humble newsletter.**

I encourage you to watch the recording, but to recap what I showed:

-   PostgreSQL is not only a rock-solid Open Source database, but also how rich the plugin ecosystem is, and how that impacts its success

-   native PostgreSQL partitioning for efficient data storage management,

-   How to compose plugins like [Timescale](https://www.linkedin.com/company/timescaledb/) for time series data, PostGIS for spatial data (GPS tracking, etc.).

-   In general, how can plugins cut the time needed to deliver essential features

-   Automate reporting with continuous aggregations without having to poll the database

-   Stream database changes in real time by using logical replication as a push-notification system

-   Detect issues as they happen, for example, spotting unusual fleet activity, without constant polling

All of that is based on the simple, but real-world app of tracking business trips and managing reporting and alerting around them.

Ok, let’s move into the questions that I didn’t manage to cover during the webinar.

## Questions & Answers

### Partitioning

> **Michał:** _How many partitions is too much partitions? talking about weekly partitions for ~10 years?_

If we follow the example from our webinar, the trips table looks like this:

```
CREATE TABLE trips (
    trip_time TIMESTAMPTZ NOT NULL,
    vehicle_id INT NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    distance_kilometers NUMERIC(10,2) NOT NULL,
    fuel_used_liters NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (trip_time, vehicle_id)
) PARTITION BY RANGE (trip_time);

-- setup partitions for year

DO $$DECLARE
    month_start_date DATE := '2023-01-01';
    month_end_date DATE := '2023-12-01';
BEGIN
    WHILE month_start_date < month_end_date LOOP
        EXECUTE format('
            CREATE TABLE trips_%s PARTITION OF trips
            FOR VALUES FROM (%L) TO (%L);',
            TO_CHAR(month_start_date, 'YYYY_MM'),
            month_start_date,
            month_start_date + INTERVAL '1 month'
        );
        month_start_date := month_start_date + INTERVAL '1 month';
    END LOOP;
END$$;
```

Then, if we partition it by time, we’d get in 10 years:

-   month - 120 partitions (12 \* 10),

-   week - 520 partitions (52 \* 10),

-   day - 3650 partitions(365 \* 10).

Obviously, 520 and 3650 sound like potentially a lot and should raise our eyebrows. PostgreSQL can handle up to a few thousand partitions fairly well, provided that typical queries allow the query planner to prune all but a small number of partitions. But here's the catch - each partition requires its metadata to be loaded into the local memory of each session that touches it. See the nice research on how the number of partitions can impact performance: [Partitioning in Postgres and the risk of high partition counts](https://pganalyze.com/blog/5mins-postgres-partitioning).

Nevertheless, we may notice that for our case, partitions fall into three groups:

-   **current partition** - where new trips are added,

-   **active period partitions** - e.g., the last 3 months, that are interesting for us from the alerting and reporting needs or maybe filling back missing trips,

-   **old partitions** - those that we don’t touch at all, or sporadically (e.g. older than 3 months).

This split is also essential from the perspective of another question:

> **Serge:** _Is there a notion of hot partition?_

Yes, depending on our scenarios, some partitions may be the most used. That’s also why partition planning is critical, and it should be also made based on the business scenario. For our case, we should definitely care and keep focus on the current partition (the hot one, as it’s the most often used), and the active period.

What about the rest? They can be moved either to cheaper, slower storage. PostgreSQL allows this through setting up a so-called _[Tablespace](https://www.postgresql.org/docs/current/manage-ag-tablespaces.html)._

We can do it by calling a SQL statement:

```
-- Create cheap storage
CREATE TABLESPACE cold_storage LOCATION '/mnt/slow_disk';

-- detach partion
ALTER TABLE trips DETACH PARTITION trips_2025_01;

-- set cheaper disk for this table
ALTER TABLE trips_2025_01 SET TABLESPACE cold_storage;
```

We could also use the [pg\_partman](https://github.com/pgpartman/pg_partman) extension to automate it:

```
-- Tell partman to keep only 2 years attached
UPDATE partman.part_config
SET retention = '3 months',
    retention_keep_table = true  -- detach but don't drop
WHERE parent_table = 'public.trips';

-- Run maintenance (or let background worker do it)
SELECT partman.run_maintenance();
```

That also answers the next question:

> **Karol:** _How can we “move” older partitions to some less available/slower storage? Is available in postgres itself or some postgres cloud providers?_

So it’s a native mechanism, but supported in the Cloud RDSes (also pg\_partman is usually available there).

Worth noting is that detaching means removing a partition from the parent table while keeping it as a standalone table. The detached partition continues to exist as a standalone table, but no longer has any ties to the table from which it was detached. [Read more in the partitioning docs](https://www.postgresql.org/docs/current/ddl-partitioning.html).

We can attach it again, if we want, or just delete the content or even the whole partition table if we don’t need to access it.

That’s also important for the next question:

> **Matteo:** _what about a time range query? like time >= x AND time < y?. will Postgres touch only the relevant partitions?_

Yes, PostgreSQL uses partition pruning to automatically skip irrelevant partitions when you query with conditions on the partition key.

Here's how it works with our trips table when using the [Explain tool](https://www.postgresql.org/docs/current/sql-explain.html):

```
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM trips
WHERE trip_time >= '2025-06-15'
  AND trip_time < '2025-07-15';
```

We’ll get something close to:

```
Append  (cost=0.00..241.00 rows=4800 width=64) (actual time=0.015..0.467 rows=4752 loops=1)
  Subplans Removed: 10    -- ← 10 partitions skipped
  ->  Seq Scan on trips_2025_06  (cost=0.00..48.20 rows=1200 width=64) (actual time=0.014..0.128 rows=1188 loops=1)
        Filter: ((trip_time >= '2025-06-15'::timestamp) AND (trip_time < '2025-07-15'::timestamp))
  ->  Seq Scan on trips_2025_07  (cost=0.00..48.20 rows=1200 width=64) (actual time=0.012..0.115 rows=1176 loops=1)
        Filter: ((trip_time >= '2025-06-15'::timestamp) AND (trip_time < '2025-07-15'::timestamp))
```

PostgreSQL will only query (scan) partition tables _trips\_2025\_06_ and _trips\_2025\_07_ because our date range spans mid-June to mid-July. The other 10 monthly partitions were pruned away. Pruned means skipped.

Two types of pruning occur:

-   **Planning time pruning** - when query values are constants (like above)

-   **Execution time pruning** - with [prepared statements](https://www.postgresql.org/docs/current/sql-prepare.html) or subqueries where values aren't known until runtime.

This is why partitioning by time works well for time-series data - PostgreSQL only touches partitions that overlap with your date range. Still, the recommendation is to try avoid doing queries between partitions. We should make our partitions as autonomous as possible, as querying between partitions is costly (may even mean accessing different disks, etc.).

That’s also how we’re coming to the next two questions:

> **Barry:** _What happens when you run this on a table with data already in it? Will it automatically split the data into the relevant partition?_

And:

> **Nikita:** _Please share your experience with rebalancing of partitions._

PostgreSQL doesn't have automatic partition rebalancing like distributed databases. Once data lands in a partition, it stays there unless you manually move it. This becomes a problem when your partitioning strategy no longer fits your data patterns.

The most common issue? You chose the wrong partition size. Maybe you started with yearly partitions, but now queries are slow because each partition has too much data. You need to split them, e.g.:

```
-- Can't just alter boundaries - must detach and recreate
ALTER TABLE trips DETACH PARTITION trips_2025;

-- Create monthly partitions instead
CREATE TABLE trips_2025_01 PARTITION OF trips
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
-- ... create all 12 months

-- Move data from the old yearly partition
INSERT INTO trips SELECT * FROM trips_2025;

-- drop old years partition
DROP TABLE trips_2025;
```

Another case is when you have data in the wrong partitions. Updating your partition key value won’t move your data to a different partition, so instead of updating the partition key value, you need to insert it into the new partition with the new key and drop it from the old one. You can do it as follows:

```
WITH moved AS (
  DELETE FROM trips_2024_12  
  -- condition to find record(s) you want to move
  WHERE trip_time = '2024-12-31' and vehicle_id = 123
  RETURNING
    vehicle_id,
    driver_name,
    start_location,
    end_location,
    distance_kilometers,
    fuel_used_liters
)
INSERT INTO trips (trip_time, vehicle_id, driver_name, start_location,
                   end_location, distance_kilometers, fuel_used_liters)
SELECT '2025-01-01', 123, driver_name, start_location,
       end_location, distance_kilometers, fuel_used_liters
FROM moved;
```

In the same way, if you have a table that’s not yet partitioned but has existing data, then PostgreSQL will refuse to partition it. You have two options. Either manually create new partitioned tables and migrate data first, or use pg\_partman, which can partition existing tables:

```
SELECT partman.create_parent('public.trips', 'trip_time', 'native', 'monthly');
CALL partman.partition_data_proc('public.trips');
```

So, again, PostgreSQL extensions ecosystem FTW!

And final question on partitioning:

> **Dillan**: _Does ef core support partitions_

Not at the moment, you’ll need to set up partitions on your own through custom migration, and AFAIK, the same story for other popular ORMs. Still, that’s not a big issue, as when you do the setup, you can query a partitioned table as any other table.

## Logical Replication

I wrote in more detail about PostgreSQL Logical replication and Write-Ahead Log in:

-   [Push-based Outbox Pattern with Postgres Logical Replication](/en/push_based_outbox_pattern_with_postgres_logical_replication/)

-   [The Write-Ahead Log: The underrated Reliability Foundation for Databases and Distributed systems](/en/the-write-ahead-log-a-foundation/)

Check also a great article from Gunnar Morling, an authority in this space:

-   [The Wonders of Postgres Logical Decoding Messages](https://www.infoq.com/articles/wonders-of-postgres-logical-decoding-messages/)

They should answer some of the questions. Let’s do a super quick TLDR of the key concepts.

**A Write-Ahead Log is a structure on the disk to which all statements representing changes (INSERT, UPDATE, DELETE)** are appended before applying them to tables upon transaction commit. Most of the databases are cleaning those entries, soon after they’re committed, PostgreSQL allows us to keep them as long as we tell it to.

**This enables Logical replication, which streams database changes from a publisher to subscribers using the Write-Ahead Log.** Unlike physical replication that copies everything byte-by-byte, logical replication sends actual SQL-like changes (thus logical, as they represent the logical change, not serialised bytes of data).

Key components:

-   **Publication:** Defines which tables to replicate. You set it up by calling:

    ```
    CREATE PUBLICATION outbox_pub FOR TABLE outbo
    ```

-   **Replication Slot:** Tracks subscriber progress in WAL, ensures no data loss (pg\_create\_logical\_replication\_slot)

-   **Subscriber:** Connects to slot, receives changes, sends acknowledgements

So, answering Matteo’s question:

> **Matteo**: _How does logical replication relate to Change Data Capture?_

Logical replication IS PostgreSQL's native CDC. It captures changes from WAL and streams them out, the same as [Debezium](https://debezium.io/) or other CDC tools.

The difference is scope. Debezium uses logical replication internally, providing a higher abstraction level and features such as connectors to Kafka. It handles batching, retries, and monitoring. With native logical replication, you build that plumbing yourself.

> **Muhammad:** I assume WAL notifications are ordered?

Yes, strictly ordered by transaction commit order. WAL is append-only. PostgreSQL tracks subscriber progress through replication slots using LSN (Log Sequence Number - read more [here](https://www.crunchydata.com/blog/postgres-wal-files-and-sequuence-numbers)).

Ordering is per replication slot.

> **Muhammad:** _What happens when there are multiple subscribers to WAL notifications?_

Multiple subscribers of the same slot process at different speeds, so "ordered" messages might arrive out of order at different downstream systems. So it’s similar to RabbitMQ guarantees for multiple consumers of the same queue.

If you need global ordering across systems, you need to either have a single subscriber for the replication slot or you need additional coordination.

Read also more in [The Order of Things: Why You Can't Have Both Speed and Ordering in Distributed Systems](/en/the-order-of-things-why-you-cant/).

> **Muhammad:** _Do we get publisher confirms with this Postgres Publication_

Not in the traditional message queue sense. The subscriber sends acknowledgements after processing batches of changes, not individual messages - that's why we call SendStatusUpdate() in the code example.

PostgreSQL gives you position-based tracking. If your subscriber crashes after processing message 100 but before sending the status update, it'll reprocess from maybe message 80. Your consumer must be idempotent.

> **Muhammad:** _Does WAL get auto flushed if there is no subscriber confirms?_

No. WAL segments stick around until the subscriber confirms. Replication slots will prevent the removal of required resources even when there is no connection. But that also brings cost:

> **Nikita:** _Does WAL grow indefinitely when a subscriber goes down? Can we limit the growth?_

Yes, indefinitely by default. To understand why, you need to know how WAL cleanup works.

PostgreSQL continuously writes changes to WAL files in the pg\_wal directory. Each file is 16MB by default. Without replication slots, PostgreSQL deletes old WAL files after:

-   They've been checkpointed (data written to main tables)

-   They've been archived (if archiving is enabled)

Let’s compare that to how messaging systems deal with retention.

In Kafka, you set retention policies like "keep data for 7 days" or "keep 100GB". Data gets deleted after this period, regardless of whether consumers read it. Late consumers simply miss old data.

PostgreSQL works differently. WAL retention is controlled by replication slots, not publications. A publication defines which tables to replicate - it has no retention policy. The slot tracks the consumer's position and prevents WAL deletion until consumed.

With slots, PostgreSQL also checks every slot position before deletion. One slow slot blocks WAL cleanup for everyone.

If you want Kafka-like behaviour where data is available for future subscribers, you need WAL archiving:

```
-- Archive WAL to long-term storage
archive_mode = on
archive_command = 'cp %p /mnt/wal_archive/%f'
```

This copies WAL files before deletion. Future subscribers can replay from the archive, not the active WAL. But logical replication doesn't automatically use archives - you'd need to restore them manually or use tools like [pg\_rewind](https://www.postgresql.org/docs/current/app-pgrewind.html).

You can also set the maximum size of data to keep for the slot:

```
ALTER SYSTEM SET max_slot_wal_keep_size = '10GB';
```

This works like a [circuit breaker](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern) - slots that retain too much WAL get invalidated rather than filling your disk. But unlike Kafka, where late consumers just miss data, PostgreSQL slots become permanently broken.

The fundamental difference: Kafka decouples retention from consumption. PostgreSQL couples them tightly - data stays until consumed or the slot breaks. You can't have "keep WAL for 7 days for future subscribers" without archiving.

So again, just like with partitioning, archiving strategy is the key!

## Trivia

> What are core key features not present in SQL Server?

Lots to mention! Jokes aside, MSSQL is a decent database, but from my perspective, Microsoft is lagging behind and underfunding efforts on it. Even on their conferences, they announce more news around PostgreSQL than MSSQL. The biggest difference is in the ecosystem and extensions being first-class citizens.

Still, here’s a quick list from the top of my head:

1.  **Extension system -** The ability to add functionality without touching core code. That's how we get pg\_partman, PostGIS, TimescaleDB. SQL Server has nothing comparable.

2.  **Logical replication with custom output plugins -** SQL Server has CDC, but for traditional replication, you can't customise or plug into it as described for PostgreSQL.

3.  Partitioning in MSSQL is just for the enterprise version, and IMHO, more complicated than in PostgreSQL.

4.  **[Foreign Data Wrappers](https://wiki.postgresql.org/wiki/Foreign_data_wrappers) -** Query external databases, CSV files, APIs as if they were local tables. SQL Server has linked servers but they're not as flexible.

5.  **Custom types and operators** - Define your own data types and how they behave. SQL Server is limited to built-in types.

6.  **JSONB with GIN indexing -** While SQL Server has JSON support, PostgreSQL's JSONB with indexing is more mature and performant.

7.  **Tablespaces -** Place specific tables/partitions on different disks. SQL Server uses filegroups, but PostgreSQL's approach is simpler for partitioning.

8.  **Arrays as first-class citizens** - you can store and index arrays directly.

9.  Rich ecosystem of various hosting services, besides cloud RDSes there’s a variety of bare metal VPCs, providers like [Supabase](https://supabase.com/), [Neon](https://neon.com/). And cloud-native databases like [AWS AuroraDB](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraPostgreSQL.html), [Google Spanner](https://cloud.google.com/spanner/docs/postgresql-interface), [CockroachDB](https://www.cockroachlabs.com/docs/stable/), [Yugabyte](https://www.yugabyte.com/), compatible with PostgreSQL syntax.

10.  The PostgreSQL Docker image is lighter and much easier to run integration tests.

> **Peter:** _What misuse of PostgreSQL (feature or in general) has turned out to be useful?_

I’d say that:

1.  **Using PostgreSQL as a document database -** I wrote about it in [PostgreSQL JSONB - Powerful Storage for Semi-Structured Data](/en/postgresql-jsonb-powerful-storage/). What seemed to be a wild idea worked really well. For year, I was co-maintaining .NET tool [Marten](https://martendb.io/), which allows using PostgreSQL as a document db, now I’m building also [Pongo](https://github.com/event-driven-io/Pongo) - a Mongo-compliant alternative in Node.js. Also tools like FerretDB and even cloud providers used it, e.g. AWS in DocumentDB, Microsoft in CosmosDB.

2.  **Using PostgreSQL as a queue -** that’s not something I’d recommend as the safe default, but if throughput of a few thousand messages per second is fine for you, then why not? That’s what Particular did in [NServiceBus transport](https://docs.particular.net/transports/postgresql/). There are popular tools like [Supabase queues](https://supabase.com/docs/guides/queues), [pgBoss](https://github.com/timgit/pg-boss), beware of _Just use PostgreSQL for all advice_, as [Just use X is dangerous advice](/en/just-use-sql-they-say-or-on-how-accidental/), but can be a good choice.

3.  **Using PostgreSQL as an event store** - that’s what I did in Marten, and do in [Emmett](/en/emmett_postgresql_event_store/), and also other tools are doing. Don’t write your own, now you have tools in all popular environments that’ll do it for you.

4.  **Full-Text Search Engine** - Using PostgreSQL's full-text search capabilities instead of Elasticsearch or Solr might not be always the best ide, but for many use cases, [PostgreSQL's tsvector and tsquery](https://www.postgresql.org/docs/current/textsearch.html) are more than sufficient for many cases and can eliminate operational complexity if you’re already using PostgreSQL and don’t have sophisticated needs.

> **Peter:** _What is a common thing you see as a consultant that many teams+orgs get wrong with postgres?_

I think that the issues are similar to those in other environments:

-   [Not using or misusing connection pooling](/en/architecture-weekly-189-mastering/),

-   not using explain and not tuning queries,

-   not using prepared statements for the commonly used queries,

-   not setting or oversetting indexes,

-   not using optimistic concurrency,

-   not thinking about the transaction isolation, and causing deadlocks.

From the issues that are special for PostgreSQL:

-   [not knowing how PostgreSQL sequences works](/en/ordering_in_postgres_outbox/), and losing messages when using the outbox pattern or PostgreSQL as a message queue,

-   **Not understanding VACUUM and autovacuum:** PostgreSQL's MVCC model means dead tuples accumulate and need cleanup. Many teams either disable autovacuum (terrible idea) or don't tune it properly for their workload. This leads to table bloat, degraded query performance. Check more about it in:

    -   [Internals of PostgreSQL VACUUM Processing](https://www.interdb.jp/pg/pgsql06.html)

    -   [Robert Haas: Understanding and Fixing Autovacuum](https://www.youtube.com/watch?v=7a1otYLZxy4)

* * *

Woof, that was a lot! I hope that this was useful and I didn’t mess anything! How would you answer those questions? Or maybe you have more of them?

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian](https://savelife.in.ua/pl/donate/) organisation or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

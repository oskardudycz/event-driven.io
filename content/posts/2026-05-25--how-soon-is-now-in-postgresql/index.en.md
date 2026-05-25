---
title: How soon is now in PostgreSQL?
category: "PostgreSQL"
cover: 2026-05-25-cover.png
author: oskar dudycz
---

![cover](2026-05-25-cover.png)

**How soon is now? In PostgreSQL, it's not always as soon as you'd think.** I learned that the hard way recently, so you don't have to.

It took me hours and wasn't easy to reproduce, even though the fix is one line. I found it in [a Cybertec post](https://www.cybertec-postgresql.com/en/postgresql-now-vs-nowtimestamp-vs-clock_timestamp/), as I quite often do when I'm staring at something odd in PostgreSQL. I'm supposed to know my way around the database, but I missed it, which is another reason I want to write this down.

I was working on distributed locking in [Emmett](https://github.com/event-driven-io/emmett). When you scale a service horizontally, you can easily end up with two instances of the same message processor running at once. That's bad. Both instances would pull the same events, both would write to the same projection storage, and we'd get duplicated side effects, overwritten state and broken checkpoints. So we need to guarantee that exactly one instance of each processor is active at any time. Emmett does that using two things working hand in glove: PostgreSQL advisory locks and a row in the `emt_processors` table. The row keeps the durable side of ownership: which instance currently holds the processor (`processor_instance_id`), when it last checked in (`last_updated`), and what state it's in (`status`). I described the full design in [Rebuilding Event-Driven Read Models in a safe and resilient way](/en/rebuilding_event_driven_read_models/), so I won't bore you with the whole picture here.

For this story, the part that matters is what happens when an instance crashes. The crashed processor's connection is gone, so its advisory lock has already been released. A new instance can grab the advisory lock without resistance. But the row in `emt_processors` still says `status = 'running'` and still points to the previous owner, because the crash didn't give anyone a chance to clean it up.

From the outside, we can't tell whether the previous owner has crashed or is just between heartbeats. So we wait. If the row's `last_updated` is older than a configurable timeout, the new instance is allowed to claim ownership anyway. Anyone quiet for that long is treated as gone. To make this graceful, the lock acquisition runs inside a retry policy. A fresh instance starting just after a crash doesn't fail straight away; it retries until the timeout window expires.

## The bug

The takeover decision lives in the upsert against `emt_processors`. In the real function, that upsert sits inside a Common Table Expression (CTE) alongside a `pg_try_advisory_xact_lock` call. 

For the record: the snippets below skip that wrapping (and trim a couple of unused parameters) to keep the focus on the upsert, where the bug lives. The full version is in [the source](https://github.com/event-driven-io/emmett/blob/4c5909982313654f7df383a44b02a14a04f30b50/src/packages/emmett-postgresql/src/eventStore/schema/processors/processorsLocks.ts).

```sql
CREATE OR REPLACE FUNCTION emt_try_acquire_processor_lock(
    p_processor_id           TEXT,
    p_processor_instance_id  TEXT,
    p_lock_timeout_seconds   INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO emt_processors (processor_id, processor_instance_id, status, last_updated)
  VALUES (p_processor_id, p_processor_instance_id, 'running', now())
  ON CONFLICT (processor_id) DO UPDATE
  SET processor_instance_id = p_processor_instance_id,
      status                = 'running',
      last_updated          = now()
  WHERE   
     -- same instance reconnecting
     emt_processors.processor_instance_id = p_processor_instance_id                      
     -- previous owner stopped cleanly
     OR emt_processors.status = 'stopped'     
     -- previous owner timed out    
     OR emt_processors.last_updated
        < now() - (p_lock_timeout_seconds || ' seconds')::interval;
  RETURN FOUND;
END;
$$;
```

The last branch is the takeover. It reads naturally: if the previous owner hasn't checked in for longer than the timeout, the new instance can replace them. All tests were green. Stop me if you think you've heard this one before. The problem surfaced through user feedback (thanks, [Martin](https://www.linkedin.com/in/martindilger/)!), and it took me a long time to reproduce; none of the existing tests covered the scenario that triggered it. [Once I had a new end-to-end test that pinpointed the symptom](https://github.com/event-driven-io/emmett/pull/339/changes#diff-c790c5d796e8e155d3e621f9b5bc2843503eda7c121c7715c232dbe9608a8964R741), the rest was the usual, long, boring, debugging loop.

To see why, open `psql` and run this:

```sql
BEGIN;
SELECT now() AS tx_now, clock_timestamp() AS wall_clock;
SELECT pg_sleep(2);
SELECT now() AS tx_now, clock_timestamp() AS wall_clock;
COMMIT;
```

You'll get something like:

```
            tx_now             |          wall_clock
-------------------------------+-------------------------------
 2026-05-25 10:00:00.123456+00 | 2026-05-25 10:00:00.124012+00

            tx_now             |          wall_clock
-------------------------------+-------------------------------
 2026-05-25 10:00:00.123456+00 | 2026-05-25 10:00:02.131845+00
```

The first column is the same in both rows. The second one is two seconds apart. As it turns out, `now()` is a synonym for `transaction_timestamp()`: it returns the time the transaction began, and keeps returning that value for every statement inside the same transaction. A light that never goes out, in other words. `clock_timestamp()` reads the wall clock each time it's called, so it advances as time does. Cybertec wrote [a good walkthrough](https://www.cybertec-postgresql.com/en/postgresql-now-vs-nowtimestamp-vs-clock_timestamp/) of the whole family of timestamp functions if you want the full picture.

What difference does it make? For a column like `last_updated`, the constancy of `now()` is usually what you want: every row touched in the same transaction shares a single timestamp, which keeps audit logs and write batches coherent. For asking "has enough time passed?" inside the same transaction, the same constancy works against us.

Now back to the retry. The consumer that calls `tryAcquire` looks roughly like this:

```ts
pool.withTransaction((tx) =>
  asyncRetry(
    () => tryAcquireProcessorLock(tx.execute, options),
    { retries: 10, minTimeout: 200, maxTimeout: 1000 },
  ),
);
```

`pool.withTransaction` opens a database transaction and passes its executor to the body. `asyncRetry` then repeatedly calls the stored procedure on that same executor, with a backoff between attempts. So even though the retries are spread out in real time, every call runs inside the same database transaction:

```
withTransaction        (transaction starts at T)
  └── asyncRetry
       ├── call lock function    → now() = T
       ├── call lock function    → now() = T   (200 ms later)
       ├── call lock function    → now() = T   (400 ms later)
       └── ...
```

`last_updated < now() - timeout` evaluates the same way every iteration. The predicate is effectively constant for the lifetime of that transaction. From the database's perspective, no time was passing between attempts, even though the retries were spread across real seconds. (of course, the valid question is whether retries should happen inside a transaction, but let's say that this is out of scope of today's article, deal?). 

So what was the fix? Change the time source inside the function. PL/pgSQL lets you declare local variables, so I added one at the top, initialised from `clock_timestamp()`, and used it everywhere the function previously called `now()`:

```sql
CREATE OR REPLACE FUNCTION emt_try_acquire_processor_lock(
    p_processor_id           TEXT,
    p_processor_instance_id  TEXT,
    p_lock_timeout_seconds   INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_time TIMESTAMPTZ := clock_timestamp();
BEGIN
  INSERT INTO emt_processors (processor_id, processor_instance_id, status, last_updated)
  VALUES (p_processor_id, p_processor_instance_id, 'running', v_current_time)
  ON CONFLICT (processor_id) DO UPDATE
  SET processor_instance_id = p_processor_instance_id,
      status                = 'running',
      last_updated          = v_current_time
  WHERE emt_processors.processor_instance_id = p_processor_instance_id
     OR emt_processors.status = 'stopped'
     OR emt_processors.last_updated
        < v_current_time - (p_lock_timeout_seconds || ' seconds')::interval;
  RETURN FOUND;
END;
$$;
```

`clock_timestamp()` ignores transaction boundaries. Every call to the stored procedure reads the wall clock fresh, so each retry sees a slightly later value than the last. After enough retries inside the wrapping transaction, the takeover predicate flips, and the new instance wins.

The function uses the timestamp in two places: when setting `last_updated` on the new owner, and when comparing the previous owner's `last_updated` to the timeout. I switched both to `v_current_time`, so the write and the check read from the same wall clock. Mixing `clock_timestamp()` on one side and `now()` on the other would leave a subtler version of the same bug.

A cleaner option for the future is to move the retry one layer up, so each attempt opens its own transaction. That would remove the trap entirely and let the function go back to plain `now()`. For now, the local variable does the job.

## Why my tests didn't catch it

Now to the testing side. I had a careful suite of integration tests for the stored procedure. Two instances racing for the lock. The same instance reconnects after a crash. Takeover after a custom timeout. They all passed, and they could not have caught this bug. Here's the shape of a typical one:

```ts
await pool.withTransaction((connection) =>
  lock.tryAcquire({ execute: connection.execute }),
);
```

That's the shape: set up some state, call `tryAcquire` once, check the result. A single call to the stored procedure works fine with `now()` in the WHERE clause. There is only one timestamp involved per call, and the predicate evaluates correctly against it. The bug only shows up when several calls share one transaction, which happens when the consumer's `withTransaction` wraps a retry policy. The stored-procedure tests never put those two together.

The end-to-end consumer tests do go through the consumer's `withTransaction` wrapper, but they covered the happy paths: clean start, clean stop, two consumers competing, and an instance reclaiming its own stale lock. None of them combined the three conditions that together expose the bug:

1. a previous owner whose row still says `status = 'running'` (a crash, not a graceful stop),
2. a new instance arriving with a different instance ID,
3. a retry acquisition policy with a timeout short enough for the retries to outlast it inside the test's deadline.

Any one of those missing and the takeover predicate either succeeded on the first attempt (so the retry never fired), or the test finished before the retry's failure to make progress was visible.

So why did this slip through both layers? The stored-procedure tests never combined a retry policy with the stale-row state, so they never produced multiple calls inside one transaction. The end-to-end tests did exercise the retry path, but none of them happened to combine all three conditions above at once. Both layers had blind spots, and the bug lived exactly where they overlapped.

The Pull Request that fixes the bug also adds a new family of tests that mount `tryAcquire` under the same transactional wrapper the real consumer uses, with the crash + new-instance + retry combination wired up on purpose. That's the kind of test I should have had from the start.

## What I'm taking away

Two things about `now()`:

- **`now()` is the right tool when you want every row touched in the same transaction to share a timestamp.** `created_at`, `last_updated`, audit columns. That stability is a feature.
- **`now()` is the wrong tool when you want to ask "has time moved on?" from inside a transaction.** Use `clock_timestamp()` when you genuinely mean the wall clock.

And one harder thing about tests. Inner tests for stored procedures give me a tight feedback loop and pinpoint failures, but only inside the scaffolding I build for them. End-to-end tests run the real wiring, but I can't enumerate every combination of timeouts, instance IDs and crash states without the suite collapsing under its own weight. The combination where this bug lived wasn't reachable from either side by accident; it needed a deliberate setup.

I don't have a clean rule for where to draw that line, and honestly, I don't think there is one. My takeaway is to look at the seam: the spot where the inner test invokes the code differently from how the production caller invokes it. Here, it was a single-call test against a retry loop sharing one transaction. Wherever that gap sits, write a test there. Not at the unit level, not at the full end-to-end level, but in a setup that mirrors how the real caller actually drives the code and exercises the path you care about.

## TLDR

`now()` returns the start of the current transaction, not the current moment. Inside a transaction it doesn't change between statements. If you wrap a retry loop around a function that uses `now()` in a `WHERE` clause, and the retry loop runs inside one transaction, the predicate is frozen and the retries do nothing. Use `clock_timestamp()` when you mean "right now". And pay extra attention to the seam between inner and end-to-end tests, because that's where mismatches between how tests drive the code and how production drives it tend to hide.

The fix and the new tests live in [Emmett Pull Request #339](https://github.com/event-driven-io/emmett/pull/339).

Uff. That bug was nasty.

![](./2026-05-25-nasty.gif)

Read also:
- [Rebuilding Event-Driven Read Models in a safe and resilient way](/en/rebuilding_event_driven_read_models/), with the locking design this bug lives inside,
- [Distributed Locking: A Practical Guide](https://www.architecture-weekly.com/p/distributed-locking-a-practical-guide),
- [Consumers, projectors, reactors and all that messaging jazz in Emmett](/en/consumers_processors_in_emmett/),
- [Checkpointing the message processing](/en/checkpointing_message_processing/),
- [Cybertec: PostgreSQL `now()` vs `now()::timestamp` vs `clock_timestamp()`](https://www.cybertec-postgresql.com/en/postgresql-now-vs-nowtimestamp-vs-clock_timestamp/),
- [Is keeping dates in UTC really the best solution?](/en/is_keeping_utc_dates_best_solution/).

Or my other articles about PostgreSQL:
- [Postgres Superpowers in Practice](/en/postgres_superpowers/),
- [PostgreSQL partitioning, logical replication and other Q&A](https://www.architecture-weekly.com/p/postgresql-partitioning-logical-replication)
- [PostgreSQL JSONB - Powerful Storage for Semi-Structured Data](https://www.architecture-weekly.com/p/postgresql-jsonb-powerful-storage)
- [Push-based Outbox Pattern with Postgres Logical Replication](/en/push_based_outbox_pattern_with_postgres_logical_replication/)
- [How to get all messages through Postgres logical replication](/en/how_to_get_all_messages_through_postgres_logical_replication/)
- [The Write-Ahead Log: The underrated Reliability Foundation for Databases and Distributed systems](https://www.architecture-weekly.com/p/the-write-ahead-log-a-foundation)
- [How Postgres sequences issues can impact your messaging guarantees](/en/ordering_in_postgres_outbox/)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

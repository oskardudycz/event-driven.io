---
title: Interactive Rubber Ducking with GenAI
category: "Software Architecture"
cover: 2026-03-16-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![cover](2026-03-16-cover.png)

You may already know that [I'm a GenAI sceptic](/pl/the_end_of_coding_wrong_question/). And a general sceptic.

Do you know that scepticism comes from the Greek *σκέπτομαι* (*skeptomai*), meaning 'to search, to think about, or look for'? So my intention is not to say no to everything new, but more to think about it first, and understand before I say yes.

There's a lot of stuff about GenAI that makes me smile, but I still understand that my way is my way, and I won't stop the world. I won't even try. Thus, I want to research and consider how those tools can help me. I already wrote that I don't feel like [10x Dev](https://www.architecture-weekly.com/p/requiem-for-a-10x-engineer-dream), but I'm finding more ways to get help from it. 

**One of the ways that helped me is something I call _"Interactive Rubber-Ducking"_.** 

Initially, I called it just [brainstorming](https://www.architecture-weekly.com/p/start-alone-then-together-why-software), but that wouldn't be precise, as I'm using it to brainstorm ideas, more to challenge and clarify them.

Most of the code I write nowadays is done in [my OSS projects](https://github.com/oskardudycz/). I'm grateful to have a [great community](https://discord.gg/fTpqUTMmVa) with people actively contributing in different ways; still, the canonical design and code work is on my side. As I work in an event-driven niche, I'm often alone with my own thoughts. I try to use the [RFC process](https://www.architecture-weekly.com/p/workflow-engine-design-proposal-tell) and discuss it with other fellow humans, but they are not always available. Even if they do, to avoid wasting their time, I need to know what to tell or ask them. I need to give some proposals (with alternatives) to have an [effective discussion](/pl/fifteen_tips_on_how_to_run_meetings_effectively/). I may seem organised, but that's not always the thing. Sitting in your own head is not a great place to be in general. If you're a technical leader or an architect, I'm sure that you know that solitude too well.

GenAI tools are not great sparing partners. They're _Yes men_. If they read this article, they'd for sure confirm it. They'd probably do it even without reading it. Of course, you can ask them not to be [sycophant](https://www.merriam-webster.com/dictionary/sycophant). You can ask numerous MUSTS with capital letters and bolded **NEVER** here and there, and it can help, but it won't fully beat the way they were trained.

And talking to yourself is a similar experience: you'll find numerous ways to justify your own decisions, and looking at the same place for too long will make you miss obvious blind spots.

Ok, so why would we take those two blind "people" and try to make them help each other?

**That's kinda what "Interactive Rubber-Ducking" is.** It takes a blind human with an idea, and another blind not-so-human asking questions. It starts with such a prompt:

> Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let's do this iteratively and dig into every relevant detail. Remember, only one question at a time.
> 
> Once we are done, save the spec as spec.md
> 
> Before asking another question, store the previous one with the answer in qa.md. Write literally the question and answer, not just a summary.
> 
> Here's the idea:

I'm using it as a command in Claude Code, and, most importantly, with beefier models like Opus, which can better reason and ask better questions. Doing it with lower-level models always gave me much worse results.

I'm using it with Claude Code, not Claude Chat, because I want the model to scan my codebase. I can ask it to look in certain areas or to reference my answers. I can even ask to search the web or MCPs like [Context 7](https://context7.com/) to check documentation and APIs for popular libraries. Then it's getting more into brainstorming sometimes, than rubber-ducking, but that's fine.

As a result, we'll get two artefacts:
- **qa.md** - with the log of the back-and-forth discussion,
- **spec.md** - in theory spec built by LLM, but imho it's more of a concise summary. 

It may look like Specification-Driven Design, but it's not.

My goal for this exercise is not to get an actionable specification.

The goal is to get our LLM-based Rubber Duck to ask us hard questions and make us think, not to make the LLM think for us. Find blind spots, and challenge our thinking.

But we're drivers, we need to know what we want to do, we need to know all the WHYs, and we also need to know HOW. LLM is here to help, but not to do creative work for us. It just pulls it out from our heads.

It also helps to see how our design may be seen by others, especially such mediocre thinkers as LLMs. 

I don't expect the Agent to be able to start implementing the spec. I expect it to reflect all considerations and summarise findings. I'm always double-checking to make sure it includes all the important points. If not, I'll keep doing Q&A until I'm satisfied.

Having both of those files will allow us to keep a full discussion without losing important details, and a shorter version. We can feed that to another model for review, or try to work on tasks and develop a more detailed plan. Sometimes I plan on my own; for simpler tasks, I may ask the LLM to do it fully. Usually, I'm driving the LLM step by step, passing just specific asks. 

The example? Why not. 

**I recently did such an exercise, trying to narrow down how to introduce the _Second-level cache_ to [Pongo](https://github.com/event-driven-io/pongo) and [Emmett](https://github.com/event-driven-io/emmett).** What's _Second-level cache_? A Second-level cache is a local store of data managed by the persistence provider to improve application performance. 

**Why do I want to introduce it?** Because I got an [issue from the user](https://github.com/event-driven-io/emmett/issues/322) that [rebuilding projections](/pl/rebuilding_event_driven_read_models/) with a lot events can take too long. One of the reasons is that applying an event on a projection takes:
- loading the current state,
- updating it,
- storing the result.

Those are two operations per event. If we have a batch of 100 events, that'd mean 200 operations; for 1000 events, this would be 2000, so the classical N+1 problem. We could do it differently, and within a batch:
- group events by the target documents,
- load all of them in one operation by finding all documents within an array of ids (taken from events),
- caching them,
- applying events in memory,
- storing updated documents in one operation.

Then we'll get at worst 102 operations for 100 events and 1002 for 1000 events, so a linear increase.

Still, I decided to add batching and introduce 2nd-level cache as a solution. I and my experience were a driving force behind that. I could,  of course, rubber duck it, but I had that already planned, not just detailed. I also did some initial research before doing the session.

Let me show you the result below. Not too bad if you ask me. Of course, the task wasn't very innovative; it's a standard way for mature solutions. Still questions were surprisingly good and helped me.

I hope this log will show you (besides how bad I'm at typos) some insight into how I think, talk, and consider the design.

Tell me your thoughts, if that matches your way, if you haven't done it yet, try it and tell me how it went!

---

## Interactive Rubber Ducking example

### Q1: Cache library choice — lru-cache, keyv, or custom interface?

**Question:** You mentioned both `keyv` and `lru-cache`. They pull in different directions. Which trade-off do you prefer?
- A) Start with `lru-cache`, optionally let users swap adapters later.
- B) Start with `keyv` so cross-node sharing works out of the box.
- C) Define a thin cache interface (`get`/`set`/`delete`/`clear`) and ship `lru-cache` as the default adapter.

**Answer:** Custom cache interface (option C). No dependency on external APIs — keep it pluggable. Start with an in-memory provider only. Considered writing a custom LRU with me, but wants to ship fast. Key point: don't stick to any third-party API surface, allow pluggability.

### Q2: Where should the cache live in Pongo's hierarchy?

**Question:** Three attachment points: A) PongoClient level (shared across all), B) PongoDb level (per database), C) PongoCollection level (per collection). Or configurable at multiple levels?

**Answer:** Allow defining it at different levels — cascading configuration. Set a default higher up, override per collection if needed.

### Q3: Inheritance/override behavior for cascading cache config?

**Question:** For the cascading config — what should the inheritance/override behavior be?

Two sub-questions:
1. Should a lower level be able to *disable* caching even if a parent enables it?
2. Should cache *settings* (like max size, TTL) also cascade, or only the cache provider instance itself?

**Answer:**
1. Yes. Cache should be an object with type, general params and specific for this type, or `'disabled'`. That's a proper devex.
2. Yes, as above. But if one selects a different cache type then general params should be inherited but type-specific should not be inherited and should fallback to defaults.

**Claude's thoughts:** The `CacheConfig | 'disabled'` pattern is clean — discriminated unions play nicely with TypeScript. The inheritance rule makes sense: general params (TTL, max size) cascade, but type-specific params reset to defaults when you switch providers, avoiding leaking nonsensical config (e.g., a Redis connection string bleeding into an in-memory cache). Also worth distinguishing between "I didn't specify anything" (inherit from parent via `undefined`) and "I explicitly want defaults" (reset) — `undefined` vs `'disabled'` vs `CacheConfig` gives a clean three-state: inherit / off / explicit.

### Q4: Cache interface shape — async, batch ops, scoping?

**Question:** Settling the cache interface details:
1. Async or sync? Making the interface `Promise`-based from the start keeps it pluggable. Sound right?
2. Batch methods (`getMany`, `setMany`, `deleteMany`) — should the cache interface support batch ops natively, or loop internally?
3. Should `clear()` be scoped per collection, or always clear the entire cache?

**Answer:**
1. Maybe we could return either promise or no promise, then if we await it, it would support both? Also ensure that settings are close to what lru-cache and keyv are having.
2. Having them (even as syntactic sugar) would be a good devex.
3. We could pass down not only settings, but also the cache provider instance, then if settings are the same we can reuse cache without recreating it. If set had ttl provided, then we could do it by overriding those TTLs on item level. ClearAll probably would be something we should expose only for advanced, typically user should not be aware of cache.

**Claude's thoughts:** `MaybePromise<T>` (i.e. `T | PromiseLike<T>`) works — `await` on a non-Promise just resolves immediately. No overhead for sync providers, no breaking change for async ones. Passing a cache instance is smart: config becomes either settings (Pongo creates the cache) or a pre-built instance (user brings their own). Multiple collections can explicitly share one cache instance. `clear()` should be internal/advanced — scope by collection prefix internally so a collection-level clear doesn't nuke another collection's entries when sharing an instance. For aligning with lru-cache/keyv settings: both support `max` (max entries) and `ttl` (TTL in ms). Start with `max` and `ttl` as the general params.

### Q5: Cache key strategy

**Question:** Since cache instances might be shared across collections, how to avoid key collisions?
- A) Pongo manages key prefixing internally (`{dbName}:{collectionName}:{id}`). The cache interface works with plain string keys, namespacing is Pongo's concern.
- B) Key is just the document `_id`. Simpler but only safe with per-collection instances.

**Answer:** A, definitely.

### Q6: Cache invalidation and consistency with optimistic concurrency

**Question:** How should cache interact with different operations?
1. Successful writes → update/evict cache. Clear.
2. Concurrency errors → evict stale entry. Clear.
3. Reads with `_id` filter → cache hit or miss-then-populate. Clear.
4. `handle` method — should the read inside `handle` use the cache (risking more concurrency errors on stale data) or always go to DB?

**Answer:** Definitely use cache. We could consider disabling cache through handle options.

**Claude's thoughts:** Use cache by default — optimistic concurrency is the safety net. If cached version is stale, write fails, we evict, caller can retry. Adding `skipCache?: boolean` to `HandleOptions` is a clean escape hatch for high-contention cases.

### Q7: Should `skipCache` be available on read methods too?

**Question:** Should `skipCache` also be available on `findOne` and other read methods for symmetry, or keep it `handle`-only?

**Answer:** Good point, having `skipCache` on find methods (also `findMany` etc.) would be good.

**Claude's thoughts:** Consistent API surface. Add `skipCache?: boolean` on the shared options type (e.g. `CollectionOperationOptions`) so it's available everywhere without repeating yourself.

### Q8: Batch operations on `handle` — signature and handler shape

**Question:** You want `handle` to accept an id or array of ids. Two design choices:
1. Overloaded signature (`handle(id: string | string[], ...)`) vs separate method (`handleMany`)?
2. Handler shape for batch: A) still receives/returns one document at a time (Pongo batches DB ops internally) or B) receives/returns full array?

Also noted: since PongoDocuments always have `_version`, if someone provides `expectedVersion` we could compare it against the cached version and decide if it's stale without hitting the DB.

**Answer:** Option A for handler shape. `handleMany` would be consistent with other APIs, but single id or array (`string | string[]`) is clean enough.

**Claude's thoughts:** Version comparison in cache is a cheap short-circuit — if cached `_version` doesn't match `expectedVersion`, we know it's stale without a round trip. On signature: TypeScript overloads can narrow the return type (`string` → single result, `string[]` → array). `handle` is a higher-level orchestration method, not direct CRUD, so a union input feels natural. Go with `handle(id: string | string[], handler, options?)`.

### Q9: Defaults — max entries, TTL, enabled by default?

**Question:** What defaults to set? Proposed: `max: 1000`, `ttl: 60_000` (1 min), and should cache be enabled by default or opt-in?

**Answer:** Stick to recommended lru-cache defaults for now. Enable cache by default.

**Claude's thoughts:** Enabling by default works because: (1) optimistic concurrency is always the safety net, (2) it's document-by-id only so invalidation is straightforward, (3) users can set `'disabled'`. `lru-cache` requires `max` to be set (no default) and has no default TTL. Suggested: `max: 1000`, no TTL (rely on LRU eviction + invalidation on writes/concurrency errors) — most lru-cache-aligned.

### Q10: TTL or no TTL as staleness backstop?

**Question:** No TTL means cached entries live until LRU-evicted or invalidated by a Pongo write. If something updates the DB outside this Pongo instance (another service, direct SQL), the cache won't know. Options:
- A) No TTL, accept the trade-off — OC catches it on next write.
- B) Set a conservative default TTL (e.g., 5 minutes) as a staleness bound.

**Answer:** Fine with using TTL and sometimes hitting OC issue. OC assumes rare conflicts.

### Q11: Where does cache integration hook into existing code?

**Question:** Two approaches for minimal invasiveness:
1. Wrap at the `pongoCollection` level — intercept operations inside the factory function, driver/SQL layers untouched.
2. Decorator/wrapper pattern — `cachedPongoCollection` wraps `PongoCollection`, adds cache logic around delegation.

**Answer:** Leaning more to option 1. Thinks it'll be easier to make observability precise eventually.

**Claude's assessment:** Agreed with option 1. Cache decisions depend on internal state (whether filter targets `_id`, document `_version`, write success vs concurrency error). A wrapper would need to re-inspect all of that from the outside. For observability, cache hit/miss logic next to the actual DB call enables precise metrics in context. Pongo's factory functions already compose behavior internally (transactions, schema migration) — cache is another concern at the same level. A decorator would duplicate filter-inspection logic and add indirection that doesn't carry its weight.

### Q12: Cache interaction with transactions

**Question:** How should cache interact with transactions?
1. Should writes within a transaction update the cache immediately, or only after commit?
2. Should reads within a transaction check the cache?

**Answer:**
1. After commit.
2. We should use cache, but allow skipping it on transaction or session options. We can also allow setting cache settings per session.

**Claude's thoughts:** Reads within a transaction benefiting from cache is more aggressive but logical — most transactions are short-lived. The narrow case: `insertOne` then `findOne` same `_id` within a transaction — cache won't have the uncommitted insert, falls through to DB, gets the right answer anyway. No correctness issue, just no perf benefit for that case. Per-session cache settings fit the cascading pattern (e.g., `startSession({ cache: 'disabled' })` for batch migrations). Proposed cascade priority: client → db → collection → session → per-operation `skipCache`.

### Q13: Cascade priority — does session override collection?

**Question:** Does the cascade priority **client → db → collection → session → per-operation `skipCache`** feel right? Session overriding collection is the non-obvious part — the argument being that session is the most immediate runtime context, while collection is structural config. Or would you prefer collection always wins over session?

**Answer:** That's fine. Session should precede collection, as normally you create session to e.g. share connection, and join the number of operations logically, so it'd make sense actually to also do it to e.g. override settings like caching.

**Claude's thoughts:** Session as logical grouping of operations with shared context (connection, transaction) — overriding cache settings at that level is extending the same concept. Bulk import in a session? Set cache disabled once on the session instead of `skipCache` on every call. Final cascade: client → db → collection → session → per-operation.

### Q14: Cache provider error handling

**Question:** If the cache provider throws (e.g., Redis connection drops), should Pongo:
- A) Treat it as a cache miss — fall through to DB silently, maybe log a warning. Cache failures never break the application.
- B) Propagate the error — let the caller deal with it.

**Answer:** A — yes, when we add observability to Pongo, we need to make it also a metric and trace event/attribute/log entry.

**Claude's thoughts:** Cache is an optimization, not a correctness requirement. Silent degradation now, observable degradation when the observability layer lands.

### Q15: Cache warming, events/hooks, and delete operations

**Question:** Three remaining areas:
1. Cache warming — should Pongo support pre-populating the cache on startup?
2. Cache events/hooks — should users be able to listen to cache hits/misses/evictions?
3. Delete operations — `deleteOne`/`deleteMany` should evict from cache. Anything non-obvious there?

**Answer:**
1. For now keep it as a future concept, or define pluggable strategy for users.
2. You can add the basic hook to the Pongo Cache wrapper. Shouldn't be that hard to just call some function.
3. Yes, they should evict if they can, we can delete (for now) when `deleteMany` deletes by ids.

**Claude's thoughts:** Cache warming deferred — can add a strategy hook later. Basic event callbacks (onHit, onMiss, onEvict, onError) on the cache wrapper are low-cost and useful for debugging even before full observability. Delete eviction scoped to id-based deletes for now — filter-based `deleteMany` doesn't evict (no way to know which ids were affected without querying first).

---

## Interactive Rubber Ducking result

### Pongo 2nd Level Cache — Specification

### Overview

Add a document-level (by `_id`) 2nd level cache to Pongo with a pluggable provider interface. Ships with an in-memory provider backed by `lru-cache`. Enabled by default. Designed to be minimally invasive to existing code.

### Cache Interface

#### `PongoCacheProvider<T>`

A thin, Pongo-owned interface. No coupling to any third-party API.

```typescript
type MaybePromise<T> = T | PromiseLike<T>;

interface PongoCacheProvider {
  get(key: string): MaybePromise<PongoDocument | null | undefined>;
  set(key: string, value: PongoDocument, options?: { ttl?: number }): MaybePromise<void>;
  delete(key: string): MaybePromise<void>;
  getMany(keys: string[]): MaybePromise<(PongoDocument | null | undefined)[]>;
  setMany(entries: { key: string; value: PongoDocument; ttl?: number }[]): MaybePromise<void>;
  deleteMany(keys: string[]): MaybePromise<void>;
  clear(): MaybePromise<void>;
}
```

- `MaybePromise` return types: sync providers (in-memory) return values directly, async providers (Redis) return Promises. `await` handles both transparently.
- Batch methods (`getMany`, `setMany`, `deleteMany`) are first-class. Default in-memory implementation may loop internally, but the interface allows optimized batch ops for external providers.
- `clear()` is internal/advanced — not exposed to typical users. When sharing a cache instance across collections, scoping is handled via key prefixing by Pongo, not by the provider.

#### Cache key strategy

Pongo manages key prefixing internally: `{dbName}:{collectionName}:{documentId}`.

The cache provider works with plain string keys — namespacing is Pongo's concern, not the provider's.

#### Event hooks

The Pongo cache wrapper supports basic callbacks:

- `onHit?(key: string): void`
- `onMiss?(key: string): void`
- `onEvict?(key: string): void`
- `onError?(error: unknown, operation: string): void`

These are optional and intended for debugging and future observability integration.

### Configuration

#### `CacheConfig`

```typescript
type CacheConfig = {
 type: string;               // e.g., 'in-memory', 'redis', etc.
 max?: number;               // max entries (general param, cascades)
 ttl?: number;               // TTL in ms (general param, cascades)
  // type-specific options live here too, keyed by type
 [key: string]: unknown;
} | 'disabled';
```

Three states:
- `undefined` — inherit from parent level
- `'disabled'` — explicitly turn off caching at this level
- `CacheConfig` object — explicit configuration

#### Cascading configuration

Cache config can be set at multiple levels. Each level inherits from its parent unless explicitly overridden:

**client → db → collection → session → per-operation**

Inheritance rules:
- General params (`max`, `ttl`) cascade down.
- If a lower level switches `type`, type-specific params reset to defaults (not inherited from parent).
- Session overrides collection — session is a logical grouping of operations, natural place to override runtime behavior (e.g., disable cache for a bulk import).
- Per-operation `skipCache?: boolean` is the most granular escape hatch.

#### Passing a cache instance

Users can provide either:
- **Settings** — Pongo creates and manages the cache provider.
- **A pre-built cache provider instance** — Pongo uses it directly.

If settings are the same across multiple collections, Pongo can reuse the same provider instance internally. When a user passes an instance, multiple collections can explicitly share one cache.

#### Defaults

- **Enabled by default**
- `max`: follow `lru-cache` recommended defaults (1000)
- `ttl`: follow `lru-cache` recommended defaults
- Default provider: in-memory (`lru-cache`)

### Integration points

#### Where: `pongoCollection` factory function

Cache logic is added directly inside `pongoCollection`, not as an external decorator/wrapper. This gives cache operations access to internal state (filter inspection, `_version`, write outcomes) and keeps observability precise.

#### Read operations

**`findOne`:**
- If the filter targets `_id`, check cache first.
- Cache hit → return cached document.
- Cache miss → query DB, populate cache, return.
- `skipCache?: boolean` option available.

**`findMany` / other query methods:**
- If the filter is a list of `_id` values, check cache for each.
- Return cached hits, query DB for misses, populate cache with DB results.
- Non-`_id` filters bypass cache entirely (cache is by-id only).

#### Write operations

**`insertOne`:**
- After successful insert, put the document into cache.

**`insertMany`:**
- After successful insert, put all documents into cache.

**`updateOne` / `updateMany` / `replaceOne`:**
- After successful write, update the cache entry with the new document state.

**`deleteOne`:**
- After successful delete, evict from cache.

**`deleteMany`:**
- If deleting by ids, evict those ids from cache.
- Filter-based `deleteMany` does not evict (no way to know affected ids without extra query). Future improvement possible.

### Optimistic concurrency

- On concurrency error (version mismatch), **evict the stale entry** from cache. This is critical — a concurrency error means someone else updated the record (e.g., from another node), so the cached version is stale.
- If a caller provides `expectedVersion` and the cached document has `_version`, compare them in memory. If they don't match, we know it's stale without hitting the DB — cheap short-circuit.

#### `handle` method

- Accepts `id: string | string[]` (overloaded: string returns single result, string[] returns array).
- Read phase uses cache by default.
- Write phase updates/evicts cache based on outcome.
- `skipCache?: boolean` available in handle options.
- For batch: loads all ids from cache, fetches misses from DB in one query, processes handler per document, batch writes to DB, updates cache after commit.

#### Transactions

- **Writes update cache only after commit.** Not during the transaction — uncommitted data should not enter the cache.
- **Reads within a transaction check cache** by default (most transactions are short-lived, cached data is probably valid). If the transaction modified a document and then reads it, cache miss falls through to DB which returns the correct uncommitted state.
- Cache can be disabled per-session: `startSession({ cache: 'disabled' })`.
- Per-session cache settings follow the cascade (session overrides collection).

### Error handling

Cache provider errors are **swallowed** — treated as cache misses. The application never fails because of a cache failure.

- Cache is an optimization, not a correctness requirement.
- Errors trigger `onError` hook for debugging.
- Future: errors will become metrics and trace events when Pongo's observability layer lands.

### Future considerations (out of scope for v1)

- **Cache warming**: pluggable strategy for pre-populating cache on startup. Interface hook defined but no default implementation shipped.
- **Query-result caching**: caching results of non-`_id` queries. Complex invalidation — deferred.
- **Cross-node cache sharing**: Redis/Memcached providers. The interface supports it; no provider shipped in v1.
- **Filter-based `deleteMany` eviction**: would require querying affected ids before delete.
- **Observability integration**: metrics (hit ratio, latency saved, eviction counts), trace attributes, log entries for cache operations.

### Implementation approach

1. Define `PongoCacheProvider` interface and `CacheConfig` types.
2. Implement in-memory provider using `lru-cache`.
3. Build Pongo cache wrapper (key prefixing, event hooks, error swallowing).
4. Wire cascading config resolution (client → db → collection → session → per-op).
5. Integrate into `pongoCollection`: intercept `_id`-based reads, update cache on writes, evict on deletes and concurrency errors.
6. Extend `handle` to accept `string | string[]` with batch support.
7. Add `skipCache` to operation options.
8. Tests: unit tests for cache provider, integration tests for cache + collection operations, e2e tests for concurrency scenarios.

---

Cheers!

Oskar

**p.s.** and yes [Nano Banana](https://gemini.google/pl/overview/image-generation/) also did pretty well generating the cover of this post!

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
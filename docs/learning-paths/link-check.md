# Reading list link check

Checked on 2026-10-13 against [reading-list.md](reading-list.md). The list is cut off after the first Kafka link, so this covers only what is there now.

Method: GET with redirects followed, a desktop browser User-Agent, 20 s timeout, eight requests at a time and one retry on network errors. YouTube links were checked through YouTube's oEmbed endpoint. A 200 from Medium, LinkedIn or YouTube's own pages proves little, and 403/429 responses usually mean bot protection, so those are listed as unverifiable rather than dead. Trivial redirects (http to https, trailing slash, `event-driven.io/` to `/en/`) are ignored.

## Summary

- 367 link occurrences, 350 unique URLs (346 if `www.`/`m.`, `http`/`https` and YouTube playlist parameters are ignored).
- 280 load without a redirect or with only a trivial one.
- 25 redirect to a new address with the same content.
- 19 are broken: 11 fail outright (404, DNS, TLS or connection errors, one unavailable YouTube video) and 8 return 200 only after redirecting to a blog index, home page or "page not found" page.
- 26 could not be verified (bot protection, mostly Medium).
- 137 links point to Oskar's own content: 101 on event-driven.io and 36 on Architecture Weekly. 130 resolve to a post in `content/posts`; 7 Architecture Weekly webinar posts have no imported post.

## Dead or unavailable

| Section                                        | URL                                                                                                                              | Result                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Event versioning                               | http://blog.approache.com/2019/02/versioning-in-event-sourced-system-tldr_10.html?m=1                                            | connection refused or reset                                                       |
| Event Sourcing is not Event Streaming          | https://axoniq.io/blog-overview/axon-and-kafka-how-does-axon-compare-to-apache-kafka                                             | 404                                                                               |
| Idempotency                                    | https://developer.visa.com/capabilities/vpp/docs-how-to                                                                          | 404                                                                               |
| Idempotency                                    | https://docs.mono.co/docs/telco-transactions                                                                                     | 404                                                                               |
| Security                                       | https://docs.pivotal.io/rabbitmq-cf/2-0/enable-oauth-for-rabbitmq.html                                                           | TLS error                                                                         |
| Delivery guarantees, outbox and inbox patterns | https://eng.uber.com/real-time-exactly-once-ad-event-processing/                                                                 | 404                                                                               |
| Event Streaming                                | https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying | 404                                                                               |
| Modelling with events                          | https://onote.com/                                                                                                               | DNS lookup fails                                                                  |
| CAP Theorem                                    | https://towardsdatascience.com/cap-theorem-and-distributed-database-management-systems-5c2be977950e                              | 404                                                                               |
| Events on the inside, events on the outside    | https://www.innoq.com/en/blog/domain-events-versus-event-sourcing/                                                               | 404                                                                               |
| Event Sourcing foundations                     | https://www.youtube.com/watch?v=goknSHnTD4M                                                                                      | 404 (oEmbed: video unavailable)                                                   |
| Two Phase Commit                               | http://adrianmarriott.net/logosroot/papers/LifeBeyondTxns.pdf                                                                    | 200, but redirects to a generic page: http://adrianmarriott.net/pagenotfound.html |
| Event Sourcing is not Event Streaming          | https://materialize.com/kafka-is-not-a-database/                                                                                 | 200, but redirects to a generic page: https://materialize.com/blog/               |
| Observability, Auditability and tracing        | https://www.eventstore.com/blog/monitoring-your-eventstoredb-with-prometheus-and-grafana                                         | 200, but redirects to a generic page: https://kurrentdb.kurrent.io/blog/          |
| GDPR                                           | https://www.eventstore.com/blog/protecting-sensitive-data-in-event-sourced-systems-with-crypto-shredding-1                       | 200, but redirects to a generic page: https://kurrentdb.kurrent.io/blog/          |
| How to store events in Event Sourcing          | https://www.eventstore.com/blog/requirements-for-the-storage-of-events                                                           | 200, but redirects to a generic page: https://kurrentdb.kurrent.io/blog/          |
| Snapshots                                      | https://www.eventstore.com/blog/snapshotting-strategies                                                                          | 200, but redirects to a generic page: https://kurrentdb.kurrent.io/blog/          |
| How to store events in Event Sourcing          | https://www.eventstore.com/blog/turning-the-database-inside-out                                                                  | 200, but redirects to a generic page: https://kurrentdb.kurrent.io/blog/          |
| Testing                                        | https://www.eventstore.com/webinars/testing-event-sourced-applications                                                           | 200, but redirects to a generic page: https://kurrentdb.kurrent.io/               |

## Redirected to a different URL

The content appears to have moved. Consider updating these to the final URL.

| Section                                        | URL                                                                                                                                            | Final URL                                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| CQRS                                           | http://www.kamilgrzybek.com/design/feature-folders/                                                                                            | https://www.kamilgrzybek.com/blog/posts/feature-folders                                                                                |
| Delivery guarantees, outbox and inbox patterns | http://www.kamilgrzybek.com/design/the-outbox-pattern/                                                                                         | https://www.kamilgrzybek.com/blog/posts/the-outbox-pattern                                                                             |
| Rabbit MQ                                      | https://blog.rabbitmq.com/posts/2021/07/rabbitmq-streams-overview/                                                                             | https://www.rabbitmq.com/blog/2021/07/13/rabbitmq-streams-overview                                                                     |
| CQRS                                           | https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf                                                                                    | https://cqrs.wordpress.com/wp-content/uploads/2010/11/cqrs_documents.pdf                                                               |
| SQS, SNS                                       | https://data.solita.fi/lessons-learned-from-combining-sqs-and-lambda-in-a-data-project/                                                        | https://www.solita.fi/blogs/lessons-learned-from-combining-sqs-and-lambda-in-a-data-project/                                           |
| Distributed processes                          | https://docs.microsoft.com/en-us/azure/architecture/patterns/choreography                                                                      | https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography                                                             |
| Events Ordering                                | https://docs.microsoft.com/en-us/azure/architecture/patterns/competing-consumers                                                               | https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers                                                      |
| Distributed processes                          | https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga                                                          | https://learn.microsoft.com/en-us/azure/architecture/patterns/saga                                                                     |
| Events and commands                            | https://docs.microsoft.com/en-us/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/domain-events-design-implementation | https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation |
| Distributed processes                          | https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj591569(v=pandp.10)                                                                | https://learn.microsoft.com/en-us/previous-versions/msp-n-p/jj591569(v=pandp.10)                                                       |
| Event versioning                               | https://leanpub.com/esversioning/read                                                                                                          | https://leanpub.com/read/esversioning                                                                                                  |
| Modelling with events                          | https://miro.com/miroverse/event-storming/                                                                                                     | https://miro.com/templates/event-storming/                                                                                             |
| Observability, Auditability and tracing        | https://pulsar.apache.org/docs/en/deploy-monitoring/                                                                                           | https://pulsar.apache.org/docs/5.0.x/deploy-monitoring/                                                                                |
| Idempotency                                    | https://stripe.com/docs/api/idempotent_requests                                                                                                | https://docs.stripe.com/api/idempotent_requests                                                                                        |
| Idempotency                                    | https://www.checkout.com/docs/payments/manage-payments/retry-a-payment                                                                         | https://www.checkout.com/docs/developer-resources/api/idempotency (a different page: general idempotency docs)                         |
| Delivery guarantees, outbox and inbox patterns | https://www.confluent.io/blog/enabling-exactly-kafka-streams/                                                                                  | https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/                                      |
| Events Ordering                                | https://www.dataversity.net/how-to-overcome-data-order-issues-in-apache-kafka/#                                                                | https://www.dataversity.net/articles/how-to-overcome-data-order-issues-in-apache-kafka/                                                |
| Event Sourcing foundations                     | https://www.eventstore.com/                                                                                                                    | https://www.kurrent.io/ (EventStore rebranded to Kurrent)                                                                              |
| Event versioning                               | https://www.eventstore.com/blog/event-immutability-and-dealing-with-change                                                                     | https://kurrentdb.kurrent.io/blog/event-immutability-and-dealing-with-change/                                                          |
| Short living streams                           | https://www.eventstore.com/blog/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention                           | https://kurrentdb.kurrent.io/blog/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/                |
| Snapshots                                      | https://www.eventstore.com/blog/snapshots-in-event-sourcing                                                                                    | https://kurrentdb.kurrent.io/blog/snapshots-in-event-sourcing/                                                                         |
| Event Sourcing foundations                     | https://www.eventstore.com/event-sourcing                                                                                                      | https://kurrentdb.kurrent.io/event-sourcing/                                                                                           |
| Event Streaming                                | https://www.oreilly.com/ideas/why-local-state-is-a-fundamental-primitive-in-stream-processing                                                  | https://www.oreilly.com/content/why-local-state-is-a-fundamental-primitive-in-stream-processing/                                       |
| Rabbit MQ                                      | https://www.rabbitmq.com/getstarted.html                                                                                                       | https://www.rabbitmq.com/tutorials                                                                                                     |
| Observability, Auditability and tracing        | https://www.rabbitmq.com/prometheus.html                                                                                                       | https://www.rabbitmq.com/docs/prometheus                                                                                               |

## Unverifiable

| Section                                                           | URL                                                                                                                                            | Result                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Event versioning                                                  | https://developers.redhat.com/blog/2021/05/04/event-driven-apis-and-schema-governance-for-apache-kafka-get-ready-for-kafka-summit-europe-2021# | 403 (blocked or rate-limited)                 |
| Idempotency                                                       | https://dt-23597.medium.com/if-youre-using-kafka-with-your-microservices-you-re-probably-handling-retries-wrong-8492890899fa                   | 403 (blocked or rate-limited)                 |
| Events Ordering, Idempotency                                      | https://engineering.nanit.com/rabbitmq-retries-the-full-story-ca4cc6c5b493                                                                     | 403 (blocked or rate-limited)                 |
| Event Sourcing foundations                                        | https://itnext.io/event-sourcing-explained-b19ccaa93ae4                                                                                        | 403 (blocked or rate-limited)                 |
| Event Sourcing is not Event Streaming                             | https://itnext.io/event-sourcing-why-kafka-is-not-suitable-as-an-event-store-796e5d9ab63c                                                      | 403 (blocked or rate-limited)                 |
| Event Driven Architecture                                         | https://leejamesgilmore.medium.com/serverless-event-driven-systems-9617c6406064                                                                | 403 (blocked or rate-limited)                 |
| Handling errors in event streams                                  | https://levelup.gitconnected.com/error-handling-in-event-driven-systems-1f0a7ef2cfb7                                                           | 403 (blocked or rate-limited)                 |
| Observability, Auditability and tracing                           | https://medium.com/@bocytko/most-common-design-issues-found-during-production-readiness-and-post-incident-reviews-47b2c9e14a9d                 | 403 (blocked or rate-limited)                 |
| Event Sourcing foundations                                        | https://medium.com/@eulerfx/scaling-event-sourcing-at-jet-9c873cac33b8                                                                         | 403 (blocked or rate-limited)                 |
| Idempotency                                                       | https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb                                   | 403 (blocked or rate-limited)                 |
| Handling business logic                                           | https://medium.com/eventuous/aggregate-pattern-in-domain-driven-design-7ad823475099                                                            | 403 (blocked or rate-limited)                 |
| Event Sourcing foundations, How to store events in Event Sourcing | https://medium.com/itnext/essential-features-of-an-event-store-for-event-sourcing-13e61ca4d066                                                 | 403 (blocked or rate-limited)                 |
| Distributed processes                                             | https://medium.com/plexiti/aggregates-and-sagas-are-process-owners-e8c8ba973da7                                                                | 403 (blocked or rate-limited)                 |
| Event Sourcing is not Event Streaming                             | https://medium.com/serialized-io/apache-kafka-is-not-for-event-sourcing-81735c3cf5c                                                            | 403 (blocked or rate-limited)                 |
| Handling errors in event streams                                  | https://medium.com/ssense-tech/exploring-advanced-error-handling-patterns-with-event-driven-architecture-part-i-e2f37741d904                   | 403 (blocked or rate-limited)                 |
| Handling errors in event streams                                  | https://medium.com/ssense-tech/exploring-advanced-error-handling-patterns-with-event-driven-architecture-part-ii-235bb72cfa19                  | 403 (blocked or rate-limited)                 |
| Eventual Consistency                                              | https://medium.com/swlh/handling-eventual-consistency-11324324aec4                                                                             | 403 (blocked or rate-limited)                 |
| GDPR                                                              | https://medium.com/sydseter/gdpr-compliant-event-sourcing-with-hashicorp-vault-f27011cac318                                                    | 403 (blocked or rate-limited)                 |
| Eventual Consistency                                              | https://queue.acm.org/detail.cfm?id=2610533                                                                                                    | 403 (blocked or rate-limited)                 |
| Two Phase Commit                                                  | https://queue.acm.org/detail.cfm?id=3321612                                                                                                    | 403 (blocked or rate-limited)                 |
| Delivery guarantees, outbox and inbox patterns                    | https://vladmihalcea.com/how-to-extract-change-data-events-from-mysql-to-kafka-using-debezium/                                                 | 429 (blocked or rate-limited)                 |
| Modelling with events                                             | https://www.linkedin.com/pulse/user-story-mapping-domain-discovery-trond-hjorteland/                                                           | 200 (host may return 200 for missing content) |
| Event versioning                                                  | https://www.researchgate.net/publication/315637858_The_dark_side_of_event_sourcing_Managing_data_conversion                                    | 403 (blocked or rate-limited)                 |
| Business rules                                                    | https://www.sciencedirect.com/science/article/pii/S2212827117311095                                                                            | 403 (blocked or rate-limited)                 |
| Read models and Projections                                       | https://zimarev.com/blog/event-sourcing/projections/                                                                                           | 403 (blocked or rate-limited)                 |
| Event Driven Architecture                                         | https://zimarev.com/blog/event-sourcing/startup-story-1/                                                                                       | 403 (blocked or rate-limited)                 |

## Own links without a post

All 101 event-driven.io links match a post folder slug, including `/en/anti-patterns/`, `/en/key-value-stores/`, `/en/property-sourcing/` and `/en/state-obsession/`, which are posts, not pages.

These Architecture Weekly links match no folder slug and no `redirectFrom` or `redirectAliases` entry. Only webinars 21 to 23 are imported.

| Section                      | URL                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Migrating to Event Sourcing: | https://www.architecture-weekly.com/p/webinar-1-from-crud-to-event-sourcing   |
| Modelling with events        | https://www.architecture-weekly.com/p/webinar-3-implementing-distributed      |
| CQRS                         | https://www.architecture-weekly.com/p/webinar-4-from-cqrs-to-crud-in-practice |
| Read models and Projections  | https://www.architecture-weekly.com/p/webinar-7-design-and-test-event-driven  |
| Modelling with events        | https://www.architecture-weekly.com/p/webinar-9-radek-maziarka-modularization |
| Modelling with events        | https://www.architecture-weekly.com/p/webinar-15-mario-bittencourt-leveraging |
| Event versioning             | https://www.architecture-weekly.com/p/webinar-16-simple-patterns-for-events   |

These resolve only through `redirectFrom`, because the post folder uses a different slug:

| Link slug                               | Post folder                                                         |
| --------------------------------------- | ------------------------------------------------------------------- |
| `announcing-strictland-new-contract`    | `2026-06-15--announcing-strictland-contract-testing`                |
| `dealing-with-race-conditions-in-event` | `2025-10-20--dealing_with_race_conditions_in_eda_using_read_models` |
| `fixing-bugs-in-event-sourcing-is`      | `2026-07-27--fixing-bugs-in-event-sourcing-is-hard`                 |
| `vertical-slices-their-ownership-and`   | `2026-08-10--vertical-slices-and-dependencies`                      |

## Formatting defects

| Line          | Section                                                                             | Problem                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 34            | Events and commands                                                                 | Empty `- ` item.                                                                                                                      |
| 97            | Distributed processes                                                               | Link without the `- ` prefix.                                                                                                         |
| 179           | Handling errors in event streams                                                    | Link without the `- ` prefix.                                                                                                         |
| 259           | Migrating to Event Sourcing:                                                        | Empty `- ` item.                                                                                                                      |
| 282           | Event versioning                                                                    | Link text omits the `?tab=readme-ov-file` query that the target has.                                                                  |
| 300           | GDPR                                                                                | Stray pasted text after the link: "ant feature would be to undo the plan to the previous step", repeated twice.                       |
| 309           | Event Sourcing is not Event Streaming                                               | Link text anchor `#this-is-not-event-sourcing` differs from the target anchor `#1319-this-is-not-event-sourcing-but-event-streaming`. |
| 251, 256, 261 | Bi-Temporal modelling:, Migrating to Event Sourcing:, Uniqueness in Event Sourcing: | Headings end with a colon; no other heading does.                                                                                     |
| 265           | Uniqueness in Event Sourcing:                                                       | Links the JVM `events-versioning` sample, which looks misplaced; the same link appears under Event versioning.                        |
| 498           | Kafka                                                                               | The list stops after one Kafka link.                                                                                                  |

## Duplicates

Within one section:

- Handling business logic: https://www.youtube.com/watch?v=GtWVGJp061A (lines 79 and 81).
- Business rules: https://www.youtube.com/watch?v=Fuac__g928E (lines 317 and 318).
- SQS, SNS: https://sookocheff.com/post/messaging/dissecting-sqs-fifo-queues/ (lines 485 and 487).

The same URL in several sections:

| URL                                                                                                  | Sections (lines)                                                              |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| https://www.architecture-weekly.com/                                                                 | My works (6), Architecture (343)                                              |
| https://event-driven.io/en/how_to_effectively_compose_your_business_logic/                           | Handling business logic (64), Modelling with events (151)                     |
| https://event-driven.io/en/idempotent_command_handling/                                              | Handling business logic (65), Idempotency (425)                               |
| https://event-driven.io/en/checkpointing_message_processing/                                         | Distributed processes (94), How to store events in Event Sourcing (223)       |
| https://event-driven.io/en/strict_ordering_in_event_handling/                                        | Distributed processes (97), Events Ordering (415)                             |
| https://event-driven.io/en/anti-patterns/                                                            | Modelling with events (137), Anti-patterns (163)                              |
| https://event-driven.io/en/one_or_more_event_that_is_the_question/                                   | Anti-patterns (168), Event Sourcing foundations (198)                         |
| https://event-driven.io/en/on_putting_stream_id_in_event_data/                                       | Anti-patterns (169), Event Sourcing foundations (199)                         |
| https://www.architecture-weekly.com/p/deduplication-in-distributed-systems                           | Handling errors in event streams (181), Idempotency (426)                     |
| https://www.youtube.com/watch?v=tjiuDQbkRFY                                                          | Handling errors in event streams (182), Architecture (347)                    |
| https://medium.com/itnext/essential-features-of-an-event-store-for-event-sourcing-13e61ca4d066       | Event Sourcing foundations (215), How to store events in Event Sourcing (228) |
| https://github.com/oskardudycz/EventSourcing.JVM/tree/main/samples/events-versioning                 | Uniqueness in Event Sourcing: (265), Event versioning (279)                   |
| https://event-driven.io/en/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/ | Eventual Consistency (407), Idempotency (427)                                 |
| https://engineering.nanit.com/rabbitmq-retries-the-full-story-ca4cc6c5b493                           | Events Ordering (419), Idempotency (436)                                      |

The same resource under a different URL:

- YouTube `Lu-skMQ-vAw`: with playlist parameters in Event Driven Architecture (13), plain in Event Sourcing is not Event Streaming (305).
- YouTube `xzekp1RuZbM`: `youtube.com` in Modelling with events (148), `www.youtube.com` in Bi-Temporal modelling: (254).
- `verraes.net/2019/05/ddd-msg-arch/`: `http` in Architecture / DDD (359), `https` in Messaging foundations (382).
- The same post, `2025-10-20--dealing_with_race_conditions_in_eda_using_read_models`: through Architecture Weekly in Distributed processes (96) and through event-driven.io in Events Ordering (414).

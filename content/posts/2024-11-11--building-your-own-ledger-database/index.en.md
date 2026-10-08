---
title: Building your own Ledger Database
category: Software Architecture
cover: 2024-11-11-cover.png
author: oskar dudycz
redirectFrom: /building-your-own-ledger-database/
---

**Building your own database sounds like moronic move.** Yet, that’s the advice I gave recently on the Architecture Weekly Discord channel. Why did I do it?  

**One member asked about the recommendation for replacing Amazon QLDB. What’s Amazon QLDB?** Apparently, it's the database type that Amazon is sunsetting next year. It was also the database that the question asker was using in most of his project services.

Jokes aside, Amazon states that:

> _Amazon Quantum Ledger Database (Amazon QLDB) is a fully managed ledger database that provides a transparent, immutable, and cryptographically verifiable transaction log owned by a central trusted authority. You can use Amazon QLDB to track all application data changes, and maintain a complete and verifiable history of changes over time._

And suggests [migrating it to Amazon Aurora PostgreSQL](https://aws.amazon.com/blogs/database/migrate-an-amazon-qldb-ledger-to-amazon-aurora-postgresql/).

Which is an option, but I suggested something else. Before we go to my suggestion, let’s discuss what are actually Ledger Databases. We talk about them in the previous editions, so [#169 - 4th March 2024](https://www.architecture-weekly.com/p/architecture-weekly-169-4th-march) and [#181 - 27th May 2024](https://www.architecture-weekly.com/p/architecture-weekly-181-27th-may).

## What Are Ledger Databases?

**Ledger databases are specialized data stores designed to provide an immutable and verifiable record of transactions over time.** They ensure that every change to the data is recorded and cannot be tampered with, making them ideal for applications where data integrity and audibility are critical. Many industries have such legal requirements.

**Unlike traditional databases that allow data to be overwritten or deleted, ledger databases use an append-only model.** Every transaction is added as a new entry, and previous entries remain untouched. This creates a complete history of all data changes, which is crucial for compliance, auditing, and tracing.

Under the hood, ledger databases combine familiar database technologies with cryptographic techniques to guarantee data integrity. Each transaction is often cryptographically hashed and linked to the previous one, forming a chain that makes tampering evident.

## Use cases for Ledger Databases

So, where do ledger databases fit into our architectural toolbox?

**In business domains where you have to prove that no one even has a slight option to mutate the operations log.** In some of them, user access management is not enough. You’d better use databases natively made write-ahead, not allowing you to mutate or delete anything. For instance:

-   **Financial Services:** Banks, payment processors, and financial institutions need to maintain accurate and immutable records of transactions for compliance and auditing purposes. A ledger database ensures that every deposit, withdrawal, or transfer is permanently recorded.

-   **Healthcare Records:** Patient data must be accurate, secure, and compliant with regulations like [HIPAA](https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act). Ledger databases help maintain a record of patient information and medical history, ensuring that any access or modification is immutably logged.

-   **Government and Legal Records:** Official documents like property titles, court records, and legislative changes require integrity and traceability. An immutable ledger provides a trustworthy record that can withstand legal scrutiny.

-   **Supply Chain Management:** Tracking the movement of goods from origin to destination requires transparency and trust among multiple parties. Ledger databases can record each step in the supply chain, providing a verifiable history that stakeholders can rely on.

Immutable log of data, ummmm. Do I smell Event Sourcing?

## Ledger Databases vs. Event Stores and Event Sourcing

There's often confusion between ledger databases and event stores used in event sourcing. While both deal with immutable data and event histories, they serve different purposes.

**Event Sourcing is a design pattern in which outcomes of the business logic are stored as events.** Then, they’re used for making the next decisions. They’re stored in sequences called streams. That can sound a bit scary, but in other words, streams represent records in classical databases. Events are the state; there’s no other state. Thus, the name Event Sourcing.

**In Event Sourcing flow looks as follows:**

-   read all events from the stream,

-   interpret it getting the current state,

-   run business logic,

-   store the new event(s) in the same stream you’ve read from.

-   rinse/repeat.

**So, Event Stores are essentially Key-Value databases: The key is the record id, and the value is the sequence of events.** And they’re used for transactional operations focused on business logic. Read more in my articles:

-   [Event stores are key-value databases, and why that matters](/en/event_stores_are_key_value_stores/)

-   [Is the audit log a proper architecture driver for Event Sourcing?](/en/audit_log_event_sourcing/)

-   [How to get the current entity state from events?](/en/how_to_get_the_current_entity_state_in_event_sourcing/)

Ledger databases, on the other hand, are specialized databases optimized for storing transactions, often with financial data semantics. They focus on accurately recording transactions, with an emphasis on data integrity and compliance, and often include cryptographic verification. So, they’re more like audit logs with much different data granularity than event stores.

**Your main driver is to record and keep immutable data as side effects of your business logic, not your decision model.**

Event stores are also general-purpose databases, while ledger databases are tailored for specific domains like finance. For example, financial ledger databases accurately record monetary transactions and balances and ensure consistency in financial operations. Going down the niche allows for domain-specific optimizations and limits the scope of usage.

## Custom Ledger Databases

Those optimisation needs drove Uber and Stripe to build their own Ledger Databases; I’ve gone through them in linked editions.

### Stripe Ledger

**Stripe built its own ledger system focused on storing and tracking financial data.** Stripe operates at a massive scale, processing billions of events daily. They had to standardize the representation of money movement. With various systems and partners involved, they required a unified way to represent transactions despite the complexity and imperfections of real-world financial data.

The ledger had to be an immutable source of truth that could be relied upon for internal operations and external audits. So, they also had to ensure data integrity and trustworthiness.

The real world is imperfect, and they had to embrace it. Banking and network partners can provide malformed reports or errors, and they needed custom system to keep these imperfections manageable.

Stripe's Ledger is an immutable log of events that models internal data-producing systems with common patterns like:

-   **State Machine Representation:** Ledger encodes producer systems as state machines, modeling behavior as logical fund flows—the movement of balances between accounts.

-   **Double-Entry Bookkeeping:** They applied traditional accounting principles to validate money movement, ensuring that credits and debits balance out.

-   **Data Quality Platform:** On top of Ledger, they built a platform to unify detection of money movement issues and provide response tooling. This ensures proactive alerting and surfaces issues promptly.

As mentioned, they operate on an extreme scale. Ledger processes five billion events per day. To handle this scale, they optimized their systems for high throughput and low latency. By using double-entry bookkeeping and immutable logs, they ensured that every transaction is accounted for and that the system can detect discrepancies.

Read more:

-   [Ledger: Stripe’s system for tracking and validating money movement](https://stripe.com/blog/ledger-stripe-system-for-tracking-and-validating-money-movement)

### Uber's LedgerStore

**Similarly to Stripe, Uber developed its own ledger system, LedgerStore. To better meet its needs, Uber moved from using DynamoDB to its custom solution**.

At Uber's scale, DynamoDB became expensive. Managing petabytes of data and trillions of indexes was not cost-effective. DynamoDB's limitations led to issues like hot partitions and write throttling, requiring complex workarounds that increased system complexity.

Uber needed a system that ensured data integrity, handled massive data volumes efficiently, and provided better performance.

Similarly, they needed to ensure the data integrity and correctness guarantees, ensuring that individual records are immutable and corrections are trackable. To do that, they came up with their own ledger database. They designed an indexing system capable of handling trillions of indexes, supporting various access patterns via different types of indexes (strongly consistent, eventually consistent, time-range indexes).

Uber migrated over a trillion ledger entries from DynamoDB to LedgerStore. They used [Apache Spark](https://spark.apache.org/) for incremental backfill, processing data in chunks to avoid system overloads.

To ensure accuracy, Uber used shadow validation, comparing outputs from the old and new systems to detect discrepancies, achieving a 99.99% accuracy rate.

They encountered performance issues due to poorly distributed index data and inefficient indexing methods. To address this, they optimized partition keys and revised their indexing approach to reduce unnecessary scans.

Read more:

-   [Uber - How LedgerStore Supports Trillions of Indexes at Uber](https://www.uber.com/en-AU/blog/migrating-from-dynamodb-to-ledgerstore/)

-   [Uber - Migrating a Trillion Entries of Uber’s Ledger Data from DynamoDB to LedgerStore](https://www.uber.com/en-AU/blog/migrating-from-dynamodb-to-ledgerstore/)

## What was the Discord member use case?

**The person who asked the question faced the challenge of migrating over 100 ledgers before Amazon QLDB was deprecated.** The company operates in a regulated environment, providing imaging solutions for healthcare and pharmaceutical clients.

**They need to:**

-   Log critical information about actions taken on data, including action type, timestamp, source, outcome, and the identity of the individual or entity who carried out the action.

-   Implement measures to protect the accuracy and completeness of audit logs and verify the integrity of the data.

-   Restrict data access to authorized individuals using appropriate access controls.

-   Provide an audit trail that cannot be altered or deleted.

-   Ability to deploy within specific legal jurisdictions to comply with data residency requirements.

**Currently, they use a combination of AWS services:**

-   DynamoDB for storing data.

-   Kinesis for streaming changes.

-   Lambda functions to write to the ledger (either in the same account or cross-account).

Given the scale and regulatory requirements, moving to a centralized solution like Amazon Aurora PostgreSQL might be expensive and may not meet all needs. For instance:

-   you know that I love PostgreSQL, but you cannot easily prove that modifying data is not possible,

-   they are built for transactional operations, not great for massive batch operations,

-   they have maximum limits of size (PG - 32 TB of data),

-   etc.

## S3 and DuckDB as Ledger Database

![A friendship meme replacing ledger database services with Amazon S3 as the preferred foundation.](2024-11-11-cover.png)

I suggested considering Amazon S3 as the storage for audit logs. Here's why:

1.  **Immutability:** S3 can be configured immutable using [Object Lock with WORM (Write Once Read Many)](https://aws.amazon.com/blogs/storage/protecting-data-with-amazon-s3-object-lock/) policies, making it suitable for storing audit trails that cannot be altered or deleted.

2.  **Cost-Effective:** S3 storage is relatively cheap, especially compared to relational databases. You pay for what you use, and there are different storage classes to optimize costs based on access patterns. I went extensively with cost analysis in: [Show me the money! Practically navigating the Cloud Costs Complexity](/en/show-me-the-money-practically-navigating/). Here, the pricing model works in favour of the audit log, as you can batch data. Also, you can use cheaper tiers to store audit logs, as you don’t need to access them on a daily basis.

3.  **Scalability:** S3 scales virtually infinitely, handling vast amounts of data without the need to provision capacity.

4.  **Data Residency and Compliance:** S3 supports data residency requirements by allowing you to choose the regions where data is stored and applying specific compliance configurations. Read more in [AWS documentation](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-aws-semicon-workloads/meeting-data-residency-requirements.html).

5.  **Batch Operations:** Since they already have an intermediate step storing data in DynamoDB, they could batch operations and store them in S3, reducing costs and simplifying the architecture.

6.  **Querying Data with DuckDB:** For querying data in S3, tools like DuckDB can be used. DuckDB is a fast, embeddable database optimized for analytical queries on large datasets stored in files like [Parquet](https://parquet.apache.org/).

### Challenges and solutions

**Of course, this solution is not perfect. It’s just fine-tuned for this specific scenario.**

In a nutshell, S3 is immutable, so that should be easier to prove than a relational database. It’s really cheap. Especially if you have an intermediate step in storing data inside the database already (the Discord member already used DynamoDB for transactional data), then you could batch operations.

Querying large datasets in S3 can have latency. To optimize query performance, using file format like [Parquet](https://parquet.apache.org/) and partitioning data is a must. Why? I wrote longer on that in [Using S3 but not the way you expected. S3 as strongly consistent event store](/en/using-s3-but-not-the-way-you-expected/). Partitioning should also help to set up the granular authorisation rules for sensitive audit logs. Se allow that through IAM policies, using encryption, and monitoring access logs.

S3 provides eventual consistency for overwriting PUTS and DELETES, but since we're using an append-only model with new objects, consistency should not be an issue.

**DuckDB is a relatively new player in the game.** I haven’t used it yet in production. Still, all the people I know who have used it say only good things. It’s already used in production by many and [has good support for cloud-native BLOB storage like the S3](https://duckdb.org/docs/extensions/httpfs/s3api.html). It also supports the [Parquet file format](https://parquet.apache.org/) that enhances the querying capabilities and decreases the file size.

Read also more in:

-   [DuckDB and AWS — How to Aggregate 100 Million Rows in 1 Minute](https://towardsdatascience.com/duckdb-and-aws-how-to-aggregate-100-million-rows-in-1-minute-3634eef06b79)

-   [Reading and Writing Parquet Files](https://duckdb.org/docs/data/parquet/overview.html)

Of course, it’d be good to do a Proof of Concept before making a final decision and compare with AWS-based solutions to move from dynamo to S3, e.g.:

-   [DynamoDB data export to Amazon S3: how it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)

-   [Export and analyze Amazon DynamoDB data in an Amazon S3 data lake in Apache Parquet format](https://aws.amazon.com/blogs/database/export-and-analyze-amazon-dynamodb-data-in-an-amazon-s3-data-lake-in-apache-parquet-format/)

I think such a proposed solution can be even cheaper than the existing one (as AWS Kinesis is not cheap). Plus, even with DuckDB it may be less moving pieces. It also fits well with the current tech stack.

Uber used [Apache Spark](https://spark.apache.org/) in their migration, and DuckDB is a modern alternative. So, there’s alignment here. See also:

-   [Use dbt and Duckdb instead of Spark in data pipelines](https://medium.com/datamindedbe/use-dbt-and-duckdb-instead-of-spark-in-data-pipelines-9063a31ea2b5)

## Why Not Use Existing Databases Like Amazon QLDB?

Well, obviously, because Amazon is sunsetting it. Jokes aside, why do they do it?

While Amazon hasn't publicly detailed all the reasons, we can speculate based on industry trends and challenges.

Ledger databases are a niche market. The specialized nature of QLDB might have led to limited adoption compared to more general-purpose databases. Uber and Stripe's decision shows that those niches also have specific needs that are hard to match with the general-built solution.

**That’s why Amazon may be refocusing resources on services with higher demand and broader applicability, such as Amazon Aurora PostgreSQL.**

Implementing and managing general usage ledger databases is extremelt complex. Customers might prefer more familiar relational databases with added features for auditing and compliance. Those who have strong legal needs may still come up with simpler solutions, as I described.

## Why build your own database?

Ledger databases offer significant benefits for applications that require an immutable and verifiable record of application behaviour. However, they come with tradeoffs in complexity, performance, and cost.

The experiences of companies like Stripe and Uber demonstrate that sometimes building your own ledger system is necessary, especially when existing solutions don't meet the specific needs of your domain, optimizing for specific use cases, and being prepared to tackle data integrity, system performance, and scalability challenges.

**For discussed case, considering alternatives like using S3 with tools like DuckDB provides a more cost-effective and manageable solution while meeting regulatory requirements.** It simplifies the architecture, reduces costs, and leverages familiar AWS services and open-source tools.

I think that the interesting observation for building your own solution can be on two spectrums:

-   **Needing something more powerful:** like Stripe and Uber,

-   **Needing something simpler and cheaper:** like in the proposal.

I think this will also be a trend, and we’ll see more options like that as BLOB storage becomes more powerful and cheap. Building your own database layer might seem like a bold move, but sometimes, it's the right one—especially when it ensures the longevity and integrity of your applications.

**We should not be afraid to think about our own stuff; if we verify that:**

-   our solution has a limited number of features that won’t grow,

-   the competition doesn’t match our needs,

-   we have the team skills and capacity to run and maintain it,

-   the cost model is aligned with our needs,

-   performance will be good enough.

Those sound like famous last words, so we must be extremely careful. We can decrease the risk by using popular tools that will not disappear and will be relatively easy to replace, such as S3 and DuckDB, in our case.

**What are your thoughts?**

If you haven’t joined yet, here’s the [invitation link](https://discord.gg/jEtvTFPy) to our Discord community. Come on in and discuss your challenges with us!

Cheers!

Oskar

**p.s.** I’d like to know what’s interesting and what’s not. Your thoughts mean much to me, and I'd like to make this newsletter useful for you! I’d be grateful to fill out this short survey: [https://forms.gle/1k6MS1XBSqRjQu1h8](https://forms.gle/1k6MS1XBSqRjQu1h8).

**p.s.2. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).

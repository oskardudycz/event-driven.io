---
title: Ordering, Grouping and Consistency in Messaging systems
category: Software Architecture
cover: 2024-11-18-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

**We went quite far from our Queue Broker series in recent editions, but today, we’re back to it!** Did you miss it?

**[In an initial article, we introduced the QueueBroker](/en/architecture-weekly-190-queuing-backpressure/)—a central component that manages queuing, backpressure, and concurrency.** In distributed systems, queues do more than buffer requests or smooth traffic spikes. They can ensure order, enforce grouping, and provide guarantees for exclusive processing. These properties are critical when designing systems that must be both scalable and consistent.

**[On Friday, I wrote an extensive guide on how to handle idempotency in command handling on my blog.](/en/idempotent_command_handling/)** I explained the challenges in ensuring that our business operations are handled correctly without duplicates. I went through the various ways to handle it, both explicitly and generically, from building predictable state machines to handling it in business logic to leveraging Optimistic Concurrency, retries, and distributed locks.

**I recommend handling idempotency using business logic, as it’s highly dependent on the business rules. And those rules tend to change.** If we use generic handling, we’re always adding additional overhead, even if most of our applications rarely have idempotency issues. That’s something to consider, as it can also increase costs in cloud environments.

Such implementations are also tricky. We need to handle thread safety and atomic updates correctly. I showed the implementation using a distributed lock like Redis, as in-memory implementation isn’t that simple.

And _“in-memory implementation isn’t that simple”_ is a good challenge. And I’ll take it today!

**It’s a good opportunity to merge ideas from those two articles. We’ll build a thread-safe, in-memory** _**IdempotencyKey Store**_ **by combining single-writer, grouped queuing with idempotency guarantees.** We’ll also explore the broader architectural principles behind grouping and ordering in queuing systems like Amazon SQS FIFO, Kafka, and Azure Service Bus.

But first, let’s start with the problem grouping solves.

## Why Grouping Matters

In distributed systems, operations in a shared state—whether it’s a bank account, an order, or a device—are often processed asynchronously. But asynchronous processing introduces risk:

-   **Transactions arrive out of order:** Imagine a bank processes a withdrawal before a deposit. A user with a $0 balance may see a failed transaction, even though funds were deposited seconds earlier.

-   **Duplicate messages cause inconsistent state:** A hotel system receives two commands to check in a guest. Without safeguards, the system may allocate two rooms to the same guest.

-   **Concurrency can break assumptions:** In an IoT system, a device sends a “door open” event while another service processes a “door locked” command. Without guarantees, these commands could execute simultaneously, leaving the system in an undefined state.

**Grouping allows related operations to be processed sequentially while operations on different groups run concurrently.** We’re correlating a set of tasks, telling that they need to be processed in the certain order: For example:

-   **Banking systems group by account:** Ensuring withdrawals and deposits for the same account are serialized.

-   **Order management systems group by order:** Ensuring updates to the same order (e.g., payment, shipping) are processed in order.

-   **IoT systems group by device:** Ensuring events from the same device don’t conflict.

Grouping isn’t a new idea. Systems like Amazon SQS FIFO, Azure Service Bus, and Kafka have implemented variations of this pattern to solve similar problems.

## How Popular Systems Handle Grouping and Ordering

### Amazon SQS FIFO

**Regular [Amazon SQS](https://aws.amazon.com/sqs/) doesn’t provide any ordering guarantee. Still, some years ago, AWS added a variation: [Amazon SQS FIFO (First-In-First-Out)](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html).**

Amazon SQS FIFO ensures messages with the same message group ID are processed in the right order. Groups are independent, so tasks for one group don’t block tasks in another. For example, in an e-commerce system, group messages by _orderId_ to ensure updates for the same order (e.g. _“Order Placed”,_ _“Payment Confirmed”_) are processed sequentially. Messages for different orders can be processed concurrently.

Of course, ordering guarantees come at the cost of throughput: FIFO queues process fewer messages per second than standard queues. We may be also facing bottlenecks in group processing. A slow task in one group delays all subsequent tasks in that group.

### Azure Service Bus

[Azure Service Bus uses sessions](https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions) to group related messages. Messages in a session are processed sequentially, similar to SQS FIFO, but with added features like session locks to ensure only one consumer handles a session at a time.

Session locks make Azure Service Bus robust against failures, but managing them adds complexity. Throughput can be impacted if too many messages are grouped into the same session.

### Kafka

**Kafka achieves grouping through partitioning.** Each partition processes events sequentially, and partitions can be assigned to consumers for parallel processing. Partitioning requires careful design.

Partitions represent a physical split. Poor partitioning can lead to uneven workload distribution. You can also have a single consumer inside the consumer group to handle those messages, but you cannot distribute them. When consumers fail, or new consumers join, partitions must be reassigned, temporarily disrupting processing.

### RabbitMQ

RabbitMQ ensures message ordering within a queue. Messages are delivered in the same order they are enqueued. However, once multiple consumers subscribe to the queue, RabbitMQ balances messages across consumers in a round-robin fashion, potentially disrupting the ordering.

**RabbitMQ doesn't natively support grouping like SQS FIFO or Azure Service Bus sessions.** Implementing message grouping typically requires creating additional queues or custom routing logic with exchanges. To achieve that you could:

-   Use one queue per group. For instance, in an e-commerce system, you can create a queue for each orderId to process updates like "Order Placed" and "Order Shipped" sequentially.

-   Alternatively, use consistent hashing to route messages with the same key (e.g., orderId) to the same queue, ensuring grouped ordering.

**While creating separate queues for each group ensures strict ordering, it increases operational complexity.** It can lead to scaling issues. Managing thousands of queues for a high-cardinality grouping key like userId can overwhelm RabbitMQ. It also causes increased resource usage. Each queue consumes memory and CPU, leading to overhead in large-scale systems.

## Guaranteeing idempotency with queue

**[The generic implementation of the idempotency handling looks as follows](/en/idempotent_command_handling/). We:**

1.  Attempt to acquire the lock for the specified key.

2.  If the attempt wasn’t successful, return the default result.

3.  If we acquire the lock, then run the business logic.

4.  If it fails, release the lock. We don’t want to lock the key, let someone fix the state condition, and retry later.

5.  If it was successful, accept the lock and return the result.

In code it can look as follows:

```typescript
async function idempotent <T>(
  handler: () => Promise<T>,
  options: IdempotentOptions<T>,
): Promise<T> {
  const { key, timeoutInMs, defaultResult, store } = options;

  //Attempt to acquire the lock for the specified key
  const appended = await store.tryLock(key, { timeoutInMs });

  // If it was used, return the default result
  if (!appended) return await defaultResult();

  try {
    // run handler
    const result = await handler();

    // Mark operation as successful
    await store.accept(key);

    return result;
  } catch (error) {
    // Release key if it was used already
    await store.release(key);
    throw error;
  }
};

type IdempotentOptions<T> = {
  store: IdempotencyKeyStore;
  key: string;
  defaultResult: () => T | Promise<T>;
  timeoutInMs?: number;
};
```

The store can be defined as:

```typescript
type IdempotencyKeyStore = {
  tryLock: (
    key: string,
    options?: { timeoutInMs?: number },
  ) => boolean | Promise<boolean>;
  accept: (key: string) => void | Promise<void>;
  release: (key: string) => void | Promise<void>;
};
```

The store has the following methods:

-   _tryLock_ - that tries to lock the specified key for a certain period of time. Returns true if the lock was acquired and false otherwise.

-   _accept_ - accepts the key lock after successful handling.

-   _release_ - releases the lock in case of handling failure.

What’s most important is that those operations should be thread-safe and atomic. Without that, we may face race conditions. The safest option is to use a distributed lock, e.g., Redis or a relational database.

**But we’re not here today to choose the safest options but to learn!**

What if we had an implementation that ensures that we schedule the processing of a certain task one at a time? [Actually, we have it from our older edition](/en/architecture-weekly-190-queuing-backpressure/).

Let’s join those forces together!

![Captain Planet and the Planeteers imagined a kinder world. What can we do  better? | SYFY WIRE](2024-11-18-cover.jpg "Captain Planet and the Planeteers imagined a kinder world. What can we do  better? | SYFY WIRE")

**We’ll use a queue broker single-writer capabilities to ensure that only a single check for the existence of a specific idempotency key will be made in parallel.**

**Our Queue Broker allows multiple tasks to be enqueued and handled asynchronously.** As long as we don’t reach the maximum number of active tasks, they can be processed in parallel. This is useful for limiting the number of connections in the connection pool.

The other tasks will wait in the queue to be processed. Our Queue Broker uses a single-writer pattern to ensure that scheduling happens sequentially. We can enqueue multiple tasks, but they’re not processed immediately; the background queue processing processes them. Thanks to that, we can control the concurrency.

**That’s what we need today: limit the concurrency processing per task group.** Let’s adapt our initial implementation to handle those needs. Let’s start by adding tracking of the active task groups (_note: I’m using TypeScript here)_:

```typescript
type Queue = QueueItem[];

class QueueBroker {
  private queue: Queue = [];
  private isProcessing = false;
  private activeTasks = 0;
  private activeGroups: Set<string> = new Set();

  constructor(private options: QueueOptions) {}

  //(...)
}
```

We’re already keeping:

-   the tasks queue,

-   semaphore informing if we’re currently processing tasks already,

-   active tasks counter

We’re adding a simple set to keep the list of currently active task groups.

**Now, we need to update the enqueue method to allow specifying the task group id:**

```typescript
type Queue = QueueItem[];

type QueueTaskOptions = { taskGroupId?: string };

type QueueItem = {
  task: () => Promise<void>;
  options?: QueueTaskOptions;
};

class QueueBroker {
  // (...)  

  enqueue<T>(task: QueueTask<T>, options?: QueueTaskOptions): Promise<T> {
    if (this.queue.length >= this.options.maxQueueSize) {
      return Promise.reject(
        'Too many pending connections. Please try again later.',
      );
    }

    return this.schedule(task, options);
  }

  private schedule<T>(
    task: QueueTask<T>,
    options?: QueueTaskOptions,
  ): Promise<T> {
    return promiseWithDeadline(
      (resolve, reject) => {
        const taskWithContext = () => {
          return new Promise<void>((resolveTask, failTask) => {
            const taskPromise = task({
              ack: resolveTask,
            });

            taskPromise.then(resolve).catch((err) => {
              failTask(err);
              reject(err);
            });
          });
        };

        this.queue.push({ task: taskWithContext, options });
        if (!this.isProcessing) {
          this.ensureProcessing();
        }
      },
      { deadline: this.options.maxTaskIdleTime },
    );
  }
}
```

**We’re making it optional. If someone doesn’t provide the task group id, the task will be processed with the default behaviour (so it will not have any causal relation with other tasks).** In the schedule method, we’re also just passing the task together with options.

The real code happens in the queue processing. Just to recap, only a single call of a _processQueue method_ can happen at a time (for details, [check the previous article](https://www.architecture-weekly.com/i/147613456/single-writer-pattern)).

```typescript
class QueueBroker {
  // (...)  
  private processQueue(): void {
    try {
      while (
        this.activeTasks < this.options.maxActiveTasks &&
        this.queue.length > 0
      ) {
        const item = this.takeFirstAvailableItem();

        // finish processing if there's nothing to process
        if (item === null) return;

        const groupId = item.options?.taskGroupId;

        if (groupId) {
          // Mark the group as active
          this.activeGroups.add(groupId);
        }

        this.activeTasks++;
        void this.executeItem(item);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      this.isProcessing = false;
      if (
        this.hasItemsToProcess() &&
        this.activeTasks < this.options.maxActiveTasks
      ) {
        this.ensureProcessing();
      }
    }
  }
```

Now, besides the concurrency check based on the currently active tasks, we’re also ensuring that there’s no other processing happening with the same group id.

We achieve that by searching for the first eligible task using the _takeFirstAvailableItem_ method:

```typescript
class QueueBroker {
  // (...)  
  private takeFirstAvailableItem = (): QueueItem | null => {
    const taskIndex = this.queue.findIndex(
      (item) =>
        !item.options?.taskGroupId ||
        !this.activeGroups.has(item.options.taskGroupId),
    );

    if (taskIndex === -1) {
      // All remaining tasks are blocked by active groups
      return null;
    }

    // Remove the task from the queue
    const [item] = this.queue.splice(taskIndex, 1);

    return item;
  };

  private hasItemsToProcess = (): boolean =>
    this.queue.findIndex(
      (item) =>
        !item.options?.taskGroupId ||
        !this.activeGroups.has(item.options.taskGroupId),
    ) !== -1;
}
```

**Eligible means, in this context, without task group id or task group id that’s not processed currently.** We return null and stop processing if an eligible item isn’t found. This means that we have exhausted the maximum number of active tasks, and all remaining are task group ids currently being processed. We can stop scheduling tasks, which will be rescheduled after task processing.

```typescript
class QueueBroker {
  // (...)  
  private async executeItem({ task, options }: QueueItem): Promise<void> {
    try {
      await task();
    } finally {
      this.activeTasks--;

      // Mark the group as inactive after task completion
      if (options && options.taskGroupId) {
        this.activeGroups.delete(options.taskGroupId);
      }

      // schedule main processing if it's not running
      this.ensureProcessing();
    }
  }
}
```

Tasks with taskGroupIds that are currently active are skipped, but they remain in the queue and maintain their position.

**If a task's group is still marked as active due to an asynchronous delay in cleaning up active groups, that task will be skipped for this iteration. However, it remains in the queue and will be picked up in the next loop iteration once the group becomes inactive.**

Tasks continue to be processed as long as there are eligible tasks in the queue.

### Example Walkthrough

Let’s say that we enqueued the following tasks:

0.  T1 - G1

1.  T2 - G1

2.  T3 - G2

3.  T4 - G3

4.  T5 -G1

The example iteration can look as follow:

1.  **First Iteration:**

    -   T1 (G1) is dequeued and processed.  
        **queue = \[ T2, T3, T4, T5 \]**

        **activeGroups = \[ G1 \]**

    -   T2 (G1) is skipped because G1 is active.  
        **queue = \[ T2, T3, T4, T5 \]**

        **activeGroups = \[ G1 \]**

    -   T3 (G2) is dequeued and processed.

        **queue = \[ T2, T4, T5 \]  
        activeGroups = \[ G1, G2 \]**

    -   Task 4 (group3) is dequeued and processed.  
        **queue = \[ T2, T5 \]**

    **activeGroups = \[ G1, G2, G3 \].**

    -   T5 (G1) is skipped because G1 is active.

        **queue = \[ T2, T5 \]**

        **activeGroups = \[ G1, G2, G3 \].**

2.  **Second Iteration**

    -   When T1 finishes, G1 is removed from activeGroups.

        **queue = \[ T2, T5 \]**

        **activeGroups = \[ G2, G3 \].**

    -   T2 (G1) is now eligible and dequeued for processing.

    -   **queue = \[ T5 \]**

        **activeGroups = \[ G1, G2, G3 \].**

    -   When T3 or T4 finishes, nothing happens, as only T5 is left, and it has G1, which is actively handled.

    -   **queue = \[ T5 \]**

        **activeGroups = \[ G1 \].**

3.  **Third Iteration**

    -   When T2 finishes, G1 is removed from activeGroups.

        **queue = \[ T5 \]**

        **activeGroups = \[ \].**

    -   T5 (G1) is now eligible and dequeued for processing.

        **queue = \[ \]**

        **activeGroups = \[ G1 \].**

4.  **The fourth iteration is also the last one, as there are no more tasks to be processed.**

Of course, the order is related to the time of task processing and maximum active tasks, but most importantly, group tasks are guaranteed to be processed sequentially.

### Idempotency Key Store with Queue

Having that, we can use our Queue Broker to implement our Idempotency Key Store.

```typescript
class IdempotencyKeyStore {
  private lockedKeys: Map<string, 'Locking' | 'Accepted'> = new Set();

  constructor(private options: IdempotencyKeyStoreOptions) {}

  async tryLock(key: string): Promise<boolean> {
    if (this.lockedKeys.has(key)) {
      // Key is already locked
      return false;
    }

    // Use the QueueBroker to schedule a lock acquisition task
    return this.options.queueBroker.enqueue(
      ({ ack }) => {
        const hasKey = this.lockedKeys.has(key);
        if (!hasKey) {
          this.lockedKeys.add(key, 'Locking');
        }
        ack();
        return Promise.resolve(hasKey);
      },
      // Ensure tasks for the same key are serialized
      { taskGroupId: key },
    );
  }

  accept(key: string): Promise<void> {
    // Set the key to be accepted and marked as used
    if (this.lockedKeys.has(key)) {
      this.lockedKeys.set(key, 'Accepted');
    }

    return Promise.resolve();
  }

  async release(key: string): Promise<void> {
    // Remove the key from the locked set, allowing new tasks to proceed
    if (this.lockedKeys.has(key)) {
      this.lockedKeys.delete(key);
    }
  }
}
```

Of course, that’s just a basic implementation that doesn’t include time to live, etc. but this could be also implemented based on our (not so?) simple Queue Broker.

## Trade-Offs

Of course, our implementation has tradeoffs, so please, please don’t take it to production. What tradeoffs?

1.  **Linear Search Overhead:** Iterating through the queue to find the first task whose group is not active is linear (O(n)), which can add overhead if the queue grows large. While it's simple and ensures FIFO order, frequent searches might degrade performance slightly as the queue grows. For very large queues we’d need to use different structures, maybe queue per key, but then we could fell down to the other issues we discussed on RabbitMQ handling.

2.  **Delay in Processing Blocked Tasks:** Tasks belonging to active groups remain blocked in the queue until their group becomes inactive. This can lead to inefficiency if most tasks belong to a few heavily used groups, as tasks from other groups might have to wait unnecessarily while the queue is scanned.

    In our case, this delay should be minor since blocked tasks remain in the queue and are retried in the next loop iteration. But for the real world queue processing tasks may not be as simple as just checking in the key store cache. To optimize further, you could prioritize ungrouped or less-congested groups, but this could break FIFO guarantees.

3.  **Asynchronous Cleanup Lag:** If there's a delay in cleaning up active groups (due to asynchronous task completion), eligible tasks might be skipped unnecessarily for one iteration. The delay is usually negligible and doesn’t break FIFO, but it might result in minor inefficiencies in high-throughput systems. The retry mechanism works well and ensures eventual processing in most cases. No additional mitigation is required unless you observe frequent long-running tasks or unexpected delays.

4.  **Fairness with Ungrouped Tasks:** If many tasks have taskGroupId, ungrouped tasks might have to wait longer than expected due to the findIndex search order. The current approach does not explicitly prioritize ungrouped tasks, even though they are always eligible for execution. If fairness for ungrouped tasks is critical, you could maintain two separate queues (grouped and ungrouped) and process ungrouped tasks first. This would add complexity but ensure fairness.

## TLDR

As you see, most of those issues can also be transferred to the real queues we discussed and the real tradeoff analysis we could perform in our systems.

I hope that this article has shown you the challenges and potential solutions to implementing message grouping. While it’s good to have, it can also degrade performance and scalability.

We should be careful about that.

**What would you say if, in the next edition, I’d go with queue prioritisation or deduplication?**

Also last but not least. How do you like the format? What would you change in it? What topics would you like to see here?

Cheers

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).

---
title: Making your system observability predictable
category: Software Architecture
cover: 2024-09-23-cover.png
author: oskar dudycz
redirectFrom: /making-your-system-observability/
---

Welcome to the next week!  

[Last week, we discussed why logs and metrics are not enough.](/en/when-logs-and-metrics-arent-enough/) I promised that we’d discuss how to instrument our code. And that’s what we’re going to do today.

**I aim to show you how to do it predictably, making observability a quality parameter of our system. It's not just a bunch of fancy logs.**

Speaking about logs, let’s quickly recap what we learnt so far.

* * *

**Logs give us granular details about what's happening in the system at a specific time.** They allow you to read the story of what has happened. Yet, even if they’re structured, they're fragmented. We often patch them manually to understand how a task moves through the system. Again, this is not the most educated way for troubleshooting.

**Predefined dashboards showing metrics are great for tracking** _**known unknowns**_**—scenarios we don’t want but know can happen.** They give us an aggregated view of how your system is performing right now. If the queue size grows or the wait time for acquiring connections increases, it's a red flag that something's wrong. However, these metrics are often too high-level to diagnose the root cause.

**We know what happened and need to take action, but we don't understand why.** We can guess, but guessing in production issues is not the predictable way to handle them. Your boss wouldn’t like to hear that you do Guess Driven Development.

* * *

**The alternative is modern Observability tooling based on the Open Telemetry standard. They give us both logical and physical tools.**

Logical:

-   **traces** - they’re like call stacks for distributed systems. They follow a business operation as it travels through multiple system components, recording every important interaction.

-   **spans** - represent single steps in that trace—a unit of work. They contain start and end time, attributes, metadata that adds context to the span (e.g., query type, queue size), and commonly shared values

-   **span events** - milestones or significant events that happen within the span (e.g., query failed, connection acquired).

-   **metrics -** as I mentioned, metrics can be helpful in a certain range of scenarios. We can still do them with Open Telemetry.

## Instrumenting Observability

To understand what’s happening in our system, we need to instrument it, specify what we need, and describe how we’d like to see it. For instance, we’d like to see how long connection acquisition took or how long the connection was open.

**OpenTelemetry gives you automatic instrumentation for standard tools like database connectors, web frameworks, and messaging systems.** Yet the automatic instrumentation lacks context. Your context. If you want to know why certain queries are slow or which specific task is holding a connection for too long, you need manual instrumentation. This means adding custom spans to your code to record business-specific actions—like when a query on the "orders" table starts, how many rows it returns, and how long it takes to execute.

Without manual instrumentation, you're left guessing when things go wrong. It takes more effort, but it’s crucial for getting detailed insights that allow you to diagnose and fix issues quickly. You’re not just tracking the surface-level “what happened,” but also the deeper “why and how,” which is essential in complex systems like connection pooling.

**Still, we’re now building the connection pool, so kinda providing the automated instrumentation for others.** That’s a challenge, as we cannot guess what people may need. That also means we should provide as much information as possible, allowing people to filter out what’s not useful.

## Practical Instrumentation

If we’d like to provide both traces and metrics, we need to define providers accordingly: _TraceProvider_ and _MeterProvider_.

**The** _**TracerProvider**_ **is the central entity keeping the general configuration of how we’d like to handle tracing.** Like:

-   sampling strategies (which spans to collect),

-   span processors (what to do with spans after they’re created),

-   exporters (where to send the span data).

In most setups, you have a single global _TracerProvider_. _TraceProvider_ can create and manage multiple _tracers._

**Each tracer can be customised for different system parts**, allowing you to trace specific services or components. You can have different tracers for each module. Each module and team may require different needs, so it’s worth allowing them to diverge. Still, having a central place where you set up basic conventions is a good practice.

**Accordingly,** _**MeterProvider**_ **centralises the metrics handling.** It lets to:

-   manage metrics (contextual to the specific feature, component or service),

-   Configure metrics export (where to send the span data),

-   Global access to metrics (allowing your entire application to report metrics consistently).

Some metrics can be highly contextual to the business features (e.g., the number of orders processed per minute), while others can be the same for the whole system (e.g., the number of Web API requests handled per second).

In Node.js and TypeScript, the simplest setup for them could look as follows:

```
import {
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import {
  BasicTracerProvider,
} from '@opentelemetry/sdk-trace-base';

const tracerProvider = new BasicTracerProvider();

const meterProvider = new MeterProvider({
    readers: [],
});
```

And yes, you need to install the following packages:

```
npm install --save @opentelemetry/api @opentelemetry/sdk-metrics @opentelemetry/sdk-trace-base
```

Cool stuff, but what’s next?

## Predictable Observability

My initial plan for this article was to show you the full Graphana Docker Compose setup, ask you to run it, and show some colourful spans. Something like this from [Dynatrace docs](https://www.dynatrace.com/news/blog/opentelemetry-demo-identifying-metrics-traces/):

![OpenTelemetry demo: Identifying metrics and traces](image-2.jpg "OpenTelemetry demo: Identifying metrics and traces")

That’d be cool. I hear you when you say, _“Those articles are nice, but it’d be great if there were more diagrams.”_ No worries, we’ll get there. But you can already see that stuff in the vendor blogs. Google it, and you’ll see a lot of results.

I want to show you today a bit harder, but the sure way—the way inspired by the excellent talk from [Martin Thwaites](https://martinjt.me/) (btw. he’s the person you should follow to learn about observability).

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=yVQMnQKSsh4)`

I was sitting in a dark room in Oslo when Martin gave this talk. When I left, I was a bit brainwashed.

**TLDW is that Martin showed that we should treat Spans (and other Telemetry data) as our system's output.** In other words, we should verify whether we produce the expected telemetry data.

I wasn’t fully ready for that at the moment I saw this talk, but I already knew that I needed to process it, and I’ll get back to this idea in the future. It took me a while, but the idea constantly circled in my head.

**It’s sad, but many of us haven’t seen a real production system.** After seven years of my career, I retrospectived and realised that I put only three systems on prod in that span—not a significant number. The startup and venture capital culture of placing high bets is one of the key factors. People are taught to deliver something and sell it as fast as they can or pivot. Many products are not reaching even that phase, running out of money.

That’s also why we don’t learn how to operate predictable production. We spend most of our time pushing features or discussing whether we should use _var_, const, or strongly typed variables. We don’t have the incentive to focus on observability because we won’t need that without going to production.

[We already discussed how to answer the question, “Is it production ready?”](/en/architecture-weekly-191-is-it-production/). And I think that one of the most important features is observability. It can be reflected in database data and events stored or published, but it should also be reflected in Telemetry. That should be a part of our acceptance criteria.

**That’s what Martin was postulating in his talk.**

Becoming production-ready is a process. We cannot magically turn the switch and be responsible. We cannot postpone thinking about observability until two weeks before going to production. We cannot just sprinkle it with the observability auto-instrumentation.

Or actually, we can, but we’ll fail then.

How can we do it practically, then? Provide the automated setup to ensure that we produce the expected telemetry data.

## Test-Driven Instrumentation

Let’s try to instrument our Connection Pool in a Test-Driven Way. We’ll use Node.js and TypeScript, but you can do the same in other environments.

Let’s start with the basic telemetry setup for our tests:

```
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { getTestMetricReader } from './metrics';

export const getTestOtelSetup = () => {
  // Trace setup
  const tracerProvider = new BasicTracerProvider();

  const inMemorySpanExporter = new InMemorySpanExporter();

  tracerProvider.addSpanProcessor(
    new SimpleSpanProcessor(inMemorySpanExporter),
  );
  tracerProvider.register();

  const tracer = tracerProvider.getTracer('test-tracer');

  // metrics setup
  const inMemoryMetricsExporter = new InMemoryMetricExporter(
    AggregationTemporality.DELTA,
  );
  const inMemoryMetricsReader = getTestMetricReader(inMemoryMetricsExporter);
  const meterProvider = new MeterProvider({
    readers: [inMemoryMetricsReader],
  });

  const meter = meterProvider.getMeter('test-meter');

  return {
    tracer,
    meter,
    spanExporter: inMemorySpanExporter,
    metricsExporter: inMemoryMetricsExporter,
    metricsReader: inMemoryMetricsReader,
  };
};
```

_Btw. it sucks that Substack doesn’t have code highlighting. But I know that I have some blind readers, so images are not an option…_

I’m using the simple in-memory setup here. For now, I don’t want to export it outside (e.g., to Graphana Tempo, Jaeger, Honeycomb, etc.). I just want to have the setup that allows me to check if certain spans and metrics were registered.

For in-memory metrics, I had to [steal the code from the official repo](https://github.com/open-telemetry/opentelemetry-js/blob/6515ed8098333646a63a74a8c0150cc2daf520db/experimental/packages/opentelemetry-instrumentation-http/test/utils/TestMetricReader.ts):

```
import {
  MetricReader,
  type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';

export class TestMetricReader extends MetricReader {
  constructor(private _exporter: PushMetricExporter) {
    super({
      aggregationTemporalitySelector:
        _exporter.selectAggregationTemporality?.bind(_exporter),
    });
  }

  protected onForceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onShutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async collectAndExport(): Promise<void> {
    const result = await this.collect();
    await new Promise<void>((resolve, reject) => {
      this._exporter.export(result.resourceMetrics, (result) => {
        if (result.error != null) {
          reject(result.error);
        } else {
          resolve();
        }
      });
    });
  }
}

export const getTestMetricReader = (
  inMemoryMetricsExporter: PushMetricExporter,
) => new TestMetricReader(inMemoryMetricsExporter);
```

Nothing fancy. The goal of this class is to collect and export metrics data using a provided exporter. Metrics in Open Telemetry are push-based, so we need to have a way to collect and export them. Essentially, the reader just waits for all metrics to be pushed to the exporter. The exporter is responsible for processing and sending metrics data to a backend or another storage.

Having that, we can set up our tests:

```
import assert from 'assert';
import { beforeEach, describe, it } from 'node:test';
import { SimpleConnectionPool } from './connectionPool';
import { getTestOtelSetup } from './otel';

void describe('Connection Pool', () => {
  let pool: SimpleConnectionPool;
  let connectionString: string;    
  const { spanExporter, metricsExporter, metricsReader } = getTestOtelSetup();

  beforeEach(() => {
    connectionString = 'postgres://user:pass@localhost/test';
    pool = new SimpleConnectionPool({
      connectionString,
      maxConnections: 3,
      maxQueueSize: 5,
      maxWaitingTime: 100,
    });

    spanExporter.reset();
    metricsExporter.reset();
  });

  // (...) here be dragons. Or tests. Or both.
});
```

We’re setting up telemetry and a connection pool and ensuring that we reset our telemetry data before each test to get proper test isolation.

## Testing Spans

Let’s say we’d like to provide information on connection acquisition. This is essential for connection pooling management, as it informs how long it actually took to get a connection. The acquisition may take longer if we reach the maximum number of open connections and need to wait or if we’re opening a new connection instead of just leasing the one already opened.

The simplest test could look as follows:

```
void it('exports span with acquisition information', async () => {
  const connection = await pool.connect();
  assert.ok(connection, 'Connection should be successful');

  // Verify that a span was generated
  const spans = spanExporter.getFinishedSpans();
  assert.strictEqual(spans.length, 1, 'One span should be generated');

  // Verify the span name
  const generatedSpan = spans[0];
  assert.strictEqual(
    generatedSpan.name,
    'aw.db.connection_pool.connection_acquiring',
  );
  assert.strictEqual(
    generatedSpan.status.code,
    SpanStatusCode.OK,
  );
});
```

Of course, such a test will fail, as we haven’t added any instrumentation yet. But hey, that’s correct, as we’d like to follow [Red-Green-Refactor](https://martinfowler.com/bliki/TestDrivenDevelopment.html)!

Let’s add some instrumentation:

```
export class SimpleConnectionPool implements ConnectionPool {
  private isEnded = false;
  private queueBroker: QueueBroker;

  constructor(
    private tracer: Tracer,
    private options: ConnectionPoolOptions
  ) {
    this.queueBroker = new QueueBroker({
      maxQueueSize: this.options.maxQueueSize,
      maxActiveTasks: this.options.maxConnections,
      maxTaskIdleTime: this.options.maxWaitingTime,
    });
  }

  connect(): Promise<PooledConnection> {
    if (this.isEnded) {
      return Promise.reject('Connection Pool is ended');
    }

    // 1. Get current active context
    const currentContext = context.active();

    // 2. Create a new span
    const acquisitionSpan = this.tracer.startSpan(
      'aw.db.connection_pool.connection_acquisition'
    );

    // 3. Attach span to active context
    const childContext = trace.setSpan(currentContext, acquisitionSpan);

    // 4. Run code within the context
    return context.with(childContext, () =>
      this.queueBroker.enqueue(({ ack }) => {
        const connection = this.openConnection(ack);

        // 5. Ending the span
        acquiringSpan.setStatus({ code: SpanStatusCode.OK });
        acquiringSpan.end();
        return Promise.resolve(connection);
      }),
    );
  }

  // (..) Dragons and the rest of code
}
```

We’re injecting here a tracer, which is responsible for recording new spans. Having that, we:

1.  **Get current active context.** The trace needs to start somewhere. Typically, when our web API gets the HTTP request, our code is triggered by the delivery of the message from the queue. That’s handled typically by the auto-instrumentation. Then, we need to get the already initiated context and attach it to it. Without that, it’d be a free rider without referencing a specific context. For our case, the connection pool is usually called as part of application logic, so it’s crucial to attach it to an active request context.

2.  **Create a new span.** We need to create a specific span that is contextual to our operation. We want to track the acquisition time, so we’re starting that as the first step before even enqueuing it to the queue broker.

3.  **Attach span to active context.** Having the span, we can attach it to the active context, getting the span child context as a result, and...

4.  **Run code within the context.**

5.  **Ending the span with success status.** After getting the connection (either leased or new), we can close our span successfully. Here, we should ensure with try/catch/finally that we also handle errors and always end span, but following TDD, we should only provide the minimum set of features to satisfy the test, and that’s what we did!

The final touch is to update the test setup to pass the trace provider:

```
void describe('Connection Pool', () => {
  let pool: SimpleConnectionPool;
  let connectionString: string;

  const { spanExporter, metricsExporter, metricsReader, tracer } =
    getTestOtelSetup();

  beforeEach(() => {
    connectionString = 'postgres://user:pass@localhost/test';
    pool = new SimpleConnectionPool(tracer, {
      connectionString,
      maxConnections: 3,
      maxQueueSize: 5,
      maxWaitingTime: 100,
    });

    spanExporter.reset();
    metricsExporter.reset();
  });

  // (...) 🐉🐲
});
```

## Naming things

Few more things here. Naming conventions. We named our span as follows:

```
aw.db.connection_pool.connection_acquisition
```

You can think about span as the stream of events, where attributes are metadata, and events are things that happened during its lifetime. We discussed in [another post how critical it is to select the right key](/en/using-s3-but-not-the-way-you-expected/). The same thing goes with spans. In our case, we’re splitting the span parts with dots, each representing the specific host.

We start with the prefix representing our library, system, module, etc. In our case, it’s **aw** (from Architecture Weekly—how smart!). Then we say that it’s related to **db** operations and **connection\_pool**. And then, we say that our span represents connection acquisition.

You can read more about span semantic naming conventions (and other OpenTelemetry components) in:

-   [OpenTelemetry documentation](https://opentelemetry.io/docs/concepts/semantic-conventions/),

-   Jeremy Blythe's article “[Effective Trace Instrumentation with Semantic Conventions](https://www.honeycomb.io/blog/effective-trace-instrumentation-semantic-conventions)” on the HoneyComb blog,

-   Martin Thwaites’ article “[OpenTelemetry Best Practices #1: Naming](https://www.honeycomb.io/blog/opentelemetry-best-practices-naming)” is also on the HoneyComb blog.

## Testing metrics

In OpenTelemetry, we can define the following types of metrics:

1.  **Counter -** a metric that can only increase. It’s typically used to track an event's total number of occurrences over time, such as the number of requests served or errors encountered. Counters always reset when the system restarts and cannot be decreased.

2.  **Gauge** - a metric that can increase or decrease over time. Gauges are used to track values that fluctuate, like CPU usage, memory usage, or the number of active connections in a pool.

3.  **Histogram** - used to record the distribution of values over a period of time. It’s handy for measuring response times, latencies, or connection wait times. Histograms allow you to capture how often specific values occur within different ranges, helping you understand the distribution of performance metrics.

**Let’s define a metric showcasing the connection acquisition time.** We’ll use the histogram, as each acquisition will have a different value. Based on that, we can calculate measurements like mean, median, etc.

```
import {
  type Histogram,
  type Meter,
} from '@opentelemetry/api';

const connectionAcquisitionTimeHistogram = (meter: Meter) =>
  meter.createHistogram('connection_acquisition_time', {
    description: 'Time taken to acquire a connection from the pool',
    unit: 'ms',
  });

type ConnectionPoolMetrics = {
  connectionAcquisitionTime: Histogram;
  // more would come here
};

const connectionPoolMetrics = (meter: Meter): ConnectionPoolMetrics => ({
  connectionAcquisitionTime: connectionAcquisitionTimeHistogram(meter),
});
```

Let’s also add a helper for tests to collect recorded histogram values:

```
const collectHistogramDataPoints = async (
  metricName: string,
  metricsReader: TestMetricReader,
  metricsExporter: InMemoryMetricExporter,
): DataPoint<Histogram>[] => {
  await metricsReader.collectAndExport();

  // Check if metrics were recorded
  const metrics = metricsExporter.getMetrics();
  assert(metrics.length > 0, 'Metrics should be recorded');

  // Find the metric
  const acquisitionMetric = metrics
    .flatMap((m) => m.scopeMetrics.flatMap((sm) => sm.metrics))
    .find((metric) => metric.descriptor.name === 'metricName');

  assert(acquisitionMetric, `${metricName} metric should be present`);

  return acquisitionMetric.dataPoints as DataPoint<Histogram>[];
};
```

And add the new test ensuring that metrics recording was made:

```
void describe('Connection Pool', () => {
  void it('exports acquisition time metric', async () => {
    const connection = await pool.connect();
    assert.ok(connection, 'Connection should be successful');

    // Check the data point for recorded acquisition time
    const dataPoints = await collectHistogramDataPoints(
      'aw.db.connection_pool.acquisition_time',
      metricsReader,
      metricsExporter,
    );

    assert.strictEqual(dataPoints.length, 1);

    const [dataPoint] = dataPoints;
    assert.ok(
      dataPoint.value.count === 1,
      'Connection acquisition time should be recorded once',
    );
    assert.ok(
      dataPoint.value.min! > 0,
      'Connection acquisition time should be recorded and greater than 0',
    );
  });
});
```

Yup, simple as that. Method _collectHistogramDataPoints_ is also an example of how you can wrap this not-so-pleasant API to make testing easier. The test will fail, so let’s instrument our code to record the metric.

Having it, we can instrument our code to record those times.

```
export class SimpleConnectionPool implements ConnectionPool
  constructor(
    private tracer: Tracer,
    private metrics: ConnectionPoolMetrics,
    private options: ConnectionPoolOptions,
  ) {
    // (...)
  }

  connect(): Promise<PooledConnection> {
    if (this.isEnded) {
      return Promise.reject('Connection Pool is ended');
    }

    const enqueueTime = Date.now();

    // 1. Get current active context
    const currentContext = context.active();

    // 2. Create a new span
    const acquisitionSpan = this.tracer.startSpan(
      'aw.db.connection_pool.connection_acquisition'
    );

    // 3. Attach span to active context
    const childContext = trace.setSpan(currentContext, acquisitionSpan);

    // 4. Run code within the context
    return context.with(childContext, () =>
      this.queueBroker.enqueue(({ ack }) => {
        const connection = this.openConnection(ack);

        const acquisitionTime = Date.now() - enqueueTime;

        this.metrics.connectionAcquisitionTime.record(acquisitionTime);

        // 5. Ending the span
        acquiringSpan.setStatus({ code: SpanStatusCode.OK });
        acquiringSpan.end();
        return Promise.resolve(connection);
      }),
    );
  }

  // (..) Dragons and the rest of code
}
```

And bang! We have our code instrumented and verified.

## To the infinity and beyond!

If such tests look to you more like: _“Nice, but how can I benefit from it?”_ then think further. In the same way, you can orchestrate and test the observability of your business code.

You can not only ensure that you generate correct spans representing infrastructure context but also the inputs and outputs of your command handler, business logic. You can define business metrics like order processing time and many more.

Thanks to this approach, you don’t need to play with docker-compose and OpenTelemetry UIs manually and click a lot to see if what you expect is what you get. You can get predictable observability as a part of your core process.

Of course, you need to be sane in that and test stuff like attributes, events, and recordings. You shouldn’t test all the nitty gritty. Be reasonable.

**And I’d like to know if I should continue this observability journey. I have more in my buck, as I’m working on instrumenting Emmett and Pongo.**

**Your thoughts mean much to me, and I'd like to make this newsletter be useful for you! Please respond to this email, comment, or fill out this short survey: [https://forms.gle/1k6MS1XBSqRjQu1h8](https://forms.gle/1k6MS1XBSqRjQu1h8)!**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian](https://savelife.in.ua/pl/donate/) organisation or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

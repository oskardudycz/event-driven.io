---
title: Long-polling, how to make our async API synchronous
category: "API"
cover: 2021-11-17-cover.png
author: oskar dudycz
---

![cover](2021-11-17-cover.png)

I'll continue today a topic of handling eventual consistency that I started in [the previous article](/pl/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/). This time let's learn the trick called "long-polling". It helps in cheating on the API surface that our operations are synchronous.

Let's imagine that we're either have an asynchronous process making changes, or just our database (e.g. MongoDB, ElasticSearch) has built-in eventual consistency. Having that, we cannot be sure if changes were already applied or not. The best was if we had a push notifications mechanism (e.g. WebSockets-based), informing the client application about the end of processing. Then the client could take the needed operation.

However, for various reasons, this might not be a viable solution. Sometimes we don't have enough experience with such solutions, and our coworkers get defensive. WebSockets are nice but tricky to configure, especially if we're using load balancers. We may also be making an API-first approach where API is treated as our product. Some of our clients might not want to use push notifications. It's also a mind shift experience, and UI/UX needs to reflect the asynchronous nature of backend logic. 

Too often, we decide to perform retries on our clients until we get satisfying data. I had the case once when client applications were doing DDoS attach on our backend, right in the middle of the important demo for the client. Blind client-side retries are no-go for the production systems.

What to do then? We can consider using long-polling. We're shifting retries from the clients to the backend side. Instead of being banged by the API retries, we're waiting until the operation is finished or retrying the calls internally. Thanks to that, we're getting more control of them. We can easier include logic like backpressure, circuit breakers etc. 

How to implement it? I'll use NodeJS and TypeScript endpoint as an example. In other environments, it can be done accordingly. Let's say that we're opening the shopping cart. We're processing the change and storing the data. We're using MongoDB, which doesn't guarantee reading-own-writes by default.

Our handler looks as follows:

```typescript
export const route = (router: Router) =>
  router.get(
    '/clients/:clientId/shopping-carts/:shoppingCartId',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        const query = mapRequestToQuery(request);

        const result = await getShoppingCartDetails(query);

        if(result === null) {
          response.sendStatus(404);
          return;
        }

        response.set('ETag', toWeakETag(result.revision));
        response.send(result);
      } catch (error) {
        next(error);
      }
    }
  );

function mapRequestToQuery(
  request: Request
): GetShoppingCartDetails {
  if (!isNotEmptyString(request.params.shoppingCartId)) {
    throw 'Invalid request';
  }

  return {
    shoppingCartId: request.params.shoppingCartId,
  };
}
```

We're getting shopping cart id from the URL, getting the result together with ETag to enable optimistic concurrency handling (read more in [How to use ETag header for optimistic concurrency](/pl/how_to_use_etag_header_for_optimistic_concurrency/)). The query handling is using MongoDB api:

```typescript
export type GetShoppingCartDetails = Query<
  'get-shopping-cart-details',
  {
    shoppingCartId: string;
  }
>;

export async function getShoppingCartDetails(
  query: GetShoppingCartDetails
): Promise<ShoppingCartDetails | null> {
  const collection = await getMongoCollection<ShoppingCartDetails>(
    'shoppingCartDetails'
  );

  return collection.findOne({
    shoppingCartId: query.data.shoppingCartId,
  });
}
```

So far, so good. But what will happen if the newly opened shopping cart does not exist yet? We'll get an unexpected _404_ status. It's getting more probable depending on how unlucky we are or how fast we're making requests.

To do _long-polling_, we need to retry our query until the result is available. We'll use for that _retryPromise_ and _retryIfNotFound_ methods introduced in [the previous article](/pl/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/).

```typescript
export type RetryOptions = Readonly<{
  maxRetries?: number;
  delay?: number;
  shouldRetry?: (error: any) => boolean;
}>;

export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  delay: 100,
  shouldRetry: () => true,
};

export async function retryPromise<T = never>(
  callback: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let retryCount = 0;
  const { maxRetries, delay, shouldRetry} = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  do {
    try {
      return await callback();
    } catch (error) {
      if (!shouldRetry(error) || retryCount == maxRetries) {
        console.error(`[retry] Exceeded max retry count, throwing: ${error}`);
        throw error;
      }

      const sleepTime = Math.pow(2, retryCount) * delay + Math.random() * delay;

      console.warn(
        `[retry] Retrying (number: ${
          retryCount + 1
        }, delay: ${sleepTime}): ${error}`
      );

      await sleep(sleepTime);
      retryCount++;
    }
  } while (true);
}

export async function assertFound<T>(() => find: Promise<T | null>): Promise<T> {
  const result = await find();

  if (result === null) {
    throw 'DOCUMENT_NOT_FOUND';
  }

  return result;
}

export function retryIfNotFound<T>(
  find: () => Promise<T | null>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  return retryPromise(() => assertFound(find), options);
}
```

Method _assertFound_ throws an exception, when the record was not found, to trigger promise rejection and retry made by _retryPromise_. It uses [the recommended by AWS retry policy](https://docs.aws.amazon.com/general/latest/gr/api-retries.html). It has configurable exponential backoff to increase the delay between retries, a random factor to not spam our database.

We can wrap our query handler with them:

```typescript
export const route = (router: Router) =>
  router.get(
    '/clients/:clientId/shopping-carts/:shoppingCartId',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        const query = mapRequestToQuery(request);

        const result = await retryIfNotFound(() =>
          await getShoppingCartDetails(query);
        );

        response.set('ETag', toWeakETag(result.revision));
        response.send(result);
      } catch (error) {
        if(error ===  'DOCUMENT_NOT_FOUND') {
          response.sendStatus(404);
        }
        next(error);
      }
    }
  );
```

Thanks to that, we can tune the retry options to get the expected result. However, as I explained in [Tell, don't ask! Or, how to keep an eye on boiling milk](/pl/tell_dont_ask_how_to_keep_an_eye_on_boiling_milk/) article, relying on the timing is never okay. There may be the case when we don't calculate timeout properly, and the document will still be unavailable. We need to be prepared for such a case. We cannot just increase the number of maximum retries. This will keep a hanging connection to our service and may cause connection pool exhaustion. The best is to fail fast and recover. It's always good to provide a maximum deadline to cut it if it takes longer.

We can do that by adding an additional method that will cut the async call. In JS/TS we can extend Promise as follows:

```typescript
declare global {
  interface Promise<T> {
    withTimeout(timeout: number): Promise<T>;
  }
}

export type TIMEOUT_ERROR = 'TIMEOUT_ERROR';

Promise.prototype.withTimeout = function <T>(timeout: number) {
  return Promise.race<T>([
    this,
    new Promise(function (_resolve, reject) {
      setTimeout(function () {
        reject('TIMEOUT_ERROR');
      }, timeout);
    }),
  ]);
};
```

We're using [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) method, which takes an array of promises and finishes immediately when one of the promises succeeds or fail. We're passing two promises:
- first one with our async call,
- second one is with a timer that will just reject promise after the defined timeout.

If our call is fast enough, it'll just return the result, and the timer promise will be finished. Otherwise, the timer will end our async call.

We're also extending the general _Promise type by extending its prototype. Thanks to that, we can use it as:

```typescript
const result = await retryIfNotFound(() =>
    await getShoppingCartDetails(query);
).withTimeout(1000);
```

Which will kill our retries if they take longer than expected.

Long-polling is a simple technique that shouldn't be used by default. We should at first consider changing our UI/UX strategy, consider using push notifications. However, sometimes we just have to pragmatically get the job done, and that's one of the tools that used wisely can help us on that.

Cheers!

Oskar
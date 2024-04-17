---
title: Mocking the native Node.js Test Runner
category: "Testing"
cover: 2024-04-17-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-04-17-cover.png)

**Last week, we discussed an overused but applicable pattern: [in-memory bus](/pl/inmemory_message_bus_in_typescript/).** This time, we'll continue with the leitmotif and talk about mocking. No, I won't mock you; I will mock TypeScript code.

**Node.js in version 18th added its own [native Test Runner](https://nodejs.org/api/test.html).** Why did they do it? Jest looks like [abandonware](https://github.com/jestjs/jest/pull/11529#issuecomment-1027405616) even after [transferring to OpenJs Foundation](https://engineering.fb.com/2022/05/11/open-source/jest-openjs-foundation/), issues are not getting closed, and it's slow. [Vitest](https://vitest.dev/) is a decent new alternative. 

Native Test Runner is also young but nicely integrated directly into Node.js and maintained by the core team. It's lightweight, thanks to [Thiago Valentim's suggestion and contribution](https://github.com/event-driven-io/emmett/pull/14). I started using it in [Emmett](https://event-driven-io.github.io/emmett/getting-started.html). So far, so good; it's really fast (each test file spawns as a Node.js subprocess); sometimes configuring it with TypeScript adds a bit of a headache, but which tool doesn't?

**That's how we're reaching mocking. What's mocking?** Nice, try, but I won't go into that battle. Telling what's right is a slippery slope, as you may get various answers from different people and arguments on the nitty gritty of the definition. Let me just [quote Martin Fowler](https://martinfowler.com/articles/mocksArentStubs.html#TheDifferenceBetweenMocksAndStubs):

> _"(Mocks are) objects pre-programmed with expectations which form a specification of the calls they are expected to receive. (...) mocks insist upon behavior verification. The other doubles can, and usually do, use state verification."_

Fowler shows the following example:

```java
class OrderInteractionTester...

  public void testOrderSendsMailIfUnfilled() {
    Order order = new Order(TALISKER, 51);
    Mock warehouse = mock(Warehouse.class);
    Mock mailer = mock(MailService.class);
    order.setMailer((MailService) mailer.proxy());

    mailer.expects(once()).method("send");
    warehouse.expects(once()).method("hasInventory")
      .withAnyArguments()
      .will(returnValue(false));

    order.fill((Warehouse) warehouse.proxy());
  }
}
```

**That's also the reason why I don't like Mocks;** I disagree that testing if the method is called, by definition, focuses on behaviour. Too often, it just focuses on the mechanics and the way we implement our code instead of the real behaviour we'd like to test. Focusing on behaviour is really important to me, and I wrote about [here](/pl/behaviour_driven_design_is_not_about_tests/). Still, let's not go too far down this road, if you have more time, I encourage you to read a [great take from James Shore about testing without mocks](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks).

Still, it's undeniably useful to sometimes mock the implementation of the real object or verify whether we actually called it. One way or another. Thanks to that, we can test our code or application without calling external services, doing a lot of IO operations, etc. Or ensure that dependency was called. 

**Also, it's not always easy to see the results of our behaviour.** Let's take event publishing [from the last article](/pl/inmemory_message_bus_in_typescript/). We have the following interface:

```typescript
interface EventsPublisher {
  publish<EventType extends Event = Event>(event: EventType): Promise<void>;
}
```

It's fire and forget; the event is forwarded to the handlers. We could write a stub that'd be doing a simple implementation, but hey, we'd repeat much of what we did, as our [implementation is already in-memory](/pl/inmemory_message_bus_in_typescript/). We could, of course, implement a stub for the handler and ensure that it was called. That wouldn't be bad, but we could also just mock it. 

Let's say that we have an [Anti-Corruption Layer](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/acl.html) for payment gateway. We use it to reduce the scope of change in our system's external API. When we make a payment, we also want to notify others that it was successfully made. The dummy implementation for that could look as follows:

```typescript
interface ExternalPaymentGateway {
  makePayment(amount: number): Promise<void>;
}

type PaymentMade = Event<'PaymentMade', { amount: number; paidAt: Date }>;

const PaymentGatewayAcl = (
  externalApi: ExternalPaymentGateway,
  eventPublisher: EventsPublisher,
) => {
  return {
    makePayment: async (amount: number): Promise<void> => {
      await externalApi.makePayment(amount);

      await eventPublisher.publish<PaymentMade>({
        type: 'PaymentMade',
        data: { amount, paidAt: new Date() },
      });
    },
  };
};
```

Our ACL has two dependencies: an external payment API gateway and an Events Publisher. 

We also have a random factor, so the paid date is generated based on the current time. This makes our tests potentially non-deterministic, as from outside, we won't know the exact value. We could pass the function that'd return us a new date and then mock this dependency, but we can also do it differently. We'll get to that in a bit.

Let's try to set up our tests:

```typescript
import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { type Event, type EventsPublisher, getInMemoryMessageBus } from '@event-driven-io/emmett';

void describe('Payment Gateway Acl', () => {
  const eventsPublisher = getInMemoryMessageBus();
  const externalPaymentGatewayStub: ExternalPaymentGateway = {
    makePayment: () => Promise.resolve(),
  };  
  const sut = PaymentGatewayAcl(externalPaymentGatewayStub, eventsPublisher);

  const now = new Date();
  mock.timers.enable({ apis: ['Date'], now });

  void it('publishes event when payment was made',  () => {
     console.log('We'll get here in a bit!');
     assert.fail();
  });

  void it('does NOT publish event when payment failed', () => {
     console.log('We'll get here in a bit!');
     assert.fail();
});
```

The syntax is similar to the one you may know from Jest, Jasmine, and other testing frameworks. We're starting by setting up our dependencies and system under test: _PaymentGatewayAcl_. We're using the in-memory bus as it is and providing a stub of the external payment gateway with a _do-nothing-and-always-succeed_ implementation.


Node.js Native Test Runner provides basic abstractions for mocking. It is also neat that it allows mocking dates and timers like _setTimeout_. 

```typescript
import { mock } from 'node:test';

const now = new Date();
mock.timers.enable({ apis: ['Date'], now });
```

That means the Node.js test runtime will always inject the provided date instead of generating a new one, making our test non-deterministic. That's the benefit of having a native test runner instead of a third-party solution. Read more options in [documentation](https://nodejs.org/api/test.html#dates).

Let's now fill the first test:

```typescript
void describe('Payment Gateway Acl', () => {
    // (...) setup

  void it('publishes event when payment was made', async (test) => {
    // Given
    const publishEvent = test.mock.method(eventsPublisher, 'publish');

    const amount = Math.random() * 100;

    // When
    await sut.makePayment(amount);

    // Then
    const expectedEvent: PaymentMade = {
      type: 'PaymentMade',
      data: {
        amount,
        paidAt: now,
      },
    };

    verifyThat(publishEvent).calledWith(expectedEvent);
  });
});
```

We're telling the test runner to watch for our event publisher publish method. 

```typescript
const publishEvent = test.mock.method(eventsPublisher, 'publish');
```

We'll need it to verify if the method was called with the expected parameters in the last line. We're also using the _test.mock_ from the test parameter, as this will ensure mocks will be set up only in the scope of the test. It is essential to have test isolation. We wouldn't like to have calls in other tests interfere with our verification:

```typescript
verifyThat(publishEvent).calledWith(expectedEvent);
```

**And here we're getting to the native test runner's childhood issues.** You can mock only a specific method, not the whole object. The API is pretty raw, and not all types are exposed out of the box. 

The _verifyThat_ helper you saw was made by me. Let's discuss how to provide such a simple wrapper.

We need to define types for Mocked Function:

```typescript
type AnyFunction = (...args: any[]) => any;

type Call = {
  arguments: unknown[];
  result: unknown;
  target: unknown;
  this: unknown;
};

type MockedFunction<T extends AnyFunction> = T & {
  mock?: { calls: Call[] };
};
```

We started by defining _AnyFunction_, which (as the name suggests) represents functions with a set of arguments, essentially any functions. Defining it like that is essential; you'll see it in a moment.

Then, we're adding typing for mocked function calls. It represents collections of calls that were made. Each call may have different arguments and results.

Now we can define the _verifyThat_ wrapper as:

```typescript
export const verifyThat = <T extends AnyFunction>(fn: MockedFunction<T>) => {
  return {
    calledWith: (...args: Parameters<T>) => {
      assert.ok(
        fn.mock?.calls.length !== undefined &&
          fn.mock.calls.length >= 1 &&
          fn.mock.calls.some((call) => deepEquals(call.arguments, args)),
      );
    },
    calledTimes: (times: number) => {
      assert.equal(fn.mock?.calls?.length, times);
    },
    notCalled: () => {
      assert.equal(fn?.mock?.calls?.length, 0);
    },
    called: () => {
      assert.ok(
        fn.mock?.calls.length !== undefined && fn.mock.calls.length > 0,
      );
    },
  };
};

const deepEquals = (left: unknown, right: unknown): boolean => {
  try {
    assert.deepEqual(left, right);
    return true;
  } catch {
    return false;
  }
};
```

The _verifyThat_ is a builder function that returns an object with assertions for the passed function. 

**The most interesting one is _calledWith_. It uses [Parameters](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype) to build into TypeScript.** It allows you to construct the array of arguments for the passed function. Moreover, it also respects the parameter types, even if they're different! Thanks to that, the compiler won't let you provide an incomplete number of parameters or use the wrong types. Sweet!

I also added some examples of the other assertions you can pass there. I'm also using built-in assertions provided by Node.js natively. Let's use one of them in the negative scenario test:


```typescript
void describe('Payment Gateway Acl', () => {
    // (...) setup

  void it('does NOT publish event when payment failed', async (test) => {
    const publishEvent = test.mock.method(eventsPublisher, 'publish');
    const makePayment = test.mock.method(
      externalPaymentGatewayStub,
      'makePayment',
    );
    makePayment.mock.mockImplementation(() =>
      Promise.reject('You shall not pass!'),
    );

    const amount = Math.random() * 100;

    try {
      await sut.makePayment(amount);
      assert.fail('Expecting error!');
    } catch {
      verifyThat(publishEvent).notCalled();
    }
  });
});
```

**Native test runner also allows the replacement of the existing implementation.** We're doing that to simulate the failure of the payment gateway.

```typescript
makePayment.mock.mockImplementation(() =>
  Promise.reject('You shall not pass!'),
);
```

This will make our dependency fail; we can verify in the try/catch statement if our event publisher wasn't indeed called by using humble wrapper:

```typescript
verifyThat(publishEvent).notCalled();
```

And that's it. I think I'll also include this set of helpers for Emmett, so you can also benefit from it, but in any case, feel free to _steal_ this code and have fun!

**Yet, beware not to abuse mocks, and try to shape your code so you don't need too much of them.**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

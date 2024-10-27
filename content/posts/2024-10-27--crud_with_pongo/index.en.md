---
title: Bootstrapping CRUD with Pongo
category: "TypeScript"
cover: 2024-10-27-cover.png
author: oskar dudycz
---

![](2024-10-27-cover.png)

**The leitmotif of this blog is the event-driven approach. I truly believe that it's a way to keep our applications closer to business.** By doing so, we can better reflect the business process in our system design and code. And that's great, as it brings multiple benefits: easier evolution, resiliency, and better managed and traced workflows. 

Still, sometimes you don't need all of that. 

**Sometimes you just need a _bag for data_, or the _CRUD_ as most of us prefer to call it.**

**CRUD comes from the common set of operations we perform on our data: Create, Read, Update, and Delete. It's an implementation style suited for Content Management Systems.** The responsibility is to store and manage data. Of course, we wrap that with basic validation, consistency rules, and authorisation. We run simple business logic or enrich data with information available only on the backend. You just put some data and retrieve it. What you put is what you get.

In CRUD, you don't have specific behaviour. What's more, from the system side, this data doesn't have much business context. That's why implementations are generic. It only has meaning for the user who puts this data inside and retrieves it. The user interprets it upon reading and makes decisions outside of the system based on it.

**CRUD can also be a valid approach for proof of concepts.** For instance, if we have a product idea, we bootstrap a basic application without an extensive set of business workflows, just basic data ingestion and visualisation, to ensure that there's potential in this idea.

In general, there is nothing to be ashamed of when doing CRUD. It's a valid implementation style but with limited use cases. If we choose it wisely, then it's all fine. 

We need also to remember that we should not set this decision in stone. 

**That's why I like to match CRUD with [CQRS](https://event-driven.io/en/cqrs_facts_and_myths_explained/).** How come? Aren't they contradicting? Not in my world!

**CQRS stands for Command Query Responsibility Segregation.** It's a structural pattern. It tells us to slice our business application by the behaviour and then segregate them into two responsibilities:
- Command handling - business logic that can change state but should not be returning business data,
- Query handling - returns data but does not change the state (_"Asking a question should not change the answer").

If those rules are fulfilled, our internal implementation can be CRUD, and we can apply CQRS principles. That's essential for proof of concepts. We start with the simple, generic implementation and evolve it once new business requirements appear. As we already segregated our business functionality, we can adjust precisely the places that need to be changed. CRUD doesn't have to be an unmaintainable amalgamate!

Still, no matter which way you choose, I believe that Pongo is a decent tool for CRUDs. My way or highway? Nah, I won't tell you how to live!

**Why Pongo?**
- It's a Node.js tool, so it's a lightweight and accessible environment with a big, vibrant community. You should not have issues with potential hiring,
- It runs on PostgreSQL, so it's easy operational-wise, and it's easy to set up your hosting in cloud providers, on-premise or services like [Neon](https://neon.tech), [Supabase](https://supabase.com/), [Vercel](https://vercel.com), etc.
- MongoDB-like API is easy to learn and is well-known to many of us.
- The document approach and denormalised data help make it easier to set up your data. It's well suited for the CRUD model, where you want to store and retrieve data in the same form as you put it,
- Pongo will get you covered with built-in migrations, so there is no need to care a lot about the database schema.

All of that makes a good combination for fast bootstrapping.

For basics, you can check previous articles:
- [Pongo - Mongo but on Postgres and with strong consistency benefits](https://event-driven.io/en/introducting_pongo)
- [Pongo behind the scenes](https://event-driven.io/en/pongo_behind_the_scenes/)
- [Pongo gets strongly-typed client, migrations, and command line tooling](https://event-driven.io/en/pongo_strongly_typed_client/)
- [Running a regular SQL on Pongo documents](https://event-driven.io/en/sql_support_in_pongo/)

And [documentation](https://event-driven-io.github.io/Pongo/getting-started.html).

So pardon me, I won't repeat myself, especially since you might have read them already. Let me show you some special sauce: Pongo command handling.

**The typical flow in CRUD for updating records looks as follows:**
1. Validate the incoming request.
2. Read the current state.
3. Do necessary validation based on it.
4. Run business logic.
5. Update the state.
6. Store it.

**Similarly, for deletion:**
1. Validate the incoming request.
2. You read the current state.
3. Do the necessary validation, checking if you can delete it.
4. Delete it.

**For creation, it's even simpler; you just:**
1. Validate the incoming request.
2. Generate the new state based on request data.
3. Store it.

**If we'd like to be sneaky, we could wrap it in a single flow that covers all of those cases.**
1. Validate the incoming request.
2. Read the current state.
3. If a state exists and you want to update it, do the necessary validation based on it.
4. Run business logic. Returning new state, updated state, or null if you want to delete the state.
5. Depending on the result of the business logic:
- Create if state didn't exist and result state is not null,
- Update if state existed and result state is different and not null,
- Delete if state existed and result state is null,
- Do nothing otherwise, and safely handle idempotency.

And guess what? That's precisely what Pongo can do for you.

Let's use our favourite Shopping Cart example. Types for it could look as follows:

```ts
interface ProductItem {
  productId: string;
  quantity: number;
}

type PricedProductItem = ProductItem & {
  unitPrice: number;
};

type ShoppingCart = {
  _id: string;
  clientId: string;
  productItems: PricedProductItem[];
  productItemsCount: number;
  totalAmount: number;
  status: 'Opened' | 'Confirmed';
  openedAt: Date;
  confirmedAt?: Date | undefined;
  cancelledAt?: Date | undefined;
};
```

**We could define the basic set of operations:**
- adding a product item - that's possible to not confirmed or non-existing shopping cart,
- removing a product item - that's possible when we have enough products already in the not confirmed shopping cart,
- confirming non-empty shopping cart (we can confirm it twice, handling idempotence safely),
- cancelling opened shopping cart (we can cancel it twice, handling idempotence safely).

The business logic could look as follows:

Adding product item:

```ts
const addProductItem = (
  command: {
    clientId: string;
    shoppingCartId: string;
    productItem: PricedProductItem;
    now: Date;
 },
  state: ShoppingCart | null,
): ShoppingCart => {
  if (state && state.status === 'Confirmed')
    throw new Error('Shopping Cart already closed');

  const { shoppingCartId, clientId, productItem, now } = command;

  const shoppingCart: ShoppingCart = state ?? {
    _id: shoppingCartId,
    clientId,
    openedAt: now,
    status: 'Opened',
    productItems: [],
    totalAmount: 0,
    productItemsCount: 0,
  };

  const currentProductItem = shoppingCart.productItems.find(
    (pi) =>
          pi.productId === productItem.productId &&
          pi.unitPrice === productItem.unitPrice,
    );

  if (currentProductItem !== undefined) {
    currentProductItem.quantity += productItem.quantity;
  } else {
    shoppingCart.productItems.push(productItem);
  }

  shoppingCart.totalAmount += productItem.unitPrice * productItem.quantity;
  shoppingCart.productItemsCount += productItem.quantity;

  return shoppingCart;
};
```

Removing product item:

```ts
const removeProductItem = (
  command: {
    productItem: PricedProductItem;
    now: Date;
 },
  state: ShoppingCart | null,
): ShoppingCart => {
  if (state === null || state.status !== 'Opened')
    throw new Error('Shopping Cart is not opened');

  const { productItem } = command;

  const currentProductItem = state.productItems.find(
    (pi) =>
          pi.productId === productItem.productId &&
          pi.unitPrice === productItem.unitPrice,
    );

  if (
    currentProductItem === undefined ||
    currentProductItem.quantity < productItem.quantity
  ) {
    throw new Error('Not enough products in shopping carts');
  }

  state.totalAmount -= productItem.unitPrice * productItem.quantity;
  state.productItemsCount -= productItem.quantity;

  return state;
};
```

Confirming

```ts
const confirm = (
  command: {
    now: Date;
 },
  state: ShoppingCart | null,
): ShoppingCart => {
  if (state === null) throw new Error('Shopping Cart is not opened');

  if (state.status === 'Confirmed') return state;

  if (state.productItems.length === 0)
    throw new Error('Shopping Cart is empty');

  const { now } = command;

  state.status = 'Confirmed';
  state.confirmedAt = now;

  return state;
};
```

Cancelling:

```ts
const cancel = (state: ShoppingCart | null): ShoppingCart | null => {
  if (state != null && state.status === 'Confirmed')
    throw new Error('Cannot cancel confirmed Shopping Cart');
  return null;
};
```

Then we can make a basic Pongo setup:

```ts
import { pongoClient } from "@event-driven-io/pongo";

const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";

const pongo = pongoClient(connectionString);
const pongoDb = pongo.db();

const shoppingCarts = pongoDb.collection<ShoppingCart>("shoppingCarts");
```

And plug our code into some request processing pipeline (e.g. web api):

```ts
type AddProductItemRequest = Request<
  { clientId: string; shoppingCartId: string },
  unknown,
  { productId: string; quantity: number }
>;

router.post(
  '/clients/:clientId/shopping-carts/current/product-items',
  on(async (request: AddProductItemRequest) => {
    const command = {
      clientId: request.params.clientId,
      productItem: {
        productId: request.body.productId,
        quantity: request.body.quantity),
        unitPrice: request.body.unitPrice,
      },
    };
    
    const result = await shoppingCarts.handle((state) =>
      addProductItem(command, state),
    );

    return Ok(result.document);
  })
);
```

For all other endpoints the code will look the accordingly. Isn't that nice?

**I think that's a simple and quick way to sping up a new CRUD system, or bootstrap a new Proof of Concepts.**

Thoughts?

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

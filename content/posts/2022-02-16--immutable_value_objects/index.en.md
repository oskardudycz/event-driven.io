---
title: Immutable Value Objects are simpler and more useful than you think!
category: "Architecture"
cover: 2022-02-16-cover.png
author: oskar dudycz
---

![cover](2022-02-16-cover.png)

I love proper typing. But what does that even mean? I could say that this is a types' structure defined in a self-explanatory way. But that'd be clichéd, wouldn't it? That's why I won't say that.

Before I start coding, I'm asking myself ([or others](/en/bring_me_problems_not_solutions/)): _"what is the business use-case, what my code is supposed to do?"_ That's a necessary starting point of providing the types' structure. It's best if our code speaks the same language as a business. For instance, _SendInvoice_ is more straightforward than _OnSaveButtonClick_. You're also grasping a business use case by looking at the code. Even if it is a pure infrastructure code, I always try to think about how to use it. So I'm putting myself as another programmer, a potential class user. Knowing what the type should be doing helps identify an even more important thing: what the type should not do. The fewer, the better. Our goal should not be to create a class that can do everything. You wouldn't like to build the new Skynet that decided that humans are redundant, right? The less the class does, the more precise its intended usage is.

Therefore, I try to avoid inheritance and generic code. Of course, there are justified situations when it is worth using these mechanisms to not follow the Copypaste Principle. Nevertheless, it is usually better to simply wrap up the logic and expose a specialized set of behaviours instead of inheriting class with all the baggage.

Take, for example, shopping cart requirements. If we add a product item to it, then:
- when the product is not yet available, add an entry with the product item's quantity and price,
- when there is already a product with a given price, simply increase its quantity.

Similarly, when we remove a product item from the shopping cart:
- you can only remove the existing product,
- when we remove less than the current product's quantity, we just reduce it,
- when we delete all products items, we also delete the whole entry.

If we modelled product items with a regular list, we would give the user too much choice. With great power comes great responsibility. And in this case, also a burden. We need to know the whole business logic to use such structured code. We'd need to also add validation before each call to make sure that we're doing something acceptable. That means a lot of code duplication. The more mechanical repetition, the higher risk of a dummy mistake. 

Therefore, we can try a different way, like:

```csharp
public class ProductItemsList
{
    private readonly List<PricedProductItem> items;

    private ProductItemsList(List<PricedProductItem> items)
    {
        this.items = items;
    }

    public ProductItemsList Add(PricedProductItem productItem)
    {
        var clone = new List<PricedProductItem>(items);

        var currentProductItem = Find(productItem);

        if (currentProductItem == null)
            clone.Add(productItem);
        else
            clone[clone.IndexOf(currentProductItem)] = currentProductItem.MergeWith(productItem);

        return new ProductItemsList(clone);
    }

    public ProductItemsList Remove(PricedProductItem productItem)
    {
        var clone = new List<PricedProductItem>(items);

        var currentProductItem = Find(productItem);

        if (currentProductItem == null)
            throw new InvalidOperationException("Product item wasn't found");

        clone.Remove(currentProductItem);

        return new ProductItemsList(clone);
    }
   
    public static ProductItemsList Empty() =>
        new(new List());

    public override string ToString() =>
        $"[{string.Join(", ", items.Select(pi => pi.ToString()))}]";
}
```

Not too much code, but a lot of stuff is going on.

First, there are no interfaces or abstract classes. Why would we need them if we assume there will be exactly one implementation of the product items list? From the perspective of developers using it, they should think of it as a more sophisticated list. They should ignore the implementation details and treat it as a library class. Thanks to that, we do not have to duplicate the business logic, validations etc. We can unit test our class implementation and not repeat those tests everywhere we use it. We can assume that it just works (as we do for any other type from the external package).

Another interesting fact is that our collection is immutable. When we add or remove an item, we always return a new list instance. What do we gain from doing that? Predictability and reducing multi-thread access issues. We do not have to worry about someone accidentally changing it in another thread. Of course, there is a performance penalty for this. If we need über-performant code, then we should remember that. Still, most of the time, that's not an issue. How many items can a shopping cart have?

In the exercise above, we created a simple Value Object. It is an immutable object that is represented by the elements it contains. It can have behaviours and be composed of other value objects (you may have already noticed [PricedProductItem](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/Sample/EventStoreDB/Simple/ECommerce/ShoppingCarts/ProductItems/PricedProductItem.cs). It is also a Value Object).

Thanks to the simple composition, we get a set of predictable, precise types. We ensure that they only accept the correct data and performs the proper logic. Thus, we reduce the need to have a multitude of tests testing an imaginary interface's implementation. That reduces the development and maintenance and maintenance time.

To see the full implementation, check the code in my sample repository: [ProductItemsList.cs](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/Sample/EventStoreDB/Simple/ECommerce/ShoppingCarts/ProductItems/ProductItemsList.cs).

Cheers!

Oskar
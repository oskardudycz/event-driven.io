---
title: Just use SQL they say... Or how accidental complexity piles on
category: Software Architecture
cover: 2025-09-08-cover.jpg
author: oskar dudycz
redirectFrom: /just-use-sql-they-say-or-on-how-accidental/
---

Welcome to the new week!

_**“Just use SQL”**_, they say.

_**“No need for [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping)s”**_, they add.

And they may be right, but…

Let’s say that you want to query users. In TypeScript, this could look like:

```typescript
const sql = 'SELECT userName, email FROM users';

const result = await connection.execute.query(sql);
```

Easy peasy!

Now, let’s add a bit more, so filtering, let’s say that we’d like to find users with a specific e-mail.

```sql
const email = 'oskar@event-driven.io';
const sql = `
  SELECT userName, email
  FROM users
  WHERE email = '${ email }'
`;
const result = await connection.execute.query(sql);
```

Still a piece of cake, right? We’re using [Template Strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), a feature available nowadays in most languages (oh well, Java, hey! I’m looking at you!).

This will work, but what if the email wasn’t the constant value, as I did, but was provided by the user? Well, then one could give an email with the value:

```typescript
const email = `'; DROP TABLE users; SELECT 'drop da base!`;
```

…or something similar, depending on your SQL dialect, and cause (in) famous [SQL Injection](https://en.wikipedia.org/wiki/SQL_injection).

![Speed camera SQL Injection : r/geek](2025-09-08-cover.jpg "Speed camera SQL Injection : r/geek")

One solution would be to try to validate or sanitise the email value. Still, have you seen the e-mail regex? Not quite as easy as we’d like to: see [here](https://stackoverflow.com/a/201378).

Luckily, databases give us parameterised queries so that we can provide params that will be sanitised and mapped. For instance, like that:

```sql
const sql = `
  SELECT userName, email
  FROM users
  WHERE email = ?
`;
const result = await connection.execute.query(sql, [email]);
```

Cool, but let’s say that we’d like to have email, be just one of the params, and our filtering params look as follows:

```typescript
type UsersFilter = {
   userName?: string;
   email?: string
};

function filterUsers(filter?: UsersFilter): Promise<User[]> {
  const sql = `SELECT userName, email FROM users`;

  const params = [];

  if (filter && (filter.userName || filter.email)) {
     sql += " WHERE ";

     let hasParams = false;

     if(filter.userName) {
       sql += " userName = ?";
       params.push(filter.userName);
       hasParams = true;
     }

     if(filter.email) {
       if(hasParams) sql += " AND ";

       sql += " email = ?";
       params.push(filter.userName);
     }
  }

  return connection.execute.query(sql, params);
}
```

Boy, that escalated quickly…

![Boy, that escalated quickly. I mean, that really got out of hand fast.](image-2.jpg "Boy, that escalated quickly. I mean, that really got out of hand fast.")

And that’s just basic filtering of two parameters. What if there were 10? What if there were even more?

Of course, we could make it more generic, more sneaky, but I’m sure that you’re starting to get the idea where we’re getting into.

We’re getting into the _[Stringly Typed](https://wiki.c2.com/?StringlyTyped)_ world where we’re doing complicated string manipulations. We not only need to generate SQL based on the provided criteria in a predictable manner, but also ensure that the parameters in the SQL query match the values provided in the parameters array when querying values.

What can we do about it? Let’s try to simplify the filtering query generation first.

```typescript
type ParametrizedQuery {
  sql: string,
  params: unknown[]
}

const emptyQuery: ParametrizedQuery = { sql: '', params: [] };
```

We’re benefiting from the dynamic nature of the JS/TS here: each object is a record with field names and values. In other environments, we’d need to use either Reflection or code generation. Still, we find the field names,

Cool, now we can use it in our method:

```typescript
function filterUsers(filter?: UsersFilter): Promise<User[]> {
  const sql = `SELECT userName, email FROM users`;

  const { sql: whereSql, params } = where(filter);

  return connection.execute.query(sql + whereSql, params);
}
```

That solved the issue for some time, but… What if we’d like to support not only equals but also: greater than, less than, LIKE, etc.?

Then we’d need to try harder!

```typescript
type ColumnOperator = 'eq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte';

type ColumnFilter = {
  columnName: string;
  value: unknown
  operator: ColumnOperator;
}

type WhereOperator = 'AND' | 'OR'

type WhereFilter = {
   columnFilters: ColumnFilter[];
   operator: WhereOperator;
}
```

We could define a column filter to contain the column name, value and operator. Then, the Where filter would be a collection of column filters and a binary operator.

We could map our filter object to the WhereFilter using:

```typescript
type BuildWhereFilterOptions = {
   map?: (property: string, value: unknown) => ColumnFilter;
   operator?: WhereOperator
}

function buildWhereFilter(
  filter: Record<string, unknown>,
  options?: BuildWhereFilterOptions
): WhereFilter {
  const { map, operator } = options;

  const columnFilters = Object.entries(filter)
    .filter(([key, value]) => value !== undefined)
    .map(([prop, value]) => ((map ? map(prop, value): undefined) ?? {
      columnName: prop,
      value,
      operator: 'eq'
    }));

  return {
    columnFilters,
    operator: operator ?? 'AND'
  };
}
```

Besides the filter, we’re also allowing an optional pass mapping function to customise filtering and also the general binary operator.

We could use it in the where SQL generation:

```typescript
function mapToSQL(columnFilter: ColumnFilter): string {
  const { columnName, operator } = columnFilter;

  switch (operator) {
    case 'eq':
      return `${columnName} = ?`;
    case 'like':
      return `${columnName} LIKE ?`;
    case 'gt':
      return `${columnName} > ?`;
    case 'lt':
      return `${columnName} < ?`;
    case 'gte':
      return `${columnName} >= ?`;
    case 'lte':
      return `${columnName} <= ?`;
    default:
      return `${columnName} = ?`;
  }
}

function where(filter: WhereFilter): ParametrizedQuery {
  const { columnFilters: filters, operator } = filter;

  return columnFilters.length > 0 ?
    {
      sql: ' WHERE ' + filters.map(mapToSQL).join(` ${operator} `),  
      params: filters.map(c => c.value)
    }
    : emptyQuery;  
}
```

And now we can customise our filtering, adding LIKE for user name with:

```typescript
function filterUsers(usersFilter?: UsersFilter): Promise<User[]> {
  const sql = `SELECT userName, email FROM users`;

  const filter = buildWhereFilter(usersFilter, {
    map: (prop, value) => {
      if (prop === 'userName' && value) {
        return {
          columnName: prop,
          value: `%${value}%`,
          operator: 'like'
        };
      }
    }
  });

  const { sql: whereSql, params } = where(whereFilter);
  return connection.execute.query(sql + whereSql, params);
}
```

And that’s just a beginning! As we see, we have [almost built a simple WHERE condition compiler](/en/compilation-isnt-just-for-programming/)! Or at least we’re not that far from it.

Where am I going with this? Why am I showing you such code?

Definitely **NOT** to tell you “just use ORM!”.

That’s not the point here. SQL is fine, ORMs are fine. When used in the proper context.

One of the reasons is that I’m working on such stuff in [Pongo](https://github.com/event-driven-io/Pongo), adding multiple database support and some sneaky SQL handling. I don’t want to be alone with that!

**The other, and most important, story behind it is to show you that it’s never “just”.**

Just is enough for a simple or explicit context. Eventually, as our system grows, we’ll need to deal with complications. Popular tools might not be perfect; they may be too heavy, depending on design decisions, but as Gerald Weinberg said:

> _Things_ are _the way they_ are _because they_ got that _way_

You can live “just” with something. This can be a good starting point. Yet, we should always consider when deciding on DIY or “take off the shelf” solutions, where we need to land and what our main problem is to solve.

Because if it appears that we’ll need more advanced features, then we’ll follow the path similar to the one that people building popular libraries/tools have taken.

It’s always worth thinking whether “just” will be enough for us. Usually, “just” is enough only for some time. And it is better not to overlook this to change our approach, as then we can deal with accidental complexity related to wrongly weighted “just” as described in this article.

Read also more in:

-   [Not all issues are complex, some are complicated. Here's how to deal with them](/en/how_to_solve_complicated_problems/).

-   [In the defence of Object-Relational Mappers](/en/in_the_defence_of_orms/)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian](https://savelife.in.ua/pl/donate/) organisation or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).

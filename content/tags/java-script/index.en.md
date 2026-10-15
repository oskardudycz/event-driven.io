---
description: "JSON has no dates or BigInt, so values come back as strings or throw errors. How to keep your types intact when serialising in JavaScript and TypeScript."
---

One article so far, about a problem you'll hit sooner or later. JSON.stringify and JSON.parse look like all you need until your data contains a date or a BigInt: the date comes back as a string, and the BigInt throws an error. The article shows how to add explicit mapping on both sides, so the objects you read back are the same as the ones you wrote.

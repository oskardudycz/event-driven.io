---
description: "Your API has to handle concurrent edits and data that isn't updated yet. Three practical articles on dealing with both without confusing clients."
---

Three hands-on articles. The first uses the HTTP ETag header so that two people editing the same record don't silently overwrite each other's changes. The other two deal with data that updates a moment after the write: keeping read models in MongoDB correct, and making the API wait briefly so the client sees its own change.

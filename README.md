# Repl.it DB Client
Repl.it-db client is a simple way to use the repl.it database. It uses `await/async`.

## Get started
```js
const Client = require("replitdb-client");
const client = new Client();
await Client.set("key", "value");
let key = await Client.get("key");
console.log(key);
```
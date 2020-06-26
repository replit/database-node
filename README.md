[![npm version](https://badge.fury.io/js/replitdb-client.svg)](https://badge.fury.io/js/replitdb-client)
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

## Docs
### `class Client(String key?)`
The key is the optional custom URL.

**Native Functions**

These functions are specified in the repl.it DB.

> `Get(String key)`

Gets a key. Returns Promise.
```js
Client.get("key").then(console.log);
```

> `Set(String key, String value)`

Sets a key to value. Returns Client. 

> `Delete(String key)`

Deletes a key. Returns Client.

> `List(String? prefix)`

Lists all of the keys, or all of the keys starting with `prefix` if specifed.

**Dynamic Functions**

These functions have been added by me.
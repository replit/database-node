[![npm version](https://badge.fury.io/js/replitdb-client.svg)](https://badge.fury.io/js/replitdb-client)

[![Run on Repl.it](https://repl.it/badge/github/mrlapizgithub/repl.it-db)](https://repl.it/github/mrlapizgithub/repl.it-db)

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

> `get(String key, Object options?)`

Gets a key. Returns Promise.
```js
Client.get("key", { raw: false }).then(console.log);
```

> `set(String key, Any value)`

Sets a key to value. Returns Client. 

> `delete(String key)`

Deletes a key. Returns Client.

> `list(String? prefix)`

Lists all of the keys, or all of the keys starting with `prefix` if specifed.

**Dynamic Functions**

These functions have been added by me.

> `empty()`

Clears the database. Returns Client

> `getAll()`

Get all key/value pairs and return as an object.

> `setAll(Object obj)`

Sets the entire database through a key/value object. Returns Client

> `deleteMultiple(...String args)`

Deletes multiple keys. Returns client.

## Tests
```sh
npm i
npm run test
```
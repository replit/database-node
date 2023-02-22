[![npm version](https://badge.fury.io/js/%40replit%2Fdatabase.svg)](https://badge.fury.io/js/%40replit%2Fdatabase)

[![Run on Repl.it](https://repl.it/badge/github/replit/database-node)](https://repl.it/github/replit/database-node)

# Repl.it Database client
Repl.it Database client is a simple way to use Repl.it Database in your Node.js repls. It uses `await/async`.

## Get started
```js
const { Client } = require("@replit/database");
const client = new Client();

client.set("key", "value").then(async () => {
	let key = await client.get("key");
	console.log(key);
});
```

## Docs
### `class Client(String url?, Number ms?)`
The parameter url is the optional custom DB URL.
The parameter ms is millseconds till cache expires.

**Native Functions**

These functions are specified in the repl.it DB.

> `get(String key, Object config?)`

Gets a value from cache or from the database if it doesn't exist. Returns Promise.
```js
client.get("key", { 
	raw: false,
	fetch: false // Setting this to true ignores cache
}).then(console.log);
```

> `set(String key, Any value)`

Sets a key to value. Returns Client. 

> `delete(String key)`

Deletes a key. Returns Client.

> `list(Object config?)`

Lists all of the keys, or all of the keys starting with `prefix` if specifed.
```js
client.list({ 
	prefix: "",
	fetch: false // Setting this to true fetches from db
}).then(console.log);
```

**Dynamic Functions**

These functions have been added by me.

> `empty()`

Clears the database. Returns Client

> `getAll(Object config?)`

Get all key/value pairs and return as an object.
```js
client.getAll({ 
	fetch: false // Setting this to true fetches from db
}).then(console.log);
```

> `setAll(Object obj)`

Sets the entire database through a key/value object. Returns Client

> `deleteMultiple(...String args)`

Deletes multiple keys. Returns client.

## Tests
```sh
npm i
npm run test
```

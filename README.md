[![npm version](https://badge.fury.io/js/%40replit%2Fdatabase.svg)](https://badge.fury.io/js/%40replit%2Fdatabase)

[![Run on Repl.it](https://repl.it/badge/github/replit/database-node)](https://repl.it/github/replit/database-node)

# Repl.it Database Client

Repl.it Database Client is a simple way to use repl.it database in your Node.js repls. It's optimized for asynchronous and uses `async/await`.

## Getting started

Just import the module as usual and create an Client instance to access your repl.it database.

```js
const Client = require("@replit/database");
const db = new Client();
await db.set("key", "awesome-value");
let value = await db.get("key");
console.log(value);
```

## Docs

Initial repl.it database implementation containy only one class and supports `set, get, list, and delete` methods. These are referred to as **Native Methods**. In addition to these, some extra methods are added in order to improve ease of use and functionality. These functions are referred to as **Dynamic Methods** and they are `getAll, setAll, deleteMultiple, and empty`.

### Class structure

Repl.it Database Client contains only one class with the signature of `class Client(String key?)`. The key is an optional value and it points to a custom repl.it database URL.

### Native methods

These methods are specified in the repl.it database implementation. `set, get, list, and delete`

**Set a value**

`obj.set(String key, Any value)` stores a value with the given key and returns the client instance.

```js
await db.set("key", "value");
```

or

```
db.set("key", "value").catch( err => {
  console.log("Something, somewhere went terribly wrong.");
});
```

**Get a value**

`obj.get(String key, Object options?)` returns a promise associated with the given key.

```js
let value = await db.get("key");
```

or

```js
db.get("key").then( value => {
  console.log("Here's my valude folks:", value);
});
```

**List keys**

`obj.list(String? prefix)` returns all keys matching the optional `prefix` value. Returns all keys if no prefix is specified.

**Delete a key-value pair**

`obj.delete(String key)` deletes the key and its associated value from database. Returns the client instance.


### Dynamic methods

These methods written by the repo owner and provide additional functionality to improve ease of use. `getAll, setAll, deleteMultiple, and empty`.

**Get all key-value pairs**

`obj.getAll()` returns all key-value pairs as an object.

**Set all key-value pairs**

`obj.setAll(Object obj)` seet the entire database through a key-value object and returns the client instance.

**Delete multiple key-value pairs**

`obj.deleteMultiple(...String args)` deletes the given keys and their associated values. Returns the client instance.

**Empty the database**

`obj.empty()` clears the database and returns the client instance.


## Testing

```sh
npm i
npm run test
```

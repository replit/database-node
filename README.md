[![npm version](https://badge.fury.io/js/better-replit-db.svg)](https://badge.fury.io/js/better-replit-db)

[![Run on Repl.it](https://replit.com/badge/github/pieromqwerty/better-replit-db)](https://replit.com/github/pieromqwerty/better-replit-db)

# Better Replit DB
Better Replit DB is a fork of the official Replit Database client, with the added benefit of the contents being cached in memory. This allows for much faster load read and write times than the regular client. It also uses `await/async`, just like the official client.

*Better Replit DB is a drop-in replacement as well, simply change `require('@replit/database')` to `require('better-replit-db')` in your JS file.*

***IT IS LITERALLY DOZENS OF TIMES FASTER THAN THE OFFICIAL LIB***

## Speed Comparison
### 20x Ops
|Test|better-replit-database|@replit/database|Times Faser
-|-|-|-
Creating a Client|**16 ms**</span>|120 ms|**7.5x**
Setting a Value|**80 ms**|2858 ms|**35.7x**
Listing Keys|**107 ms**|1583 ms|**14.8x**
Getting a Value|**25 ms**|1349 ms|**54.0x**
Deleting a Value|**199 ms**|4046 ms|**20.3x**
Listing Keys|**36 ms**|1422 ms|**39.5x**
Ensuring Values are Escaped|**35 ms**|1350ms|**38.6x**

### 100x Ops
> Coming Soon - Regular DB Host Gets Ratelimited

## Get started
```js
const database = require("better-replit-db");
const db = new database();
await db.set("key", "value");
let key = await db.get("key");
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

These functions have been added by the original author.

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

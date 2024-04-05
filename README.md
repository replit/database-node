# Replit Database Client
[![Run on Repl.it](https://img.shields.io/badge/run-on_Replit-f26208?logo=replit)](https://replit.com/github/replit/database-node) [![npm: @replit/database](https://img.shields.io/npm/v/%40replit%2Fdatabase)](https://www.npmjs.com/package/@replit/database)

The Replit Database client is a simple way to use [Replit Database](https://docs.replit.com/hosting/databases/replit-database) in your Node.js repls. The client expects to run within a Replit managed server context. Use this library in servers or other applications that execute on a Replit server, rather than in your user's browser.

## Installation
Install the TypeScript Library with
```sh
npm install @replit/database
```

This library supports [Bun](https://replit.com/@replit/Bun?v=1), [Deno](https://replit.com/@replit/Deno?v=1), and [Node.js](https://replit.com/@replit/Nodejs?v=1) (Node versions 18+ or any Node version [polyfilled with the fetch API](https://github.com/node-fetch/node-fetch#providing-global-access)).


## Quickstart
```typescript
import Client from "@replit/database";

const client = new Client();
await client.set("key", "value");
let value = await client.get("key");

console.log(value); // { ok: true, value: "value" }

```

## Docs

Initiate a new database client:
```typescript
import Client from "@replit/database";

/**
 * Initiates Class.
 * @param {String} dbUrl Custom database URL
 */
new Client()
```

Retrieve a value for a key from the database:
```typescript
/**
 * Gets a key
 * @param {String} key Key
 * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
 * @returns Promise<OkResult<any> | ErrResult<RequestError>>
 */
const value = await client.get(key, /* options?: {raw: boolean} */)
console.log(value)
// { ok: true, value: "value" } | { ok: false, error: RequestError }
```

Sets a value for a key in the database:
```typescript
/**
 * Sets a key
 * @param {String} key Key
 * @param {any} value Value
 */
await client.set(key, value)
```

Deletes a key from the database:
```typescript
/**
 * Deletes a key
 * @param {String} key Key
 */
const result = await client.delete(key)
console.log(result.ok) // boolean
```

Lists all keys starting with the provided prefix:
```typescript
/**
 * List key starting with a prefix if provided. Otherwise list all keys.
 * @param {String} prefix The prefix to filter by.
 */
const keys = await client.list("prefix-")
console.log(keys) // { ok: true, value: [...] } | { ok: false, error: RequestError }
```

Clears the database:
```typescript
/**
 * Clears the database.
 * @returns a Promise containing this
 */
await client.empty()
```

Gets all records in the database:
```typescript
/**
 * Get all key/value pairs and return as an object
 * @param {boolean} [options.raw=false] Makes it so that we return the raw
 * string value for each key. Default is false.
 */
const records = await client.getAll(/* options?: {raw: boolean} */)
```

Sets multiple key value pairs:
```typescript
/**
 * Sets multiple keys from an object.
 * @param {Object} obj The object.
 */
await client.setMultiple({keyOne: "valueOne", keyTwo: "valueTwo"})
```

Deletes multiple keys from the database:
```typescript
/**
 * Delete multiple entries by key.
 * @param {Array<string>} args Keys
 */
await client.deleteMultiple(['keyOne', 'keyTwo'])
```


## Tests
```sh
npm i
npm run test
```

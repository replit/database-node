[![npm version](https://badge.fury.io/js/%40replit%2Fdatabase.svg)](https://badge.fury.io/js/%40replit%2Fdatabase)

[![Run on Repl.it](https://repl.it/badge/github/replit/database-node)](https://repl.it/github/replit/database-node)

# Replit Database client
Replit Database client is a simple and easy way to use Replit Database in your node repls. 
It uses promises to make for easy use.

## Get started
```js
// Import the client
const Client = require("@replit/database");
// Create a client
const db = new Client();
// Set a item in the database
await db.set("key", "value");
// Get the same item that we set
let key = await db.get("key");
// Print the value
console.log(key);
```

## Functions

### Creating a client
You can specify the url of the database.
If you don't specify the url, it will use a url from the env.
```js
// DB with URL
const db = new Client("https://database.example.example");
// DB without URL
const db = new Client();
```

### Geting an item
When getting an item, by default, it tries to parse the value as a JSON.
To disable this, you can pass `true` as the second argument.
```js
// Get the item
let key = await db.get("key");
// Get the item as a string
let key = await db.get("key", true);
```

### Setting an item
When setting an item, by default, it stores it as a JSON.
To disable this, you can pass `true` as the third argument.
```js
// Set the item
await db.set("key", "value");
// Set the item as a string
await db.set("key", "value", true);
```

### Deleting an item
There are no settings for deleting an item.
```js
// Delete the item
await db.delete("key");
```

### Listing items
If you want to list all the items in the db, dont pass any arguments.
You can also specify a prefix to list only the items that starts with that prefix.
```js
// List all the items
let items = await db.list();
// List all the items that starts with "key"
let items = await db.list("key");
```

### Emptying the database
There is no settings for emptying the database.
```js
// Empty the database
await db.empty();
```

### Get all the items in the DB
When getting all the items, by default, it tries to parse the value as a JSON.
To disable this, you can pass `true` as the first argument.
```js
// Get all the items
let items = await db.getAll();
// Get all the items as a string
let items = await db.getAll(true);
```

### Setting all the items in the DB
When setting all the items, by default, it stores them as a JSON.
To disable this, you can pass `true` as the second argument.
```js
// Set all the items
await db.setAll({
	key: "value",
	key2: "value2"
});
// Set all the items as a string
await db.setAll({
	key: "value",
	key2: "value2"
}, true);
```

### Deleting multiple items
There are no settings for deleting multiple items.
```js
// Delete multiple items
await db.deleteAll("key", "key2");
```

## Tests
```sh
yarn install
yarn test
```
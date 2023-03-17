const fetch = require("node-fetch");
const Client = require("./index");

let client;

beforeAll(async () => {
  const pass = process.env.PASSWORD;
  const resp = await fetch("https://database-test-jwt.kochman.repl.co", {
    headers: {
      Authorization: "Basic " + btoa("test:" + pass),
    },
  });
  const url = await resp.text();
  client = new Client(process.env.REPLIT_DB_URL ?? url);
  await client.empty();
});

afterEach(async () => {
  await client.empty();
});

test("create a client with a key", async () => {
  expect(client).toBeTruthy();
  expect(typeof client.key).toBe("string");
});

test("sets a value", async () => {
  expect(await client.set("key", "value")).toEqual(client);
  expect(await client.setAll({ key: "value", second: "secondThing" })).toEqual(
    client
  );
});

test("list keys", async () => {
  await client.setAll({
    key: "value",
    second: "secondThing",
  });

  expect(await client.list()).toEqual(["key", "second"]);
});

test("gets a value", async () => {
  await client.setAll({
    key: "value",
  });

  expect(await client.getAll()).toEqual({ key: "value" });
});

test("delete a value", async () => {
  await client.setAll({
    key: "value",
    deleteThis: "please",
    somethingElse: "in delete multiple",
    andAnother: "again same thing",
  });

  expect(await client.delete("deleteThis")).toEqual(client);
  expect(await client.deleteMultiple("somethingElse", "andAnother")).toEqual(
    client
  );
  expect(await client.list()).toEqual(["key"]);
  expect(await client.empty()).toEqual(client);
  expect(await client.list()).toEqual([]);
});

test("list keys with newline", async () => {
  await client.setAll({
    "key\nwit": "first",
    keywidout: "second",
  });

  expect(await client.list()).toEqual(["keywidout", "key\nwit"]);
});

test("ensure that we escape values when setting", async () => {
  expect(await client.set("a", "1;b=2")).toEqual(client);
  expect(await client.list()).toEqual(["a"])
  expect(await client.get("a")).toEqual("1;b=2")
});

test("ensure that we escape keys when deleting", async () => {
  expect(await client.set("https://url.com/foo?bar=bazz", "a")).toEqual(client);
  expect(await client.delete("https://url.com/foo?bar=bazz")).toEqual(client);
  expect(await client.list()).toEqual([]);
});

test("ensure that we escape key when emptying", async () => {
  expect(await client.set("https://url.com/foo?bar=bazz", "a")).toEqual(client);
  expect(await client.empty()).toEqual(client);
  expect(await client.list()).toEqual([]);
});

test("ensure that we escape keys when getting", async () => {
  expect(await client.set("https://url.com/foo?bar=bazz", "a")).toEqual(client);
  expect(await client.get("https://url.com/foo?bar=bazz")).toEqual("a");
});
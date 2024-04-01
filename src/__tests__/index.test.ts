import { beforeAll, afterEach, test, expect } from "vitest";
import Client from "../.";

let client: Client;

beforeAll(async () => {
  if (process.env.REPL_ID) {
    // testing locally
    client = new Client();
  } else {
    // testing from CI
    const pass = process.env.USE_FILE
      ? process.env.RIDT_PASSWORD
      : process.env.JWT_PASSWORD;
    const url = process.env.USE_FILE
      ? "https://database-test-ridt-util.replit.app"
      : "https://database-test-jwt-util.replit.app";
    const resp = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`test:${pass}`).toString(
          "base64",
        )}`,
      },
    });
    const token = await resp.text();
    client = new Client(token);
  }

  await client.empty();
});

afterEach(async () => {
  await client.empty();
});

test("create a client with a key", async () => {
  expect(client).toBeTruthy();
  expect(typeof client["dbUrl"]).toBe("string");
});

test("sets a value", async () => {
  expect(await client.set("key", "value")).toEqual(client);
  expect(await client.setAll({ key: "value", second: "secondThing" })).toEqual(
    client,
  );
});

test("list keys", async () => {
  await client.setAll({
    key: "value",
    second: "secondThing",
  });

  const result = await client.list();
  const expected = ["key", "second"];
  expect(result).toEqual(expect.arrayContaining(expected));
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
    client,
  );
  expect(await client.list()).toEqual(["key"]);
  expect(await client.empty()).toEqual(client);
  expect(await client.list()).toEqual([]);
});

test("delete a value with a key with newlines", async () => {
  await client.setAll({
    "key\nnewline": "value",
    key: "nonewline",
  });

  expect(await client.delete("key")).toEqual(client);
  expect(await client.list()).toEqual(["key\nnewline"]);
  expect(await client.delete("key\nnewline")).toEqual(client);
  expect(await client.list()).toEqual([]);
});

test("list keys with newline", async () => {
  await client.setAll({
    "key\nwit": "first",
    keywidout: "second",
  });

  const expected = ["keywidout", "key\nwit"];
  const result = await client.list();

  expect(result).toEqual(expect.arrayContaining(expected));
});

test("ensure that we escape values when setting", async () => {
  expect(await client.set("a", "1;b=2")).toEqual(client);
  expect(await client.list()).toEqual(["a"]);
  expect(await client.get("a")).toEqual("1;b=2");
});

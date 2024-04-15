import { beforeAll, afterEach, test, expect } from "vitest";
import Client from "@replit/database";
import * as util from "../util";

let client: Client;

beforeAll(async () => {
  client = new Client(await util.getToken());
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
  expect((await client.set("key", "value")).value).toEqual(client);
  expect(
    (await client.setMultiple({ key: "value", second: "secondThing" })).value,
  ).toEqual(client);
});

test("list keys", async () => {
  await client.setMultiple({
    key: "value",
    second: "secondThing",
  });

  const result = (await client.list()).value;
  const expected = ["key", "second"];
  expect(result).toEqual(expect.arrayContaining(expected));
});

test("gets a value", async () => {
  await client.set("key", "value");

  expect((await client.get("key")).value).toEqual("value");
});

test("gets a value with forward slash in the key", async () => {
  await client.set("k/e/y", "v/a/l/u/e");

  expect((await client.get("k/e/y")).value).toEqual("v/a/l/u/e");
});

test("gets a value double forward slashes in the key", async () => {
  await client.set("k//e//y", "value");

  expect((await client.get("k//e//y")).value).toEqual("value");
});

test("get many values", async () => {
  await client.setMultiple({
    key: "value",
    another: "value",
  });

  expect((await client.getAll()).value).toEqual({
    key: "value",
    another: "value",
  });
});

test("delete a value", async () => {
  await client.setMultiple({
    key: "value",
    deleteThis: "please",
    somethingElse: "in delete multiple",
    andAnother: "again same thing",
  });

  expect((await client.delete("deleteThis")).value).toEqual(client);
  expect(
    (await client.deleteMultiple("somethingElse", "andAnother")).value,
  ).toEqual(client);
  expect((await client.list()).value).toEqual(["key"]);
  expect((await client.empty()).value).toEqual(client);
  expect((await client.list()).value).toEqual([]);
});

test("delete a value with a key with newlines", async () => {
  await client.setMultiple({
    "key\nnewline": "value",
    key: "nonewline",
  });

  expect((await client.delete("key")).value).toEqual(client);
  expect((await client.list()).value).toEqual(["key\nnewline"]);
  expect((await client.delete("key\nnewline")).value).toEqual(client);
  expect((await client.list()).value).toEqual([]);
});

test("delete a value with a key with double forward slashes", async () => {
  await client.set("k//e//y", "value");

  expect((await client.delete("k//e//y")).value).toEqual(client);
  const result = await client.get("k//e//y");
  expect(result.ok).toEqual(false);
  expect(result.error?.statusCode).toEqual(404);
});

test("list keys with newline", async () => {
  await client.setMultiple({
    "key\nwit": "first",
    keywidout: "second",
  });

  const expected = ["keywidout", "key\nwit"];
  const result = await client.list();

  expect(result.value).toEqual(expect.arrayContaining(expected));
});

test("ensure that we escape values when setting", async () => {
  expect((await client.set("a", "1;b=2")).value).toEqual(client);
  expect((await client.list()).value).toEqual(["a"]);
  expect((await client.get("a")).value).toEqual("1;b=2");
});

test("getting an error", async () => {
  await client.set("key", "value");

  expect((await client.get("key2")).ok).toBeFalsy();
  expect((await client.get("key2")).error?.statusCode).toEqual(404);
});

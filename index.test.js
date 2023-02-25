const { Client } = require("./index");

let client, fetchClient;

beforeAll(async () => {
	client = new Client();
	fetchClient = new Client();

	await client.empty();
});

afterEach(async () => {
	await client.empty();
});

test("create a client", async () => {
	expect(client).toBeTruthy();
	expect(typeof client.cache).toBe("object");
});

test("sets a value", async () => {
	expect(await client.set("key", "value")).toEqual(client);
	expect(await client.setAll({
		key: "value",
		second: "secondThing"
	})).toEqual(
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

	expect(await client.getAll()).toEqual({
		key: "value"
	});
});

test("fetches a value", async () => {
	await client.setAll({
		key: "value",
	});

	expect(await fetchClient.getAll({ fetch: true })).toEqual({
		key: "value"
	});
});

test("key and value with newline", async () => {
	await client.set("key\na", "val\nue");

	expect(await client.getAll()).toEqual({
		"key\na": "val\nue",
	});
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

test("ensure that we escape values when setting", async () => {
	expect(await client.set("a", "1;b=2")).toEqual(client);
	expect(await client.list()).toEqual(["a"])
	expect(await client.get("a")).toEqual("1;b=2")
});
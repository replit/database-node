const fetch = require("node-fetch");
const Client = require("@replit/database");

let client;

beforeAll(async () => {
	client = new Client();
	await client.empty();
});

afterEach(async () => {
	await client.empty();
});

test("create a client with a key 20 times", async () => {
	for (let i = 0; i < 20; i++) {
		expect(client).toBeTruthy();
		expect(typeof client.key).toBe("string");
	}
});

test("sets a value 20 times", async () => {
	for (let i = 0; i < 20; i++) {
		expect(await client.set("key", "value")).toEqual(client);
		expect(await client.setAll({ key: "value", second: "secondThing" })).toEqual(
			client
		);
	}
});

test("list keys 20 times", async () => {
	for (let i = 0; i < 20; i++) {
		await client.setAll({
			key: "value",
			second: "secondThing",
		});

		expect(await client.list()).toEqual(["key", "second"]);
	}
});

test("gets a value 20 times", async () => {
	for (let i = 0; i < 20; i++) {
		await client.setAll({
			key: "value",
		});

		expect(await client.getAll()).toEqual({ key: "value" });
	}
});

test("delete a value 20 times", async () => {
	for (let i = 0; i < 20; i++) {
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
	}
});

test("list keys with newline 20 times", async () => {
	for (let i = 0; i < 20; i++) {
		await client.setAll({
			"key\nwit": "first",
			keywidout: "second",
		});

		expect(await client.list()).toEqual(["keywidout", "key\nwit"]);
	}
});

test("ensure that we escape values when setting 20 times", async () => {
	for (let i = 0; i < 20; i++) {
		expect(await client.set("a", "1;b=2")).toEqual(client);
		expect(await client.list()).toEqual(["a"])
		expect(await client.get("a")).toEqual("1;b=2")
	}
});

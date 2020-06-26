const Client = require('./index')

const client = new Client();

client.empty();

afterEach(async () => {
  await client.empty();
})

test('create a client with a key', async () => {
  expect(client).toBeTruthy();
  expect(typeof client.key).toBe('string');

});

test('sets a value', async () => {
  expect(await client.set("key", "value")).toEqual(client);
  expect(await client.setAll({key: "value", second: "secondThing"})).toEqual(client);

});

test('list keys', async () => {
  await client.setAll({
    key: "value",
    second: "secondThing"
  })

  expect(await client.list()).toEqual("key\nsecond")
});

test('gets a value', async () => {
  await client.setAll({
    key: "value"
  });

  expect(await client.getAll()).toEqual({key: "value"});
});

test('delete a value', async () => {
  await client.setAll({
    key: "value",
    deleteThis: "please"
  })

  expect(await client.delete('deleteThis')).toEqual(client);
  expect(await client.empty()).toEqual(client);
  expect(await client.list()).toEqual("");
})
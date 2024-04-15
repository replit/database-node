import { test, expect } from "vitest";
const Client = require('@replit/database')
const utils = require('../util')

test('cjs smoke test', async () => {
  const db = new Client(await utils.getToken());

  expect(db).not.toBeUndefined()
})

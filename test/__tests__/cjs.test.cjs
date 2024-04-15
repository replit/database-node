import { test, expect } from "vitest";
const Client = require('@replit/database')

test('cjs smoke test', () => {
  const db = new Client();

  expect(db).not.toBeUndefined()
})

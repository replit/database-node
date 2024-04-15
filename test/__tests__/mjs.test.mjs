import { test, expect } from "vitest";
import Client from '@replit/database'

test('esm smoke test', () => {
  const db = new Client();

  expect(db).not.toBeUndefined()
})

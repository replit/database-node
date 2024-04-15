import { test, expect } from "vitest";
import Client from '@replit/database'
import { getToken } from '../util'

test('esm smoke test', async () => {
  const db = new Client(await getToken());

  expect(db).not.toBeUndefined()
})

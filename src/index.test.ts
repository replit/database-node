/** @format */

import { config } from 'dotenv';
import { join, Client } from '.';

let db: undefined | Client;

jest.setTimeout(30000);

beforeAll(async () => {
	// Load environment variables from .env file
	config();
	// If REPLIT_DB_URL is set then create a new client with it
	if (process.env.REPLIT_DB_URL) {
		db = new Client();
		return;
	}
	// Get the details
	const details = {
		host: process.env.DB_HOST || '',
		token: process.env.DB_TOKEN || ''
	};
	// Get the URL
	const url = join(
		details.host,
		'db',
		Buffer.from(details.token, 'utf8').toString('base64')
	);
	// Create the client
	db = new Client(url);
}, 30000);

beforeEach(async () => {
	// Wipe the DB
	return await db?.empty();
});

test('Read and write a key', async () => {
	// Write a key
	await db?.set('a', '0');
	// Get the
	const value = db?.get('a', true);
	// Make sure the value is correct
	expect(value).resolves.toBe('0');
});

test('Read and write many keys', async () => {
	// Write the keys
	await db?.setAll({
		a: '0',
		b: '1',
		c: '2'
	});
	// Read the keys
	const values = db?.getAll(true);
	// Make sure the values are correct
	expect(values).resolves.toEqual({
		a: '0',
		b: '1',
		c: '2'
	});
});

test('Deleting a key', async () => {
	// Write a key
	await db?.set('a', '0');
	// Delete the key
	await db?.delete('a');
	// Make sure the key is deleted
	expect(await db?.get('a')).toBe(undefined);
});

test('Deleting many keys', async () => {
	// Write a key
	await db?.setAll({
		a: '0',
		b: '1',
		c: '2'
	});
	// Delete the key
	await db?.deleteMultiple('a', 'b', 'c');
	// Read the keys
	const values = await db?.getAll();
	// Make sure the values are deleted
	expect(values?.a).toBe(undefined);
	expect(values?.b).toBe(undefined);
	expect(values?.c).toBe(undefined);
});

test('Wipping the DB', async () => {
	// Write a key
	await db?.set('a', '0');
	// Wipe the DB
	await db?.empty();
	// Read the key
	const value = db?.get('a');
	// Make sure the value is correct
	expect(value).resolves.toBe(undefined);
});

test('Listing all keys', async () => {
	// Write the keys
	await db?.setAll({
		a: '0',
		b: '1',
		c: '2'
	});
	// Get all the keys
	const keys = db?.list();
	// Make sure the keys are correct
	expect(keys).resolves.toEqual(['a', 'b', 'c']);
});

test('Listing keys with a prefix', async () => {
	// Write the keys
	await db?.setAll({
		prefix_a: '0',
		prefix_b: '1',
		c: '2'
	});
	// Get the keys
	const keys = await db?.list('prefix_');
	// Make sure the keys are correct
	expect(keys).toEqual(['prefix_a', 'prefix_b']);
});

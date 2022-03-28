import axios from 'axios';
import { join } from 'path';
import { generateUrl } from './generateUrl';

class Client {
	/** The DB url */
	private url: string;

	/**
	 * @description Creates a new instance of the client
	 * @param {string | undefined} url An optional URL to use for the client
	 */
	constructor(url?: string) {
		const dbUrl = url || process.env.REPLIT_DB_URL;
		// Make sure the url is set
		if (!dbUrl) {
			throw new Error('URL was not found in env and or undefined url passed.');
		}
		// Set the url
		this.url = dbUrl;
	}

	/**
	 * @description Gets a value from the DB
	 * @param {string} key The key to get
	 * @param {boolean | undefined} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<string | undefined>} The value or undefined
	 */
	public async get(key: string, raw: boolean | undefined = false): Promise<string | undefined> {
		const request = await axios.get(join(this.url, encodeURIComponent(key)));
		// If the raw flag is set return the raw value
		if (raw) {
			return request.data.toString();
		}
		// Try to parse the value
		try {
			return JSON.parse(request.data.toString());
		} catch {
			return request.data.toString();
		}
	}

	/**
	 * @description Sets a value in the DB
	 * @param {string} key The key to set
	 * @param {any} value The value to set
	 * @param {boolean} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<Client>} The client
	 */
	public async set(key: string, value: any, raw: boolean = false): Promise<Client> {
		const data = raw ? value.toString() : JSON.stringify(value);
		// Make the request
		await axios.post(
			this.url,
			`${encodeURIComponent(key)}=${encodeURIComponent(data)}`,
			{headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
		);
		// Return the client
		return this;
	}

	/**
	 * @description Deletes a value from the DB
	 * @param {string} key The key to delete
	 * @returns {Promise<Client>} The client
	 */
	public async delete(key: string): Promise<Client> {
		// Make the request
		const requestPromise = axios.delete(join(this.url, encodeURIComponent(key)));
		// Wait for the request to finish
		await requestPromise.catch((error) => {
			if (error.response.status !== 404) throw error;
		});
		// Return the client
		return this;
	}

	/**
	 * @description List all keys the start with a given prefix
	 * @param {string} prefix Defaults to '', the prefix to use
	 * @returns {Promise<string[]>} The keys
	 */
	public async list(prefix: string = ''): Promise<string[]> {
		// Make the request
		const request = await axios.get(generateUrl(this.url, {
			prefix: prefix,
			encode: 'true'
		}) || '');
		// Return the keys
		if (request.data.toString().length === 0) {
			return [];
		}
		// Return the keys
		return request.data.toString().split('\n');
	}

	/**
	 * @description Empties the DB
	 * @returns {Promise<Client>} The client
	 */
	public async empty(): Promise<Client> {
		// Get the keys
		const keys = await this.list();
		// Delete each key
		for (const key of keys) {
			await this.delete(key);
		}
		// Return the client
		return this;
	}

	/**
	 * @description Gets all the key and values from the DB
	 * @param {boolean} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<{[key: string]: any}>} The key and values
	 */
	public async getAll(raw: boolean = false): Promise<{[key: string]: any}> {
		// Get the keys
		const keys = await this.list();
		// Create an object
		const obj: {[key: string]: any} = {};
		// Crate a promise for each key
		await Promise.all(keys.map(async (key) => {
			if (obj[key] === obj.__proto__) {
				console.warn('Prototype detected, key skipped:', key);
				return;
			}
			obj[key] = await this.get(key, raw);
		}))
		// Return the object
		return obj;
	}

	/**
	 * @description Sets all the values in the DB
	 * @param {{[key: string]: any}} values The values to set
	 * @param {boolean} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<Client>} The client
	 */
	public async setAll(values: {[key: string]: any}, raw: boolean = false): Promise<Client> {
		// Create a promise for each key
		await Promise.all(Object.keys(values).map(async (key) => {
			await this.set(key, values[key], raw);
		}));
		// Return the client
		return this;
	}

	/**
	 * @description Delete multiple keys from the DB
	 * @param {string[]} keys The keys to set
	 */
	public async deleteMultiple(...keys: string[]): Promise<Client> {
		// Create a promise for each key
		await Promise.all(keys.map(async (key) => {
			await this.delete(key);
		}));
		// Return the client
		return this;
	}
}

export default Client;
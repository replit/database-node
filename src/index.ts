/** @format */

import axios from 'axios';
import { generateUrl } from './generateUrl';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export const join = (...args: string[]) => {
	const cleanedArray = args.map((arg) => {
		// Remove the first and last character if they are '/'
		if (arg.startsWith('/')) {
			arg = arg.substring(1);
		}
		if (arg.endsWith('/')) {
			arg = arg.substring(0, arg.length - 1);
		}
		return arg;
	});
	// Join the array with '/'
	return cleanedArray.join('/');
};

export class Client {
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
			throw new Error(
				'URL was not found in env and or undefined url passed.'
			);
		}
		// Set the url
		this.url = dbUrl;
	}

	/**
	 * @description Gets a value from the DB
	 * @param {string} key The key to get
	 * @param {boolean | undefined} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<string | object | number | undefined>} The value or undefined
	 */
	public async get(
		key: string,
		raw: boolean | undefined = false
	): Promise<string | object | number | undefined> {
		const request = await axios
			.get(join(this.url, encodeURIComponent(key)))
			.catch((error) => {
				if (error.response && error.response.status === 404) {
					return {
						data: undefined
					};
				}
				throw error;
			});
		// If the raw flag is set return the raw value
		if (raw) {
			return request.data !== undefined
				? request.data.toString()
				: undefined;
		}
		// Try to parse the value
		try {
			return request.data !== undefined
				? JSON.parse(request.data || '')
				: undefined;
		} catch {
			return request.data !== undefined ? request.data : undefined;
		}
	}

	/**
	 * @description Sets a value in the DB
	 * @param {string} key The key to set
	 * @param {object | string | number | undefined} value The value to set
	 * @param {boolean} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<Client>} The client
	 */
	public async set(
		key: string,
		value: object | string | number | undefined,
		raw = false
	): Promise<Client> {
		const data = raw
			? (value || 'undefined').toString()
			: JSON.stringify(value);
		// Make the request
		await axios.post(
			this.url,
			`${encodeURIComponent(key)}=${encodeURIComponent(data)}`,
			{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
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
		const requestPromise = axios.delete(
			join(this.url, encodeURIComponent(key))
		);
		// Wait for the request to finish
		await requestPromise.catch((error) => {
			if (error.response && error.response.status === 404) {
				return;
			}
			throw error;
		});
		// Return the client
		return this;
	}

	/**
	 * @description List all keys the start with a given prefix
	 * @param {string} prefix Defaults to '', the prefix to use
	 * @returns {Promise<string[]>} The keys
	 */
	public async list(prefix = ''): Promise<string[]> {
		// Make the request
		const request = await axios
			.get(
				generateUrl(this.url, {
					prefix: prefix,
					encode: 'true'
				}) || ''
			)
			.catch((error) => {
				if (error.response && error.response.status === 404) {
					return {
						data: []
					};
				}
				throw error;
			});
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
	 * @returns {Promise<{[key: string]: object | string | number | undefined}>} The key and values
	 */
	public async getAll(
		raw = false
	): Promise<{ [key: string]: object | string | number | undefined }> {
		// Get the keys
		const keys = await this.list();
		// Create an object
		const obj: { [key: string]: object | string | number | undefined } = {};
		// Crate a promise for each key
		const promises = keys.map((key) => {
			return (async () => {
				if (obj[key] === obj.__proto__) {
					console.warn('Prototype detected, key skipped:', key);
					return;
				}
				// Set the value
				obj[key] = await this.get(key, raw);
			})();
		});
		// Wait for all the promises to finish
		await Promise.all(promises);
		// Return the object
		return obj;
	}

	/**
	 * @description Sets all the values in the DB
	 * @param {{[key: string]: object | string | number | undefined}} values The values to se
	 * @param {boolean} raw Defaults to false, if true will return the raw value
	 * @returns {Promise<Client>} The client
	 */
	public async setAll(
		values: { [key: string]: object | string | number | undefined },
		raw = false
	): Promise<Client> {
		// Create a body
		const body = Object.keys(values)
			.map((key) => {
				return `${encodeURIComponent(key)}=${encodeURIComponent(
					raw
						? (values[key] || 'undefined').toString()
						: JSON.stringify(values[key])
				)}`;
			})
			.join('&');
		// Make the request
		await axios.post(this.url, body, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});
		// Return the client
		return this;
	}

	/**
	 * @description Delete multiple keys from the DB
	 * @param {string[]} keys The keys to set
	 */
	public async deleteMultiple(...keys: string[]): Promise<Client> {
		// Create a promise for each key
		await Promise.all(
			keys.map((key) => {
				return (async () => {
					await this.delete(key);
				})();
			})
		);
		// Return the client
		return this;
	}
}

export default Client;

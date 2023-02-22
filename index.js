const https = require('https');

const agent = new https.Agent({
	keepAlive: true
});

const rawFetch = typeof fetch === 'undefined' ? require("./fetch.cjs") : fetch;

const request = (url, options) => rawFetch(url, typeof options === 'object' ? { agent, ...options  } : { agent });

const parseJson = (str) => {
	if (typeof str !== 'string') return null;
	try {
		return JSON.parse(str);
	} catch (err) {
		return null;
	}
}

class CacheMap extends Map {
	constructor(ms) {
		super();
		if (ms === null) return;
		this.expiration = new Map();
		this.expiration.ms = ms;
	}

	get(key) {
		const value = super.get(key);

		if (!this.expiration) return value;

		const time = new Date().getTime(),
			expiresAt = this.expiration.get(key);

		if (time > expiresAt) {
			this.delete(key);
      return null;
		}

		return value;
	}

	set(key, value) {
		if (this.expiration) {
			const expiresAt = new Date().getTime() + this.expiration.ms;
			this.expiration.set(key, expiresAt);
		}
		return super.set(key, value);
	}

	delete(key) {
		if (this.expiration) this.expiration.delete(key);
		return super.delete(key);
	}
}

class Client {
	#url;

	/**
	 * Initiates Class.
	 * @param {String} url Custom database URL
	 * @param {?number} [ms=null] Milliseconds till cache expires or null for no cache expiry
	 */
	constructor(url, ms = null) {
		this.cache = new CacheMap(ms);
		this.#url = url || process.env.REPLIT_DB_URL;

		if (!this.#url) throw new Error("You must either pass a database URL into the Client constructor, or you must set the REPLIT_DB_URL environment variable. If you are using the repl.it editor, you must log in to get an auto-generated REPLIT_DB_URL environment variable.");

		this.getAll({ fetch: true }).then(keys => {
			for (const key in keys) this.cache.set(key, keys[key]);
		});
	}

	// Native Functions
	/**
	 * Gets a key
	 * @param {String} key Key
	 * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
	 * @param {boolean} [options.fetch=false] Fetches value from db without checking cache. Default is false.
	 */
	async get(key, options = {}) {
		let value = this.cache.get(key);

		if (options.fetch || !value) {
			value = await request(`${this.#url}/${encodeURIComponent(key)}`).then(r => r.text());
			this.cache.set(key, value);
		}

		if (options.raw) return value;

		return parseJson(value) ?? value;
	}

	/**
	 * Sets a key
	 * @param {String} key Key
	 * @param {any} value Value
	 */
	async set(key, value) {
		const strValue = JSON.stringify(value);

		this.cache.set(key, strValue);

		await request(this.#url, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `${encodeURIComponent(key)}=${encodeURIComponent(strValue)}`,
		});
		return this;
	}

	/**
	 * Deletes a key
	 * @param {String} key Key
	 */
	async delete(key) {
		this.cache.delete(key);
		await request(`${this.#url}/${encodeURIComponent(key)}`, { method: "DELETE" });
		return this;
	}

	/**
	 * List keys starting with a prefix or list all.
	 * @param {String} [options.prefix] Filter keys starting with prefix.
	 * @param {boolean} [options.fetch=false] Fetches values from db. Default is false.
	 */
	async list(options = {}) {
		if (!options.fetch) return [...this.cache.keys()].filter(key => key.startsWith(options.prefix ?? ""));

		const text = await request(
			`${this.#url}?encode=true&prefix=${encodeURIComponent(options.prefix ?? "")}`
		).then(r => r.text());

		if (text.length === 0) return [];
		return text.split("\n").map(decodeURIComponent);
	}

	// Dynamic Functions
	/**
	 * Clears the database.
	 */
	async empty() {
		const promises = [];
		for (const key of await this.list({ fetch: true }))
			promises.push(this.delete(key));

		await Promise.all(promises);

		return this;
	}

	/**
	 * Get all key/value pairs and return as an object.
	 * @param {boolean} [options.fetch=false] Fetches values from db. Default is false.
	 */
	async getAll(options = {}) {
		const output = {};
		for (const key of await this.list({ fetch: options.fetch }))
			output[key] = await this.get(key, { fetch: options.fetch });

		return output;
	}


	/**
	 * Sets the entire database through an object.
	 * @param {Object} obj The object.
	 */
	async setAll(obj) {
		for (const key in obj) await this.set(key, obj[key]);
		return this;
	}

	/**
	 * Delete multiple entries by keys
	 * @param {Array<string>} args Keys
	 */
	async deleteMultiple(...args) {
		const promises = [];

		for (const arg of args) promises.push(this.delete(arg));

		await Promise.all(promises);

		return this;
	}
}

module.exports = {
	Client
};
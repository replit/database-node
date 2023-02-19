const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({
	keepAlive: true
});

const httpsAgent = new https.Agent({
	keepAlive: true
});

const agent = (_parsedURL) => _parsedURL.protocol == 'http:' ? httpAgent : httpsAgent;

const rawFetch = typeof fetch === 'undefined' ? require("./fetch.cjs") : fetch;

// Keep alive for 2x faster requests
const request = (...args) => {
	const options = args[1];
	if (typeof options === 'object')
		options.agent = agent;
	else
		args[1] = { agent };

	return rawFetch(...args);
};

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
		let value = super.get(key);

		if (!this.expiration) return value;

		const time = new Date().getTime(),
			expiresAt = this.expiration.get(key);

		if (time > expiresAt) {
			value = null;
			this.delete(key);
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
		this.#url = url ?
			url :
			process.env.REPLIT_DB_URL;
		if (!this.#url) throw new Error("You must either pass a database URL into the Client constructor, or you must set the REPLIT_DB_URL environment variable. If you are using the repl.it editor, you must log in to get an auto-generated REPLIT_DB_URL environment variable.");
		this.fetchAll().then(keys => {
			for (const key in keys) this.cache.set(key, keys[key]);
		});
	}

	// Native Functions
	/**
	 * Gets a key
	 * @param {String} key Key
	 * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
	 */
	async get(key, options = {}) {
		const value = this.cache.get(key);

		if (!value) return await this.fetch(key, options);

		if (options.raw) return value;

		return parseJson(value) ?? value;
	}

	/**
	 * Fetches a key
	 * @param {String} key Key
	 * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
	 */
	async fetch(key, options) {
		const value = await request(this.#url+'/'+encodeURIComponent(key)).then(r => r.text());

		this.cache.set(key, value);

		if (options?.raw) return value;

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
		await request(this.#url+'/'+encodeURIComponent(key), { method: "DELETE" });
		return this;
	}

	/**
	 * List keys starting with a prefix or list all from cache or if none in cache from db.
	 * @param {String} prefix Filter keys starting with prefix.
	 */
	async list(prefix = "") {
		let keys = [...this.cache.keys()].filter(key => key.startsWith(prefix));
		if (!keys.length === 0) keys = await this.fetchList(prefix);
		return keys;
	}

	/**
	 * List key starting with a prefix or list all.
	 * @param {String} prefix Filter keys starting with prefix.
	 */
	async fetchList(prefix = "") {
		const text = await request(
			this.#url+'?encode=true&prefix='+encodeURIComponent(prefix)
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
		for (const key of await this.fetchList())
      promises.push(this.delete(key));

		await Promise.all(promises);

		return this;
	}

	/**
	 * Get all key/value pairs and return as an object.
	 */
	async getAll() {
		let output = {};
		for (const key of await this.list()) 
			output[key] = await this.get(key);
		
		return output;
	}

	/**
	 * Fetch all key/value pairs and return as an object.
	 */
	async fetchAll() {
		let output = {};
		for (const key of await this.fetchList()) 
			output[key] = await this.fetch(key);
		
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
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
  args[1] = typeof options !== 'object' ? {
    agent
  } : {
    ...args[1],
    agent
  };

  return rawFetch(...args);
};

class CacheMap extends Map {
	constructor (ms) {
		super();
		this.ms = ms;
		this.expiration = new Map();
	}
  get(key) {
    const time = new Date().getTime(),
      expiresAt = this.expiration.get(key);

    let value = super.get(key);

    if (time > expiresAt) {
      value = null;
      this.delete(key);
      this.expiration.delete(key);
    }

    return value;
  }
  set(key, value) {
    const expiresAt = new Date().getTime() + this.ms;
    this.expiration.set(key, expiresAt);
    return super.set(key, value);
  }
}

class Client {
  /**
   * Initiates Class.
   * @param {String} key Custom database URL
	 * @param {Number} [ms=1000*60*5] Milliseconds till cache expires
   */
  constructor(key, ms = 1000 * 60 * 5) {
    this.cache = new CacheMap(ms);
    this.key = key ?
      key :
      process.env.REPLIT_DB_URL;
		if (!key) throw new Error("You must either pass a database URL into the Client constructor, or you must set the REPLIT_DB_URL environment variable. If you are using the repl.it editor, you must log in to get an auto-generated REPLIT_DB_URL environment variable.");
  }

  // Native Functions
  /**
   * Gets a key
   * @param {String} key Key
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
   */
  async get(key, options) {
    const value = this.cache.get(key) ?? await this.fetch(key);

    return options?.raw ?
      value :
      JSON.parse(value) ?? null;
  }

  /**
   * Fetches a key
   * @param {String} key Key
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
   */
  async fetch(key, options) {
    const res = await request(this.key + "/" + key);
    const value = await res.text();

    this.cache.set(key, value);

    return options?.raw ?
      value :
      JSON.parse(value) ?? null;
  }

  /**
   * Sets a key
   * @param {String} key Key
   * @param {any} value Value
   */
  async set(key, value) {
    const strValue = JSON.stringify(value);

    this.cache.set(key, strValue);

    await request(this.key, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
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
    await request(`${this.key}/${key}`, {
      method: "DELETE"
    });
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
    const res = await request(
      `${this.key}?encode=true&prefix=${encodeURIComponent(prefix)}`
    );
    const text = await res.text();

    if (text.length === 0) return [];
    return text.split("\n").map(decodeURIComponent);
  }

  // Dynamic Functions
  /**
   * Clears the database.
   */
  async empty() {
    const promises = [];
    for (const key of await this.fetchList()) {
      promises.push(this.delete(key));
    }

    await Promise.all(promises);

    return this;
  }

  /**
   * Get all key/value pairs and return as an object.
   */
  async getAll() {
    let output = {};
    for (const key of await this.list()) {
      let value = await this.get(key);
      output[key] = value;
    }
    return output;
  }

  /**
   * Fetch all key/value pairs and return as an object.
   */
  async fetchAll() {
    let output = {};
    for (const key of await this.fetchList()) {
      let value = await this.fetch(key);
      output[key] = value;
    }
    return output;
  }

  /**
   * Sets the entire database through an object.
   * @param {Object} obj The object.
   */
  async setAll(obj) {
    for (const key in obj) {
      let val = obj[key];
      await this.set(key, val);
    }
    return this;
  }

  /**
   * Delete multiple entries by keys
   * @param {Array<string>} args Keys
   */
  async deleteMultiple(...args) {
    const promises = [];

    for (const arg of args) {
      promises.push(this.delete(arg));
    }

    await Promise.all(promises);

    return this;
  }
}

module.exports = {
  Client
};
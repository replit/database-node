const fetch = require("node-fetch");

class Client {
  /**
   * Initiates Class.
   * @param {String} key Custom database URL
   */
  constructor(key) {
    this.key = key || process.env.REPLIT_DB_URL;
  }

  // Native Functions
  /**
   * Gets a key
   * @param {String} key Key
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
   */
  async get(key, options) {
    return fetch(this.key + "/" + key)
      .then((e) => e.text())
      .then((strValue) => {
        if (options?.raw) {
          return strValue;
        }

        if (!strValue) {
          return null;
        }

        let value = strValue;
        try {
          // Try to parse as JSON, if it fails, we throw
          value = JSON.parse(strValue);
        } catch (_err) {
          throw new SyntaxError(
            `Failed to parse value of ${key}, try passing a raw option to get the raw value`
          );
        }

        if (value === undefined) {
          return null;
        }

        return value;
      });
  }

  /**
   * Sets a key
   * @param {String} key Key
   * @param {any} value Value
   */
  async set(key, value) {
    const strValue = JSON.stringify(value);

    await fetch(this.key, {
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
    await fetch(`${this.key}/${key}`, { method: "DELETE" });
    return this;
  }

  /**
   * List key starting with a prefix or list all.
   * @param {String} prefix Filter keys starting with prefix.
   */
  async list(prefix = "") {
    return fetch(
      `${this.key}?encode=true&prefix=${encodeURIComponent(prefix)}`
    )
      .then((r) => r.text())
      .then((t) => {
        if (t.length === 0) {
          return [];
        }
        return t.split("\n").map(decodeURIComponent);
      });
  }

  // Dynamic Functions
  /**
   * Clears the database.
   */
  async empty() {
    for (const key of await this.list()) {
      await this.delete(key);
    }

    return this;
  }

  /**
   * Get all key/value pairs and return as an object
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

    for (const arg of args) {
      await this.delete(arg);
    }

    return this;
  }
}

module.exports = Client;

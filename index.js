const fetch = require("node-fetch");

class Client {
  /**
   * Initiates Class.
   * @param {String} key Custom database URL
   */
  constructor(key) {
    if (key) this.key = key;
    else this.key = process.env.REPLIT_DB_URL;
  }

  // Native Functions
  /**
   * Gets a key
   * @param {String} key Key
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
   * @returns {Promise<any>}
   */
  async get(key, options) {
    return await fetch(this.key + "/" + key)
      .then((e) => e.text())
      .then((strValue) => {
        if (options && options.raw) {
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

        if (value === null || value === undefined) {
          return null;
        }

        return value;
      });
  }

  /**
   * Sets a key
   * @param {String} key Key
   * @param {any} value Value
   * @returns {Promise<Client>}
   */
  async set(key, value) {
    const strValue = JSON.stringify(value);

    await fetch(this.key, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: key + "=" + strValue,
    });

    return this;
  }

  /**
   * Deletes a key
   * @param {String} key Key
   * @returns {Promise<Client>}
   */
  async delete(key) {
    await fetch(this.key + "/" + key, { method: "DELETE" });
    return this;
  }

  /**
   * List key starting with a prefix or list all.
   * @param {String} prefix Filter keys starting with prefix.
   * @returns {Promise<String[]>}
   */
  async list(prefix = "") {
    return await fetch(
      this.key + `?encode=true&prefix=${encodeURIComponent(prefix)}`
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
   * @returns {Promise<Client>}
   */
  async empty() {
    const promises = [];
    for (const key of await this.list()) {
      promises.push(this.delete(key));
    }

    await Promise.all(promises);

    return this;
  }

  /**
   * Get all key/value pairs and return as an object
   * @returns {Promise<any>}
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
   * @returns {Promise<Client>}
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
   * @returns {Promise<Client>}
   */
  async deleteMultiple(...args) {
    const promises = [];

    for (const arg of args) {
      promises.push(this.delete(arg));
    }

    await Promise.all(promises);

    return this;
  }
  
  /**
   * List keys by their keyName and value.
   * @returns {Promise<{ key: String, value: any }>}
   */
  async listAllAsObject() {
    const output = [];

    for (const key of await this.list()) {
      output.push({ key, value: await this.get(key) })
    }

    return output;
  }
}

module.exports = Client;

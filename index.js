const fetch = require("node-fetch");

class Client {
  /**
   * Initiates Class.
   * @param {String} key Custom database URL. If not specified, will default to `process.env.REPLIT_DB_URL`
   */
  constructor(key) {
    if (key) {
      this.key = key;
    } else {
      this.key = process.env.REPLIT_DB_URL;
    };
  }
  // Native Functions
  /**
   * Gets the value of `key`
   * @param {String} key The name of what you want to get
   * @param {Boolean} [options.raw=false] Whether or not to return the raw string; default is `false`
   */
  async get(key, options) {
    return await fetch(this.key + "/" + key)
      .then(e => e.text())
      .then(strValue => {
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
          value = strValue; //Failed to parse as JSON, return raw STR
        }
        if (value === null || value === undefined) {
          return null;
        }
        return value;
      })
  }
  /**
   * Sets a key as `value`
   * @param {String} key Name of what you wish to edit
   * @param {any} value Value of what you wish to set `key` as
   * @returns Client
   */
  async set(key, value) {
    const strValue = JSON.stringify(value)
    await fetch(this.key, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: key + "=" + strValue });
    return this;
  }
  /**
   * Deletes a key
   * @param {String} key Name of what you wish to delete
   * @returns Client
   */
  async delete(key) {
    await fetch(this.key + "/" + key, { method: "DELETE" });
    return this;
  }

  /**
   * List key starting with a prefix or list all.
   * @param {String} prefix Filter keys starting with prefix.
   */
  async list(prefix="") {
    return await fetch(this.key + "?prefix=" + prefix)
      .then(e => e.text());
  }

  // Dynamic Functions
  /**
   * Clears the database.
   * @returns {Object} Client
   */
  async empty() {
    let data = await this.list();
    data = data.split("\n");
    
    const promises = []
    for (const el of data) {
      promises.push(this.delete(el));
    }

    await Promise.all(promises);
    return this;
  }

  /**
   * Get all key/value pairs and return as an object
   * @returns {Object} obj Output object consisting of key/value pairs
   */
  async getAll() {
    let output = {};
    let data = await this.list();
    data = data.split("\n");

    for (const key of data) {
      let value = await this.get(key);
      output[key] = value;
    };
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
   * @returns {Object} Client
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

module.exports = Client;

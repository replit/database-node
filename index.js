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
          throw new SyntaxError(`Failed to parse value of ${key}, try passing a the raw option to get the raw value`);
        }

        if (value === null || value === undefined) {
          return null;
        }

        return value;
      })
  }

  /**
   * Sets a key
   * @param {String} key Key
   * @param {any} value Value
   */
  async set(key, value) {
    const strValue = JSON.stringify(value)

    await fetch(this.key, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: key + "=" + strValue });
    return this;
  }

  /**
   * Deletes a key
   * @param {String} key Key
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
   */
  async empty() {
    let data = await this.list();
    data = data.split("\n");
    data.forEach(async el => {
      await this.delete(el);
    });
    return this;
  }

  /**
   * Get all key/value pairs and return as an object
   */
  async getAll() {
    let output = {};
    let data = await this.list();
    data = data.split("\n");
    for (const key in data) {
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
    for (const key of obj) {
      let val = obj[key];
      await this.set(key, val);
    }
    return this;
  }
}

module.exports = Client;

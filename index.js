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
   */
  async get(key) {
    return await fetch(this.key + "/" + key)
      .then(e => e.text());
  }

  /**
   * Sets a key
   * @param {String} key Key
   * @param {String} value Value
   */
  async set(key, value) {
    await fetch(this.key, { method: "POST", body: key + "=" + value });
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
    data.forEach(el => {
      let value = await this.get(el);
      output[el] = value;
    });
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
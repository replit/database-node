const fetch = require("node-fetch");

class Client {
  constructor(key) {
    if (key) this.key = key;
    else this.key = process.env.REPLIT_DB_URL;
  }

  async get(key) {
    return await fetch(this.key + "/" + key)
      .then(e => e.text());
  }

  async set(key, value) {
    await fetch(this.key, { method: "POST", body: key + "=" + value });
    return this;
  }

  async delete(key) {
    await fetch(this.key + "/" + key, { method: "DELETE" });
    return this;
  }

  async list(prefix="") {
    return await fetch(this.key + "?prefix=" + prefix)
      .then(e => e.text());
  }

  async empty() {
    return await fetch(this.key, { method: "DELETE" });
  }
}

module.exports = Client;
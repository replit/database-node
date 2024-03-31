import fetch from "node-fetch";
import { readFileSync } from "fs";

const replitDBFilename = "/tmp/replitdb";

export default class Client {
  private _key: string; // use this.key internally

  private lastKeyRefreshTime: number | undefined;

  /**
   * Initiates Class.
   * @param {String} key Custom database URL
   */
  constructor(key?: string) {
    if (key) {
      this._key = key;
    } else {
      this._key = getKey();
      this.lastKeyRefreshTime = Date.now();
    }
  }

  private get key(): string {
    if (!this.lastKeyRefreshTime) {
      return this._key;
    }

    if (Date.now() < this.lastKeyRefreshTime + 1000 * 60 * 60) {
      return this._key;
    }

    // refresh key
    this._key = getKey();
    this.lastKeyRefreshTime = Date.now();

    return this._key;
  }

  // Native Functions
  /**
   * Gets a key
   * @param {String} key Key
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
   */
  async get(key: string, options?: { raw: boolean }) {
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
            `Failed to parse value of ${key}, try passing a raw option to get the raw value`,
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
   */
  async set<Value>(key: string, value: Value) {
    const strValue = JSON.stringify(value);

    await fetch(this.key, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeURIComponent(key) + "=" + encodeURIComponent(strValue),
    });
    return this;
  }

  /**
   * Deletes a key
   * @param {String} key Key
   */
  async delete(key: string) {
    await fetch(this.key + "/" + encodeURIComponent(key), { method: "DELETE" });
    return this;
  }

  /**
   * List key starting with a prefix or list all.
   * @param {String} prefix Filter keys starting with prefix.
   */
  async list(prefix: string = "") {
    return await fetch(
      this.key + `?encode=true&prefix=${encodeURIComponent(prefix)}`,
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
    const promises: Array<Promise<this>> = [];
    for (const key of await this.list()) {
      promises.push(this.delete(key));
    }

    await Promise.all(promises);

    return this;
  }

  /**
   * Get all key/value pairs and return as an object
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value for each key. Default is false.
   */
  async getAll(options?: { raw: boolean }) {
    let output: Record<string, string | null> = {};
    for (const key of await this.list()) {
      let value = await this.get(key, options);
      output[key] = value;
    }
    return output;
  }

  /**
   * Sets the entire database through an object.
   * @param {Object} obj The object.
   */
  async setAll(obj: Record<string, any>) {
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
  async deleteMultiple(...args: Array<string>) {
    const promises: Array<Promise<this>> = [];

    for (const arg of args) {
      promises.push(this.delete(arg));
    }

    await Promise.all(promises);

    return this;
  }
}

function getKey(): string {
  let key: string | undefined;
  try {
    key = readFileSync(replitDBFilename, "utf8");
  } catch (err) {
    key = process.env.REPLIT_DB_URL;
  }

  if (!key) {
    throw new Error("expected key, got undefined");
  }

  return key;
}

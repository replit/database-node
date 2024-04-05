import { RequestError, doFetch, getDbUrl } from "./request";
import { Err, ErrResult, Ok, OkResult } from "./result";

export default class Client {
  private _dbUrl: string; // use this.dbUrl internally

  private lastDbUrlRefreshTime: number | undefined;

  /**
   * Initiates Class.
   * @param {String} dbUrl Custom database URL
   */
  constructor(dbUrl?: string) {
    if (dbUrl) {
      this._dbUrl = dbUrl;
    } else {
      this._dbUrl = getDbUrl();
      this.lastDbUrlRefreshTime = Date.now();
    }
  }

  private get dbUrl(): string {
    if (!this.lastDbUrlRefreshTime) {
      return this._dbUrl;
    }

    if (Date.now() < this.lastDbUrlRefreshTime + 1000 * 60 * 60) {
      return this._dbUrl;
    }

    // refresh url
    this._dbUrl = getDbUrl();
    this.lastDbUrlRefreshTime = Date.now();

    return this._dbUrl;
  }

  /**
   * Gets a key
   * @param {String} key Key
   * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
   */
  async get(
    key: string,
    options?: { raw: boolean },
  ): Promise<OkResult<any> | ErrResult<RequestError>> {
    const response = await doFetch({
      urlPath: `${this.dbUrl}/${key}`,
    });
    if (!response.ok) {
      return Err(response.error);
    }

    const text = await response.value.text();
    if (options && options.raw) {
      return Ok(text);
    }

    if (!text) {
      return Ok(null);
    }

    try {
      // Try to parse as JSON, if it fails, we return an error
      const parsed = JSON.parse(text);
      return Ok(parsed === null || parsed === undefined ? null : parsed);
    } catch {
      return Err({
        message: `Failed to parse value of ${key}, try passing a raw option to get the raw value`,
      });
    }
  }

  /**
   * Sets a key
   * @param {String} key Key
   * @param {any} value Value
   */
  async set(
    key: string,
    value: any,
  ): Promise<OkResult<this> | ErrResult<RequestError, unknown>> {
    const strValue = JSON.stringify(value);

    const response = await doFetch({
      urlPath: this.dbUrl,
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeURIComponent(key) + "=" + encodeURIComponent(strValue),
    });

    if (response.ok) {
      return Ok(this);
    } else {
      return Err(response.error);
    }
  }

  /**
   * Deletes a key
   * @param {String} key Key
   */
  async delete(
    key: string,
  ): Promise<OkResult<this> | ErrResult<RequestError, unknown>> {
    const response = await doFetch({
      urlPath: `${this.dbUrl}/${encodeURIComponent(key)}`,
      method: "DELETE",
    });

    if (response.ok) {
      return Ok(this);
    } else {
      return Err(response.error);
    }
  }

  /**
   * List key starting with a prefix if provided. Otherwise list all keys.
   * @param {String} prefix The prefix to filter by.
   */
  async list(
    prefix: string = "",
  ): Promise<OkResult<string[]> | ErrResult<RequestError, unknown>> {
    const response = await doFetch({
      urlPath: `${this.dbUrl}?encode=true&prefix=${encodeURIComponent(prefix)}`,
    });

    if (!response.ok) {
      return Err(response.error);
    }

    const text = await response.value.text();
    if (!text.length) {
      return Ok([]);
    }

    return Ok(text.split("\n").map(decodeURIComponent));
  }

  /**
   * Clears the database.
   * @returns a Promise containing this
   */
  async empty() {
    const keys = await this.list();
    if (!keys.ok) {
      return Err(keys.error);
    }

    const promises: Array<ReturnType<Client["delete"]>> = [];
    for (const key of keys.value) {
      promises.push(this.delete(key));
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => !r.ok).map((r) => r.error);
    if (errors.length) {
      return Err({ message: "Failed to empty databse" }, errors);
    }

    return Ok(this);
  }

  /**
   * Get all key/value pairs and return as an object
   * @param {boolean} [options.raw=false] Makes it so that we return the raw
   * string value for each key. Default is false.
   */
  async getAll(options?: { raw: boolean }) {
    const keys = await this.list();
    if (!keys.ok) {
      return Err(keys.error);
    }

    let output: Record<string, string | null> = {};
    for (const key of keys.value) {
      const value = await this.get(key, options);
      if (!value.ok) {
        return Err(value.error);
      }
      output[key] = value.value;
    }

    return Ok(output);
  }

  /**
   * Sets multiple keys from an object.
   * @param {Object} obj The object.
   */
  async setMultiple(obj: Record<string, any>) {
    const promises: Array<ReturnType<Client["set"]>> = [];

    for (const key in obj) {
      let val = obj[key];
      promises.push(this.set(key, val));
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => !r.ok).map((r) => r.error);
    if (errors.length) {
      return Err({ message: "Failed to set multiple" }, errors);
    }

    return Ok(this);
  }

  /**
   * Delete multiple entries by key.
   * @param {Array<string>} args Keys
   */
  async deleteMultiple(...args: Array<string>) {
    const promises: Array<ReturnType<Client["delete"]>> = [];

    for (const arg of args) {
      promises.push(this.delete(arg));
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => !r.ok).map((r) => r.error);

    if (errors.length) {
      return Err({ message: "Failed to delete keys" }, errors);
    }

    return Ok(this);
  }
}

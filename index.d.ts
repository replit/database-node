declare class Client<T extends Record<string, unknown> = Record<string, unknown>> {
	/** 
	 * Initiates Class. 
	 * @param url Custom database URL
	 */
	constructor(url?: string);

	// Native
	/**
	 * Retrieves a value from the cache or the database.
	 * @param {string} key - The key to retrieve.
	 * @param {object} [config] - Configuration options.
	 * @param {boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
	 * @param {boolean} [config.fetch=false] - If true, fetches the value from the database.
	 * @returns {*} - The value of the key.
	 */
	public get(key: keyof T, config: {
		raw: true
	}): Promise<string>;
	public get<K extends keyof T>(key: K, config?: {
		raw?: false
	}): Promise<T[K]>;
	public get<K extends keyof T>(key: K, config?: {
		raw?: boolean,
		fetch?: boolean
	}): Promise<T[K] | string>;
	/** 
	 * Sets a key 
	 * @param key Key 
	 * @param value Value 
	 */
	public set<K extends keyof T>(key: K, value: T[K]): Promise<this>;
	/** 
	 * Deletes a key 
	 * @param key Key 
	 */
	public delete(key: keyof T): Promise<this>;
	/**
	 * List keys starting with a prefix or list all.
	 * @param {object} [config] - Configuration options.
	 * @param {string} [config.prefix=''] Filter keys starting with prefix.
	 * @param {boolean} [config.fetch=false] Fetches values from the database. Default is false.
	 */
	public list(config?: {
		fetch?: boolean,
		prefix?: string
	}): Promise<(keyof T)[]>;

	// Dynamic
	/** Clears the database. */
	public empty(): Promise<this>;
	/**
	 * Get all key/value pairs and return as an object.
	 * @param {object} [config] - Configuration options.
	 * @param {boolean} [config.fetch=false] If true, fetches values from the database. Default is false.
	 */
	public getAll(config?: {
		fetch?: boolean
	}): Promise<T>;
	/** 
	 * Sets the multiple entries through an object. 
	 * @param obj The object. 
	 */
	public setMultiple(obj: Partial<T>): Promise<this>;
	/** 
	 * Delete multiple entries by keys 
	 * @param args Keys 
	 */
	public deleteMultiple(...args: (keyof T)[]): Promise<this>;
}

export default { Client };
export class Client<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Initiates Class.
   * @param key Custom database URL
   */
  constructor(key?: string);

  // Native
  /**
   * Gets a key
   * @param key Key
   * @param [options.raw=false] Makes it so that we return the raw string value. Default is false.
   */
  public get(key: keyof T, options: { raw: true }): Promise<string>;
  public get<K extends keyof T>(key: K, options?: { raw?: false }): Promise<T[K]>;
  public get<K extends keyof T>(key: K, options?: { raw?: boolean }): Promise<T[K] | string>;

  /**
   * Sets a key
   * @param key Key
   * @param value Value
   */
  public set<K extends keyof T>(key: K, value: T[K]): Promise<this>;

  /**
   * Deletes a key
   * @param key Key
   */
  public delete(key: keyof T): Promise<this>;

  /**
   * List key starting with a prefix or list all.
   * @param prefix Filter keys starting with prefix.
   */
  public list(prefix?: string): Promise<(keyof T)[]>;

  // Dynamic
  /** Clears the database. */
  public empty(): Promise<this>;

  /** Get all key/value pairs and return as an object */
  public getAll(): Promise<T>;

  /**
   * Sets the entire database through an object.
   * @param obj The object.
   */
  public setAll(obj: Partial<T>): Promise<this>;

  /**
   * Delete multiple entries by keys
   * @param args Keys
   */
  public deleteMultiple(...args: (keyof T)[]): Promise<this>;
}

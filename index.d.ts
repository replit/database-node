export class Client {
  constructor(key?: String)
  
  // Native
  public get(key: String): Promise<String>
  public set(key: String, value: String): Client
  public delete(key: String): Client
  public list(prefix?: String): Promise<String>

  // Dynamic
  public empty(): Client
  public getAll(): Object
  public setAll(obj: Object): Client
}
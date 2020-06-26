export class Client {
  constructor(key?: string)
  
  // Native
  public get(key: string): Promise<string>
  public set(key: string, value: string): Client
  public delete(key: string): Client
  public list(prefix?: string): Promise<string>

  // Dynamic
  public empty(): Client
  public getAll(): Object
  public setAll(obj: Object): Client
}

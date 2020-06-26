export class Client {
  constructor(key?: String): Client

  // Native
  public async get(key: String): Promise<String>
  public async set(key: String, value: String): Client
  public async delete(key: String): Client
  public async list(prefix?: String): Promise<String>

  // Dynamic
  public async empty(): Client
  public async getAll(): Object
  public async setAll(obj: Object): Client
}
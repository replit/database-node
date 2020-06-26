export class Client {
  constructor(key?: String): Client
  // Native
  public async get(key: String): Promise
  public async set(key: String, value: String): Client
  public async delete(key: String): Client
  public async list(prefix?: String): Promise
  // Dynamic
  public async empty(): Client
}
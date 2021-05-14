export default class Client {
  constructor(key?: string);

  // Native
  public get(key: string, options?: { raw?: boolean }): Promise<any>;
  public set(key: string, value: any): Promise<Client>;
  public delete(key: string): Promise<Client>;
  public list(prefix?: string): Promise<string[]>;

  // Dynamic
  public empty(): Promise<Client>;
  public getAll(): Promise<Record<any, any>>;
  public setAll(obj: Record<any, any>): Promise<Client>;
  public deleteMultiple(...args: string[]): Promise<Client>;
  public listAllAsObject(): Promise<{ key: String, value: any }>
}

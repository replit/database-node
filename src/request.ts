import { readFileSync } from "fs";
import { Result, Ok, Err } from "./result";

/**
 * An object that represents an error with a request
 * @public
 */
export interface RequestError {
  message: string;
  statusCode?: number;
}

export async function doFetch({
  urlPath,
  ...rest
}: {
  urlPath: string;
} & RequestInit): Promise<Result<Response, RequestError>> {
  const response = await fetch(new URL(urlPath), rest);

  if (response.status !== 200 && response.status !== 204) {
    return Err({
      message: await response.text(),
      statusCode: response.status,
    });
  }

  return Ok(response);
}

const replitDBFilename = "/tmp/replitdb";
export function getDbUrl(): string {
  let dbUrl: string | undefined;
  try {
    dbUrl = readFileSync(replitDBFilename, "utf8");
  } catch (err) {
    dbUrl = process.env.REPLIT_DB_URL;
  }

  if (!dbUrl) {
    throw new Error("expected dbUrl, got undefined");
  }

  return dbUrl;
}

/**
 * A Result type that can be used to represent a successful value or an error.
 * It forces the consumer to check whether the returned type is an error or not,
 * `result.ok` acts as a discriminant between success and failure
 * @public
 */
export type Result<T, E = Error | string, ErrorExtras = unknown> =
  | OkResult<T>
  | ErrResult<E, ErrorExtras>;

/**
 * Represents a successful result
 * @public
 */
export interface OkResult<T> {
  ok: true;
  value: T;
  error?: undefined;
}

/**
 * Represents a failure result
 * @public
 */
export interface ErrResult<E, ErrorExtras = unknown> {
  ok: false;
  error: E;
  value?: undefined;
  errorExtras?: ErrorExtras;
}

/**
 * A helper function to create an error Result type
 */
export function Err<E, ErrorExtras>(
  error: E,
  errorExtras?: ErrorExtras,
): ErrResult<E, ErrorExtras> {
  return { ok: false, error, errorExtras };
}

/**
 * A helper function to create a successful Result type
 **/
export function Ok<T>(value: T): OkResult<T> {
  return { ok: true, value };
}

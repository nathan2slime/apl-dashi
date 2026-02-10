/**
 * Create a shallow copy of `data` excluding specified keys and any properties whose value is `null` or `undefined`.
 *
 * @template T - The object type of the input `data`.
 * @template Key - The union of keys from `T` to be excluded.
 *
 * @param data - The source object whose own enumerable string-keyed properties will be considered.
 * @param keys - An array of keys (from `T`) to exclude from the returned object.
 *
 * @returns A new object typed as `Omit<T, Key>` that:
 *  - does not include any properties with keys listed in `keys`,
 *  - does not include any properties whose value is `null` or `undefined`.
 *
 * @remarks
 * - The function operates on own enumerable string-keyed properties only (uses `Object.entries`).
 *   Symbol-keyed properties and non-enumerable properties are ignored.
 * - The returned object is a shallow copy; object/array values are preserved by reference.
 * - Property descriptors (writable/configurable/enumerable/get/set) are not preserved.
 * - Type narrowing is performed via a runtime cast (`as Omit<T, Key>`); runtime checks are limited
 *   to key presence and `null`/`undefined` filtering — the TypeScript type system is not enforced at runtime.
 *
 * @example
 * const obj = { a: 1, b: null, c: 3 };
 * // exclude "a", and also drop "b" because its value is null
 * const result = exclude(obj, ['a']);
 * // result === { c: 3 }
 */
export const exclude = <T extends object, Key extends keyof T>(
  data: T,
  keys: Key[]
): Omit<T, Key> =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => {
      return !keys.includes(key as Key) && data[key] != null;
    })
  ) as Omit<T, Key>;

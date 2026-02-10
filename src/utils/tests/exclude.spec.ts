import { describe, expect, it } from 'vitest';

import { exclude } from '~/utils/exclude';

describe('exclude', () => {
  it('should exclude specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = exclude(obj, ['a', 'b']);

    expect(result).toEqual({ c: 3 });
  });

  it('should remove properties with null or undefined values', () => {
    const obj = { a: 1, b: null, c: undefined, d: 4 };
    const result = exclude(obj, []);

    expect(result).toEqual({ a: 1, d: 4 });
  });

  it('should exclude keys and remove null/undefined values at the same time', () => {
    const obj = { a: null, b: 2, c: undefined, d: 4 };
    const result = exclude(obj, ['b']);

    expect(result).toEqual({ d: 4 });
  });

  it('should return an empty object if all properties are excluded or null/undefined', () => {
    const obj = { a: null, b: undefined };
    const result = exclude(obj, ['a', 'b']);

    expect(result).toEqual({});
  });

  it('should preserve object and array references (shallow copy)', () => {
    const innerObj = { x: 1 };
    const innerArr = [1, 2, 3];
    const obj = { a: innerObj, b: innerArr, c: null };
    const result = exclude(obj, []);

    expect(result).toEqual({ a: innerObj, b: innerArr });
    expect(result.a).toBe(innerObj);
    expect(result.b).toBe(innerArr);
  });
});

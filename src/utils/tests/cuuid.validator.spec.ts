import { createId } from '@paralleldrive/cuid2';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { IsCuid } from '~/utils/cuuid.validator';

class TestClass {
  @IsCuid()
  id: string;
}

describe('IsCuid', () => {
  it('should pass validation with a valid CUID', async () => {
    const instance = new TestClass();
    instance.id = createId();
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with an invalid CUID', async () => {
    const instance = new TestClass();
    instance.id = 'invalid-cuid';
    const errors = await validate(instance);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isCuid).toBe('id must be a valid CUID');
  });

  it('should fail validation with a non-string value', async () => {
    const instance = new TestClass();
    instance.id = 12345 as unknown as string;
    const errors = await validate(instance);
    expect(errors).toHaveLength(1);
  });

  it('should fail validation with undefined value', async () => {
    const instance = new TestClass();
    instance.id = undefined as unknown as string;
    const errors = await validate(instance);
    expect(errors).toHaveLength(1);
  });
});

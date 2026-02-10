import { isCuid } from '@paralleldrive/cuid2';
import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator
} from 'class-validator';

export const IsCuid = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isCuid(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid CUID`;
        }
      }
    });
  };
};

import { registerDecorator, ValidationOptions } from 'class-validator';
import { ISO_4217_MAP } from '../constants/iso-codes';

export function IsValidCurrency(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCurrency',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value in ISO_4217_MAP;
        },
        defaultMessage() {
          return `${propertyName} must be a valid ISO 4217 currency code`;
        },
      },
    });
  };
}
import 'reflect-metadata';

// Symbol for metadata key
export const EXCLUDE_LOGGING_KEY = Symbol('excludeLogging');

// Create the ExcludeLogging decorator
export class ExcludeMethods {
  static names: Set<string> = new Set();
  static method: string = null;

  static add(name: string) {
    this.names.add(name);
  }

  static has(name: string): boolean {
    return this.names.has(name);
  }

  static get() {
    return this.names;
  }

  static setMethod(name: string) {
    this.method = name;
  }

  static getMethod() {
    return this.method;
  }

  static clearMethod() {
    this.method = null;
  }
}

export function ExcludeLogging(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  Reflect.defineMetadata(EXCLUDE_LOGGING_KEY, true, target, propertyKey);
}

// After
// export function ExcludeLogging() {
//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     const originalMethod = descriptor.value;
//     descriptor.value = function (...args: any[]) {
//       return originalMethod.apply(this, args);
//     };
//     return descriptor;
//   };
// }

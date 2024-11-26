import { Logger as logger } from '@nestjs/common';

import { EXCLUDE_LOGGING_KEY, ExcludeMethods } from './exclude-log.decorator';

export function LogClassMethods(constructor: any) {
  const methods = Object.getOwnPropertyNames(constructor.prototype).filter(
    (method) => method !== 'constructor' && typeof constructor.prototype[method] === 'function'
  );
  console.log('methods', methods);

  methods.forEach((method) => {
    const originalMethod = constructor.prototype[method];
    
    constructor.prototype[method] = function (...args: any[]) {
      const startTime = performance.now();

      try {
        ExcludeMethods.clearMethod();
        const isExcluded = Reflect.getMetadata(EXCLUDE_LOGGING_KEY, constructor.prototype, method);

        if (isExcluded) {
          logger.debug(`[${method}]:ExcludeLogging`);
          ExcludeMethods.setMethod(method);
        } else {
          logger.debug(`${method} with arguments: ${JSON.stringify(args)}`);
        }

        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.then((resolvedResult) => {
            if (!isExcluded) {
              logger.debug(`[${method}][Result]:\n${JSON.stringify(resolvedResult)}`);
            }
            const endTime = performance.now();
            logger.debug(`${method} took ${(endTime - startTime).toFixed(2)} milliseconds.\n`);
            return resolvedResult;
          }).catch((error) => {
            if (error instanceof Error) {
              logger.error(`Error in ${method}: ${error.stack}`);
            }
            throw error;
          });
        }

        if (!isExcluded) {
          logger.debug(`[${method}][Result]:\n${JSON.stringify(result)}`);
        }
        const endTime = performance.now();
        logger.debug(`${method} took ${(endTime - startTime).toFixed(2)} milliseconds.\n`);
        return result;

      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error in ${method}: ${error.stack}`);
        }
        throw error;
      }
    };
  });
}

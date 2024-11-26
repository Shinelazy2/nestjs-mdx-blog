import { Logger, QueryRunner} from 'typeorm';
import { ExcludeMethods } from './exclude-log.decorator';
import {Logger as logger} from '@nestjs/common';

export class CustomQueryLogger implements Logger {
    // TODO: @ExcludeLogging 데코레이터에서 제외된 함수 로깅 금지 설정
  
    private isExcludedFromLogging() {
      const method = ExcludeMethods.getMethod();
      const isExcluded = method !== null ? true : false;
      return isExcluded;
    }
  
    async logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
      // TODO: 한번만 로그 찍기
      if (this.isExcludedFromLogging()) {
        logger.debug('[Query]: SQL Excluded');
        return; // 로깅 제외
      }
      if (parameters && parameters.length > 0) {
        const paramsCopy = [...parameters]; // 배열 복사
        const formattedQuery = query.replace(/\?/g, () => {
          const param = paramsCopy.shift(); // 복사한 배열에서 요소 제거
          if (typeof param === 'string') {
            return `'${param.replace(/'/g, "''")}'`; // SQL 인젝션 방지
          }
          return param;
        });
        logger.debug(`[Query]: ${formattedQuery}`);
      } else {
        logger.debug(`[Query]: ${query}`);
      }
    }
  
    logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
      logger.error('Query Failed:', query);
      if (parameters && parameters.length > 0) {
        logger.error('With Parameters:', parameters);
      }
      logger.error('Error:', error);
    }
  
    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
      logger.warn(`Slow Query (${time}ms): ${query}`);
      if (parameters && parameters.length > 0) {
        logger.warn('With Parameters:', parameters);
      }
    }
  
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
      logger.debug('Schema Build:', message);
    }
  
    logMigration(message: string, queryRunner?: QueryRunner) {
      logger.debug('Migration:', message);
    }
  
    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
      switch (level) {
        case 'log':
          logger.debug('Log:', message);
          break;
        case 'info':
          logger.debug('Info:', message);
          break;
        case 'warn':
          logger.warn('Warning:', message);
          break;
        default:
          logger.debug('Unknown level:', message);
          break;
      }
    }
  }
  
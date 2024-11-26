import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { LoggingInterceptor } from './config/interceptors/logging.interceptor.js';

async function bootstrap() {
  initializeTransactionalContext(); // Transactional Context 초기화
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());

  // app.useGlobalPipes(new ValidationPipe());
  const whitelist = ['http://localhost:3001'];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: ['Content-Type', '*'],
    methods: 'GET,PUT,PATCH,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    enableDebugMessages: true,  // 개발 환경에서 상세한 에러 메시지 활성화
    exceptionFactory: (errors) => {
      const messages = errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value
      }));
      console.log('Validation failed:', JSON.stringify(messages, null, 2));
      return new BadRequestException(messages);
    }
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

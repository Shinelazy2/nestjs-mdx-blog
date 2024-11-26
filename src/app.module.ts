import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MdxModule } from './mdx/mdx.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MdxModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      async dataSourceFactory(option) {
        if (!option) throw new Error('Invalid options passed');
        return addTransactionalDataSource(new DataSource(option));
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/images',
      serveStaticOptions: {
        index: false, // index.html 자동 조회 비활성화
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

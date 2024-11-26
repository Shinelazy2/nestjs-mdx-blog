import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as path from 'path';
import { CustomQueryLogger } from './decorator/custom-query.logger';
// import { Mdx } from 'src/mdx/entities/Mdx.entity';
// import { MdxTag } from 'src/mdx/entities/mdx-tag.entity';
// import { Tag } from 'src/mdx/entities/tag.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      // entities: ['dist/**/*.entity{.ts,.js}'],
      // entities: [Mdx, MdxTag, Tag],
      entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
      synchronize: true,
      migrations: ['dist/migrations/*.js'],
      autoLoadEntities: true,
      logging: 'all',
      logger: new CustomQueryLogger(),
      extra: {
        authPlugin: 'mysql_native_password',
      },
    };
  }
}

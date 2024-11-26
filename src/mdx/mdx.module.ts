import { Module } from '@nestjs/common';
import { MdxService } from './mdx.service';
import { MdxController } from './mdx.controller';
import { MdxRepository } from './mdx.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mdx } from './entities/mdx.entity';
import { MdxTag } from './entities/mdx-tag.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mdx, Tag, MdxTag])],
  controllers: [MdxController],
  providers: [MdxService, MdxRepository],
})
export class MdxModule {}

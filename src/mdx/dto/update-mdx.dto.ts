import { PartialType } from '@nestjs/mapped-types';
import { CreateMdxDto } from './create-mdx.dto';

export class UpdateMdxDto extends PartialType(CreateMdxDto) {}

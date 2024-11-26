import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateMdxDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsString()
  description: string;
}

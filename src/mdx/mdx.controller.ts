import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MdxService } from './mdx.service';
import { CreateMdxDto } from './dto/create-mdx.dto';
import { TagStatistics } from './types/index';
import { UpdateMdxDto } from './dto/update-mdx.dto';
import { LogClassMethods } from 'src/config/decorator/method-logger';

@Controller('mdx')
export class MdxController {
  constructor(private readonly mdxService: MdxService) {}

  @Get('/')
  async getAllMDX() {
    return await this.mdxService.getAllMDX();
  }

  @Get(':idx')
  async getOneMDX(@Param('idx') idx: number) {
    console.log("🚀 ~ MdxController ~ getOneMDX ~ idx:", idx)
    const newLocal = await this.mdxService.getOneMDX(Number(idx));
    return newLocal;
  }

  @Put(':id')
  async updateMdx(
    @Param('id') id: number,
    @Body() updateMdxDto: UpdateMdxDto,
  ) {
    console.log("🚀 ~ MdxController ~ updateMdxDto:", updateMdxDto)
    console.log("🚀 ~ MdxController ~ id:", id)
    return await this.mdxService.updateMdx(id, updateMdxDto);
  }

  @Post('save')
  async setMDX(@Body() mdxProperties: CreateMdxDto) {
    console.log('🚀 ~ MdxController ~ setMDX ~ mdxProperties:', mdxProperties);
    return await this.mdxService.setMdx(mdxProperties);
  }

  @Get('tag/:tagName')
  async getMdxByTagName(@Param('tagName') tagName: string) {
    return await this.mdxService.getMdxByTagName(tagName);
  }

  @Get('tags/statistics')
  async getTagStatisticss(): Promise<TagStatistics[]> {
    return await this.mdxService.getTagStatistics();
  }

  @Get('tags/all')
  async getAllTags() {
    return await this.mdxService.getAllTags();
  }

  @Delete(':id')
  async deleteMdx(@Param('id') id: number) {
    return await this.mdxService.deleteMdx(Number(id));
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = `/images/${file.filename}`;
    return { imageUrl };
  }

}

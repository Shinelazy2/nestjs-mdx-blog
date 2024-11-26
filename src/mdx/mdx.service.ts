import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMdxDto } from './dto/create-mdx.dto.js';
import { MdxRepository } from './mdx.repository.js';
import { Transactional } from 'typeorm-transactional';
import { Tag } from './entities/tag.entity.js';
import { Mdx } from './entities/mdx.entity.js';
import { MdxTag } from './entities/mdx-tag.entity.js';
import { TagStatistics } from './types/index.js';
import { UpdateMdxDto } from './dto/update-mdx.dto.js';
import { LogClassMethods } from '../config/decorator/method-logger.js';

@Injectable()
export class MdxService {
  constructor(private readonly mdxRepository: MdxRepository) {}

  @Transactional()
  async setMdx(createMdxDto: CreateMdxDto) {
    // 1. MDX 생성
    const mdx = new Mdx();
    mdx.content = createMdxDto.content;
    mdx.title = createMdxDto.title;
    mdx.description = createMdxDto.description;
    const savedMdx = await this.mdxRepository.saveMdx(mdx);
    
    // 2. Tags 처리 - 쉼표로 구분된 태그들을 분리하고 처리
    const tagNames = createMdxDto.tag
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0); // 빈 문자열 제거

    // 각 태그에 대해 처리
    for (const tagName of tagNames) {
      // 2.1 Tag 찾기 또는 생성
      let tag = await this.mdxRepository.findTagByName(tagName);
      if (!tag) {
        tag = new Tag();
        tag.name = tagName;
        tag = await this.mdxRepository.saveTag(tag);
      }

      // 2.2 MdxTag 관계 설정
      const mdxTag = new MdxTag();
      mdxTag.mdx = savedMdx;
      mdxTag.tag = tag;
      await this.mdxRepository.saveMdxTag(mdxTag);
    }

    return savedMdx;
  }

  async getOneMDX(idx: number) {
    console.log("🚀 ~ MdxService ~ getOneMDX ~ idx:", idx)
    const mdx = await this.mdxRepository.getOneMDX(idx);
    const tags = mdx.mdxTags.map((mdxTag) => mdxTag.tag.name);
    const result = { ...mdx, tags };
    return result
  }

  private transformMdxResponse(mdx: Mdx) {
    return {
      id: mdx.id,
      title: mdx.title,
      content: mdx.content,
      description: mdx.description,
      thumbnail: `http://localhost:3000/images/${mdx.thumbnail}`,
      createdAt: mdx.createdAt,
      updatedAt: mdx.updatedAt,
      published: mdx.published,
      tags: mdx.mdxTags.map((mdxTag) => mdxTag.tag.name),
    };
  }

  async getAllMDX() {
    const mdxList = await this.mdxRepository.getAllMDX();
    return mdxList.map((mdx) => this.transformMdxResponse(mdx));
  }

  async getMdxByTagName(tagName: string) {
    const mdxList = await this.mdxRepository.getMdxByTagName(tagName);
    const result = mdxList.map((mdx) => this.transformMdxResponse(mdx))
    console.log("🚀 ~ MdxService ~ getMdxByTagName ~ result:", result)
    return result
  }

  async getTagStatistics(): Promise<TagStatistics[]> {
    const totalCount = await this.mdxRepository.getTotalMdxCount();
    const tagStats = await this.mdxRepository.getTagsWithCount();

    // COUNT 결과가 문자열로 반환되므로 숫자로 변환
    const result: TagStatistics[] = [
      { tagName: 'All', tagCount: totalCount },
      ...tagStats.map((stat) => ({
        tagName: stat.tagName,
        tagCount: parseInt(stat.tagCount, 10),
      })),
    ];

    return result;
  }

  @Transactional()
  async updateMdx(id: number, updateMdxDto: UpdateMdxDto) {
    const mdx = await this.mdxRepository.getOneMDX(id);
    if (!mdx) {
      throw new NotFoundException('MDX not found');
    }
  
    // MDX 기본 데이터 업데이트
    mdx.title = updateMdxDto.title;
    mdx.content = updateMdxDto.content;
    mdx.description = updateMdxDto.description;
  
    // 태그 처리
    const newTagNames = updateMdxDto.tag
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  
    // updateMdxWithTags 호출로 단순화
    await this.mdxRepository.updateMdxWithTags(id, mdx, newTagNames);
  
    // 업데이트된 MDX 조회 및 반환
    const updatedMdx = await this.mdxRepository.getOneMDX(id);
    return this.transformMdxResponse(updatedMdx);
  }

  async getAllTags() {
    const tags = await this.mdxRepository.getAllTags();
    return tags.map(tag => tag.name);
  }

  async deleteMdx(id: number) {
    const result = await this.mdxRepository.deleteMdx(id);
    if (!result) {
      throw new NotFoundException(`MDX with ID ${id} not found`);
    }
    return { message: 'MDX deleted successfully' };
  }
}

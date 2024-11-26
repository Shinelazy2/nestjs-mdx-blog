import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Mdx } from './entities/mdx.entity';
import { MdxTag } from './entities/mdx-tag.entity';
import { Tag } from './entities/tag.entity';
import { LogClassMethods } from 'src/config/decorator/method-logger';

@Injectable()
// @LogClassMethods
export class MdxRepository {
  
  private mdxRepo: Repository<Mdx>;
  private mdxTagRepo: Repository<MdxTag>;
  private tagRepo: Repository<Tag>;

  constructor(private readonly dataSource: DataSource) {
    this.mdxRepo = this.dataSource.getRepository(Mdx);
    this.mdxTagRepo = this.dataSource.getRepository(MdxTag);
    this.tagRepo = this.dataSource.getRepository(Tag);
  }

  async getOneMDX(idx: number) {
    return await this.mdxRepo
      .createQueryBuilder('mdx')
      .where('mdx.id = :idx', { idx })
      .leftJoinAndSelect('mdx.mdxTags', 'mdxTags')
      .leftJoinAndSelect('mdxTags.tag', 'tag')
      .getOne();
  }

  async getAllMDX() {
    return await this.mdxRepo
      .createQueryBuilder('mdx')
      .leftJoinAndSelect('mdx.mdxTags', 'mdxTags')
      .leftJoinAndSelect('mdxTags.tag', 'tag')
      .getMany();
  }

  async findTagByName(name: string) {
    return await this.tagRepo.findOne({ where: { name } });
  }

  async saveTag(tag: Tag) {
    return await this.tagRepo.save(tag);
  }

  async saveMdx(mdx: Mdx) {
    return await this.mdxRepo.save(mdx);
  }

  async saveMdxTag(mdxTag: MdxTag) {
    return await this.mdxTagRepo.save(mdxTag);
  }

  async getMdxByTagName(tagName: string) {
    if (tagName.toUpperCase() === 'ALL') {
      return await this.getAllMDX();
    }

    return await this.mdxRepo
      .createQueryBuilder('mdx')
      .leftJoinAndSelect('mdx.mdxTags', 'mdxTags')
      .leftJoinAndSelect('mdxTags.tag', 'tag')
      .where('tag.name = :tagName', { tagName })
      .getMany();
  }

  async getTagsWithCount(): Promise<{ tagName: string; tagCount: string }[]> {
    return await this.tagRepo
      .createQueryBuilder('tag')
      .select('tag.name', 'tagName')
      .addSelect('COUNT(mdxTag.id)', 'tagCount')
      .leftJoin('tag.mdxTags', 'mdxTag')
      .groupBy('tag.id')
      .orderBy('tagCount', 'DESC')
      .getRawMany();
  }

  async getTotalMdxCount(): Promise<number> {
    return await this.mdxRepo.count();
  }

  async save(mdx: Mdx) {
    return await this.mdxRepo.save(mdx);
  } 

  async removeAllMdxTag(id: number) {
    return await this.mdxTagRepo.delete({ mdx: { id } });
  }

  async getAllMdxTag(id: number) {
    return await this.mdxTagRepo.find({ where: { mdx: { id } } });
  }

  async removeAllTag(ids: number[]) {
    return await this.tagRepo.delete({ mdxTags: { mdx: { id: In(ids) } } });
  }

  async setMdxTag(id: number, newTag: string[]) {
    return await this.mdxTagRepo.save(newTag.map(tag => ({ mdx: { id }, tag: { name: tag } })));
  }

  async setTag(id: number, newTag: string[]) {
    return await this.tagRepo.save(newTag.map(tag => ({ name: tag })));
  }

  async getAllTags() {
    return await this.tagRepo.createQueryBuilder('tag')
    .groupBy('tag.name')
    .getMany();
  }

  async updateMdxWithTags(id: number, mdx: Mdx, newTagNames: string[]) {
    return await this.dataSource.transaction(async manager => {
      // 1. 현재 MDX의 태그 관계 조회
      const currentMdxTags = await manager.find(MdxTag, {
        where: { mdx: { id } },
        relations: { tag: true }
      });

      // 2. 현재 태그 이름들
      const currentTagNames = currentMdxTags.map(mdxTag => mdxTag.tag.name);

      // 3. MDX 저장
      const savedMdx = await manager.save(Mdx, mdx);

      // 4. MdxTag 관계 삭제
      await manager.delete(MdxTag, { mdx: { id } });

      // 5. 사용되지 않는 태그 삭���
      const tagsToRemove = currentMdxTags
        .filter(mdxTag => !newTagNames.includes(mdxTag.tag.name))
        .map(mdxTag => mdxTag.tag.id);

      if (tagsToRemove.length > 0) {
        // 5.1 해당 태그들이 다른 MDX에서 사용되는지 확인
        for (const tagId of tagsToRemove) {
          const tagUsageCount = await manager.count(MdxTag, {
            where: { tag: { id: tagId } }
          });

          // 5.2 사용되지 않는 태그만 삭제
          if (tagUsageCount === 0) {
            await manager.delete(Tag, { id: tagId });
          }
        }
      }

      // 6. 새로운 태그 처리
      for (const tagName of newTagNames) {
        // 6.1 태그 찾기 또는 생성
        let tag = await manager.findOne(Tag, { where: { name: tagName } });
        if (!tag) {
          tag = await manager.save(Tag, { name: tagName });
        }

        // 6.2 MdxTag 관계 생성
        await manager.save(MdxTag, {
          mdx: savedMdx,
          tag,
        });
      }

      return savedMdx;
    });
  }

  async deleteMdx(id: number): Promise<boolean> {
    return await this.dataSource.transaction(async manager => {
      // 1. 현재 MDX의 MdxTag 관계 조회
      const mdxTags = await manager.find(MdxTag, {
        where: { mdx: { id } },
        relations: { tag: true }
      });

      // 2. MdxTag 관계 삭제
      await manager.delete(MdxTag, { mdx: { id } });

      // 3. 연관된 태그들 중 다른 MDX에서 사용되지 않는 태그 삭제
      for (const mdxTag of mdxTags) {
        const tagUsageCount = await manager.count(MdxTag, {
          where: { tag: { id: mdxTag.tag.id } }
        });

        if (tagUsageCount === 0) {
          await manager.delete(Tag, { id: mdxTag.tag.id });
        }
      }

      // 4. MDX 삭제
      const result = await manager.delete(Mdx, id);
      return result.affected > 0;
    });
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Mdx } from './mdx.entity';

@Entity()
export class MdxTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mdx, (mdx) => mdx.mdxTags, { nullable: false })
  mdx: Mdx;

  @ManyToOne(() => Tag, (tag) => tag.mdxTags, { nullable: false })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;

  // constructor(partial: Partial<MdxTag>) {
  //   Object.assign(this, partial);
  // }
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MdxTag } from './mdx-tag.entity';

@Entity()
export class Mdx {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('longtext')
  content: string;

  @Column()
  description?: string;

  @Column({ default: 'default.png' })
  thumbnail?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  published: boolean;

  @OneToMany(() => MdxTag, (mdxTag) => mdxTag.mdx)
  mdxTags: MdxTag[];

  // constructor(partial: Partial<Mdx>) {
  //   Object.assign(this, partial);
  // }
}

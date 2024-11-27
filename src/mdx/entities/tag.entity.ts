import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MdxTag } from './mdx-tag.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => MdxTag, (mdxTag) => mdxTag.tag)
  mdxTags: MdxTag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // constructor(partial: Partial<Tag>) {
  //   Object.assign(this, partial);
  // }
}

import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProjectDetails } from './project-detail.entity';
import { Fields } from './fields.entity';

@ObjectType()
@Entity({ name: 'schema' })
export class Schema {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @ManyToOne(() => ProjectDetails, (pd) => pd.design, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectDetailId' })
  projectDetail: ProjectDetails;

  @Field(() => [Fields])
  @OneToMany(() => Fields, (col) => col.schema, {
    cascade: ['insert', 'update'],
  })
  fields: Fields[];
}

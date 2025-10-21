import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectDetails } from './project-detail.entity';
import { GraphQLJSONObject } from 'graphql-type-json';

export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

@ObjectType()
@Entity({ name: 'project-api' })
export class ProjectApi {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProjectDetails, (pd) => pd.api, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectDetailId' })
  projectDetail: ProjectDetails;

  @Field()
  @Column()
  path: string;

  @Field()
  @Column()
  method: ApiMethod;

  @Field()
  @Column()
  targetEntity: string;

  @Field(() => GraphQLJSONObject)
  @Column({ type: 'jsonb' })
  data: Record<string, any>;
}

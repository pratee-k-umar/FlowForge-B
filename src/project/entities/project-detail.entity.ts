import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Schema } from './schema.entity';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
@Entity({ name: 'project_details' })
export class ProjectDetails {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dbType?: 'mongo' | 'postgres' | 'mysql';

  @Field({ nullable: true })
  @Column({ nullable: true })
  connectionUri?: string;

  @Field()
  @Column()
  liveUrl: string;

  // @Field({ nullable: true })
  // @Column({ nullable: true })
  // databaseName?: string;

  @Field(() => [Schema])
  @OneToMany(() => Schema, (schema) => schema.projectDetail, { cascade: true })
  @JoinColumn()
  design?: Schema[];

  // @OneToOne(() => Project, (p) => p.details, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // project: Project;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'json', nullable: true })
  authConfig?: Record<string, any>;
}

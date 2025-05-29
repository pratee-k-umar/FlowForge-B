import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../project.entity';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity()
export class ProjectDetails {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ nullable: true })
  dbType?: 'mongo' | 'postgres' | 'mysql';

  @Column({ nullable: true })
  connectionUri?: string;

  @Field()
  @Column()
  liveUrl: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  design?: any;

  // @OneToOne(() => Project, (p) => p.details, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // project: Project;
}

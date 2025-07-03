import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Schema } from './schema.entity';

@ObjectType()
@Entity()
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

  @Field(() => [Schema])
  @OneToMany(() => Schema, (schema) => schema.projectDetail)
  @JoinColumn()
  design?: Schema[];

  // @OneToOne(() => Project, (p) => p.details, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // project: Project;
}

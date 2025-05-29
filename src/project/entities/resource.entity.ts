import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../project.entity';
import { FieldDef } from './field-def.entity';

@ObjectType()
@Entity()
export class Resource {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  route: string;

  @ManyToOne(() => Project, (p) => p.resources, { onDelete: 'CASCADE' })
  project: Project;

  @OneToMany(() => FieldDef, (f) => f.resource, {
    cascade: ['insert', 'update'],
  })
  fields: FieldDef[];
}

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Resource } from './resource.entity';

@ObjectType()
@Entity()
export class FieldDef {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  type: string;

  @Field()
  @Column({ default: false })
  required: boolean;

  @ManyToOne(() => Resource, (r) => r.fields, { onDelete: 'CASCADE' })
  resource: Resource;
}

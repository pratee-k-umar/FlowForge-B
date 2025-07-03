import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Schema } from './schema.entity';

@ObjectType()
@Entity({ name: 'column_schema' })
export class Fields {
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
  isRequired: boolean;

  @ManyToOne(() => Schema, (ts) => ts.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tableSchemaId' })
  schema: Schema;

  @Field(() => ID)
  @Column()
  schemaId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referencesSchemaId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referencesField?: string;
}

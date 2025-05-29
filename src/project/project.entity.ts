import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectDetails } from './entities/project-detail.entity';
import { Resource } from './entities/resource.entity';

@ObjectType()
@Entity()
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  owner: User;

  @Field(() => ProjectDetails)
  @OneToOne(() => ProjectDetails, { cascade: true })
  @JoinColumn()
  details: ProjectDetails;

  @OneToMany(() => Resource, (r) => r.project, {
    cascade: ['insert', 'update'],
  })
  resources: Resource[];
}

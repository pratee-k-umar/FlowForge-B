import { Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectDetails } from './project-detail.entity';

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
  name: string;

  @Field()
  @Column()
  route: string;

  @Field()
  @Column()
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @Field()
  @Column({ type: 'jsonb' })
  function: string;
}

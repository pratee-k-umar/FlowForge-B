import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { SocialAuth } from '../dto/social-auth.response';

@ObjectType()
export class ProjectAuth {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isEmailVerified?: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isPhoneVerified?: boolean;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  githubId?: string;

  @Column({ nullable: true })
  xId?: string;

  @Column({ nullable: true })
  microsoftId?: string;

  @Field(() => [String])
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @Field(() => SocialAuth)
  socialAuth?: SocialAuth;
}

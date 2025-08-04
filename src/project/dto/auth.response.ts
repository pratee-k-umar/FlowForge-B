import { Field, ObjectType } from '@nestjs/graphql';
import { ProjectAuth } from '../entities/project-auth.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => ProjectAuth)
  user: ProjectAuth;
}

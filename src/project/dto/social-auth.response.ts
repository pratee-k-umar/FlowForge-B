import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SocialAuth {
  @Field()
  googleId?: string;

  @Field()
  githubId?: string;

  @Field()
  xId?: string;

  @Field()
  microsoftId?: string;
}

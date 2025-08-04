import { Field, InputType } from '@nestjs/graphql';

@InputType()
class EmailPasswordConfigInput {
  @Field()
  enabled: boolean;

  @Field()
  enabledVerification: boolean;
}

@InputType()
class PhoneConfigInput {
  @Field()
  enabled: boolean;

  @Field()
  enabledVerification: boolean;
}

@InputType()
class OAuthConfigInput {
  @Field()
  enabled: boolean;

  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  clientSecret?: string;

  @Field({ nullable: true })
  authorizationUrl?: string;

  @Field({ nullable: true })
  tokenUrl?: string;

  @Field({ nullable: true })
  userInfoUrl?: string;
}

@InputType()
export class AuthConfigInput {
  @Field(() => EmailPasswordConfigInput, { nullable: true })
  emailPassword?: EmailPasswordConfigInput;

  @Field(() => PhoneConfigInput, { nullable: true })
  phone?: PhoneConfigInput;

  @Field(() => OAuthConfigInput, { nullable: true })
  google?: OAuthConfigInput;

  @Field(() => OAuthConfigInput, { nullable: true })
  github?: OAuthConfigInput;

  @Field(() => OAuthConfigInput, { nullable: true })
  x?: OAuthConfigInput;

  @Field(() => OAuthConfigInput, { nullable: true })
  microsoft?: OAuthConfigInput;
}

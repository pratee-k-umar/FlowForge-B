import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class Schema {
  @Field(() => ID)
  projectDetailId: string;

  @Field()
  name: string;
}

import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class Schema {
  @Field(() => ID)
  fieldId: string;

  @Field()
  name: string;
}

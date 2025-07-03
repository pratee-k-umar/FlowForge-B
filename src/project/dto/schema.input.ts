import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTableSchemaInput {
  @Field(() => ID)
  projectDetailId: string;

  @Field()
  name: string;
}

import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class Fields {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field({ defaultValue: false })
  isRequired?: boolean;

  @Field(() => ID, { nullable: true })
  referencesSchemaId?: string;

  @Field({ nullable: true })
  referencesField?: string;
}

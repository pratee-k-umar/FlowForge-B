import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class FieldCRUDInput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field({ defaultValue: false, nullable: true })
  isRequired?: boolean;

  @Field(() => ID, { nullable: true })
  referencesSchemaId?: string;

  @Field({ nullable: true })
  referencesField?: string;
}

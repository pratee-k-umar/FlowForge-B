import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectApiInput {
  @Field()
  path: string;

  @Field()
  method: string;

  @Field()
  action: string;

  @Field({ nullable: true })
  targetEntity?: string;

  @Field()
  isRequired: boolean;
}

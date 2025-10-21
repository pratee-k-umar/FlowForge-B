import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiMethod } from '../entities/project-api.entity';
import { GraphQLJSONObject } from 'graphql-type-json';

registerEnumType(ApiMethod, {
  name: 'ApiMethod',
});

@InputType()
export class ProjectApiInput {
  @Field()
  path: string;

  @Field(() => ApiMethod)
  method: ApiMethod;

  @Field({ nullable: true })
  targetEntity?: string;

  @Field(() => GraphQLJSONObject)
  data: Record<string, any>;

  @Field()
  isRequired: boolean;
}

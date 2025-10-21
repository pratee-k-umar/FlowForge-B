import { Field, InputType } from '@nestjs/graphql';
import { ApiMethod } from '../entities/project-api.entity';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class UpdateApi {
  @Field({ nullable: true })
  path?: string;

  @Field(() => ApiMethod, { nullable: true })
  method: ApiMethod;

  @Field({ nullable: true })
  targetEntity: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data: Record<string, any>;
}

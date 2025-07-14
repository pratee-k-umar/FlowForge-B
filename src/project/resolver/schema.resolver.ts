import { Args, Context, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Schema } from '../entities/schema.entity';
import { SchemaService } from '../services/schema.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { Fields } from '../entities/fields.entity';
import { FieldCRUDInput } from '../dto/field-crud.input';

@Resolver(() => Schema)
export class SchemaResolver {
  constructor(private readonly schemaService: SchemaService) {}

  @Mutation(() => Schema, { name: 'createSchema' })
  @UseGuards(GqlJwtGaurd)
  async createSchema(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('name') name: string,
    @Context() { req },
  ): Promise<Schema> {
    return this.schemaService.createSchema(req.user.id, projectId, name);
  }

  @Mutation(() => Fields, { name: 'addField' })
  @UseGuards(GqlJwtGaurd)
  async addField(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('schemaId', { type: () => ID }) schemaId: string,
    @Args('field') field: FieldCRUDInput,
    @Context() { req },
  ): Promise<Fields> {
    return this.schemaService.addField(
      req.user.id,
      projectId,
      schemaId,
      field.name,
      field.type,
      field.isRequired,
      field.referencesSchemaId,
      field.referencesField,
    );
  }
}

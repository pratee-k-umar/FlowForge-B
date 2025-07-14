import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DynamicService } from '../services/dynamic.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { GraphQLJSON } from 'graphql-type-json';

@Resolver()
export class DynamicResolver {
  constructor(private dynamicService: DynamicService) {}

  @Query(() => [GraphQLJSON], { name: 'getRecords' })
  @UseGuards(GqlJwtGaurd)
  async getRecords(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('entity', { type: () => String }) entity: string,
  ) {
    return this.dynamicService.findAll(projectId, entity);
  }

  @Query(() => GraphQLJSON, { name: 'getRecord' })
  @UseGuards(GqlJwtGaurd)
  async getRecord(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('entity', { type: () => String }) entity: string,
    @Args('id', { type: () => String }) id: string,
  ): Promise<any> {
    return this.dynamicService.findOne(projectId, entity, id);
  }

  @Mutation(() => GraphQLJSON, { name: 'createRecord' })
  @UseGuards(GqlJwtGaurd)
  async createRecord(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('entity', { type: () => String }) entity: string,
    @Args('data', { type: () => GraphQLJSON }) data: any,
  ): Promise<any> {
    return this.dynamicService.create(projectId, entity, data);
  }

  @Mutation(() => GraphQLJSON, { name: 'updateRecord' })
  @UseGuards(GqlJwtGaurd)
  async updateRecord(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('entity', { type: () => String }) entity: string,
    @Args('id', { type: () => String }) id: string,
    @Args('data', { type: () => GraphQLJSON }) data: any,
  ): Promise<any> {
    return this.dynamicService.update(projectId, entity, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteRecord' })
  @UseGuards(GqlJwtGaurd)
  async deleteRecord(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('entity') entity: string,
    @Args('id') id: string,
  ): Promise<boolean> {
    const { deleted } = await this.dynamicService.delete(projectId, entity, id);
    return deleted;
  }
}

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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
    @Args('entity', { type: () => String }) entity: string,
    @Context() { req },
  ) {
    const { projectDetails } = req as any;
    return this.dynamicService.findAll(projectDetails, entity);
  }

  @Query(() => GraphQLJSON, { name: 'getRecord' })
  @UseGuards(GqlJwtGaurd)
  async getRecord(
    @Args('entity', { type: () => String }) entity: string,
    @Args('id', { type: () => String }) id: string,
    @Context() { req },
  ): Promise<any> {
    const { projectDetails } = req as any;
    return this.dynamicService.findOne(projectDetails, entity, id);
  }

  @Mutation(() => GraphQLJSON, { name: 'createRecord' })
  @UseGuards(GqlJwtGaurd)
  async createRecord(
    @Args('entity', { type: () => String }) entity: string,
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Context() { req },
  ): Promise<any> {
    const { projectDetails } = req as any;
    return this.dynamicService.create(projectDetails, entity, data);
  }

  @Mutation(() => GraphQLJSON, { name: 'updateRecord' })
  @UseGuards(GqlJwtGaurd)
  async updateRecord(
    @Args('entity', { type: () => String }) entity: string,
    @Args('id', { type: () => String }) id: string,
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Context() { req },
  ): Promise<any> {
    const { projectDetails } = req as any;
    return this.dynamicService.update(projectDetails, entity, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteRecord' })
  @UseGuards(GqlJwtGaurd)
  async deleteRecord(
    @Args('entity') entity: string,
    @Args('id') id: string,
    @Context() { req },
  ): Promise<boolean> {
    const projectDetails = (req as any).projectDetails;
    const { deleted } = await this.dynamicService.delete(
      projectDetails,
      entity,
      id,
    );
    return deleted;
  }
}

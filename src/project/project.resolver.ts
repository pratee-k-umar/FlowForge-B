import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [Project], { name: 'projects' })
  @UseGuards(GqlJwtGaurd)
  async getMyProjects(@Context() { req }): Promise<Project[]> {
    return this.projectService.findByUser(req.user.id);
  }

  @Mutation(() => Project)
  @UseGuards(GqlJwtGaurd)
  async createProject(
    @Args('name') name: string,
    @Context() { req },
  ): Promise<Project> {
    return this.projectService.createProject(req.user.id, name);
  }
}

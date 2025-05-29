import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { DatabaseConfigInput, DbType } from './dto/database-config.input';

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

  @Mutation(() => Project, { name: 'setDatabaseConfig' })
  @UseGuards(GqlJwtGaurd)
  async setDatabaseConfig(
    @Args('projectId') projectId: string,
    @Args('config') config: DatabaseConfigInput,
    @Context() { req },
  ): Promise<Project> {
    return this.projectService.setDatabaseConfig(
      req.user.id,
      projectId,
      config.dbType as DbType,
      config.connectionUri,
    );
  }
}

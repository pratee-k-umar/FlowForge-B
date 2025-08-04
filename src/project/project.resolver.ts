import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { DatabaseConfigInput, DbType } from './dto/database-config.input';
import { ProjectDetails } from './entities/project-detail.entity';
import GraphQLJSON from 'graphql-type-json';
import { AuthConfigInput } from './dto/auth-config.input';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [Project], { name: 'projects' })
  @UseGuards(GqlJwtGaurd)
  async projects(@Context() { req }): Promise<Project[]> {
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

  @Mutation(() => ProjectDetails, { name: 'createDesign' })
  @UseGuards(GqlJwtGaurd)
  async createDesign(
    @Args('projectId') projectId: string,
    @Args('design', { type: () => GraphQLJSON }) design: any,
    @Context() { req },
  ): Promise<ProjectDetails> {
    return this.projectService.createDesign(req.user.id, projectId, design);
  }

  // @ResolveField('details', () => ProjectDetails)
  // async getDetails(@Parent() project: Project): Promise<ProjectDetails> {
  //   return this.projectService.getProjectDetails(project.id);
  // }

  @Mutation(() => Project, { name: 'setAuthConfig' })
  @UseGuards(GqlJwtGaurd)
  async setAuthConfig(
    @Args('projectId') projectId: string,
    @Args('authConfig') authConfig: AuthConfigInput,
    @Context() { req },
  ): Promise<ProjectDetails> {
    return this.projectService.configureAuth(
      req.user.id,
      projectId,
      authConfig,
    );
  }
}

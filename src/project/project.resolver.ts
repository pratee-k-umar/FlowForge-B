import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { DatabaseConfigInput, DbType } from './dto/database-config.input';
import { ProjectDetails } from './entities/project-detail.entity';
import GraphQLJSON from 'graphql-type-json';
import { AuthConfigInput } from './dto/auth-config.input';
import { ProjectApi } from './entities/project-api.entity';
import { ProjectApiInput } from './dto/project-api.input';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [Project], { name: 'project' })
  @UseGuards(GqlJwtGaurd)
  async projects(@Context() { req }): Promise<Project[]> {
    return this.projectService.findByUser(req.user.id);
  }

  @Query(() => ProjectDetails, { name: 'projectDetails' })
  @UseGuards(GqlJwtGaurd)
  async projectDetails(
    @Args('projectId') projectId: string,
    @Context() { req },
  ): Promise<ProjectDetails> {
    const project = await this.projectService.findById(projectId);
    if (project.owner.id !== req.user.id)
      throw new ForbiddenException('Unauthroized..!');
    return this.projectService.getProjectDetails(projectId);
  }

  @Query(() => ProjectApi, { name: 'getApi' })
  @UseGuards(GqlJwtGaurd)
  async getApi(
    @Args('projectId') projectId: string,
    @Context() { req },
  ): Promise<ProjectApi[]> {
    return this.projectService.getApi(req.user.id, projectId);
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

  @ResolveField('details', () => ProjectDetails)
  async getDetails(@Parent() project: Project): Promise<ProjectDetails> {
    return this.projectService.getProjectDetails(project.id);
  }

  @Mutation(() => ProjectApi, { name: 'createApi' })
  @UseGuards(GqlJwtGaurd)
  async createApi(
    @Args('projectId') projectId: string,
    @Args('apiInput') apiInput: ProjectApiInput,
    @Context() { req },
  ): Promise<ProjectApi> {
    return this.projectService.createApi(req.user.id, projectId, apiInput);
  }

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

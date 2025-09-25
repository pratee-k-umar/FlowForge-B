import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { ProjectService } from 'src/project/project.service';
import { Project } from 'src/project/project.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private users: UserService,
    private projectService: ProjectService,
  ) {}

  @Query(() => User)
  @UseGuards(GqlJwtGaurd)
  async me(@Context() { req }): Promise<User> {
    const userId = req.user.id;
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @ResolveField('project', () => [Project])
  async getProject(@Parent() user: User): Promise<Project[]> {
    return this.projectService.findByUser(user.id);
  }
}

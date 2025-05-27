import { Context, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';

@Resolver(() => User)
export class UserResolver {
  constructor(private users: UserService) {}

  @Query(() => User)
  @UseGuards(GqlJwtGaurd)
  async me(@Context() { req }): Promise<User> {
    const userId = req.user.id;
    const user = await this.users.findById(userId)
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

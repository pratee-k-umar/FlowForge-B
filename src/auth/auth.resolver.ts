import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGaurd } from './gql-jwt.gaurd';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => String, { name: 'signup' })
  async signup(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.signup(name, email, password);
  }

  @Mutation(() => String)
  async verifyEmail(@Args('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.login(email, password);
  }

  @Mutation(() => String)
  async requestPasswordReset(@Args('email') email: string) {
    return this.auth.requestPasswordReset(email);
  }

  @Mutation(() => String)
  async resetPassword(
    @Args('token') token: string,
    @Args('newPassword') newPass: string,
  ) {
    return this.auth.resetPassword(token, newPass);
  }

  @Mutation(() => String)
  @UseGuards(GqlJwtGaurd)
  protectedAction(@Context() { req }) {
    return `Hello ${req.user.name}`;
  }
}

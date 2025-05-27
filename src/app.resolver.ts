import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { name: 'flowforge' })
  welcome(): string {
    return 'Welcome to FlowForge!';
  }
}

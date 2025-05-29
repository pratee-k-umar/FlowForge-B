import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { AuthResolver } from './auth/auth.resolver';
import { ProjectModule } from './project/project.module';
import { ProjectMiddleware } from './project/project.middleware';
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        scalarsMap: [{ type: Object, scalar: GraphQLJSON }],
      },
      context: ({ req }) => ({ req }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST'),
        port: +cfg.get<number>('DB_PORT'),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASS'),
        database: cfg.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    EmailModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthResolver, AppResolver],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProjectMiddleware).forRoutes({
      path: 'api/:projectId/graphql',
      method: RequestMethod.ALL,
    });
  }
}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { Project } from './project.entity';
import { DynamicService } from './services/dynamic.service';
import { DynamicResolver } from './resolver/dynamic.resolver';
import { ProjectDetails } from './entities/project-detail.entity';
import { DynamicRestController } from './controller/dynamic-rest.controller';
import { SchemaService } from './services/schema.service';
import { DatabaseService } from './services/database.service';
import { Schema } from './entities/schema.entity';
import { ResourceService } from './services/resource.service';
import { Fields } from './entities/fields.entity';
import { SchemaResolver } from './resolver/schema.resolver';
import { ProjectAuth } from './entities/project-auth.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProjectAuthService } from './services/project-auth.service';
import { ConnectionManager } from './services/connection.manager';

@Module({
  imports: [
    Project,
    ProjectDetails,
    TypeOrmModule.forFeature([
      Project,
      ProjectDetails,
      Schema,
      Fields,
      ProjectAuth,
    ]),
    forwardRef(() => UserModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        secret: cfg.get<string>('USER_JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    ProjectService,
    ProjectResolver,
    ProjectAuthService,
    DynamicService,
    DynamicResolver,
    SchemaResolver,
    SchemaService,
    DatabaseService,
    ResourceService,
    ConnectionManager,
  ],
  controllers: [DynamicRestController],
  exports: [ProjectService],
})
export class ProjectModule {}

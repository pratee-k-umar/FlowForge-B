import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { Project } from './project.entity';
import { DynamicService } from './dynamic.service';
import { DynamicResolver } from './dynamic.resolver';
import { ProjectController } from './project.controller';
import { ProjectDetails } from './project-detail.entity';
import { DynamicRestController } from './dynamic-rest.controller';
import { Resource } from './resource.entity';
import { FieldDef } from './field-def.entity';
import { ResourceService } from './resource.service';
import { SchemaService } from './schema.service';

@Module({
  imports: [
    Project,
    ProjectDetails,
    TypeOrmModule.forFeature([Project, ProjectDetails, Resource, FieldDef]),
    UserModule,
  ],
  providers: [
    ProjectService,
    ProjectResolver,
    DynamicService,
    DynamicResolver,
    ResourceService,
    SchemaService,
  ],
  controllers: [ProjectController, DynamicRestController],
  exports: [ProjectService],
})
export class ProjectModule {}

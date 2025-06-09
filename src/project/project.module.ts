import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { Project } from './project.entity';
import { DynamicService } from './services/dynamic.service';
import { DynamicResolver } from './resolver/dynamic.resolver';
import { ProjectDetails } from './entities/project-detail.entity';
import { DynamicRestController } from './controller/dynamic-rest.controller';
import { Resource } from './entities/resource.entity';
import { FieldDef } from './entities/field-def.entity';
import { ResourceService } from './services/resource.service';
import { SchemaService } from './services/schema.service';

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
  controllers: [DynamicRestController],
  exports: [ProjectService],
})
export class ProjectModule {}

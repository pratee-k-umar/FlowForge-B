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
import { SchemaService } from './services/schema.service';
import { DatabaseService } from './services/database.service';
import { Schema } from './entities/schema.entity';
import { ResourceService } from './services/resource.service';
import { Fields } from './entities/fields.entity';
import { SchemaResolver } from './resolver/schema.resolver';

@Module({
  imports: [
    Project,
    ProjectDetails,
    TypeOrmModule.forFeature([Project, ProjectDetails, Schema, Fields]),
    UserModule,
  ],
  providers: [
    ProjectService,
    ProjectResolver,
    DynamicService,
    DynamicResolver,
    SchemaResolver,
    SchemaService,
    DatabaseService,
    ResourceService,
  ],
  controllers: [DynamicRestController],
  exports: [ProjectService],
})
export class ProjectModule {}

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
import { ProjectDetailsResolver } from './resolver/project-details.resolver';

@Module({
  imports: [
    Project,
    ProjectDetails,
    TypeOrmModule.forFeature([Project, ProjectDetails, Schema]),
    UserModule,
  ],
  providers: [
    ProjectService,
    ProjectResolver,
    ProjectDetailsResolver,
    DynamicService,
    DynamicResolver,
    SchemaService,
    DatabaseService,
  ],
  controllers: [DynamicRestController],
  exports: [ProjectService],
})
export class ProjectModule {}

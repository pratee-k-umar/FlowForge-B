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

@Module({
  imports: [
    Project,
    ProjectDetails,
    TypeOrmModule.forFeature([Project, ProjectDetails]),
    UserModule,
  ],
  providers: [ProjectService, ProjectResolver, DynamicService, DynamicResolver],
  controllers: [ProjectController, DynamicRestController],
  exports: [ProjectService],
})
export class ProjectModule {}

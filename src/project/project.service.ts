import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ProjectDetails } from './entities/project-detail.entity';
import { SchemaService } from './services/schema.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectDetails)
    private detailsRepo: Repository<ProjectDetails>,
    private userService: UserService,
    private readonly schemaService: SchemaService,
  ) {}

  async createProject(id: string, name: string): Promise<Project> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const details = this.detailsRepo.create({
      liveUrl: `/api/placeholder/graphql`,
    });
    const project = this.projectRepo.create({
      name,
      owner: user,
      details,
    });
    const saved = await this.projectRepo.save(project);
    saved.details.liveUrl = `/api/${saved.id}/graphql`;
    await this.detailsRepo.save(saved.details);
    return saved;
  }

  async findByUser(id: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { owner: { id: id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found!');
    return project;
  }

  async findByIdWithDetails(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['details', 'owner'],
    });
    if (!project) throw new NotFoundException('Project not found!');
    return project;
  }

  async setDatabaseConfig(
    userId: string,
    projectId: string,
    dbType: 'mongo' | 'postgres' | 'mysql',
    connectionUri: string,
  ): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['details', 'owner'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner.id !== userId) throw new ForbiddenException();

    project.details.dbType = dbType;
    project.details.connectionUri = connectionUri;
    await this.detailsRepo.save(project.details);

    await this.schemaService.provisionSchema(projectId);

    return project;
  }
}

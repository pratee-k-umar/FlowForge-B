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
import { DatabaseService } from './services/database.service';
import { Schema } from './entities/schema.entity';
import { Fields } from './entities/fields.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectDetails)
    private detailsRepo: Repository<ProjectDetails>,
    @InjectRepository(Schema) private schemaRepo: Repository<Schema>,
    @InjectRepository(Fields) private fieldRepo: Repository<Fields>,
    private userService: UserService,
    private readonly databaseService: DatabaseService,
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

  async getProjectDetails(projectId: string): Promise<ProjectDetails> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['details', 'details.fields'],
    });
    if (!project) throw new NotFoundException('Project not found!');
    return project.details;
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

    await this.databaseService.provisionSchema(project.details);

    return project;
  }

  async createDesign(
    userId: string,
    projectId: string,
    design: any,
  ): Promise<ProjectDetails> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['owner', 'details', 'details.fields'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner.id !== userId) throw new ForbiddenException();

    const details = project.details;
    if (!details) {
      throw new NotFoundException('Project details not found');
    }

    if (details.design) {
      await this.schemaRepo.remove(details.design);
    }

    const newSchemas: Schema[] = [];
    for (const table of design) {
      const schema = this.schemaRepo.create({
        name: table.name,
        projectDetail: details,
      });

      (schema as any).fields = [];

      for (const field of table.fields) {
        const newField = this.fieldRepo.create({
          ...field,
          schema: schema,
        });
        (schema as any).fields.push(newField);
      }

      newSchemas.push(schema);
    }

    details.design = newSchemas;
    const saved = await this.detailsRepo.save(details);

    await this.databaseService.provisionSchema(details);
    return saved;
  }
}

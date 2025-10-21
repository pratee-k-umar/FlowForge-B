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
import { AuthConfigInput } from './dto/auth-config.input';
import { ProjectAuth } from './entities/project-auth.entity';
import { ProjectApi } from './entities/project-api.entity';
import { ProjectApiInput } from './dto/project-api.input';
import { UpdateApi } from './dto/update-api.input';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectDetails)
    private detailsRepo: Repository<ProjectDetails>,
    @InjectRepository(Schema) private schemaRepo: Repository<Schema>,
    @InjectRepository(Fields) private fieldRepo: Repository<Fields>,
    @InjectRepository(ProjectAuth)
    @InjectRepository(ProjectApi)
    private projectApiRepo: Repository<ProjectApi>,
    private userService: UserService,
    private readonly databaseService: DatabaseService,
  ) {}

  async createProject(id: string, name: string): Promise<Project> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const details = this.detailsRepo.create({
      liveUrl: `/api/placeholder`,
    });
    const project = this.projectRepo.create({
      name,
      owner: user,
      details,
    });
    const saved = await this.projectRepo.save(project);
    saved.details.liveUrl = `/api/${saved.id}`;
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
      relations: ['details', 'owner'],
    });
    if (!project) throw new NotFoundException('Project not found!');
    return project;
  }

  async findByIdWithDetails(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: [
        'details',
        'owner',
        'details.design',
        'details.design.fields',
      ],
    });
    if (!project) throw new NotFoundException('Project not found!');
    return project;
  }

  async getProjectDetails(projectId: string): Promise<ProjectDetails> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['details', 'details.design'],
    });
    if (!project) throw new NotFoundException('Project not found!');
    return project.details;
  }

  async setDatabaseConfig(
    userId: string,
    projectId: string,
    dbType: 'mongodb' | 'postgres' | 'mysql',
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

    const dbName = project.name.toLowerCase().replace(/\s+/g, '_');
    await this.databaseService.provisionSchema(project.details, dbName);

    return project;
  }

  async createDesign(
    userId: string,
    projectId: string,
    design: any,
  ): Promise<ProjectDetails> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: [
        'owner',
        'details',
        'details.design',
        'details.design.fields',
      ],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner.id !== userId) throw new ForbiddenException();

    const details = project.details;
    if (!details) {
      throw new NotFoundException('Project details not found');
    }

    // Prevent creation if design already exists
    if (details.design && details.design.length > 0) {
      throw new ForbiddenException('Design already exists for this project');
    }

    const newSchemas: Schema[] = [];
    for (const table of design) {
      const schema = await this.schemaRepo.save({
        name: table.name,
        projectDetail: details,
      });

      const newFields: Fields[] = [];
      for (const field of table.fields) {
        const newField = await this.fieldRepo.save({
          ...field,
          schema: schema,
        });
        newFields.push(newField);
      }
      schema.fields = newFields;
      newSchemas.push(schema);
    }

    details.design = newSchemas;
    const saved = await this.detailsRepo.save(details);

    await this.databaseService.provisionSchema(details);
    return saved;
  }

  async getSchema(projectId: string): Promise<Schema[]> {
    const project = await this.findById(projectId);
    if (!project) throw new NotFoundException('Project not found..!');

    return this.schemaRepo.find({
      where: { projectDetail: { id: project.details.id } },
      relations: ['fields'],
    });
  }

  async createApi(
    userId: string,
    projectId: string,
    apiInput: ProjectApiInput,
  ): Promise<ProjectApi> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['details', 'owner'],
    });

    if (!project) throw new NotFoundException('Project not found..!');

    if (project.owner.id !== userId)
      throw new ForbiddenException('Unauthorized..!');

    const newApi = this.projectApiRepo.create({
      projectDetail: project.details,
      path: apiInput.path,
      method: apiInput.method,
      targetEntity: apiInput.targetEntity,
      data: apiInput.data,
    });

    return this.projectApiRepo.save(newApi);
  }

  async getApi(userId: string, projectId: string): Promise<ProjectApi[]> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['details', 'owner'],
    });

    if (!project) throw new NotFoundException('Project not found..!');

    if (project.owner.id !== userId)
      throw new ForbiddenException('Unauthorized..!');

    return this.projectApiRepo.find({
      where: { projectDetail: { id: project.details.id } },
    });
  }

  async updateApi(
    userId: string,
    apiId: string,
    updateInput: UpdateApi,
  ): Promise<ProjectApi> {
    const api = await this.projectApiRepo.findOne({
      where: { id: apiId },
      relations: ['projectDetail', 'owner'],
    });

    if (!api) throw new NotFoundException('API not found..!');

    if (api.projectDetail.owner.id !== userId)
      throw new ForbiddenException('Unauthorized..!');

    const { path, method, targetEntity, data } = updateInput;
    const updatePayload: Partial<ProjectApi> = {};

    if (path) updatePayload.path = path;
    if (method) updatePayload.method = method;
    if (targetEntity) updatePayload.targetEntity = targetEntity;
    if (data) updatePayload.data = data;
  }

  async configureAuth(
    userId: string,
    projectid: string,
    authConfig: AuthConfigInput,
  ): Promise<ProjectDetails> {
    const project = await this.projectRepo.findOne({
      where: { id: projectid },
      relations: ['details', 'owner', 'details.design'],
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.owner.id !== userId) throw new ForbiddenException();

    // const userSchema = project.details.design?.find(
    //   (s) => s.name.toLowerCase() === 'user',
    // );

    // if (!userSchema)
    //   throw new BadRequestException(
    //     'Create useer schema before configuring auth',
    //   );

    project.details.authConfig = authConfig;
    const savedDetails = await this.detailsRepo.save(project.details);

    await this.databaseService.provisionProjectAuthSchema(savedDetails);

    return savedDetails;
  }
}

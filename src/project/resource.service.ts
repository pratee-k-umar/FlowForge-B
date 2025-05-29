import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldDef } from './field-def.entity';
import { ProjectService } from './project.service';
import { Resource } from './resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource) private readonly resRepo: Repository<Resource>,
    @InjectRepository(FieldDef)
    private readonly fieldRepo: Repository<FieldDef>,
    private readonly projectService: ProjectService,
  ) {}

  /** Create a new collection for a project */
  async createResource(
    projectId: string,
    name: string,
    fieldDefs: { name: string; type: string; required?: boolean }[],
  ): Promise<Resource> {
    const project = await this.projectService.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    // Build the route path
    const route = `/api/${projectId}/${name}`;

    // Create field definitions
    const fields = fieldDefs.map((fd) =>
      this.fieldRepo.create({
        name: fd.name,
        type: fd.type,
        required: !!fd.required,
      }),
    );

    // Create & save Resource with its fields
    const resource = this.resRepo.create({ name, route, project, fields });
    return this.resRepo.save(resource);
  }

  /** List all resources (collections) for a project */
  async listResources(projectId: string): Promise<Resource[]> {
    return this.resRepo.find({
      where: { project: { id: projectId } },
      relations: ['fields'],
    });
  }

  /** Fetch one resource by name */
  async findResource(projectId: string, name: string): Promise<Resource> {
    const res = await this.resRepo.findOne({
      where: { project: { id: projectId }, name },
      relations: ['fields'],
    });
    if (!res) throw new NotFoundException(`Resource "${name}" not found`);
    return res;
  }
}

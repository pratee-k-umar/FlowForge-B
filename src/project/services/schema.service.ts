// src/project/resource.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schema } from '../entities/schema.entity';
import { Fields } from '../entities/fields.entity';
import { ProjectService } from '../project.service';
import { DatabaseService } from './database.service';

@Injectable()
export class SchemaService {
  constructor(
    @InjectRepository(Schema)
    private readonly schemaRepo: Repository<Schema>,

    @InjectRepository(Fields)
    private readonly fieldRepo: Repository<Fields>,

    private readonly projectService: ProjectService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Create a new schema (table) under a project and provision it in the database
   */
  async createSchema(
    userId: string,
    projectId: string,
    name: string,
  ): Promise<Schema> {
    const project = await this.projectService.findByIdWithDetails(projectId);
    if (project.owner.id !== userId) throw new ForbiddenException();

    const schema = this.schemaRepo.create({
      name,
      projectDetail: project.details,
      fields: [],
    });
    const saved = await this.schemaRepo.save(schema);
    await this.databaseService.provisionSchema(project.details);
    return saved;
  }

  /**
   * Add a field (column) to an existing Schema and provision change
   */
  async addField(
    userId: string,
    projectId: string,
    schemaId: string,
    name: string,
    type: string,
    isRequired = false,
    referencesSchemaId?: string,
    referencesField?: string,
  ): Promise<Fields> {
    const project = await this.projectService.findByIdWithDetails(projectId);
    if (project.owner.id !== userId) throw new ForbiddenException();

    const schema = await this.schemaRepo.findOne({ where: { id: schemaId } });
    if (!schema) throw new NotFoundException('Schema not found');

    const field = this.fieldRepo.create({
      schema,
      name,
      type,
      isRequired,
      referencesSchemaId,
      referencesField,
    });
    const savedField = await this.fieldRepo.save(field);

    await this.databaseService.provisionSchema(project.details);
    return savedField;
  }

  /**
   * List all Schemas (tables) and their fields for a project
   */
  async listSchemas(userId: string, projectId: string): Promise<Schema[]> {
    const project = await this.projectService.findByIdWithDetails(projectId);
    if (project.owner.id !== userId) throw new ForbiddenException();

    return this.schemaRepo.find({
      where: { projectDetail: { id: project.details.id } },
      relations: ['fields'],
    });
  }

  /**
   * Get a single Schema by id
   */
  async getSchema(
    userId: string,
    projectId: string,
    schemaId: string,
  ): Promise<Schema> {
    const project = await this.projectService.findByIdWithDetails(projectId);
    if (project.owner.id !== userId) throw new ForbiddenException();

    const schema = await this.schemaRepo.findOne({
      where: { id: schemaId, projectDetail: { id: project.details.id } },
      relations: ['fields'],
    });
    if (!schema) throw new NotFoundException('Schema not found');
    return schema;
  }

  /**
   * Delete a Schema and drop the corresponding table, then reprovision
   */
  async deleteSchema(
    userId: string,
    projectId: string,
    schemaId: string,
  ): Promise<boolean> {
    const project = await this.projectService.findByIdWithDetails(projectId);
    if (project.owner.id !== userId) throw new ForbiddenException();

    const schema = await this.schemaRepo.findOne({
      where: { id: schemaId, projectDetail: { id: project.details.id } },
    });
    if (!schema) throw new NotFoundException('Schema not found');

    await this.databaseService.dropSchemaTable(project.details, schema.name);

    await this.schemaRepo.remove(schema);
    await this.databaseService.provisionSchema(project.details);
    return true;
  }
}

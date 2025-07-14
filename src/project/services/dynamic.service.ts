import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ResourceService } from './resource.service';

@Injectable()
export class DynamicService {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly dataSource: DataSource,
  ) {}

  /** Helper: get the TypeORM repository for a given entity/table name */
  private getRepo(entityName: string): Repository<any> {
    const meta = this.dataSource.entityMetadatas.find(
      (m) => m.tableName === entityName,
    );
    if (!meta) {
      throw new BadRequestException(
        `No table found for entity "${entityName}"`,
      );
    }
    return this.dataSource.getRepository(meta.name);
  }

  /** List all records */
  async findAll(projectId: string, entityName: string): Promise<any[]> {
    const resource = await this.resourceService.findResource(
      projectId,
      entityName,
    );
    const repo = this.getRepo(resource.name);
    return repo.find();
  }

  /** Fetch one record */
  async findOne(
    projectId: string,
    entityName: string,
    id: string,
  ): Promise<any> {
    const resource = await this.resourceService.findResource(
      projectId,
      entityName,
    );
    const repo = this.getRepo(resource.name);
    const record = await repo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`${entityName} with id ${id} not found`);
    }
    return record;
  }

  /** Create a new record */
  async create(projectId: string, entityName: string, data: any): Promise<any> {
    const resource = await this.resourceService.findResource(
      projectId,
      entityName,
    );

    const validFieldNames = new Set(resource.fields.map((f) => f.name));
    const validData = {};

    // Validate required fields
    for (const field of resource.fields) {
      if (field.isRequired && data[field.name] == null) {
        throw new BadRequestException(`Field "${field.name}" is required`);
      }
    }

    for (const key of Object.keys(data)) {
      if (validFieldNames.has(key)) {
        validData[key] = data[key];
      }
    }
    const repo = this.getRepo(resource.name);
    const entity = repo.create(validData);
    return repo.save(entity);
  }

  /** Update an existing record */
  async update(
    projectId: string,
    entityName: string,
    id: string,
    data: any,
  ): Promise<any> {
    const resource = await this.resourceService.findResource(
      projectId,
      entityName,
    );

    const validFieldNames = new Set(resource.fields.map((f) => f.name));
    const validData = {};
    for (const key of Object.keys(data)) {
      if (validFieldNames.has(key) && data[key] !== undefined) {
        validData[key] = data[key];
      }
    }

    if (Object.keys(validData).length === 0) {
      throw new BadRequestException(
        'Update data contains no valid fields for this entity or all values are undefined.',
      );
    }
    const repo = this.getRepo(resource.name);
    await repo.update(id, validData);
    const updated = await repo.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`${entityName} with id ${id} not found`);
    }
    return updated;
  }

  /** Delete a record */
  async delete(
    projectId: string,
    entityName: string,
    id: string,
  ): Promise<{ deleted: boolean }> {
    const resource = await this.resourceService.findResource(
      projectId,
      entityName,
    );
    const repo = this.getRepo(resource.name);
    const result = await repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`${entityName} with id ${id} not found`);
    }
    return { deleted: true };
  }
}

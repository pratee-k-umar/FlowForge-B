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
    // Validate required fields
    for (const field of resource.fields) {
      if (field.required && data[field.name] == null) {
        throw new BadRequestException(`Field "${field.name}" is required`);
      }
    }
    const repo = this.getRepo(resource.name);
    const entity = repo.create(data);
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
    // Optionally validate fields here
    const repo = this.getRepo(resource.name);
    await repo.update(id, data);
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

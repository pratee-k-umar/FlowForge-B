import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectDetails } from './project-detail.entity';

@Injectable()
export class DynamicService {
  constructor(private dataSource: DataSource) {}

  private getRepo(entityName: string, dbType: string): Repository<any> {
    const metadata = this.dataSource.entityMetadatas.find(
      (meta) => meta.tableName === entityName,
    );
    if (!metadata) {
      throw new BadRequestException(
        `Entity "${entityName}" not found in ${dbType}`,
      );
    }
    return this.dataSource.getRepository(metadata.name);
  }

  private validateEntity(projectDetails: ProjectDetails, entityName: string) {
    if (!projectDetails.design.entities.includes(entityName)) {
      throw new BadRequestException(
        `Entity "${entityName}" not allowed for this project`,
      );
    }
  }

  async findAll(projectDetails: ProjectDetails, entityName: string) {
    this.validateEntity(projectDetails, entityName);
    const repo = this.getRepo(entityName, projectDetails.dbType);
    return repo.find();
  }

  async findOne(
    projectDetails: ProjectDetails,
    entityName: string,
    id: string,
  ) {
    this.validateEntity(projectDetails, entityName);
    const repo = this.getRepo(entityName, projectDetails.dbType);
    return repo.findOne({ where: { id } });
  }

  async create(projectDetails: ProjectDetails, entityName: string, data: any) {
    this.validateEntity(projectDetails, entityName);
    const repo = this.getRepo(entityName, projectDetails.dbType);
    const entity = repo.create(data);
    return repo.save(entity);
  }

  async update(
    projectDetails: ProjectDetails,
    entityName: string,
    id: string,
    data: any,
  ) {
    this.validateEntity(projectDetails, entityName);
    const repo = this.getRepo(entityName, projectDetails.dbType);
    await repo.update(id, data);
    return repo.findOne({ where: { id } });
  }

  async delete(projectDetails: ProjectDetails, entityName: string, id: string) {
    this.validateEntity(projectDetails, entityName);
    const repo = this.getRepo(entityName, projectDetails.dbType);
    await repo.delete(id);
    return true;
  }
}

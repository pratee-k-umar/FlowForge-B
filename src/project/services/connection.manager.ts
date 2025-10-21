import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntitySchema } from 'typeorm';
import { ProjectService } from '../project.service';
import { ProjectDetails } from '../entities/project-detail.entity';
import { Fields } from '../entities/fields.entity';

const mapColumnType = (type: string): any => {
  switch (type) {
    case 'string':
      return 'varchar';
    case 'number':
      return 'int';
    case 'boolean':
      return 'boolean';
    default:
      return 'text';
  }
};
@Injectable()
export class ConnectionManager {
  private connection: Map<string, DataSource> = new Map();
  constructor(private readonly projectService: ProjectService) {}

  async getConnection(projectId: string): Promise<DataSource> {
    if (this.connection.has(projectId)) return this.connection.get(projectId);

    const projectDetails: ProjectDetails =
      await this.projectService.getProjectDetails(projectId);

    if (!projectDetails || !projectDetails.connectionUri)
      throw new NotFoundException('Project details not found');

    const resources = await this.projectService.getSchema(projectId);

    const dynamicEntities = resources.map((resource) => {
      const columns = {};
      resource.fields.forEach((field: Fields) => {
        columns[field.name] = {
          type: mapColumnType(field.type),
          primary: field.name === 'id',
          generatedKey: field.name === 'id' ? 'uuid' : false,
        };
      });
      return new EntitySchema({
        name: resource.name,
        tableName: resource.name,
        columns,
      });
    });

    const newConnection = new DataSource({
      type: projectDetails.dbType,
      url: projectDetails.connectionUri,
      entities: dynamicEntities,
      synchronize: false,
    });

    await newConnection.initialize();
    this.connection.set(projectId, newConnection);
    return newConnection;
  }
}

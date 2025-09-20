import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProjectService } from '../project.service';
import { ProjectDetails } from '../entities/project-detail.entity';

@Injectable()
export class ConnectionManager {
  private connection: Map<string, DataSource> = new Map();
  constructor(private readonly projectService: ProjectService) {}

  async getConnection(projectId: string): Promise<DataSource> {
    if (this.connection.has(projectId)) return this.connection.get(projectId);

    const projectDetails: ProjectDetails =
      await this.projectService.getProjectDetails(projectId);

    if (!projectDetails || !projectDetails.connectionUri)
      throw new NotFoundException('Database not configured for the project..!');

    const newConnection = new DataSource({
      type: projectDetails.dbType,
      url: projectDetails.connectionUri,
      entities: [],
      synchronize: true,
    });

    await newConnection.initialize();
    this.connection.set(projectId, newConnection);
    return newConnection;
  }
}

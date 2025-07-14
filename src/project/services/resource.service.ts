import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectService } from '../project.service';
import { Schema } from '../entities/schema.entity';

@Injectable()
export class ResourceService {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Find resource metadata (schema and fields) for a given project and entity.
   */
  async findResource(projectId: string, entityName: string): Promise<Schema> {
    const project = await this.projectService.findByIdWithDetails(projectId);
    const schema = project.details?.design?.find((s) => s.name === entityName);

    if (!schema) {
      throw new NotFoundException(
        `Resource "${entityName}" not found in project "${projectId}"`,
      );
    }
    return schema;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectService } from '../project.service';

@Injectable()
export class ResourceService {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Find resource metadata for a given project and entity.
   */
  async findResource(projectId: string, entityName: string): Promise<any> {
    const project = this.projectService.findById[projectId];
    if (!project || !project[entityName]) {
      throw new NotFoundException(
        `Resource "${entityName}" not found in project "${projectId}"`,
      );
    }
    return project[entityName];
  }
}

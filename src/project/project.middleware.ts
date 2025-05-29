import { Injectable, NestMiddleware } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProjectMiddleware implements NestMiddleware {
  constructor(private readonly projectService: ProjectService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const projectId = req.params.projectId;
    const project = await this.projectService.findByIdWithDetails(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    (req as any).project = project;
    (req as any).projectDetails = project.details;
    if (req.method === 'GET') {
      return res.status(200).json({
        message: `Hello World from project ${project.name}(${projectId})`,
      });
    }
    next();
  }
}

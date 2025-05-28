import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProjectMiddleware implements NestMiddleware {
  constructor(private readonly projectService: ProjectService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const project = await this.projectService.findByIdWithDetails(
      req.params.projectId,
    );
    if (!project) throw new NotFoundException('Project not found');
    (req as any).project = project;
    (req as any).projectDetails = project.details;
    next();
  }
}

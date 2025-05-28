import { Controller, Get } from '@nestjs/common';

@Controller('api/:projectId')
export class ProjectController {
  @Get('')
  home() {
    return `Hello World`;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DynamicService } from '../services/dynamic.service';
import { GqlJwtGaurd } from 'src/auth/gql-jwt.gaurd';
import { ProjectService } from '../project.service';

@Controller('api/:projectId/:collection')
@UseGuards(GqlJwtGaurd)
export class DynamicRestController {
  constructor(
    private readonly dynamicService: DynamicService,
    private readonly projectService: ProjectService,
  ) {}

  @Get()
  async findAll(@Req() req: Request, @Param('entity') entity: string) {
    const projectDetails = (req as any).projectDetails;
    if (!projectDetails) throw new NotFoundException('Project not found');
    return this.dynamicService.findAll(projectDetails, entity);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('entity') entity: string,
    @Param('id') id: string,
  ) {
    const projectDetails = (req as any).projectDetails;
    if (!projectDetails) throw new NotFoundException('Project not found');
    return this.dynamicService.findOne(projectDetails, entity, id);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Param('entity') entity: string,
    @Body() body: any,
  ) {
    const projectDetails = (req as any).projectDetails;
    if (!projectDetails) throw new NotFoundException('Project not found');
    return this.dynamicService.create(projectDetails, entity, body);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const projectDetails = (req as any).projectDetails;
    if (!projectDetails) throw new NotFoundException('Project not found');
    return this.dynamicService.update(projectDetails, entity, id, body);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Param('entity') entity: string,
    @Param('id') id: string,
  ) {
    const projectDetails = (req as any).projectDetails;
    if (!projectDetails) throw new NotFoundException('Project not found');
    return this.dynamicService.delete(projectDetails, entity, id);
  }
}

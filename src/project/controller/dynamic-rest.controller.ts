import { All, Body, Controller, Req } from '@nestjs/common';
import { DynamicService } from '../services/dynamic.service';
import { ProjectAuthService } from '../services/project-auth.service';
import { ProjectApiInput } from '../dto/project-api.input';

type ActionHandler = (
  projectId: string,
  entityName: string,
  payload: any,
) => Promise<any>;

@Controller('api/:projectId')
export class DynamicRestController {
  private readonly actionHandlers: Map<string, ActionHandler>;
  constructor(
    private readonly dynamicService: DynamicService,
    private readonly projectAuthService: ProjectAuthService,
  ) {
    this.actionHandlers = new Map<string, ActionHandler>([
      ['find_all', this.dynamicService.findAll.bind(this.dynamicService)],
      ['find_one', this.dynamicService.findOne.bind(this.dynamicService)],
      ['create', this.dynamicService.create.bind(this.dynamicService)],
      ['update', this.dynamicService.update.bind(this.dynamicService)],
      ['delete', this.dynamicService.delete.bind(this.dynamicService)],
    ]);
  }

  @All('*')
  async handleRequests(@Req() req: Request, @Body() body: any) {
    const projectDetails = (req as any).projectDetails;
    // if (!projectDetails || !projectDetails.endpoints) {
    //   throw new Error('Project or Enpoints not configured..!');
    // }

    const method = req.method.toUpperCase();
    const path =
      (req as any).url.replace(`/api/${projectDetails.id}`, '') || '/';

    const endPoint = projectDetails.endpoints.find(
      (ep: ProjectApiInput) =>
        ep.path === path && ep.method === method && ep.isRequired,
    );

    if (!endPoint) throw new Error(`No endpoint found for ${method} ${path}`);

    const action = this.actionHandlers.get(endPoint.action);
    if (!action)
      throw new Error(`No action handler found for ${endPoint.action}`);

    return action(projectDetails.id, endPoint.targetEntity, body);
  }
}

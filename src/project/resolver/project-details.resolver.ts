import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ProjectDetails, Design } from '../entities/project-detail.entity';
import { Project } from '../project.entity';
import { ProjectService } from '../project.service';

@Resolver(() => ProjectDetails)
export class ProjectDetailsResolver {
  constructor(private projectService: ProjectService) {}

  @ResolveField('design', () => [Design])
  async getDesign(@Parent() details: ProjectDetails): Promise<Design[]> {
    if (!details.fields) {
      return [];
    }

    const tableNames = [...new Set(details.fields.map((f) => f.tableName))];
    return tableNames.map((name) => ({
      name,
      schemaId: name, // Using tableName as the unique schemaId
    }));
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    private userService: UserService,
  ) {}

  async createProject(id: string, name: string): Promise<Project> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found!');
    const project = await this.projectRepo.create({ name, owner: user });
    return this.projectRepo.save(project);
  }

  async findByUser(id: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { owner: { id: id } },
      order: { createdAt: 'DESC' },
    });
  }
}

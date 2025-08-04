import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectAuth } from '../entities/project-auth.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from '../dto/auth.response';
import { LoginInput, SignUpInput } from '../dto/auth.input';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from './database.service';
import { Repository } from 'typeorm';
import { ProjectDetails } from '../entities/project-detail.entity';

@Injectable()
export class ProjectAuthService {
  constructor(
    // @InjectRepository(ProjectAuth)
    // private projectAuthRepo: Repository<ProjectAuth>,
    // @InjectRepository(Project) private projectRepo: Repository<Project>,
    private readonly databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  private buildAuthResponse(
    endUser: ProjectAuth,
    accessToken: string,
  ): AuthResponse {
    endUser.socialAuth = {
      googleId: endUser.googleId,
      githubId: endUser.githubId,
      xId: endUser.xId,
      microsoftId: endUser.microsoftId,
    };

    return {
      accessToken,
      user: endUser,
    };
  }

  async userSignUp(
    projectDetails: ProjectDetails,
    input: SignUpInput,
  ): Promise<AuthResponse> {
    const projectAuthRepo: Repository<ProjectAuth> =
      await this.databaseService.getProjectAuthRepository(projectDetails);

    const existingUser = await projectAuthRepo.findOne({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new NotFoundException('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = projectAuthRepo.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      isEmailVerified: false,
      roles: ['user'],
    });

    const savedUser: ProjectAuth = await projectAuthRepo.save(newUser);

    const accessToken = this.jwtService.sign({
      userId: savedUser.id,
      projectId: projectDetails.id,
      roles: savedUser.roles,
    });

    return this.buildAuthResponse(savedUser, accessToken);
  }

  async userLogin(
    projectDetails: ProjectDetails,
    input: LoginInput,
  ): Promise<AuthResponse> {
    const projectAuthRepo: Repository<ProjectAuth> =
      await this.databaseService.getProjectAuthRepository(projectDetails);

    const user = await projectAuthRepo.findOne({
      where: { email: input.email },
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials..!');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid cedentials..!');
    }

    const accessToken = this.jwtService.sign({
      userId: user.id,
      projectId: projectDetails.id,
      roles: user.roles,
    });

    return this.buildAuthResponse(user, accessToken);
  }
}

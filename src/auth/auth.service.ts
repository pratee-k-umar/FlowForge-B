import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(name: string, email: string, password: string) {
    const exists = await this.users.findByEmail(email);
    if (exists) throw new BadRequestException('Email already in use');
    const user = await this.users.create(name, email, password);
    const token = this.jwt.sign({ sub: user.id });
    await this.emailService.sendVerificationEmail(email, token);
    return 'Verification email sent';
  }

  async verifyEmail(token: string) {
    const { sub } = this.jwt.verify<{ sub: string }>(token);
    await this.users.markVerified(sub);
    return 'Email verified successfully';
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isVerified)
      throw new BadRequestException(
        'Invalid credentials or email not verified',
      );
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new BadRequestException('Invalid credentials');
    return this.jwt.sign({ sub: user.id });
  }

  async requestPasswordReset(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new BadRequestException('Email not found');
    const token = this.jwt.sign({ sub: user.id }, { expiresIn: '15m' });
    await this.emailService.sendPasswordReset(email, token);
    return 'Password reset email sent';
  }

  async resetPassword(token: string, newPassword: string) {
    const { sub } = this.jwt.verify<{ sub: string }>(token);
    await this.users.updatePassword(sub, await bcrypt.hash(newPassword, 10));
    return 'Password reset successfull';
  }
}

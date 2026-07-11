import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { toPublicUser } from '../users/users.mapper';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }
    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
      email: user.email,
    });
    return {
      accessToken,
      user: toPublicUser(user),
    };
  }
}

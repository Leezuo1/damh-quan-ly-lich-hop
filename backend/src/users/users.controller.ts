import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { toPublicUser } from './users.mapper';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() currentUser: CurrentUserPayload) {
    const user = await this.usersService.findById(currentUser.userId);
    return toPublicUser(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(currentUser.userId, dto);
    return toPublicUser(user);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(currentUser.userId, dto);
    return { success: true };
  }

  // Tìm người dùng để mời tham gia cuộc họp
  @Get()
  async search(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query('q') q?: string,
  ) {
    const users = await this.usersService.search(q ?? '', currentUser.userId);
    return users.map(toPublicUser);
  }
}

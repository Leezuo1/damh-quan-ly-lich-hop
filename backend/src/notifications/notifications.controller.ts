import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { toPublicNotification } from './notifications.mapper';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findMine(@CurrentUser() currentUser: CurrentUserPayload) {
    const notifications = await this.notificationsService.findMine(
      currentUser.userId,
    );
    return notifications.map(toPublicNotification);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() currentUser: CurrentUserPayload) {
    const count = await this.notificationsService.countUnread(
      currentUser.userId,
    );
    return { count };
  }

  @Patch(':id/read')
  async markRead(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationsService.markRead(
      id,
      currentUser.userId,
    );
    return toPublicNotification(notification);
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() currentUser: CurrentUserPayload) {
    await this.notificationsService.markAllRead(currentUser.userId);
    return { success: true };
  }
}

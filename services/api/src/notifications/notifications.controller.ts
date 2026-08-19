import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listOwn(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const data = await this.notificationsService.findByUserId(user.userId, p, l);
    return { success: true, data };
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const data = await this.notificationsService.getUnreadCount(user.userId);
    return { success: true, data };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const data = await this.notificationsService.markAsRead(id);
    return { success: true, data };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    const data = await this.notificationsService.markAllAsRead(user.userId);
    return { success: true, data };
  }
}

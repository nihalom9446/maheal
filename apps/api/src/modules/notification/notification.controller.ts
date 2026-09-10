import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  notificationFilterSchema,
  broadcastAnnouncementSchema,
  NotificationFilterDto,
  BroadcastAnnouncementDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get current user's notifications in the active mahal.
   */
  @Get('my')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMyNotifications(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(notificationFilterSchema)) query: NotificationFilterDto,
  ) {
    const data = await this.notificationService.listUserNotifications(
      mahalId,
      user.sub,
      query,
    );
    return { success: true, ...data };
  }

  /**
   * Mark single notification as read.
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async markRead(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.notificationService.markAsRead(mahalId, user.sub, id);
    return { success: true, data };
  }

  /**
   * Mark all notifications as read for current user.
   */
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async markAllRead(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.notificationService.markAllAsRead(mahalId, user.sub);
    return data;
  }

  /**
   * Admin trigger broadcast for an announcement.
   */
  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @RequirePermissions('PUBLISH_ANNOUNCEMENT')
  @AuditLog('BROADCAST_ANNOUNCEMENT', 'announcement')
  async broadcast(
    @CurrentMahal() mahalId: string,
    @Body(new ZodValidationPipe(broadcastAnnouncementSchema)) dto: BroadcastAnnouncementDto,
  ) {
    const data = await this.notificationService.broadcastAnnouncement(
      mahalId,
      dto.announcement_id,
    );
    return data;
  }
}
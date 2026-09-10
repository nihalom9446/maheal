import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrayerService } from './prayer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  updatePrayerScheduleSchema,
  prayerMonthQuerySchema,
  todayPrayerQuerySchema,
  UpdatePrayerScheduleDto,
  PrayerMonthQueryDto,
  TodayPrayerQueryDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('prayers')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('schedule')
  @RequirePermissions('VIEW_PRAYER_SCHEDULE')
  async getSchedule(@CurrentMahal() mahalId: string) {
    const data = await this.prayerService.getSchedule(mahalId);
    return { success: true, data };
  }

  @Put('schedule')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('MANAGE_PRAYER_SCHEDULE')
  @AuditLog('UPDATE_PRAYER_SCHEDULE', 'prayer_schedule')
  async updateSchedule(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updatePrayerScheduleSchema)) dto: UpdatePrayerScheduleDto,
  ) {
    const data = await this.prayerService.updateSchedule(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get('today')
  @RequirePermissions('VIEW_PRAYER_SCHEDULE')
  async getToday(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(todayPrayerQuerySchema)) query: TodayPrayerQueryDto,
  ) {
    const data = await this.prayerService.getTodayTimes(mahalId, query.date);
    return { success: true, data };
  }

  @Get('month')
  @RequirePermissions('VIEW_PRAYER_SCHEDULE')
  async getMonth(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(prayerMonthQuerySchema)) query: PrayerMonthQueryDto,
  ) {
    const year = Number(query.year) || new Date().getFullYear();
    const month = Number(query.month) || (new Date().getMonth() + 1);
    const data = await this.prayerService.getMonthTimes(mahalId, year, month);
    return { success: true, data };
  }
}
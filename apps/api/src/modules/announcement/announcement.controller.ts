import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementFilterSchema,
  createDeathRecordSchema,
  updateDeathRecordSchema,
  deathRecordFilterSchema,
  createEventSchema,
  updateEventSchema,
  eventFilterSchema,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilterDto,
  CreateDeathRecordDto,
  UpdateDeathRecordDto,
  DeathRecordFilterDto,
  CreateEventDto,
  UpdateEventDto,
  EventFilterDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('announcements')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  // ===========================================================================
  // DEATH RECORDS (JANAZAH)
  // Put static sub-paths before parameterized paths (:id)
  // ===========================================================================

  @Post('deaths')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_DEATH_RECORD')
  @AuditLog('CREATE_DEATH_RECORD', 'death_record')
  async createDeathRecord(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createDeathRecordSchema)) dto: CreateDeathRecordDto,
  ) {
    const data = await this.announcementService.createDeathRecord(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get('deaths')
  @RequirePermissions('VIEW_DEATH_RECORDS')
  async listDeathRecords(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(deathRecordFilterSchema)) query: DeathRecordFilterDto,
  ) {
    const isPrivileged = user?.roles?.some(r =>
      ['MAHAL_ADMIN', 'COMMITTEE', 'TREASURER', 'MADRASA_ADMIN'].includes(r),
    ) ?? false;
    const data = await this.announcementService.listDeathRecords(mahalId, query, isPrivileged);
    return { success: true, ...data };
  }

  @Get('deaths/:id')
  @RequirePermissions('VIEW_DEATH_RECORDS')
  async getDeathRecord(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.announcementService.getDeathRecord(mahalId, id);
    return { success: true, data };
  }

  @Patch('deaths/:id')
  @RequirePermissions('CREATE_DEATH_RECORD')
  @AuditLog('UPDATE_DEATH_RECORD', 'death_record')
  async updateDeathRecord(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateDeathRecordSchema)) dto: UpdateDeathRecordDto,
  ) {
    const data = await this.announcementService.updateDeathRecord(mahalId, id, dto);
    return { success: true, data };
  }

  @Patch('deaths/:id/visibility')
  @RequirePermissions('MANAGE_DEATH_RECORD_VISIBILITY')
  @AuditLog('TOGGLE_DEATH_VISIBILITY', 'death_record')
  async toggleDeathVisibility(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('is_details_public') isPublic: boolean,
  ) {
    const data = await this.announcementService.toggleDeathDetailsPublic(mahalId, id, isPublic);
    return { success: true, data };
  }

  @Delete('deaths/:id')
  @RequirePermissions('CREATE_DEATH_RECORD')
  @AuditLog('DELETE_DEATH_RECORD', 'death_record')
  async deleteDeathRecord(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementService.deleteDeathRecord(mahalId, id);
  }

  // ===========================================================================
  // EVENTS
  // ===========================================================================

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_DRAFT_ANNOUNCEMENT')
  @AuditLog('CREATE_EVENT', 'event')
  async createEvent(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createEventSchema)) dto: CreateEventDto,
  ) {
    const data = await this.announcementService.createEvent(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get('events')
  @RequirePermissions('VIEW_ANNOUNCEMENTS')
  async listEvents(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(eventFilterSchema)) query: EventFilterDto,
  ) {
    const data = await this.announcementService.listEvents(mahalId, query);
    return { success: true, ...data };
  }

  @Get('events/:id')
  @RequirePermissions('VIEW_ANNOUNCEMENTS')
  async getEvent(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.announcementService.getEvent(mahalId, id);
    return { success: true, data };
  }

  @Patch('events/:id')
  @RequirePermissions('CREATE_DRAFT_ANNOUNCEMENT')
  @AuditLog('UPDATE_EVENT', 'event')
  async updateEvent(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) dto: UpdateEventDto,
  ) {
    const data = await this.announcementService.updateEvent(mahalId, id, dto);
    return { success: true, data };
  }

  @Delete('events/:id')
  @RequirePermissions('DELETE_ANNOUNCEMENT')
  @AuditLog('DELETE_EVENT', 'event')
  async deleteEvent(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementService.deleteEvent(mahalId, id);
  }

  // ===========================================================================
  // MAIN ANNOUNCEMENTS
  // ===========================================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_DRAFT_ANNOUNCEMENT')
  @AuditLog('CREATE_ANNOUNCEMENT', 'announcement')
  async create(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createAnnouncementSchema)) dto: CreateAnnouncementDto,
  ) {
    const data = await this.announcementService.createAnnouncement(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get()
  @RequirePermissions('VIEW_ANNOUNCEMENTS')
  async findAll(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(announcementFilterSchema)) query: AnnouncementFilterDto,
  ) {
    const data = await this.announcementService.listAnnouncements(mahalId, query);
    return { success: true, ...data };
  }

  @Get(':id')
  @RequirePermissions('VIEW_ANNOUNCEMENTS')
  async findOne(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.announcementService.getAnnouncement(mahalId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('CREATE_DRAFT_ANNOUNCEMENT')
  @AuditLog('UPDATE_ANNOUNCEMENT', 'announcement')
  async update(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAnnouncementSchema)) dto: UpdateAnnouncementDto,
  ) {
    const data = await this.announcementService.updateAnnouncement(mahalId, id, dto, user.sub);
    return { success: true, data };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('PUBLISH_ANNOUNCEMENT')
  @AuditLog('PUBLISH_ANNOUNCEMENT', 'announcement')
  async publish(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.announcementService.publishAnnouncement(mahalId, id, user.sub);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('DELETE_ANNOUNCEMENT')
  @AuditLog('DELETE_ANNOUNCEMENT', 'announcement')
  async remove(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementService.deleteAnnouncement(mahalId, id);
  }
}
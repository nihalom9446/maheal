import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WardService } from './ward.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createWardSchema,
  updateWardSchema,
  CreateWardDto,
  UpdateWardDto,
} from '@maheall/shared';

@Controller('wards')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class WardController {
  constructor(private readonly wardService: WardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('EDIT_FAMILY')
  @AuditLog('CREATE_WARD', 'ward')
  async create(
    @CurrentMahal() mahalId: string,
    @Body(new ZodValidationPipe(createWardSchema)) dto: CreateWardDto,
  ) {
    const data = await this.wardService.create(mahalId, dto);
    return { success: true, data };
  }

  @Get()
  @RequirePermissions('VIEW_FAMILY_LIST')
  async findAll(@CurrentMahal() mahalId: string) {
    const data = await this.wardService.findAll(mahalId);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('VIEW_FAMILY_LIST')
  async findOne(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.wardService.findOne(mahalId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('EDIT_FAMILY')
  @AuditLog('UPDATE_WARD', 'ward')
  async update(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateWardSchema)) dto: UpdateWardDto,
  ) {
    const data = await this.wardService.update(mahalId, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('DELETE_FAMILY')
  @AuditLog('DELETE_WARD', 'ward')
  async remove(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.wardService.remove(mahalId, id);
  }
}

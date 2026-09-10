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
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createFamilySchema,
  updateFamilySchema,
  checkDuplicateFamilySchema,
  familyFilterSchema,
  CreateFamilyDto,
  UpdateFamilyDto,
  CheckDuplicateFamilyDto,
  FamilyFilterDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('families')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_FAMILY')
  @AuditLog('CREATE_FAMILY', 'family')
  async create(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload | undefined,
    @Body(new ZodValidationPipe(createFamilySchema)) dto: CreateFamilyDto,
  ) {
    const data = await this.familyService.create(mahalId, user?.sub, dto);
    return { success: true, data };
  }

  @Get()
  @RequirePermissions('VIEW_FAMILY_LIST')
  async findAll(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(familyFilterSchema)) query: FamilyFilterDto,
  ) {
    const data = await this.familyService.findAll(mahalId, query);
    return { success: true, data };
  }

  @Post('check-duplicate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('CREATE_FAMILY')
  async checkDuplicate(
    @CurrentMahal() mahalId: string,
    @Body(new ZodValidationPipe(checkDuplicateFamilySchema)) dto: CheckDuplicateFamilyDto,
  ) {
    const data = await this.familyService.checkDuplicate(mahalId, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('VIEW_FAMILY_DETAIL')
  async findOne(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.familyService.findOne(mahalId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('EDIT_FAMILY')
  @AuditLog('UPDATE_FAMILY', 'family')
  async update(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateFamilySchema)) dto: UpdateFamilyDto,
  ) {
    const data = await this.familyService.update(mahalId, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('DELETE_FAMILY')
  @AuditLog('DELETE_FAMILY', 'family')
  async remove(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.familyService.remove(mahalId, id);
  }
}
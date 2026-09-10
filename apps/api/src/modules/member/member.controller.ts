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
import { MemberService } from './member.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createMemberSchema,
  updateMemberSchema,
  memberFilterSchema,
  deleteMemberSchema,
  CreateMemberDto,
  UpdateMemberDto,
  MemberFilterDto,
  DeleteMemberDto,
} from '@maheall/shared';

@Controller('members')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_MEMBER')
  @AuditLog('CREATE_MEMBER', 'member')
  async create(
    @CurrentMahal() mahalId: string,
    @Body(new ZodValidationPipe(createMemberSchema)) dto: CreateMemberDto,
  ) {
    const data = await this.memberService.create(mahalId, dto);
    return { success: true, data };
  }

  @Get()
  @RequirePermissions('VIEW_MEMBER_LIST')
  async findAll(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(memberFilterSchema)) query: MemberFilterDto,
  ) {
    const data = await this.memberService.findAll(mahalId, query);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('VIEW_MEMBER_DETAIL')
  async findOne(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.memberService.findOne(mahalId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('EDIT_MEMBER')
  @AuditLog('UPDATE_MEMBER', 'member')
  async update(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateMemberSchema)) dto: UpdateMemberDto,
  ) {
    const data = await this.memberService.update(mahalId, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('EDIT_MEMBER')
  @AuditLog('DELETE_MEMBER', 'member')
  async remove(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(deleteMemberSchema)) dto: DeleteMemberDto,
  ) {
    return this.memberService.remove(mahalId, id, dto);
  }

  @Post(':id/set-head')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('EDIT_FAMILY')
  @AuditLog('SET_FAMILY_HEAD', 'member')
  async setHead(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.memberService.setHead(mahalId, id);
    return { success: true, data };
  }
}
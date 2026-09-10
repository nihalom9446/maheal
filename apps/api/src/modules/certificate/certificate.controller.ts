import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  issueNikahCertificateSchema,
  issueNocCertificateSchema,
  issueMembershipCertificateSchema,
  certificateFilterSchema,
  revokeCertificateSchema,
  IssueNikahCertificateDto,
  IssueNocCertificateDto,
  IssueMembershipCertificateDto,
  CertificateFilterDto,
  RevokeCertificateDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  // ===========================================================================
  // PUBLIC VERIFICATION (No Auth Guard)
  // Must come before ':id' route to avoid route conflict
  // ===========================================================================
  @Get('verify/:token')
  async verifyPublicCertificate(@Param('token') token: string) {
    const data = await this.certificateService.verifyPublicCertificate(token);
    return { success: true, data };
  }

  // ===========================================================================
  // PROTECTED ENDPOINTS
  // ===========================================================================

  @Post('nikah')
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_CERTIFICATE')
  @AuditLog('ISSUE_NIKAH_CERTIFICATE', 'certificate')
  async issueNikahCertificate(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(issueNikahCertificateSchema)) dto: IssueNikahCertificateDto,
  ) {
    const data = await this.certificateService.issueNikahCertificate(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Post('noc')
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_CERTIFICATE')
  @AuditLog('ISSUE_NOC_CERTIFICATE', 'certificate')
  async issueNocCertificate(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(issueNocCertificateSchema)) dto: IssueNocCertificateDto,
  ) {
    const data = await this.certificateService.issueNocCertificate(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Post('membership')
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_CERTIFICATE')
  @AuditLog('ISSUE_MEMBERSHIP_CERTIFICATE', 'certificate')
  async issueMembershipCertificate(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(issueMembershipCertificateSchema)) dto: IssueMembershipCertificateDto,
  ) {
    const data = await this.certificateService.issueMembershipCertificate(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @RequirePermissions('VIEW_CERTIFICATES')
  async listCertificates(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(certificateFilterSchema)) query: CertificateFilterDto,
  ) {
    const data = await this.certificateService.listCertificates(mahalId, query);
    return { success: true, ...data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @RequirePermissions('VIEW_CERTIFICATES')
  async getCertificate(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.certificateService.getCertificate(mahalId, id);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @RequirePermissions('CREATE_CERTIFICATE')
  @AuditLog('REVOKE_CERTIFICATE', 'certificate')
  async revokeCertificate(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(revokeCertificateSchema)) dto: RevokeCertificateDto,
  ) {
    return this.certificateService.revokeCertificate(mahalId, id, dto);
  }
}

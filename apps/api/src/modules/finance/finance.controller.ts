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
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  recordPirivuSchema,
  createIncomeSchema,
  updateIncomeSchema,
  createExpenseSchema,
  updateExpenseSchema,
  pirivuFilterSchema,
  incomeFilterSchema,
  expenseFilterSchema,
  arrearsFilterSchema,
  financeSummaryQuerySchema,
  RecordPirivuDto,
  CreateIncomeDto,
  UpdateIncomeDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  PirivuFilterDto,
  IncomeFilterDto,
  ExpenseFilterDto,
  ArrearsFilterDto,
  FinanceSummaryQueryDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('finance')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /**
   * Financial Summary & Dashboard Statistics
   */
  @Get('summary')
  @RequirePermissions('VIEW_REPORTS')
  async getSummary(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(financeSummaryQuerySchema)) query: FinanceSummaryQueryDto,
  ) {
    const data = await this.financeService.getSummary(mahalId, query);
    return { success: true, data };
  }

  /**
   * Record Pirivu payment
   */
  @Post('pirivu')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('RECORD_PIRIVU')
  @AuditLog('RECORD_PIRIVU', 'pirivu')
  async recordPirivu(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload | undefined,
    @Body(new ZodValidationPipe(recordPirivuSchema)) dto: RecordPirivuDto,
  ) {
    const data = await this.financeService.recordPirivu(mahalId, dto, user?.sub);
    return { success: true, data };
  }

  /**
   * List Pirivu collections
   */
  @Get('pirivu')
  @RequirePermissions('RECORD_PIRIVU')
  async listPirivu(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(pirivuFilterSchema)) query: PirivuFilterDto,
  ) {
    const data = await this.financeService.listPirivu(mahalId, query);
    return { success: true, data };
  }

  /**
   * Get Pirivu Arrears list for active families
   */
  @Get('pirivu/arrears')
  @RequirePermissions('VIEW_PIRIVU_ARREARS')
  async getPirivuArrears(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(arrearsFilterSchema)) query: ArrearsFilterDto,
  ) {
    const data = await this.financeService.getPirivuArrears(mahalId, query);
    return { success: true, data };
  }

  /**
   * Get 12-month Pirivu status for a family
   */
  @Get('pirivu/family/:familyId/status')
  @RequirePermissions('VIEW_FAMILY_FINANCE')
  async getFamilyPirivuStatus(
    @CurrentMahal() mahalId: string,
    @Param('familyId', ParseUUIDPipe) familyId: string,
    @Query('year') year?: string,
  ) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const data = await this.financeService.getFamilyPirivuStatus(mahalId, familyId, parsedYear);
    return { success: true, data };
  }

  /**
   * Create Income record
   */
  @Post('income')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_INCOME')
  @AuditLog('CREATE_INCOME', 'income')
  async createIncome(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload | undefined,
    @Body(new ZodValidationPipe(createIncomeSchema)) dto: CreateIncomeDto,
  ) {
    const data = await this.financeService.createIncome(mahalId, dto, user?.sub);
    return { success: true, data };
  }

  /**
   * List Income records
   */
  @Get('income')
  @RequirePermissions('VIEW_INCOME')
  async listIncome(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(incomeFilterSchema)) query: IncomeFilterDto,
  ) {
    const data = await this.financeService.listIncome(mahalId, query);
    return { success: true, data };
  }

  /**
   * Update Income record
   */
  @Patch('income/:id')
  @RequirePermissions('EDIT_INCOME')
  @AuditLog('UPDATE_INCOME', 'income')
  async updateIncome(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateIncomeSchema)) dto: UpdateIncomeDto,
  ) {
    const data = await this.financeService.updateIncome(mahalId, id, dto);
    return { success: true, data };
  }

  /**
   * Delete Income record
   */
  @Delete('income/:id')
  @RequirePermissions('EDIT_INCOME')
  @AuditLog('DELETE_INCOME', 'income')
  async deleteIncome(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.financeService.deleteIncome(mahalId, id);
  }

  /**
   * Create Expense record
   */
  @Post('expense')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_EXPENSE')
  @AuditLog('CREATE_EXPENSE', 'expense')
  async createExpense(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload | undefined,
    @Body(new ZodValidationPipe(createExpenseSchema)) dto: CreateExpenseDto,
  ) {
    const data = await this.financeService.createExpense(mahalId, dto, user?.sub);
    return { success: true, data };
  }

  /**
   * List Expense records
   */
  @Get('expense')
  @RequirePermissions('VIEW_EXPENSE')
  async listExpense(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(expenseFilterSchema)) query: ExpenseFilterDto,
  ) {
    const data = await this.financeService.listExpense(mahalId, query);
    return { success: true, data };
  }

  /**
   * Update Expense record
   */
  @Patch('expense/:id')
  @RequirePermissions('EDIT_EXPENSE')
  @AuditLog('UPDATE_EXPENSE', 'expense')
  async updateExpense(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateExpenseSchema)) dto: UpdateExpenseDto,
  ) {
    const data = await this.financeService.updateExpense(mahalId, id, dto);
    return { success: true, data };
  }

  /**
   * Delete Expense record
   */
  @Delete('expense/:id')
  @RequirePermissions('EDIT_EXPENSE')
  @AuditLog('DELETE_EXPENSE', 'expense')
  async deleteExpense(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.financeService.deleteExpense(mahalId, id);
  }
}
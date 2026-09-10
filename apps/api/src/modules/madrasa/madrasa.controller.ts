import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { MadrasaService } from './madrasa.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { AuditLog } from '../../common/interceptors/audit.interceptor';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  enrollStudentSchema,
  updateStudentSchema,
  studentFilterSchema,
  createTeacherSchema,
  updateTeacherSchema,
  teacherFilterSchema,
  markAttendanceSchema,
  collectMadrasaFeeSchema,
  madrasaFeeFilterSchema,
  EnrollStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherFilterDto,
  MarkAttendanceDto,
  CollectMadrasaFeeDto,
  MadrasaFeeFilterDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('madrasa')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class MadrasaController {
  constructor(private readonly madrasaService: MadrasaService) {}

  // ===========================================================================
  // OVERVIEW
  // ===========================================================================

  @Get('overview')
  @RequirePermissions('VIEW_ALL_STUDENTS')
  async getMadrasaOverview(@CurrentMahal() mahalId: string) {
    const data = await this.madrasaService.getMadrasaOverview(mahalId);
    return { success: true, data };
  }

  // ===========================================================================
  // STUDENTS
  // ===========================================================================

  @Get('students')
  @RequirePermissions('VIEW_ALL_STUDENTS')
  async listStudents(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(studentFilterSchema)) query: StudentFilterDto,
  ) {
    const data = await this.madrasaService.listStudents(mahalId, query);
    return { success: true, ...data };
  }

  @Post('students')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('MANAGE_STUDENTS')
  @AuditLog('ENROLL_MADRASA_STUDENT', 'madrasa_student')
  async enrollStudent(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(enrollStudentSchema)) dto: EnrollStudentDto,
  ) {
    const data = await this.madrasaService.enrollStudent(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get('students/:id')
  @RequirePermissions('VIEW_ALL_STUDENTS')
  async getStudent(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.madrasaService.getStudent(mahalId, id);
    return { success: true, data };
  }

  @Put('students/:id')
  @RequirePermissions('MANAGE_STUDENTS')
  @AuditLog('UPDATE_MADRASA_STUDENT', 'madrasa_student')
  async updateStudent(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateStudentSchema)) dto: UpdateStudentDto,
  ) {
    const data = await this.madrasaService.updateStudent(mahalId, id, dto);
    return { success: true, data };
  }

  @Delete('students/:id')
  @RequirePermissions('MANAGE_STUDENTS')
  @AuditLog('DELETE_MADRASA_STUDENT', 'madrasa_student')
  async deleteStudent(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.madrasaService.deleteStudent(mahalId, id);
  }

  // ===========================================================================
  // TEACHERS / MUALLIMS
  // ===========================================================================

  @Get('teachers')
  @RequirePermissions('VIEW_ALL_STUDENTS')
  async listTeachers(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(teacherFilterSchema)) query: TeacherFilterDto,
  ) {
    const data = await this.madrasaService.listTeachers(mahalId, query);
    return { success: true, ...data };
  }

  @Post('teachers')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('MANAGE_TEACHERS')
  @AuditLog('CREATE_MADRASA_TEACHER', 'madrasa_teacher')
  async createTeacher(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createTeacherSchema)) dto: CreateTeacherDto,
  ) {
    const data = await this.madrasaService.createTeacher(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Put('teachers/:id')
  @RequirePermissions('MANAGE_TEACHERS')
  @AuditLog('UPDATE_MADRASA_TEACHER', 'madrasa_teacher')
  async updateTeacher(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTeacherSchema)) dto: UpdateTeacherDto,
  ) {
    const data = await this.madrasaService.updateTeacher(mahalId, id, dto);
    return { success: true, data };
  }

  @Delete('teachers/:id')
  @RequirePermissions('MANAGE_TEACHERS')
  @AuditLog('DELETE_MADRASA_TEACHER', 'madrasa_teacher')
  async deleteTeacher(
    @CurrentMahal() mahalId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.madrasaService.deleteTeacher(mahalId, id);
  }

  // ===========================================================================
  // ATTENDANCE
  // ===========================================================================

  @Post('attendance')
  @RequirePermissions('MARK_ATTENDANCE')
  @AuditLog('MARK_MADRASA_ATTENDANCE', 'madrasa_attendance')
  async markAttendance(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(markAttendanceSchema)) dto: MarkAttendanceDto,
  ) {
    const data = await this.madrasaService.markAttendance(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get('attendance/class')
  @RequirePermissions('MARK_ATTENDANCE')
  async getAttendanceForClass(
    @CurrentMahal() mahalId: string,
    @Query('class_level', ParseIntPipe) classLevel: number,
    @Query('date') date: string,
  ) {
    const data = await this.madrasaService.getAttendanceForClass(mahalId, classLevel, date);
    return { success: true, data };
  }

  @Get('attendance/summary')
  @RequirePermissions('VIEW_ALL_STUDENTS')
  async getAttendanceMonthlySummary(
    @CurrentMahal() mahalId: string,
    @Query('class_level', ParseIntPipe) classLevel: number,
    @Query('month') month: string, // YYYY-MM
  ) {
    const data = await this.madrasaService.getAttendanceMonthlySummary(mahalId, classLevel, month);
    return { success: true, data };
  }

  // ===========================================================================
  // FEES
  // ===========================================================================

  @Post('fees/collect')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('MANAGE_MADRASA_FEES')
  @AuditLog('COLLECT_MADRASA_FEE', 'madrasa_fee')
  async collectFee(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(collectMadrasaFeeSchema)) dto: CollectMadrasaFeeDto,
  ) {
    const data = await this.madrasaService.collectFee(mahalId, dto, user.sub);
    return { success: true, data };
  }

  @Get('fees')
  @RequirePermissions('MANAGE_MADRASA_FEES')
  async listFeeCollections(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(madrasaFeeFilterSchema)) query: MadrasaFeeFilterDto,
  ) {
    const data = await this.madrasaService.listFeeCollections(mahalId, query);
    return { success: true, ...data };
  }
}

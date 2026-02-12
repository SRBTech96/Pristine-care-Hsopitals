import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HrService } from './hr.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponseDto,
} from './dto/employee.dto';
import {
  CreateSalaryStructureDto,
  SalaryStructureResponseDto,
} from './dto/salary-structure.dto';
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  PayrollRecordResponseDto,
} from './dto/payroll.dto';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  LeaveRequestResponseDto,
} from './dto/leave.dto';
import {
  CreateOfferLetterDto,
  OfferLetterResponseDto,
} from './dto/offer-letter.dto';

@ApiTags('HR')
@ApiBearerAuth()
@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrController {
  constructor(private hrService: HrService) {}

  // ===== EMPLOYEES =====

  @Post('employees')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_CREATE_EMPLOYEE')
  @ApiOperation({ summary: 'Create employee' })
  @ApiResponse({ status: 201, type: EmployeeResponseDto })
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: any,
  ): Promise<EmployeeResponseDto> {
    const entity = await this.hrService.createEmployee(dto, user.id);
    return { ...entity };
  }

  @Get('employees/:id')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_VIEW_EMPLOYEE')
  @ApiOperation({ summary: 'Get employee' })
  @ApiResponse({ status: 200, type: EmployeeResponseDto })
  async getEmployee(@Param('id') employeeId: string): Promise<EmployeeResponseDto> {
    const entity = await this.hrService.getEmployee(employeeId);
    return { ...entity };
  }

  @Get('employees')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_LIST_EMPLOYEES')
  @ApiOperation({ summary: 'List employees' })
  @ApiResponse({ status: 200, type: [EmployeeResponseDto] })
  async listEmployees(
    @Query('departmentId') departmentId?: string,
  ): Promise<EmployeeResponseDto[]> {
    if (departmentId) {
      const items = await this.hrService.listEmployeesByDepartment(departmentId);
      return items.map(entity => ({ ...entity }));
    }
    const items = await this.hrService.listAllEmployees();
    return items.map(entity => ({ ...entity }));
  }

  @Patch('employees/:id')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_UPDATE_EMPLOYEE')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, type: EmployeeResponseDto })
  async updateEmployee(
    @Param('id') employeeId: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ): Promise<EmployeeResponseDto> {
    const entity = await this.hrService.updateEmployee(employeeId, dto, user.id);
    return { ...entity };
  }

  // ===== SALARY STRUCTURES =====

  @Post('salary-structures')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_CREATE_SALARY_STRUCTURE')
  async createSalaryStructure(
    @Body() dto: CreateSalaryStructureDto,
    @CurrentUser() user: any,
  ): Promise<SalaryStructureResponseDto> {
    const entity = await this.hrService.createSalaryStructure(dto, user.id);
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      baseSalary: entity.baseSalary,
      grossSalary: entity.grossSalary,
      effectiveFrom: entity.effectiveFrom,
      effectiveTill: entity.effectiveTill,
      isActive: entity.isActive,
      approvedBy: entity.approvedBy,
    };
  }

  @Get('salary-structures/:employeeId')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_VIEW_SALARY_STRUCTURE')
  async getSalaryStructures(
    @Param('employeeId') employeeId: string,
  ): Promise<SalaryStructureResponseDto[]> {
    const entities = await this.hrService.listSalaryStructures(employeeId);
    return entities.map(entity => ({
      id: entity.id,
      employeeId: entity.employeeId,
      baseSalary: entity.baseSalary,
      grossSalary: entity.grossSalary,
      effectiveFrom: entity.effectiveFrom,
      effectiveTill: entity.effectiveTill,
      isActive: entity.isActive,
      approvedBy: entity.approvedBy,
    }));
  }

  // ===== PAYROLL =====

  @Post('payroll/process')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_PROCESS_PAYROLL')
  async processPayroll(
    @Body() dto: CreatePayrollDto & { employeeId: string },
    @CurrentUser() user: any,
  ): Promise<PayrollRecordResponseDto> {
    return this.hrService.processPayroll(dto.employeeId, dto, user.id);
  }

  @Patch('payroll/:id/approve')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_APPROVE_PAYROLL')
  async approvePayroll(
    @Param('id') payrollId: string,
    @CurrentUser() user: any,
  ): Promise<PayrollRecordResponseDto> {
    return this.hrService.approvePayroll(payrollId, user.id);
  }

  @Patch('payroll/:id/pay')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_MARK_PAYROLL_PAID')
  async markPayrollAsPaid(
    @Param('id') payrollId: string,
    @Body() dto: { paymentReference: string },
    @CurrentUser() user: any,
  ): Promise<PayrollRecordResponseDto> {
    return this.hrService.markPayrollAsPaid(
      payrollId,
      dto.paymentReference,
      user.id,
    );
  }

  @Get('payroll/:employeeId')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_VIEW_PAYROLL_HISTORY')
  async getPayrollHistory(
    @Param('employeeId') employeeId: string,
    @Query('limit') limit: string = '12',
  ): Promise<PayrollRecordResponseDto[]> {
    return this.hrService.getPayrollHistory(employeeId, parseInt(limit));
  }

  // ===== LEAVE REQUESTS =====

  @Post('leaves')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_CREATE_LEAVE_REQUEST')
  async createLeaveRequest(
    @Body() dto: CreateLeaveDto,
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    return this.hrService.createLeaveRequest(dto, user.id);
  }

  @Patch('leaves/:id/approve')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_APPROVE_LEAVE')
  async approveLeave(
    @Param('id') leaveId: string,
    @Body() dto: { approvalComments: string },
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    return this.hrService.approveLeave(leaveId, dto.approvalComments, user.id);
  }

  @Patch('leaves/:id/reject')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_REJECT_LEAVE')
  async rejectLeave(
    @Param('id') leaveId: string,
    @Body() dto: { rejectionReason: string },
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    return this.hrService.rejectLeave(leaveId, dto.rejectionReason, user.id);
  }

  @Get('leaves/:employeeId/balance?')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_VIEW_LEAVE_BALANCE')
  async getLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Query('year') year: string,
  ): Promise<any> {
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    return this.hrService.getLeaveBalance(employeeId, currentYear);
  }

  // ===== OFFER LETTERS =====

  @Post('offer-letters')
  @Roles('ADMIN', 'HR_MANAGER')
  @Auditable('HR_CREATE_OFFER_LETTER')
  async createOfferLetter(
    @Body() dto: CreateOfferLetterDto,
    @CurrentUser() user: any,
  ): Promise<OfferLetterResponseDto> {
    return this.hrService.createOfferLetter(dto, user.id);
  }

  @Get('offer-letters/:id')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_VIEW_OFFER_LETTER')
  async getOfferLetter(
    @Param('id') offerId: string,
  ): Promise<OfferLetterResponseDto> {
    return this.hrService.getOfferLetter(offerId);
  }

  @Patch('offer-letters/:id/status')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_UPDATE_OFFER_LETTER_STATUS')
  async updateOfferLetterStatus(
    @Param('id') offerId: string,
    @Body() dto: { status: string },
    @CurrentUser() user: any,
  ): Promise<OfferLetterResponseDto> {
    return this.hrService.updateOfferLetterStatus(offerId, dto.status, user.id);
  }

  @Get('offer-letters')
  @Roles('ADMIN', 'HR_MANAGER', 'DOCTOR', 'STAFF')
  @Auditable('HR_LIST_OFFER_LETTERS')
  async listOfferLetters(
    @Query('employeeId') employeeId: string,
  ): Promise<OfferLetterResponseDto[]> {
    return this.hrService.listOfferLetters(employeeId);
  }
}

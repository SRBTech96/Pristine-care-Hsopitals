import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FinanceService } from './finance.service';
import { CreateRevenueDto } from './dto/revenue.dto';
import { CreateExpenseDto } from './dto/expense.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post('revenues')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_CREATE_REVENUE')
  async createRevenue(@Body() dto: CreateRevenueDto, @CurrentUser() user: any) {
    return this.financeService.createRevenue(dto, user.id);
  }

  @Get('revenues/:id')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_VIEW_REVENUE')
  async getRevenue(@Param('id') id: string) {
    return this.financeService.getRevenue(id);
  }

  @Get('revenues')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_LIST_REVENUES')
  async listRevenue(@Query('doctorId') doctorId?: string, @Query('departmentId') departmentId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.listRevenue({ doctorId, departmentId, from, to });
  }

  @Get('reports/doctor')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_AGG_DOCTOR')
  async aggregateByDoctor(@Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.aggregateRevenueByDoctor(from, to);
  }

  @Get('reports/department')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_AGG_DEPARTMENT')
  async aggregateByDepartment(@Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.aggregateRevenueByDepartment(from, to);
  }

  @Post('expenses')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_CREATE_EXPENSE')
  async createExpense(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.financeService.createExpense(dto, user.id);
  }

  @Get('expenses')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_LIST_EXPENSES')
  async listExpenses(@Query('departmentId') departmentId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.listExpenses({ departmentId, from, to });
  }

  @Get('balances')
  @Roles('ADMIN', 'FINANCE')
  @Auditable('FINANCE_GET_BALANCES')
  async getBalances() {
    return this.financeService.getBalances();
  }
}

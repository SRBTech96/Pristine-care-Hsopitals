import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { OwnerDashboardService } from './owner-dashboard.service';
import { OwnerFilterDto } from './dto/filters.dto';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OwnerDashboardController {
  constructor(private svc: OwnerDashboardService) {}

  @Get('reports/daily-revenue')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_DAILY_REVENUE')
  async dailyRevenue(@Query('date') date?: string) {
    return this.svc.dailyRevenue(date);
  }

  @Get('reports/monthly-revenue')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_MONTHLY_REVENUE')
  async monthlyRevenue(@Query('month') month?: string) {
    return this.svc.monthlyRevenue(month);
  }

  @Get('reports/revenue-by-doctor')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_REVENUE_BY_DOCTOR')
  async revenueByDoctor(@Query() q: OwnerFilterDto) {
    return this.svc.revenueByDoctor(q.from, q.to);
  }

  @Get('reports/revenue-by-department')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_REVENUE_BY_DEPARTMENT')
  async revenueByDepartment(@Query() q: OwnerFilterDto) {
    return this.svc.revenueByDepartment(q.from, q.to);
  }

  @Get('reports/expenses-summary')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_EXPENSES_SUMMARY')
  async expensesSummary(@Query() q: OwnerFilterDto) {
    return this.svc.expensesSummary(q.from, q.to);
  }

  @Get('reports/pharmacy-revenue')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_PHARMACY_REVENUE')
  async pharmacyRevenue(@Query() q: OwnerFilterDto) {
    return this.svc.pharmacyRevenue(q.from, q.to);
  }

  @Get('reports/discounts-summary')
  @Roles('OWNER')
  @Auditable('OWNER_VIEW_DISCOUNTS_SUMMARY')
  async discountsSummary(@Query() q: OwnerFilterDto) {
    return this.svc.discountsSummary(q.from, q.to);
  }
}

// backend/src/controllers/QualityMetricsController.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { QualityMetricsService } from '../services/QualityMetricsService';

@Controller('quality-metrics')
export class QualityMetricsController {
  constructor(private metricsService: QualityMetricsService) {}

  @Post()
  async createOrUpdateMetrics(
    @Body() body: any,
  ): Promise<any> {
    try {
      const { wardId, nurseId, metricDate, ...metricData } = body;

      const metric = await this.metricsService.createOrUpdateMetrics(
        wardId,
        nurseId,
        new Date(metricDate),
        metricData,
      );

      return {
        success: true,
        data: metric,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to create or update metrics',
      );
    }
  }

  @Get('nurse/:nurseId')
  async getMetricsByNurse(
    @Param('nurseId') nurseId: string,
    @Query('wardId') wardId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    try {
      const metrics = await this.metricsService.getMetricsByNurse(
        wardId || '',
        nurseId,
        startDate ? new Date(startDate) : new Date(),
        endDate ? new Date(endDate) : new Date(),
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch nurse metrics',
      );
    }
  }

  @Get('ward/:wardId')
  async getWardMetrics(
    @Param('wardId') wardId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    try {
      const metrics = await this.metricsService.getWardMetrics(
        wardId,
        startDate ? new Date(startDate) : new Date(),
        endDate ? new Date(endDate) : new Date(),
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch ward metrics',
      );
    }
  }

  @Get('ward/:wardId/top-performers')
  async getTopPerformers(
    @Param('wardId') wardId: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    try {
      const performers = await this.metricsService.getTopPerformers(
        wardId,
        parseInt(limit || '10', 10),
      );

      return {
        success: true,
        data: performers,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch top performers',
      );
    }
  }

  @Get('ward/:wardId/medication')
  async getMedicationMetrics(
    @Param('wardId') wardId: string,
    @Query('nurseId') nurseId?: string,
  ): Promise<any> {
    try {
      const metrics = await this.metricsService.getMedicationMetrics(
        wardId,
        nurseId || undefined,
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch medication metrics',
      );
    }
  }

  @Get('ward/:wardId/tasks')
  async getTaskMetrics(
    @Param('wardId') wardId: string,
    @Query('nurseId') nurseId?: string,
  ): Promise<any> {
    try {
      const metrics = await this.metricsService.getTaskMetrics(
        wardId,
        nurseId || undefined,
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch task metrics',
      );
    }
  }

  @Get('ward/:wardId/workload')
  async getWorkloadMetrics(
    @Param('wardId') wardId: string,
  ): Promise<any> {
    try {
      const metrics = await this.metricsService.getWorkloadMetrics(wardId);

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch workload metrics',
      );
    }
  }

  @Get('ward/:wardId/emergency-response')
  async getEmergencyResponseMetrics(
    @Param('wardId') wardId: string,
    @Query('nurseId') nurseId?: string,
  ): Promise<any> {
    try {
      const metrics = await this.metricsService.getEmergencyResponseMetrics(
        wardId,
        nurseId || undefined,
      );

      return {
        success: true,
        data: metrics,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch emergency response metrics',
      );
    }
  }
}

// backend/src/controllers/NurseAlertController.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NurseAlertService } from '../services/NurseAlertService';

@Controller('nurse-alerts')
export class NurseAlertController {
  constructor(private nurseAlertService: NurseAlertService) {}

  @Post()
  @HttpCode(201)
  async createAlert(
    @Body() body: any,
    @Request() req: any,
  ): Promise<any> {
    try {
      const {
        wardId,
        nurseId,
        patientId,
        alertType,
        severity,
        message,
        metadata,
      } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const alert = await this.nurseAlertService.createAlert({
        wardId,
        nurseId,
        patientId,
        alertType,
        severity,
        message,
        metadata,
        createdBy: userId,
      });

      return {
        success: true,
        data: alert,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to create alert',
      );
    }
  }

  @Put(':alertId/acknowledge')
  async acknowledgeAlert(
    @Param('alertId') alertId: string,
    @Body() body: any,
    @Request() req: any,
  ): Promise<any> {
    try {
      const { acknowledgedNotes } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const alert = await this.nurseAlertService.acknowledgeAlert(
        alertId,
        acknowledgedNotes,
        userId,
      );

      return {
        success: true,
        data: alert,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to acknowledge alert',
      );
    }
  }

  @Put(':alertId/escalate')
  async escalateAlert(
    @Param('alertId') alertId: string,
    @Body() body: any,
    @Request() req: any,
  ): Promise<any> {
    try {
      const { reason, escalateTo } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const alert = await this.nurseAlertService.escalateAlert(
        alertId,
        reason,
        escalateTo || 'HEAD_NURSE',
        userId,
      );

      return {
        success: true,
        data: alert,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to escalate alert',
      );
    }
  }

  @Put(':alertId/resolve')
  async resolveAlert(
    @Param('alertId') alertId: string,
    @Body() body: any,
    @Request() req: any,
  ): Promise<any> {
    try {
      const { resolutionNotes } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const alert = await this.nurseAlertService.resolveAlert(
        alertId,
        resolutionNotes,
        userId,
      );

      return {
        success: true,
        data: alert,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to resolve alert',
      );
    }
  }

  @Get('ward/:wardId')
  async getAlertsByWard(
    @Param('wardId') wardId: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const alerts = await this.nurseAlertService.getAlertsByWard(
        wardId,
        status || undefined,
        severity || undefined,
        parseInt(limit || '50', 10),
        parseInt(offset || '0', 10),
      );

      return {
        success: true,
        data: alerts,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch alerts',
      );
    }
  }

  @Get('nurse/:nurseId')
  async getAlertsByNurse(
    @Param('nurseId') nurseId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const alerts = await this.nurseAlertService.getAlertsByNurse(
        nurseId,
        status || undefined,
        parseInt(limit || '50', 10),
        parseInt(offset || '0', 10),
      );

      return {
        success: true,
        data: alerts,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch alerts',
      );
    }
  }

  @Get('ward/:wardId/open')
  async getOpenAlerts(
    @Param('wardId') wardId: string,
  ): Promise<any> {
    try {
      const alerts = await this.nurseAlertService.getOpenAlerts(wardId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch open alerts',
      );
    }
  }

  @Get('ward/:wardId/critical')
  async getCriticalAlerts(
    @Param('wardId') wardId: string,
  ): Promise<any> {
    try {
      const alerts = await this.nurseAlertService.getCriticalAlerts(wardId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch critical alerts',
      );
    }
  }

  @Get(':alertId')
  async getAlertById(
    @Param('alertId') alertId: string,
  ): Promise<any> {
    try {
      const alert = await this.nurseAlertService.getAlertById(alertId);

      if (!alert) {
        throw new NotFoundException('Alert not found');
      }

      return {
        success: true,
        data: alert,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || 'Failed to fetch alert',
      );
    }
  }

  @Get(':alertId/audit')
  async getAlertAuditLog(
    @Param('alertId') alertId: string,
  ): Promise<any> {
    try {
      const alert = await this.nurseAlertService.getAlertById(alertId);

      if (!alert) {
        throw new NotFoundException('Alert not found');
      }

      const auditLog = this.parseAuditLog(alert.auditLog);

      return {
        success: true,
        data: auditLog,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || 'Failed to fetch audit log',
      );
    }
  }

  private parseAuditLog(auditLogString: string): any[] {
    if (!auditLogString) return [];
    return auditLogString
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry) => entry !== null);
  }
}

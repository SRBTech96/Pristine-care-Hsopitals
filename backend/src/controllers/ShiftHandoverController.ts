// backend/src/controllers/ShiftHandoverController.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ShiftHandoverService } from '../services/ShiftHandoverService';

@Controller('shift-handovers')
export class ShiftHandoverController {
  constructor(private shiftHandoverService: ShiftHandoverService) {}

  @Post()
  @HttpCode(201)
  async createHandover(
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const {
        wardId,
        outgoingNurseId,
        pendingMedications,
        criticalPatients,
        pendingLabs,
        clinicalNotes,
        patientIds,
      } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const handover = await this.shiftHandoverService.createHandover(
        {
          wardId,
          outgoingNurseId,
          pendingMedications,
          criticalPatients,
          pendingLabs,
          clinicalNotes,
          patientIds,
        },
        userId,
      );

      return {
        success: true,
        data: handover,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to create handover',
      );
    }
  }

  @Put(':handoverId/acknowledge')
  async acknowledgeHandover(
    @Param('handoverId') handoverId: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { incomingNurseId } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const handover = await this.shiftHandoverService.acknowledgeHandover(
        {
          handoverId,
          incomingNurseId,
        },
        userId,
      );

      return {
        success: true,
        data: handover,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to acknowledge handover',
      );
    }
  }

  @Put(':handoverId/review')
  async reviewHandover(
    @Param('handoverId') handoverId: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { reviewNotes } = body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }

      const handover = await this.shiftHandoverService.reviewHandover(
        handoverId,
        reviewNotes,
        userId,
      );

      return {
        success: true,
        data: handover,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to review handover',
      );
    }
  }

  @Get('ward/:wardId')
  async getHandoversByWard(
    @Param('wardId') wardId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any> {
    try {
      const handovers = await this.shiftHandoverService.getHandoversByWard(
        wardId,
        status || undefined,
        parseInt(limit || '50', 10),
        parseInt(offset || '0', 10),
      );

      return {
        success: true,
        data: handovers,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch handovers',
      );
    }
  }

  @Get('ward/:wardId/pending')
  async getPendingHandovers(
    @Param('wardId') wardId: string,
  ): Promise<any> {
    try {
      const handovers = await this.shiftHandoverService.getPendingHandovers(wardId);

      return {
        success: true,
        data: handovers,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch pending handovers',
      );
    }
  }

  @Get(':handoverId')
  async getHandoverById(
    @Param('handoverId') handoverId: string,
  ): Promise<any> {
    try {
      const handover = await this.shiftHandoverService.getHandoverById(handoverId);

      if (!handover) {
        throw new NotFoundException('Handover not found');
      }

      return {
        success: true,
        data: handover,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || 'Failed to fetch handover',
      );
    }
  }

  @Get(':handoverId/audit')
  async getHandoverAuditLog(
    @Param('handoverId') handoverId: string,
  ): Promise<any> {
    try {
      const handover = await this.shiftHandoverService.getHandoverById(handoverId);

      if (!handover) {
        throw new NotFoundException('Handover not found');
      }

      const auditLog = this.parseAuditLog(handover.auditLog);

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

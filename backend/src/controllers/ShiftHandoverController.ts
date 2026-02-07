// backend/src/controllers/ShiftHandoverController.ts
import { Request, Response } from 'express';
import { ShiftHandoverService } from '../services/ShiftHandoverService';
import { ShiftHandover } from '../entities/ShiftHandover';

export class ShiftHandoverController {
  constructor(private shiftHandoverService: ShiftHandoverService) {}

  async createHandover(req: Request, res: Response): Promise<void> {
    try {
      const { wardId, fromNurseId, toNurseId, notes, patients, criticalItems } = req.body;
      const userId = req.user.id;

      const handover = await this.shiftHandoverService.createHandover({
        wardId,
        fromNurseId,
        toNurseId,
        notes,
        patients,
        criticalItems,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: handover,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async acknowledgeHandover(req: Request, res: Response): Promise<void> {
    try {
      const { handoverId } = req.params;
      const { acknowledgedNotes } = req.body;
      const userId = req.user.id;

      const handover = await this.shiftHandoverService.acknowledgeHandover(
        handoverId,
        acknowledgedNotes,
        userId
      );

      res.status(200).json({
        success: true,
        data: handover,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async reviewHandover(req: Request, res: Response): Promise<void> {
    try {
      const { handoverId } = req.params;
      const { reviewNotes } = req.body;
      const userId = req.user.id;

      const handover = await this.shiftHandoverService.reviewHandover(
        handoverId,
        reviewNotes,
        userId
      );

      res.status(200).json({
        success: true,
        data: handover,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getHandoversByWard(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      const handovers = await this.shiftHandoverService.getHandoversByWard(
        wardId,
        status as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: handovers,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getPendingHandovers(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;

      const handovers = await this.shiftHandoverService.getPendingHandovers(wardId);

      res.status(200).json({
        success: true,
        data: handovers,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getHandoverById(req: Request, res: Response): Promise<void> {
    try {
      const { handoverId } = req.params;

      const handover = await this.shiftHandoverService.getHandoverById(handoverId);

      if (!handover) {
        res.status(404).json({
          success: false,
          error: 'Handover not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: handover,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getHandoverAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { handoverId } = req.params;

      const handover = await this.shiftHandoverService.getHandoverById(handoverId);

      if (!handover) {
        res.status(404).json({
          success: false,
          error: 'Handover not found',
        });
        return;
      }

      const auditLog = this.parseAuditLog(handover.auditLog);

      res.status(200).json({
        success: true,
        data: auditLog,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  private parseAuditLog(auditLogString: string) {
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

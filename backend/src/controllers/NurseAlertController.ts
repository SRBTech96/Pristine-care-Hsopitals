// backend/src/controllers/NurseAlertController.ts
import { Request, Response } from 'express';
import { NurseAlertService } from '../services/NurseAlertService';

export class NurseAlertController {
  constructor(private nurseAlertService: NurseAlertService) {}

  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const {
        wardId,
        nurseId,
        patientId,
        alertType,
        severity,
        message,
        metadata,
      } = req.body;
      const userId = req.user.id;

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

      res.status(201).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { acknowledgedNotes } = req.body;
      const userId = req.user.id;

      const alert = await this.nurseAlertService.acknowledgeAlert(
        alertId,
        acknowledgedNotes,
        userId
      );

      res.status(200).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async escalateAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { reason, escalateTo } = req.body;
      const userId = req.user.id;

      const alert = await this.nurseAlertService.escalateAlert(
        alertId,
        reason,
        escalateTo || 'HEAD_NURSE',
        userId
      );

      res.status(200).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { resolutionNotes } = req.body;
      const userId = req.user.id;

      const alert = await this.nurseAlertService.resolveAlert(
        alertId,
        resolutionNotes,
        userId
      );

      res.status(200).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAlertsByWard(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { status, severity, limit = 50, offset = 0 } = req.query;

      const alerts = await this.nurseAlertService.getAlertsByWard(
        wardId,
        status as string,
        severity as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAlertsByNurse(req: Request, res: Response): Promise<void> {
    try {
      const { nurseId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      const alerts = await this.nurseAlertService.getAlertsByNurse(
        nurseId,
        status as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getOpenAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;

      const alerts = await this.nurseAlertService.getOpenAlerts(wardId);

      res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCriticalAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;

      const alerts = await this.nurseAlertService.getCriticalAlerts(wardId);

      res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;

      const alert = await this.nurseAlertService.getAlertById(alertId);

      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAlertAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;

      const alert = await this.nurseAlertService.getAlertById(alertId);

      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
        return;
      }

      const auditLog = this.parseAuditLog(alert.auditLog);

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

// backend/src/controllers/QualityMetricsController.ts
import { Request, Response } from 'express';
import { QualityMetricsService } from '../services/QualityMetricsService';

export class QualityMetricsController {
  constructor(private metricsService: QualityMetricsService) {}

  async createOrUpdateMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { wardId, nurseId, metricDate, ...metricData } = req.body;

      const metric = await this.metricsService.createOrUpdateMetrics(
        wardId,
        nurseId,
        new Date(metricDate),
        metricData
      );

      res.status(200).json({
        success: true,
        data: metric,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getMetricsByNurse(req: Request, res: Response): Promise<void> {
    try {
      const { wardId, nurseId } = req.params;
      const { startDate, endDate } = req.query;

      const metrics = await this.metricsService.getMetricsByNurse(
        wardId,
        nurseId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWardMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { startDate, endDate } = req.query;

      const metrics = await this.metricsService.getWardMetrics(
        wardId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTopPerformers(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { limit = 10 } = req.query;

      const performers = await this.metricsService.getTopPerformers(
        wardId,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: performers,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getMedicationMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { nurseId } = req.query;

      const metrics = await this.metricsService.getMedicationMetrics(
        wardId,
        nurseId as string
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTaskMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { nurseId } = req.query;

      const metrics = await this.metricsService.getTaskMetrics(
        wardId,
        nurseId as string
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkloadMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;

      const metrics = await this.metricsService.getWorkloadMetrics(wardId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getEmergencyResponseMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { wardId } = req.params;
      const { nurseId } = req.query;

      const metrics = await this.metricsService.getEmergencyResponseMetrics(
        wardId,
        nurseId as string
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

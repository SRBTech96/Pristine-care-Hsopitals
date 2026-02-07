// backend/src/services/QualityMetricsService.ts
import { Repository } from 'typeorm';
import { NurseQualityMetric } from '../entities/NurseQualityMetric';

export interface MetricsQueryDTO {
  wardId: string;
  nurseId?: string;
  startDate: Date;
  endDate: Date;
}

export class QualityMetricsService {
  constructor(private metricsRepository: Repository<NurseQualityMetric>) {}

  async createOrUpdateMetrics(
    wardId: string,
    nurseId: string,
    metricDate: Date,
    updates: Partial<NurseQualityMetric>
  ): Promise<NurseQualityMetric> {
    let metric = await this.metricsRepository.findOne({
      where: { wardId, nurseId, metricDate },
    });

    if (!metric) {
      metric = new NurseQualityMetric();
      metric.wardId = wardId;
      metric.nurseId = nurseId;
      metric.metricDate = metricDate;
    }

    Object.assign(metric, updates);
    return this.metricsRepository.save(metric);
  }

  async getMetricsByNurse(
    wardId: string,
    nurseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<NurseQualityMetric[]> {
    return this.metricsRepository.find({
      where: {
        wardId,
        nurseId,
      },
      order: { metricDate: 'DESC' },
    });
  }

  async getWardMetrics(
    wardId: string,
    startDate: Date,
    endDate: Date
  ): Promise<NurseQualityMetric[]> {
    return this.metricsRepository.find({
      where: { wardId },
      order: { metricDate: 'DESC' },
      relations: ['nurse'],
    });
  }

  async getTopPerformers(
    wardId: string,
    limit: number = 10
  ): Promise<Array<{
    nurseId: string;
    nurseName: string;
    overallScore: number;
  }>> {
    // Calculate aggregate scores
    const results = await this.metricsRepository
      .createQueryBuilder('metric')
      .select('metric.nurseId', 'nurseId')
      .addSelect('AVG(metric.medicationComplianceRate)', 'medicationScore')
      .addSelect('AVG(metric.taskCompletionRate)', 'taskScore')
      .addSelect('AVG(metric.handoverAcknowledgementRate)', 'handoverScore')
      .addSelect('AVG(metric.workloadScore)', 'workloadScore')
      .where('metric.wardId = :wardId', { wardId })
      .groupBy('metric.nurseId')
      .orderBy('(AVG(metric.medicationComplianceRate) + AVG(metric.taskCompletionRate)) / 2', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => ({
      nurseId: r.nurseid,
      nurseName: 'Nurse Name', // Would be populated from nurse entity
      overallScore: ((parseFloat(r.medicationscore) || 0) + (parseFloat(r.taskscore) || 0)) / 2,
    }));
  }

  async getMedicationMetrics(wardId: string, nurseId?: string) {
    const query = this.metricsRepository.createQueryBuilder('metric')
      .select('AVG(metric.medicationComplianceRate)', 'averageCompliance')
      .addSelect('SUM(metric.medicationsMissed)', 'totalMissed')
      .addSelect('SUM(metric.medicationsLate)', 'totalLate')
      .where('metric.wardId = :wardId', { wardId });

    if (nurseId) {
      query.andWhere('metric.nurseId = :nurseId', { nurseId });
    }

    return query.getRawOne();
  }

  async getTaskMetrics(wardId: string, nurseId?: string) {
    const query = this.metricsRepository.createQueryBuilder('metric')
      .select('AVG(metric.taskCompletionRate)', 'averageCompletion')
      .addSelect('SUM(metric.tasksOverdue)', 'totalOverdue')
      .addSelect('SUM(metric.tasksAssigned)', 'totalAssigned')
      .where('metric.wardId = :wardId', { wardId });

    if (nurseId) {
      query.andWhere('metric.nurseId = :nurseId', { nurseId });
    }

    return query.getRawOne();
  }

  async getWorkloadMetrics(wardId: string) {
    return this.metricsRepository.find({
      where: { wardId },
      order: { metricDate: 'DESC' },
      select: [
        'nurseId',
        'patientsAssigned',
        'tasksAssigned',
        'workloadScore',
        'metricDate',
      ],
      relations: ['nurse'],
    });
  }

  async getEmergencyResponseMetrics(wardId: string, nurseId?: string) {
    const query = this.metricsRepository.createQueryBuilder('metric')
      .select('AVG(metric.emergencyResponseTimeSeconds)', 'averageResponseTime')
      .addSelect('SUM(metric.emergencyEventsResponded)', 'totalResponded')
      .where('metric.wardId = :wardId', { wardId });

    if (nurseId) {
      query.andWhere('metric.nurseId = :nurseId', { nurseId });
    }

    return query.getRawOne();
  }

  calculateWorkloadScore(
    patientsAssigned: number,
    tasksAssigned: number,
    medicationCount: number
  ): number {
    // Simple scoring algorithm
    // Max 100 points
    // 40% patients (max 10 patients = 40 points)
    // 35% tasks (max 20 tasks = 35 points)
    // 25% medications (max 50 meds = 25 points)
    const patientScore = Math.min((patientsAssigned / 10) * 40, 40);
    const taskScore = Math.min((tasksAssigned / 20) * 35, 35);
    const medScore = Math.min((medicationCount / 50) * 25, 25);

    return Math.round(patientScore + taskScore + medScore);
  }
}

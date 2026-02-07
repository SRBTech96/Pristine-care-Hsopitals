// frontend/src/components/NurseStation/Phase2/HeadNurseQualityDashboard.tsx
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  Clock,
  CheckCircle,
  Download,
  Calendar,
} from 'lucide-react';

interface NurseMetric {
  nurseId: string;
  nurseName: string;
  medicationComplianceRate: number;
  taskCompletionRate: number;
  handoverAcknowledgementRate: number;
  emergencyResponseTimeSeconds: number;
  workloadScore: number;
  patientsAssigned: number;
  tasksAssigned: number;
  medicationsMissed: number;
  tasksOverdue: number;
}

export const HeadNurseQualityDashboard: React.FC<{
  wardId: string;
  metrics?: NurseMetric[];
}> = ({ wardId, metrics: initialMetrics = [] }) => {
  const [metrics, setMetrics] = useState<NurseMetric[]>(initialMetrics);
  const [dateRange, setDateRange] = useState('week'); // week, month, quarter
  const [selectedNurse, setSelectedNurse] = useState<NurseMetric | null>(null);

  // Calculate ward averages
  const calculations = {
    avgMedicationCompliance:
      metrics.length > 0
        ? (
            metrics.reduce((sum, m) => sum + m.medicationComplianceRate, 0) /
            metrics.length
          ).toFixed(1)
        : 0,
    avgTaskCompletion:
      metrics.length > 0
        ? (
            metrics.reduce((sum, m) => sum + m.taskCompletionRate, 0) /
            metrics.length
          ).toFixed(1)
        : 0,
    avgHandoverAck:
      metrics.length > 0
        ? (
            metrics.reduce(
              (sum, m) => sum + m.handoverAcknowledgementRate,
              0
            ) / metrics.length
          ).toFixed(1)
        : 0,
    avgEmergencyResponse:
      metrics.length > 0
        ? (
            metrics.reduce(
              (sum, m) => sum + m.emergencyResponseTimeSeconds,
              0
            ) / metrics.length
          ).toFixed(0)
        : 0,
    totalMissedMeds: metrics.reduce((sum, m) => sum + m.medicationsMissed, 0),
    totalOverdueTasks: metrics.reduce((sum, m) => sum + m.tasksOverdue, 0),
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 bg-green-50';
    if (rate >= 85) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceRating = (rate: number) => {
    if (rate >= 95) return 'Excellent';
    if (rate >= 85) return 'Good';
    if (rate >= 75) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const sortedMetrics = [...metrics].sort(
    (a, b) =>
      (b.medicationComplianceRate + b.taskCompletionRate) / 2 -
      (a.medicationComplianceRate + a.taskCompletionRate) / 2
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Quality Metrics Dashboard
            </h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        <div className="flex gap-3 items-center">
          <Calendar className="w-5 h-5 text-gray-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Medication Compliance
              </p>
              <p className={`text-3xl font-bold ${getComplianceColor(parseFloat(calculations.avgMedicationCompliance as any))}`}>
                {calculations.avgMedicationCompliance}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {calculations.totalMissedMeds} medications missed
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Task Completion</p>
              <p className={`text-3xl font-bold ${getComplianceColor(parseFloat(calculations.avgTaskCompletion as any))}`}>
                {calculations.avgTaskCompletion}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {calculations.totalOverdueTasks} tasks overdue
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Handover Acknowledgement
              </p>
              <p className={`text-3xl font-bold ${getComplianceColor(parseFloat(calculations.avgHandoverAck as any))}`}>
                {calculations.avgHandoverAck}%
              </p>
              <p className="text-xs text-gray-500 mt-2">All shifts</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Avg Emergency Response
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {calculations.avgEmergencyResponse}s
              </p>
              <p className="text-xs text-gray-500 mt-2">Average time</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Nurse Performance rankings */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Nurse Performance Rankings
        </h3>

        {metrics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No metrics data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold">Nurse</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Medication %
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Tasks %
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Handover %
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Workload
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedMetrics.map((metric, idx) => {
                  const overallScore =
                    (metric.medicationComplianceRate +
                      metric.taskCompletionRate) /
                    2;
                  return (
                    <tr
                      key={metric.nurseId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {metric.nurseName}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${getComplianceColor(metric.medicationComplianceRate)}`}>
                        {metric.medicationComplianceRate.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-4 font-semibold ${getComplianceColor(metric.taskCompletionRate)}`}>
                        {metric.taskCompletionRate.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-4 font-semibold ${getComplianceColor(metric.handoverAcknowledgementRate)}`}>
                        {metric.handoverAcknowledgementRate.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (metric.workloadScore / 100) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {metric.workloadScore.toFixed(0)}/100
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          overallScore >= 95
                            ? 'bg-green-100 text-green-800'
                            : overallScore >= 85
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {getPerformanceRating(overallScore)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedNurse(metric)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nurse Details Modal */}
      {selectedNurse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="text-lg font-bold">{selectedNurse.nurseName} - Performance Report</h3>
              <button
                onClick={() => setSelectedNurse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Medication Compliance
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {selectedNurse.medicationComplianceRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {selectedNurse.medicationsMissed} medications missed
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Task Completion
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {selectedNurse.taskCompletionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    {selectedNurse.tasksOverdue} tasks overdue
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Handover Acknowledgement
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    {selectedNurse.handoverAcknowledgementRate.toFixed(1)}%
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium mb-1">
                    Emergency Response Time
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    {selectedNurse.emergencyResponseTimeSeconds}s
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Workload Status
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Patients Assigned
                      </span>
                      <span className="text-sm font-medium">
                        {selectedNurse.patientsAssigned}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (selectedNurse.patientsAssigned / 10) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Tasks Assigned
                      </span>
                      <span className="text-sm font-medium">
                        {selectedNurse.tasksAssigned}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (selectedNurse.tasksAssigned / 20) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Overall Workload Score
                      </span>
                      <span className="text-sm font-medium">
                        {selectedNurse.workloadScore.toFixed(0)}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedNurse.workloadScore > 75
                            ? 'bg-red-600'
                            : 'bg-yellow-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            (selectedNurse.workloadScore / 100) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Recommendation
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedNurse.medicationComplianceRate < 85 ? (
                    <span className="text-red-600">
                      ⚠️ Focus on medication administration compliance through
                      additional training.
                    </span>
                  ) : selectedNurse.workloadScore > 75 ? (
                    <span className="text-orange-600">
                      ⚠️ Consider workload redistribution to prevent burnout.
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ✓ Performance is excellent. Consider as mentoring resource
                      for other nurses.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

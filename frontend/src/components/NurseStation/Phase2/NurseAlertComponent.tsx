// frontend/src/components/NurseStation/Phase2/NurseAlertComponent.tsx
import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Zap,
  Clock,
  ArrowUp,
  Eye,
} from 'lucide-react';

interface NurseAlert {
  id?: string;
  wardId: string;
  nurseId: string;
  patientId?: string;
  alertType:
    | 'overdue_medication'
    | 'unacknowledged_emergency'
    | 'missed_vitals'
    | 'pending_lab_result'
    | 'task_overdue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'open' | 'acknowledged' | 'escalated' | 'resolved';
  createdAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  escalatedAt?: Date;
  escalatedTo?: string;
  resolvedAt?: Date;
}

export const NurseAlertComponent: React.FC<{
  wardId: string;
  currentNurseId: string;
  alerts?: NurseAlert[];
}> = ({ wardId, currentNurseId, alerts: initialAlerts = [] }) => {
  const [alerts, setAlerts] = useState<NurseAlert[]>(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<NurseAlert | null>(null);
  const [acknowledgedNotes, setAcknowledgedNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <AlertCircle className="w-5 h-5 animate-pulse text-red-600" />
        );
      case 'medium':
        return <Bell className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      overdue_medication: 'Overdue Medication',
      unacknowledged_emergency: 'Unacknowledged Emergency',
      missed_vitals: 'Missed Vitals',
      pending_lab_result: 'Pending Lab Result',
      task_overdue: 'Task Overdue',
    };
    return labels[type] || type;
  };

  const handleAcknowledgeAlert = (alert: NurseAlert) => {
    console.log('Acknowledging alert:', alert.id, acknowledgedNotes);
    // API call would go here
    const updatedAlerts: NurseAlert[] = alerts.map((a) =>
      a.id === alert.id
        ? {
            ...a,
            status: 'acknowledged',
            acknowledgedAt: new Date(),
            acknowledgedBy: currentNurseId,
          }
        : a
    );
    setAlerts(updatedAlerts);
    setSelectedAlert(null);
    setAcknowledgedNotes('');
  };

  const handleEscalateAlert = (alert: NurseAlert) => {
    if (!escalationReason.trim()) {
      window.alert('Please provide escalation reason');
      return;
    }

    console.log(
      'Escalating alert:',
      alert.id,
      escalationReason
    );
    // API call would go here
    const updatedAlerts: NurseAlert[] = alerts.map((a) =>
      a.id === alert.id
        ? {
            ...a,
            status: 'escalated',
            escalatedAt: new Date(),
            escalatedTo: 'HEAD_NURSE',
          }
        : a
    );
    setAlerts(updatedAlerts);
    setSelectedAlert(null);
    setEscalationReason('');
    setShowEscalation(false);
  };

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const criticalAlerts = openAlerts.filter((a) => a.severity === 'critical');

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Nurse Alerts</h2>
          {criticalAlerts.length > 0 && (
            <span className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded-full font-bold animate-pulse">
              {criticalAlerts.length} CRITICAL
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Open Alerts</p>
          <p className="text-2xl font-bold text-gray-800">{openAlerts.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {getAlertTypeLabel(alert.alertType)}
                    </h3>
                    <p className="text-sm mt-1">{alert.message}</p>
                    {alert.patientId && (
                      <p className="text-xs mt-1 opacity-75">
                        Patient: {alert.patientId}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.createdAt || '').toLocaleTimeString()}
                    </div>
                    {alert.status !== 'open' && (
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          alert.status === 'acknowledged'
                            ? 'bg-blue-600 text-white'
                            : alert.status === 'escalated'
                              ? 'bg-orange-600 text-white'
                              : 'bg-green-600 text-white'
                        }`}
                      >
                        {alert.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <Eye className="w-5 h-5 opacity-50" />
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {getAlertTypeLabel(selectedAlert.alertType)}
                </h3>
                <p className={`text-sm font-medium mt-1`}>
                  Severity:{' '}
                  <span className="uppercase">{selectedAlert.severity}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <p className="text-gray-700 mt-1">{selectedAlert.message}</p>
              </div>

              {selectedAlert.patientId && (
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="text-gray-700 font-medium">
                    {selectedAlert.patientId}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-gray-700 font-medium capitalize">
                  {selectedAlert.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-700">
                  {new Date(selectedAlert.createdAt || '').toLocaleString()}
                </p>
              </div>

              {selectedAlert.acknowledgedAt && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    ✓ Acknowledged by {selectedAlert.acknowledgedBy}
                  </p>
                  <p className="text-xs text-blue-600">
                    {new Date(selectedAlert.acknowledgedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedAlert.status === 'open' && (
                <div className="border-t pt-4 space-y-3">
                  {!showEscalation ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Acknowledgement Notes
                        </label>
                        <textarea
                          value={acknowledgedNotes}
                          onChange={(e) => setAcknowledgedNotes(e.target.value)}
                          placeholder="Document your acknowledgement of this alert..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleAcknowledgeAlert(selectedAlert)
                          }
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Acknowledge Alert
                        </button>
                        <button
                          onClick={() => setShowEscalation(true)}
                          className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium flex items-center justify-center gap-2"
                        >
                          <ArrowUp className="w-4 h-4" />
                          Escalate
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Escalation Reason
                      </label>
                      <textarea
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="Why are you escalating this alert?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                        rows={3}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleEscalateAlert(selectedAlert)
                          }
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          Escalate to Head Nurse
                        </button>
                        <button
                          onClick={() => {
                            setShowEscalation(false);
                            setEscalationReason('');
                          }}
                          className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

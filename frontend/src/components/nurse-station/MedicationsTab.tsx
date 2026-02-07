'use client';

import React, { useState, useEffect } from 'react';
import { InpatientAdmission, MedicationSchedule, MedicationAdministration } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { AlertCircle, Check, X, Clock } from 'lucide-react';

interface MedicationsTabProps {
  admission: InpatientAdmission;
  userRole: string;
}

interface MedicationWithStatus extends MedicationSchedule {
  latestAdministration?: MedicationAdministration;
}

export default function MedicationsTab({
  admission,
  userRole,
}: MedicationsTabProps) {
  const [medications, setMedications] = useState<MedicationWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [showReasonModal, setShowReasonModal] = useState<{
    scheduleId: string;
    action: 'delayed' | 'missed' | 'withheld';
  } | null>(null);
  const [reason, setReason] = useState('');

  const isStaffNurse = userRole.includes('STAFF_NURSE');
  const canExecuteMeds = isStaffNurse;

  useEffect(() => {
    loadMedications();
  }, [admission.id]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await nurseStationAPI.listMedicationSchedules(
        admission.id,
        'active'
      );
      setMedications(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleGiveMedication = async (scheduleId: string) => {
    if (!canExecuteMeds) return;
    
    try {
      setActioningId(scheduleId);
      await nurseStationAPI.executeMedication({
        medicationScheduleId: scheduleId,
        actualDosage: 1, // dummy value - should come from user
        routeUsed: 'IV',
        siteOfAdministration: 'Left arm',
        nurseNotes: 'Administered as scheduled',
      });
      await loadMedications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to give medication');
    } finally {
      setActioningId(null);
    }
  };

  const handleSkipMedication = async (
    scheduleId: string,
    action: 'delayed' | 'missed' | 'withheld'
  ) => {
    if (!canExecuteMeds) return;
    setShowReasonModal({ scheduleId, action });
  };

  const submitSkipMedication = async () => {
    if (!showReasonModal || !reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    try {
      setActioningId(showReasonModal.scheduleId);
      await nurseStationAPI.skipMedication({
        medicationScheduleId: showReasonModal.scheduleId,
        reason: reason,
      });
      await loadMedications();
      setShowReasonModal(null);
      setReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to skip medication');
    } finally {
      setActioningId(null);
    }
  };

  const getMedicationStatus = (med: MedicationWithStatus) => {
    if (med.latestAdministration) {
      if (med.latestAdministration.status === 'administered') {
        return {
          label: 'Given',
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-700',
          icon: <Check className="w-4 h-4" />,
        };
      } else if (med.latestAdministration.status === 'withheld') {
        return {
          label: 'Withheld',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700',
          icon: <X className="w-4 h-4" />,
        };
      } else if (med.latestAdministration.status === 'delayed') {
        return {
          label: 'Delayed',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          badge: 'bg-orange-100 text-orange-700',
          icon: <Clock className="w-4 h-4" />,
        };
      }
    }
    return {
      label: 'Pending',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      icon: <Clock className="w-4 h-4 text-blue-600" />,
    };
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!canExecuteMeds && (
        <div className="flex gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>View only - only Staff Nurses can execute medications</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No active medications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => {
            const status = getMedicationStatus(med);
            return (
              <div
                key={med.id}
                className={`border-2 rounded-lg p-3 transition-colors ${status.bg} ${status.border}`}
              >
                {/* Header with Status Badge */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">
                      {med.medicationName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {med.dosage} {med.unit} • {med.frequency}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${status.badge}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {/* Route & Site */}
                <p className="text-xs text-gray-600 mb-2">
                  Route: <span className="font-medium">{med.route}</span>
                </p>

                {/* Special Instructions */}
                {med.specialInstructions && (
                  <p className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 mb-2 text-yellow-800">
                    ⚠️ {med.specialInstructions}
                  </p>
                )}

                {/* Monitoring Parameters */}
                {med.monitoringParameters && med.monitoringParameters.length > 0 && (
                  <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 mb-2 text-blue-800">
                    <p className="font-medium mb-1">Monitor:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {med.monitoringParameters.map((param, idx) => (
                        <li key={idx}>{param}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                {canExecuteMeds && status.label === 'Pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleGiveMedication(med.id)}
                      disabled={actioningId === med.id}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {actioningId === med.id ? 'Saving...' : '✓ Given'}
                    </button>
                    <button
                      onClick={() => handleSkipMedication(med.id, 'withheld')}
                      disabled={actioningId === med.id}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      {actioningId === med.id ? 'Saving...' : 'Withheld'}
                    </button>
                    <button
                      onClick={() => handleSkipMedication(med.id, 'delayed')}
                      disabled={actioningId === med.id}
                      className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 text-xs font-semibold rounded hover:bg-orange-200 disabled:opacity-50 transition-colors"
                    >
                      {actioningId === med.id ? 'Saving...' : 'Delayed'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reason for {showReasonModal.action.charAt(0).toUpperCase() + showReasonModal.action.slice(1)}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for not administering this medication.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none mb-4"
              placeholder="Enter reason..."
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReasonModal(null);
                  setReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitSkipMedication}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

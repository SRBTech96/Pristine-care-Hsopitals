'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InpatientAdmission, EmergencyEvent } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface EmergencyTabProps {
  admission: InpatientAdmission;
  userRole: string;
}

const EMERGENCY_TYPES = [
  'cardiac_arrest',
  'respiratory_distress',
  'seizure',
  'anaphylaxis',
  'severe_bleeding',
  'code_blue',
  'septic_shock',
  'acute_abdomen',
  'other',
];

export default function EmergencyTab({ admission, userRole }: EmergencyTabProps) {
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStaffNurse = userRole.includes('STAFF_NURSE');

  const [formData, setFormData] = useState({
    eventType: '',
    severity: 'high' as const,
    description: '',
  });

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.listEmergencyEvents(
        admission.wardId,
        'reported'
      );
      const patientEvents = data.filter(
        (e: any) => e.patientId === admission.patientId
      );
      setEvents(patientEvents || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load emergency events');
    } finally {
      setLoading(false);
    }
  }, [admission.patientId, admission.wardId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRaiseEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaffNurse || !formData.eventType) {
      setError('Please select an emergency type');
      return;
    }

    try {
      setSubmitting(true);
      await nurseStationAPI.raiseEmergencyEvent({
        patientId: admission.patientId,
        inpatientAdmissionId: admission.id,
        eventType: formData.eventType,
        severity: formData.severity,
        location: `Bed ${admission.bedId}`,
        description: formData.description,
        doctorsToNotify: admission.attendingDoctor ? [admission.attendingDoctor.id] : [],
      });
      setFormData({ eventType: '', severity: 'high', description: '' });
      setShowRaiseForm(false);
      await loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to raise emergency event');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      reported: 'bg-gray-50 border-gray-200',
      acknowledged: 'bg-blue-50 border-blue-200',
      in_progress: 'bg-orange-50 border-orange-200',
      resolved: 'bg-green-50 border-green-200',
      escalated: 'bg-red-50 border-red-200',
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!isStaffNurse && (
        <div className="flex gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>View only - only Staff Nurses can raise emergency events</span>
        </div>
      )}

      {/* Raise Emergency Button */}
      {isStaffNurse && !showRaiseForm && (
        <button
          onClick={() => setShowRaiseForm(true)}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5" />
          🚨 RAISE EMERGENCY
        </button>
      )}

      {/* Raise Event Form */}
      {showRaiseForm && (
        <form
          onSubmit={handleRaiseEvent}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-3"
        >
          {/* Event Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Emergency Type *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) =>
                setFormData({ ...formData, eventType: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="">Select emergency type...</option>
              {EMERGENCY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Severity
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      severity: level as any,
                    })
                  }
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold capitalize transition-colors ${
                    formData.severity === level
                      ? getSeverityColor(level) + ' ring-2 ring-offset-1'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the emergency situation..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold text-sm transition-colors"
            >
              {submitting ? 'Submitting...' : '🚨 Raise Emergency'}
            </button>
            <button
              type="button"
              onClick={() => setShowRaiseForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Emergency Events History */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No emergency events reported</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Emergency History</h3>
          {events.map((event) => (
            <div
              key={event.id}
              className={`border-2 rounded-lg p-3 ${getStatusColor(event.status)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    🚨 {event.eventType?.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(event.timeOfEvent).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getSeverityColor(
                      event.severity
                    )}`}
                  >
                    {event.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                    {event.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 mb-2">{event.description}</p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white bg-opacity-50 p-2 rounded">
                <div>
                  <p className="text-gray-600">Reported By</p>
                  <p className="font-medium text-gray-900">
                    {event.reportedBy?.firstName || 'Nurse'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {event.status.replace(/_/g, ' ')}
                  </p>
                </div>
                {event.resolvingDoctor && (
                  <>
                    <div className="col-span-2">
                      <p className="text-gray-600">Resolved By</p>
                      <p className="font-medium text-gray-900">
                        Dr. {event.resolvingDoctor.firstName}
                      </p>
                    </div>
                  </>
                )}
                {event.outcome && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Outcome</p>
                    <p className="font-medium text-gray-900">{event.outcome}</p>
                  </div>
                )}
              </div>

              {/* Actions Taken */}
              {event.actionsTaken && (
                <p className="text-xs text-gray-700 mt-2 italic">
                  ✓ Actions: {event.actionsTaken}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

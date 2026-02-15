'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InpatientAdmission, VitalsRecord } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { AlertCircle, ThermometerSun, Heart } from 'lucide-react';

interface VitalsTabProps {
  admission: InpatientAdmission;
  userRole: string;
}

export default function VitalsTab({ admission, userRole }: VitalsTabProps) {
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStaffNurse = userRole.includes('STAFF_NURSE');

  // Form state
  const [formData, setFormData] = useState({
    temperatureCelsius: '',
    heartRateBpm: '',
    systolicBp: '',
    diastolicBp: '',
    respiratoryRateRpm: '',
    oxygenSaturationPercent: '',
    bloodGlucoseMmol: '',
    painScore: '',
    consciousnessLevel: 'alert',
    urineOutputMl: '',
    bowelMovementStatus: 'normal',
    notes: '',
    abnormalFindings: false,
  });

  const loadVitals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await nurseStationAPI.listPatientVitals(admission.id);
      setVitals(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vitals');
    } finally {
      setLoading(false);
    }
  }, [admission.id]);

  useEffect(() => {
    loadVitals();
  }, [loadVitals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaffNurse) return;

    try {
      setSubmitting(true);
      await nurseStationAPI.recordVitals({
        inpatientAdmissionId: admission.id,
        temperatureCelsius: parseFloat(formData.temperatureCelsius),
        heartRateBpm: parseInt(formData.heartRateBpm),
        systolicBp: parseInt(formData.systolicBp),
        diastolicBp: parseInt(formData.diastolicBp),
        respiratoryRateRpm: parseInt(formData.respiratoryRateRpm),
        oxygenSaturationPercent: parseFloat(formData.oxygenSaturationPercent),
        bloodGlucoseMmol: parseFloat(formData.bloodGlucoseMmol),
        painScore: parseInt(formData.painScore),
        consciousnessLevel: formData.consciousnessLevel,
        urineOutputMl: formData.urineOutputMl ? parseInt(formData.urineOutputMl) : null,
        bowelMovementStatus: formData.bowelMovementStatus,
        notes: formData.notes,
        abnormalFindings: formData.abnormalFindings,
      });
      setFormData({
        temperatureCelsius: '',
        heartRateBpm: '',
        systolicBp: '',
        diastolicBp: '',
        respiratoryRateRpm: '',
        oxygenSaturationPercent: '',
        bloodGlucoseMmol: '',
        painScore: '',
        consciousnessLevel: 'alert',
        urineOutputMl: '',
        bowelMovementStatus: 'normal',
        notes: '',
        abnormalFindings: false,
      });
      setShowForm(false);
      await loadVitals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  const isAbnormal = (vital: VitalsRecord) => {
    return vital.abnormalFindings;
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Record Button */}
      {isStaffNurse && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
        >
          + Record Vitals
        </button>
      )}

      {/* Record Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Temperature */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.temperatureCelsius}
                onChange={(e) =>
                  setFormData({ ...formData, temperatureCelsius: e.target.value })
                }
                placeholder="36.5"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={formData.heartRateBpm}
                onChange={(e) =>
                  setFormData({ ...formData, heartRateBpm: e.target.value })
                }
                placeholder="80"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Systolic BP */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={formData.systolicBp}
                onChange={(e) =>
                  setFormData({ ...formData, systolicBp: e.target.value })
                }
                placeholder="120"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Diastolic BP */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={formData.diastolicBp}
                onChange={(e) =>
                  setFormData({ ...formData, diastolicBp: e.target.value })
                }
                placeholder="80"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Respiratory Rate */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Respiratory Rate (rpm)
              </label>
              <input
                type="number"
                value={formData.respiratoryRateRpm}
                onChange={(e) =>
                  setFormData({ ...formData, respiratoryRateRpm: e.target.value })
                }
                placeholder="16"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                SpO₂ (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.oxygenSaturationPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    oxygenSaturationPercent: e.target.value,
                  })
                }
                placeholder="98"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Glucose */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Glucose (mmol/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.bloodGlucoseMmol}
                onChange={(e) =>
                  setFormData({ ...formData, bloodGlucoseMmol: e.target.value })
                }
                placeholder="5.5"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Pain Score */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pain Score (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.painScore}
                onChange={(e) =>
                  setFormData({ ...formData, painScore: e.target.value })
                }
                placeholder="0"
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Consciousness Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Consciousness
              </label>
              <select
                value={formData.consciousnessLevel}
                onChange={(e) =>
                  setFormData({ ...formData, consciousnessLevel: e.target.value })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              >
                <option>alert</option>
                <option>drowsy</option>
                <option>confused</option>
                <option>unresponsive</option>
              </select>
            </div>

            {/* Bowel Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bowel Status
              </label>
              <select
                value={formData.bowelMovementStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bowelMovementStatus: e.target.value,
                  })
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              >
                <option>normal</option>
                <option>constipated</option>
                <option>diarrhea</option>
              </select>
            </div>
          </div>

          {/* Urine Output */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Urine Output (mL) - Optional
            </label>
            <input
              type="number"
              value={formData.urineOutputMl}
              onChange={(e) =>
                setFormData({ ...formData, urineOutputMl: e.target.value })
              }
              placeholder="0"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Abnormal Findings */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.abnormalFindings}
              onChange={(e) =>
                setFormData({ ...formData, abnormalFindings: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-xs font-semibold text-gray-700">
              ⚠️ Abnormal Findings (will notify doctor)
            </span>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Vitals'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Vitals History */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : vitals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No vitals recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent Vitals</h3>
          {vitals.map((v) => (
            <div
              key={v.id}
              className={`border rounded-lg p-3 ${
                isAbnormal(v)
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Time & Status */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-900">
                  {new Date(v.recordedAt).toLocaleString()}
                </p>
                {isAbnormal(v) && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    ⚠️ Abnormal
                  </span>
                )}
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Temp</p>
                  <p className="font-semibold text-gray-900">{v.temperatureCelsius}°C</p>
                </div>
                <div>
                  <p className="text-gray-600">HR</p>
                  <p className="font-semibold text-gray-900">{v.heartRateBpm} bpm</p>
                </div>
                <div>
                  <p className="text-gray-600">BP</p>
                  <p className="font-semibold text-gray-900">
                    {v.systolicBp}/{v.diastolicBp}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">SpO₂</p>
                  <p className="font-semibold text-gray-900">{v.oxygenSaturationPercent}%</p>
                </div>
              </div>

              {/* Notes if present */}
              {v.notes && (
                <p className="text-xs text-gray-600 mt-2 italic">📝 {v.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

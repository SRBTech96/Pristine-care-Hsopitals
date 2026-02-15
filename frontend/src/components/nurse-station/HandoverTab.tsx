'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InpatientAdmission, NurseHandover } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { Briefcase, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface HandoverTabProps {
  admission: InpatientAdmission;
  wardId: string;
  userRole: string;
}

const HANDOVER_TEMPLATES = [
  'General Shift Handover',
  'Post-Operative Care',
  'Critical Condition Update',
  'Discharge Planning',
  'Pain Management Review',
  'Infection Control Alert',
  'Medication Review',
  'Behavioral/Psychological Notes',
  'Family Communication',
  'Other',
];

export default function HandoverTab({
  admission,
  wardId,
  userRole,
}: HandoverTabProps) {
  const [handovers, setHandovers] = useState<NurseHandover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStaffNurse = userRole.includes('STAFF_NURSE');

  const [formData, setFormData] = useState({
    template: '',
    keyPoints: '' as string,
    clinicalUpdate: '',
    tasksPending: [] as string[],
    riskAlerts: '',
    familyReferrals: '',
  });

  const [taskInput, setTaskInput] = useState('');

  const loadHandovers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.listNurseHandovers(wardId);
      const patientHandovers = data.filter(
        (h: any) => h.patientId === admission.patientId
      );
      setHandovers(patientHandovers || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load handovers');
    } finally {
      setLoading(false);
    }
  }, [admission.patientId, wardId]);

  useEffect(() => {
    loadHandovers();
  }, [loadHandovers]);

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setFormData({
        ...formData,
        tasksPending: [...formData.tasksPending, taskInput],
      });
      setTaskInput('');
    }
  };

  const handleRemoveTask = (index: number) => {
    setFormData({
      ...formData,
      tasksPending: formData.tasksPending.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaffNurse) {
      setError('Only Staff Nurses can create handovers');
      return;
    }

    if (!formData.template || !formData.clinicalUpdate) {
      setError('Please fill in template and clinical update');
      return;
    }

    try {
      setSubmitting(true);
      await nurseStationAPI.createNurseHandover({
        patientId: admission.patientId,
        inpatientAdmissionId: admission.id,
        wardId: wardId,
        nurseId: '', // Will be set by server
        handoverTemplate: formData.template,
        keyPoints: formData.keyPoints,
        clinicalUpdate: formData.clinicalUpdate,
        tasksPending: formData.tasksPending,
        riskAlerts: formData.riskAlerts,
        familyReferrals: formData.familyReferrals,
        bedLocation: `Bed ${admission.bedId}`,
      });

      setFormData({
        template: '',
        keyPoints: '',
        clinicalUpdate: '',
        tasksPending: [] as string[],
        riskAlerts: '',
        familyReferrals: '',
      });
      setShowForm(false);
      await loadHandovers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create handover');
    } finally {
      setSubmitting(false);
    }
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
          <span>View only - only Staff Nurses can create handovers</span>
        </div>
      )}

      {/* Create Handover Button */}
      {isStaffNurse && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Shift Handover
        </button>
      )}

      {/* Handover Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3"
        >
          {/* Template */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Handover Template *
            </label>
            <select
              value={formData.template}
              onChange={(e) =>
                setFormData({ ...formData, template: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select template...</option>
              {HANDOVER_TEMPLATES.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>

          {/* Key Points */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Key Points
            </label>
            <textarea
              value={formData.keyPoints}
              onChange={(e) =>
                setFormData({ ...formData, keyPoints: e.target.value })
              }
              placeholder="Brief highlights for the incoming shift..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Clinical Update */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Clinical Update *
            </label>
            <textarea
              value={formData.clinicalUpdate}
              onChange={(e) =>
                setFormData({ ...formData, clinicalUpdate: e.target.value })
              }
              placeholder="Detailed clinical status, vital signs trends, medication changes..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Pending Tasks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Tasks Pending for Next Shift
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="Add task and press Enter..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
              >
                Add
              </button>
            </div>
            {formData.tasksPending.length > 0 && (
              <div className="space-y-1 bg-white p-2 rounded border border-gray-200">
                {formData.tasksPending.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-indigo-100 p-2 rounded"
                  >
                    <span>{task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk Alerts */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Risk Alerts & Precautions
            </label>
            <textarea
              value={formData.riskAlerts}
              onChange={(e) =>
                setFormData({ ...formData, riskAlerts: e.target.value })
              }
              placeholder="e.g., Fall risk, Infection precautions, Allergy alerts..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Family Referrals */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Family Communication & Referrals
            </label>
            <textarea
              value={formData.familyReferrals}
              onChange={(e) =>
                setFormData({ ...formData, familyReferrals: e.target.value })
              }
              placeholder="Family concerns, discharge planning, social work referrals..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Handover'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Handovers List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : handovers.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No handovers yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Handover History
          </h3>
          {handovers.map((handover) => (
            <div
              key={handover.id}
              className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-3 space-y-2"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {handover.handoverTemplate}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(handover.handoverDateTime || handover.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">
                    Recorded
                  </span>
                </div>
              </div>

              {/* Key Points */}
              {handover.keyPoints && (
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <p className="text-xs text-gray-600 font-semibold">
                    Key Points
                  </p>
                  <p className="text-xs text-gray-800">
                    {handover.keyPoints}
                  </p>
                </div>
              )}

              {/* Clinical Update */}
              <div className="bg-white bg-opacity-50 p-2 rounded">
                <p className="text-xs text-gray-600 font-semibold">
                  Clinical Status
                </p>
                <p className="text-xs text-gray-800 line-clamp-3">
                  {handover.clinicalUpdate}
                </p>
              </div>

              {/* Pending Tasks */}
              {handover.tasksPending && handover.tasksPending.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                  <p className="text-xs text-gray-600 font-semibold mb-1">
                    📋 Pending Tasks
                  </p>
                  <ul className="space-y-1">
                    {handover.tasksPending.map((task, idx) => (
                      <li key={idx} className="text-xs text-gray-800">
                        • {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Alerts */}
              {handover.riskAlerts && (
                <div className="bg-red-50 border border-red-200 p-2 rounded">
                  <p className="text-xs text-red-700 font-semibold mb-1">
                    ⚠️ Risk Alerts
                  </p>
                  <p className="text-xs text-red-800">
                    {handover.riskAlerts}
                  </p>
                </div>
              )}

              {/* Nurse Info */}
              <div className="flex items-center gap-2 text-xs pt-2 border-t border-indigo-200">
                <div className="flex-1">
                  <p className="text-gray-600">By Nurse</p>
                  <p className="font-medium text-gray-900">
                    {handover.nurse?.firstName || 'Nurse'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">To Shift</p>
                  <p className="font-medium text-gray-900">
                    {handover.toShift || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handover Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3 mt-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">
          💡 Effective Handover Tips
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Include vital signs trends and current vitals</li>
          <li>• Flag any changes in condition or new concerns</li>
          <li>• List specific tasks for the next shift</li>
          <li>• Highlight family concerns or special requests</li>
        </ul>
      </div>
    </div>
  );
}

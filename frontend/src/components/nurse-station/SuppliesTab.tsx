'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InpatientAdmission, SupplyRequest } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { Package, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface SuppliesTabProps {
  admission: InpatientAdmission;
  wardId: string;
  userRole: string;
}

const SUPPLY_CATEGORIES = [
  'Dressings & Wound Care',
  'IV & Infusion',
  'Medications',
  'Diagnostic Equipment',
  'Monitoring Devices',
  'Personal Care',
  'Linens & Hygiene',
  'Other',
];

export default function SuppliesTab({
  admission,
  wardId,
  userRole,
}: SuppliesTabProps) {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStaffNurse = userRole.includes('STAFF_NURSE');

  const [formData, setFormData] = useState({
    category: '',
    itemName: '',
    quantity: 1,
    urgency: 'routine' as const,
    notes: '',
  });

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.listSupplyRequests(wardId);
      const patientRequests = data.filter(
        (r: any) => r.patientId === admission.patientId
      );
      setRequests(patientRequests || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load supply requests');
    } finally {
      setLoading(false);
    }
  }, [admission.id, wardId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaffNurse || !formData.category || !formData.itemName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await nurseStationAPI.requestSupply({
        patientId: admission.patientId,
        inpatientAdmissionId: admission.id,
        wardId: wardId,
        category: formData.category,
        itemName: formData.itemName,
        quantity: formData.quantity,
        urgency: formData.urgency,
        notes: formData.notes,
        location: `Bed ${admission.bedId}`,
      });
      setFormData({
        category: '',
        itemName: '',
        quantity: 1,
        urgency: 'routine',
        notes: '',
      });
      setShowRequestForm(false);
      await loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit supply request');
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      stat: 'bg-red-100 text-red-700',
      urgent: 'bg-orange-100 text-orange-700',
      routine: 'bg-blue-100 text-blue-700',
      scheduled: 'bg-green-100 text-green-700',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
      fulfilled: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      cancelled: <AlertCircle className="w-4 h-4 text-gray-400" />,
    };
    return icons[status] || <Package className="w-4 h-4 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-50 border-yellow-200',
      fulfilled: 'bg-green-50 border-green-200',
      cancelled: 'bg-gray-50 border-gray-200',
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
          <span>View only - only Staff Nurses can request supplies</span>
        </div>
      )}

      {/* Request Supply Button */}
      {isStaffNurse && !showRequestForm && (
        <button
          onClick={() => setShowRequestForm(true)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Supply
        </button>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <form
          onSubmit={handleSubmitRequest}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
        >
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select category...</option>
              {SUPPLY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              placeholder="e.g., Sterile Gauze Dressings"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urgency: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any special instructions or notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Supply Requests List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No supply requests yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Request History</h3>
          {requests.map((request) => (
            <div
              key={request.id}
              className={`border-2 rounded-lg p-3 ${getStatusColor(
                request.status
              )}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {request.itemName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {request.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getUrgencyColor(
                      request.urgency
                    )}`}
                  >
                    {request.urgency.toUpperCase()}
                  </span>
                  {getStatusIcon(request.status)}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-white bg-opacity-50 p-2 rounded mb-2">
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{request.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600">Requested</p>
                  <p className="font-medium text-gray-900">
                    {new Date(request.requestDateTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {request.status}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {request.notes && (
                <p className="text-xs text-gray-700 italic">
                  📝 {request.notes}
                </p>
              )}

              {/* Fulfillment Info */}
              {request.status === 'fulfilled' && request.fulfilledDateTime && (
                <p className="text-xs text-green-700 font-medium mt-2">
                  ✓ Fulfilled on{' '}
                  {new Date(request.fulfilledDateTime).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ward Supplies Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mt-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">
          📦 Need More Supplies?
        </p>
        <p className="text-xs text-gray-600">
          Check with the Ward Manager for critical supplies. For urgent needs,
          use the STAT urgency level.
        </p>
      </div>
    </div>
  );
}

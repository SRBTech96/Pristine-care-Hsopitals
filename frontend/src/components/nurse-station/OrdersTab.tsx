'use client';

import React, { useState, useEffect } from 'react';
import { InpatientAdmission, DoctorOrder } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { AlertCircle } from 'lucide-react';

interface OrdersTabProps {
  admission: InpatientAdmission;
}

export default function OrdersTab({ admission }: OrdersTabProps) {
  const [orders, setOrders] = useState<DoctorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [admission.id]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await nurseStationAPI.listDoctorOrders(
        admission.id,
        'active'
      );
      setOrders(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      medication: 'bg-blue-100 text-blue-700',
      procedure: 'bg-purple-100 text-purple-700',
      investigation: 'bg-green-100 text-green-700',
      diet: 'bg-orange-100 text-orange-700',
      activity: 'bg-cyan-100 text-cyan-700',
      observation: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No active orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              {/* Order Type & Priority */}
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${getOrderTypeColor(
                    order.orderType
                  )}`}
                >
                  {order.orderType.toUpperCase()}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    order.priority === 'stat'
                      ? 'bg-red-100 text-red-700'
                      : order.priority === 'urgent'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.priority.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="font-medium text-sm text-gray-900 mb-1">
                {order.description}
              </p>

              {/* Instructions */}
              {order.instructions && (
                <p className="text-xs text-gray-600 mb-2 italic">
                  📝 {order.instructions}
                </p>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded">
                <div>
                  <p className="text-gray-500">Ordered By</p>
                  <p className="font-medium text-gray-900">
                    Dr. {order.doctor?.firstName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ordered</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">
                    {order.status === 'active' ? '✓ Active' : order.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Approval</p>
                  <p className="font-medium text-gray-900">
                    {order.approvedById ? '✓ Approved' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

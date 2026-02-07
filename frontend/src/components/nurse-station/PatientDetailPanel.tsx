'use client';

import React, { useState, useEffect } from 'react';
import { InpatientAdmission, Bed } from '@/types/nurse-station';
import { X } from 'lucide-react';
import OrdersTab from './OrdersTab';
import MedicationsTab from './MedicationsTab';
import VitalsTab from './VitalsTab';
import EmergencyTab from './EmergencyTab';

type TabType = 'orders' | 'medications' | 'vitals' | 'emergency';

interface PatientDetailPanelProps {
  admission: InpatientAdmission;
  beds: Bed[];
  onClose: () => void;
  userRole: string;
}

export default function PatientDetailPanel({
  admission,
  beds,
  onClose,
  userRole,
}: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('medications');
  const bed = beds.find((b) => b.id === admission.bedId);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'medications', label: 'Medications', icon: '💊' },
    { id: 'vitals', label: 'Vitals', icon: '❤️' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex-shrink-0 z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {admission.patient?.firstName} {admission.patient?.lastName}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Bed {bed?.bedCode || 'N/A'} • {admission.admissionType === 'emergency' ? '🚨 Emergency' : ''}
              {admission.isIcu ? '🏥 ICU' : ''}
              {admission.isNicu ? '👶 NICU' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded">
          <div>
            <p className="text-gray-500">Admitted</p>
            <p className="font-medium text-gray-900">
              {new Date(admission.admissionDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Doctor</p>
            <p className="font-medium text-gray-900 truncate">
              Dr. {admission.attendingDoctor?.firstName || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-50 border-b border-gray-200 px-4 pt-2 flex-shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-t whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'orders' && (
          <OrdersTab admission={admission} />
        )}
        {activeTab === 'medications' && (
          <MedicationsTab admission={admission} userRole={userRole} />
        )}
        {activeTab === 'vitals' && (
          <VitalsTab admission={admission} userRole={userRole} />
        )}
        {activeTab === 'emergency' && (
          <EmergencyTab admission={admission} userRole={userRole} />
        )}
      </div>
    </div>
  );
}

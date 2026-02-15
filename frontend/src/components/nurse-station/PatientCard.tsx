'use client';

import React, { useState } from 'react';
import {
  InpatientAdmission,
  Ward,
} from '@/types/nurse-station';
import { Activity, MessageSquare, AlertTriangle, Package, Briefcase, TrendingUp, User } from 'lucide-react';

// Import Tab Components
import VitalsChartsTab from './VitalsChartsTab';
import CommunicationTab from './CommunicationTab';
import EmergencyTab from './EmergencyTab';
import SuppliesTab from './SuppliesTab';
import HandoverTab from './HandoverTab';

interface PatientCardProps {
  admission: InpatientAdmission;
  ward?: Ward;
  userRole: string;
  currentUser?: { id: string; firstName: string; lastName: string };
}

type TabType =
  | 'overview'
  | 'vitals'
  | 'communication'
  | 'emergency'
  | 'supplies'
  | 'handover';

const TABS: {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
  { id: 'vitals', label: 'Vitals', icon: <TrendingUp className="w-4 h-4" /> },
  {
    id: 'communication',
    label: 'Messages',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  { id: 'supplies', label: 'Supplies', icon: <Package className="w-4 h-4" /> },
  {
    id: 'handover',
    label: 'Handover',
    icon: <Briefcase className="w-4 h-4" />,
  },
];

export default function PatientCard({
  admission,
  ward,
  userRole,
  currentUser,
}: PatientCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expanded, setExpanded] = useState(true);

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      admitted: 'bg-blue-100 text-blue-700',
      in_treatment: 'bg-green-100 text-green-700',
      critical: 'bg-red-100 text-red-700',
      stable: 'bg-green-100 text-green-700',
      ready_for_discharge: 'bg-yellow-100 text-yellow-700',
      discharged: 'bg-gray-100 text-gray-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 overflow-hidden transition-all shadow-sm">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Patient Name and ID */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {(admission.patientName || 'P').charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {admission.patientName}
                </p>
                <p className="text-xs text-gray-600">
                  ID: {admission.patientId}
                </p>
              </div>
            </div>

            {/* Patient Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600 font-semibold">Age</p>
                <p className="text-gray-900">{admission.patientAge} years</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Bed</p>
                <p className="text-gray-900">Bed {admission.bedId}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Doctor</p>
                <p className="text-gray-900">
                  {admission.attendingDoctor?.firstName || 'Assigned'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Duration</p>
                <p className="text-gray-900">
                  {Math.floor(
                    (Date.now() -
                      new Date(admission.admissionDateTime || admission.admissionDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(
                admission.status
              )}`}
            >
              {admission.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-semibold px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <>
          {/* Tab Navigation */}
          <div className="border-b-2 border-gray-200 flex overflow-x-auto bg-gray-50">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-96 bg-white">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-4 space-y-4">
                {/* Patient Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">Patient Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 font-semibold">Full Name</p>
                      <p className="text-gray-900">
                        {admission.patientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Gender</p>
                      <p className="text-gray-900">
                        {admission.patientGender || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Date of Birth</p>
                      <p className="text-gray-900">
                        {admission.dateOfBirth
                          ? new Date(
                              admission.dateOfBirth
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Admission</p>
                      <p className="text-gray-900">
                        {new Date(
                          admission.admissionDateTime || admission.admissionDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Medical Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600 font-semibold">
                        Primary Diagnosis
                      </p>
                      <p className="text-gray-900">
                        {admission.primaryDiagnosis || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">
                        Medical History
                      </p>
                      <p className="text-gray-900">
                        {admission.medicalHistory || 'None recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Allergies</p>
                      <p className="text-gray-900 font-semibold text-red-700">
                        {admission.allergies || 'None known'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">Medications</h3>
                  <p className="text-sm text-gray-700">
                    {admission.currentMedications || 'No medications listed'}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Emergency Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600 font-semibold">Name</p>
                      <p className="text-gray-900">
                        {admission.emergencyContactName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Phone</p>
                      <p className="text-gray-900">
                        {admission.emergencyContactPhone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Chart Tab */}
            {activeTab === 'vitals' && (
              <VitalsChartsTab admission={admission} />
            )}

            {/* Communication Tab */}
            {activeTab === 'communication' && (
              <CommunicationTab
                admission={admission}
                ward={ward}
                userRole={userRole}
                currentUser={currentUser}
              />
            )}

            {/* Emergency Tab */}
            {activeTab === 'emergency' && (
              <EmergencyTab
                admission={admission}
                userRole={userRole}
              />
            )}

            {/* Supplies Tab */}
            {activeTab === 'supplies' && (
              <SuppliesTab
                admission={admission}
                wardId={admission.wardId}
                userRole={userRole}
              />
            )}

            {/* Handover Tab */}
            {activeTab === 'handover' && (
              <HandoverTab
                admission={admission}
                wardId={admission.wardId}
                userRole={userRole}
              />
            )}
          </div>
        </>
      )}

      {/* Collapsed State - Quick Info */}
      {!expanded && (
        <div className="p-3 flex items-center justify-between bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <span>
            {admission.patientAge} years old • Bed {admission.bedId}
          </span>
          <span
            className={`font-semibold px-2 py-1 rounded ${getStatusBadge(
              admission.status
            )}`}
          >
            {admission.status.replace(/_/g, ' ')}
          </span>
        </div>
      )}
    </div>
  );
}

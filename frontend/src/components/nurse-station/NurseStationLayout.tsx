'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Home, LogOut } from 'lucide-react';
import { Ward, User, InpatientAdmission, Bed } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import WardSelector from './WardSelector';
import BedGrid from './BedGrid';
import PatientDetailPanel from './PatientDetailPanel';
import HeadNursePanel from './HeadNursePanel';
import { useAuth } from '@/hooks/useAuth';

interface NurseStationLayoutProps {
  user: User;
}

export default function NurseStationLayout({ user }: NurseStationLayoutProps) {
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<InpatientAdmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const isHeadNurse = user.roles.includes('HEAD_NURSE');
  const isStaffNurse = user.roles.includes('STAFF_NURSE');
  const isDoctor = user.roles.includes('DOCTOR');

  // Check permission
  if (!isHeadNurse && !isStaffNurse && !isDoctor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this module.</p>
        </div>
      </div>
    );
  }

  // Load wards on mount
  useEffect(() => {
    loadWards();
  }, []);

  // Load beds when ward is selected
  useEffect(() => {
    if (selectedWardId) {
      loadBeds();
    }
  }, [selectedWardId]);

  // Set up auto-refresh (every 30 seconds)
  useEffect(() => {
    if (selectedWardId) {
      const interval = setInterval(() => {
        loadBeds();
        loadAdmissions();
      }, 30000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [selectedWardId]);

  const loadWards = async () => {
    try {
      setLoading(true);
      const response = await nurseStationAPI.listWards();
      setWards(response.data);
      if (response.data.length > 0) {
        // Auto-select first ward for staff nurse, first in list for head nurse
        setSelectedWardId(response.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wards');
    } finally {
      setLoading(false);
    }
  };

  const loadBeds = async () => {
    if (!selectedWardId) return;
    try {
      const response = await nurseStationAPI.listBeds(selectedWardId);
      setBeds(response.data);
    } catch (err: any) {
      console.error('Failed to load beds:', err);
    }
  };

  const loadAdmissions = async () => {
    if (!selectedWardId) return;
    try {
      const response = await nurseStationAPI.listInpatientAdmissions(selectedWardId, 'active');
      setAdmissions(response.data);
    } catch (err: any) {
      console.error('Failed to load admissions:', err);
    }
  };

  const handleBedClick = async (bedId: string) => {
    setSelectedBedId(bedId);
    const bed = beds.find((b) => b.id === bedId);
    if (bed?.currentPatientId) {
      // Find admission for this patient in this ward
      const admission = admissions.find(
        (a) => a.patientId === bed.currentPatientId && a.wardId === selectedWardId
      );
      if (admission) {
        setSelectedAdmission(admission);
      }
    } else {
      setSelectedAdmission(null);
    }
  };

  const handleRefresh = async () => {
    await loadBeds();
    await loadAdmissions();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ward Station</h1>
                <p className="text-sm text-gray-500">
                  {isHeadNurse
                    ? 'Floor In-Charge'
                    : isStaffNurse
                    ? 'Staff Nurse'
                    : 'Doctor'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-sm font-medium text-red-600 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Ward/Nurse Management */}
        {isHeadNurse && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <HeadNursePanel
              selectedWardId={selectedWardId}
              wards={wards}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Ward Selector */}
          <div className="bg-white border-b border-gray-200 shadow-sm p-4">
            <WardSelector
              wards={wards}
              selectedWardId={selectedWardId}
              onWardChange={setSelectedWardId}
              isHeadNurse={isHeadNurse}
              onRefresh={handleRefresh}
              loading={loading}
            />
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Bed Grid */}
            <div className="flex-1 overflow-auto">
              {selectedWardId ? (
                <BedGrid
                  beds={beds}
                  admissions={admissions}
                  selectedBedId={selectedBedId}
                  onBedClick={handleBedClick}
                  loading={loading}
                  wardId={selectedWardId}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500">Select a ward to view beds</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Patient Details */}
            {selectedAdmission && (
              <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
                <PatientDetailPanel
                  admission={selectedAdmission}
                  beds={beds}
                  onClose={() => {
                    setSelectedAdmission(null);
                    setSelectedBedId(null);
                  }}
                  userRole={user.roles[0]}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-xs text-gray-500 text-center">
          Auto-refreshing every 30 seconds • Last update:{' '}
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

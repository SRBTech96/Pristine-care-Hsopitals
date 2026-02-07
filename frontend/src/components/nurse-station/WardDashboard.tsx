'use client';

import React, { useState, useEffect } from 'react';
import {
  InpatientAdmission,
  Ward,
} from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import PatientCard from './PatientCard';
import {
  LayoutGrid,
  List,
  Filter,
  AlertTriangle,
  Users,
  TrendingDown,
} from 'lucide-react';

interface WardDashboardProps {
  wardId: string;
  userRole: string;
  currentUser?: { id: string; firstName: string; lastName: string };
}

type ViewMode = 'grid' | 'list';
type FilterStatus =
  | 'all'
  | 'critical'
  | 'stable'
  | 'ready_for_discharge'
  | 'in_treatment';

export default function WardDashboard({
  wardId,
  userRole,
  currentUser,
}: WardDashboardProps) {
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [ward, setWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bed' | 'admission'>('bed');

  useEffect(() => {
    loadWardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadWardData, 30000);
    return () => clearInterval(interval);
  }, [wardId]);

  const loadWardData = async () => {
    try {
      setLoading(true);
      const [admissionsRes, wardRes] = await Promise.all([
        nurseStationAPI.listInpatientAdmissions(wardId),
        nurseStationAPI.getWard(wardId),
      ]);
      setAdmissions(admissionsRes.data || []);
      setWard(wardRes.data || null);
    } catch (err: any) {
      setError('Failed to load ward data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort admissions
  let filteredAdmissions = admissions.filter((admission) => {
    if (filterStatus !== 'all' && admission.status !== filterStatus) {
      return false;
    }
    if (
      searchQuery &&
      !admission.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !admission.patientId.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  filteredAdmissions.sort((a, b) => {
    if (sortBy === 'name') {
      return a.patientName.localeCompare(b.patientName);
    } else if (sortBy === 'bed') {
      return parseInt(a.bedId) - parseInt(b.bedId);
    } else if (sortBy === 'admission') {
      return (
        new Date(b.admissionDateTime).getTime() -
        new Date(a.admissionDateTime).getTime()
      );
    }
    return 0;
  });

  // Calculate statistics
  const stats = {
    total: admissions.length,
    critical: admissions.filter((a) => a.status === 'critical').length,
    stable: admissions.filter((a) => a.status === 'stable').length,
    readyForDischarge: admissions.filter(
      (a) => a.status === 'ready_for_discharge'
    ).length,
  };

  const statusColors: { [key: string]: string } = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    stable: 'bg-green-100 text-green-700 border-green-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Ward Dashboard</h1>
            <p className="text-blue-100">{ward?.wardName || 'Ward'}</p>
          </div>
          <button
            onClick={loadWardData}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-30" />
          </div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.critical}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600 opacity-30" />
          </div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Stable</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.stable}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-600 opacity-30" />
          </div>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Ready to Discharge</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.readyForDischarge}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-600 opacity-30" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex gap-2 justify-between items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
          />

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Patients</option>
              <option value="critical">Critical</option>
              <option value="in_treatment">In Treatment</option>
              <option value="stable">Stable</option>
              <option value="ready_for_discharge">Ready for Discharge</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'name' | 'bed' | 'admission')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="bed">Bed Number</option>
              <option value="name">Patient Name</option>
              <option value="admission">Admission Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading ward data...</p>
          </div>
        </div>
      ) : filteredAdmissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-lg font-semibold">
            {admissions.length === 0
              ? 'No patients in this ward'
              : 'No patients match the filters'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
          {filteredAdmissions.map((admission) => (
            <PatientCard
              key={admission.id}
              admission={admission}
              ward={ward || undefined}
              userRole={userRole}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAdmissions.map((admission) => (
            <div
              key={admission.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {admission.patientName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    ID: {admission.patientId} • Bed {admission.bedId} •{' '}
                    {admission.patientAge} years
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                      statusColors[admission.status] ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {admission.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-600">
                    Dr. {admission.attendingDoctor?.firstName || 'Unassigned'}
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

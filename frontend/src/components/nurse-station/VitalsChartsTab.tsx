'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InpatientAdmission } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';
import { Activity, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface VitalsChartsTabProps {
  admission: InpatientAdmission;
}

interface VitalRecord {
  timestamp: Date;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export default function VitalsChartsTab({ admission }: VitalsChartsTabProps) {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h' | '7d'>('24h');
  const [latestVitals, setLatestVitals] = useState<VitalRecord | null>(null);

  const loadVitals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.getAdmissionVitals(
        admission.id,
        timeRange
      );
      const vitalsData = data || [];
      setVitals(vitalsData);
      if (vitalsData.length > 0) {
        setLatestVitals(vitalsData[vitalsData.length - 1]);
      }
    } catch (err: any) {
      setError('Failed to load vital signs');
    } finally {
      setLoading(false);
    }
  }, [admission.id, timeRange]);

  useEffect(() => {
    loadVitals();
  }, [loadVitals]);

  const getVitalStatus = (value: number | undefined, vitalType: string) => {
    if (!value) return 'unknown';

    const ranges: { [key: string]: { low: number; high: number } } = {
      heartRate: { low: 60, high: 100 },
      temperature: { low: 36.5, high: 37.5 },
      respiratoryRate: { low: 12, high: 20 },
      oxygenSaturation: { low: 95, high: 100 },
      systolic: { low: 90, high: 120 },
      diastolic: { low: 60, high: 80 },
    };

    const range = ranges[vitalType];
    if (!range) return 'unknown';

    if (value < range.low) return 'low';
    if (value > range.high) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      low: 'text-blue-600 bg-blue-50',
      high: 'text-red-600 bg-red-50',
      normal: 'text-green-600 bg-green-50',
      unknown: 'text-gray-600 bg-gray-50',
    };
    return colors[status] || colors.unknown;
  };

  const getStatusIndicator = (status: string) => {
    const indicators: { [key: string]: React.ReactNode } = {
      low: <TrendingDown className="w-4 h-4" />,
      high: <TrendingUp className="w-4 h-4" />,
      normal: <Activity className="w-4 h-4" />,
      unknown: <AlertCircle className="w-4 h-4" />,
    };
    return indicators[status] || indicators.unknown;
  };

  const VitalCard = ({
    label,
    value,
    unit,
    vitalType,
    icon,
  }: {
    label: string;
    value: number | undefined;
    unit: string;
    vitalType: string;
    icon: React.ReactNode;
  }) => {
    const status = getVitalStatus(value, vitalType);
    const isAbnormal = status !== 'normal' && status !== 'unknown';

    return (
      <div
        className={`p-3 rounded-lg border-2 transition-colors ${
          isAbnormal
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700">{label}</p>
          <div className={`p-1.5 rounded ${getStatusColor(status)}`}>
            {getStatusIndicator(status)}
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {value !== undefined ? value.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{unit}</p>
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
        {isAbnormal && (
          <p className="text-xs text-red-700 font-semibold mt-2">
            ⚠️ {status.toUpperCase()}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['6h', '12h', '24h', '7d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range === '6h'
              ? '6 Hours'
              : range === '12h'
                ? '12 Hours'
                : range === '24h'
                  ? '24 Hours'
                  : '7 Days'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : latestVitals ? (
        <>
          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              Last Updated:{' '}
              <span className="font-semibold text-gray-900">
                {new Date(latestVitals.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          {/* Vital Signs Grid */}
          <div className="grid grid-cols-2 gap-2">
            <VitalCard
              label="Heart Rate"
              value={latestVitals.heartRate}
              unit="bpm"
              vitalType="heartRate"
              icon="❤️"
            />
            <VitalCard
              label="Temperature"
              value={latestVitals.temperature}
              unit="°C"
              vitalType="temperature"
              icon="🌡️"
            />
            <VitalCard
              label="Respiratory Rate"
              value={latestVitals.respiratoryRate}
              unit="breaths/min"
              vitalType="respiratoryRate"
              icon="💨"
            />
            <VitalCard
              label="O2 Saturation"
              value={latestVitals.oxygenSaturation}
              unit="%"
              vitalType="oxygenSaturation"
              icon="🫁"
            />
          </div>

          {/* Blood Pressure */}
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              🩸 Blood Pressure
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {latestVitals.bloodPressureSystolic || '—'}/
                  {latestVitals.bloodPressureDiastolic || '—'}
                </p>
                <p className="text-xs text-gray-600 mt-1">mmHg</p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  getVitalStatus(
                    latestVitals.bloodPressureSystolic,
                    'systolic'
                  ) !== 'normal'
                    ? 'bg-red-100'
                    : 'bg-green-100'
                }`}
              >
                <Activity className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>

          {/* Trends Section */}
          {vitals.length > 1 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                📊 Trends ({timeRange})
              </p>
              <div className="space-y-2 text-xs">
                {vitals.length >= 2 && (
                  <>
                    {latestVitals.heartRate &&
                      vitals[vitals.length - 2].heartRate && (
                        <div className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-gray-700">Heart Rate:</span>
                          <span className="font-semibold">
                            {latestVitals.heartRate >
                            vitals[vitals.length - 2].heartRate!
                              ? '📈 +'
                              : '📉 '}
                            {Math.abs(
                              latestVitals.heartRate -
                                vitals[vitals.length - 2].heartRate!
                            ).toFixed(0)}{' '}
                            bpm
                          </span>
                        </div>
                      )}
                    {latestVitals.temperature &&
                      vitals[vitals.length - 2].temperature && (
                        <div className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-gray-700">Temperature:</span>
                          <span className="font-semibold">
                            {latestVitals.temperature >
                            vitals[vitals.length - 2].temperature!
                              ? '📈 +'
                              : '📉 '}
                            {Math.abs(
                              latestVitals.temperature -
                                vitals[vitals.length - 2].temperature!
                            ).toFixed(1)}
                            °C
                          </span>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              ⚠️ Action Items
            </p>
            <ul className="space-y-1 text-xs text-gray-700">
              {Object.entries({
                heartRate: latestVitals.heartRate,
                temperature: latestVitals.temperature,
                oxygen: latestVitals.oxygenSaturation,
              }).map(([key, value]) => {
                const status = getVitalStatus(
                  value,
                  key === 'oxygen' ? 'oxygenSaturation' : key
                );
                if (status !== 'normal') {
                  return (
                    <li key={key} className="flex items-center gap-1">
                      <span className="text-red-600">•</span>
                      Review{' '}
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {status}
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No vital signs recorded yet</p>
        </div>
      )}
    </div>
  );
}

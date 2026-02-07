'use client';

import React, { useMemo } from 'react';
import { Bed, InpatientAdmission } from '@/types/nurse-station';
import BedCard from './BedCard';

interface BedGridProps {
  beds: Bed[];
  admissions: InpatientAdmission[];
  selectedBedId: string | null;
  onBedClick: (bedId: string) => void;
  loading: boolean;
  wardId: string;
}

type BedColorState = 'green' | 'red' | 'yellow' | 'orange';

export default function BedGrid({
  beds,
  admissions,
  selectedBedId,
  onBedClick,
  loading,
  wardId,
}: BedGridProps) {
  const bedStates = useMemo(() => {
    return beds.map((bed) => {
      const admission = admissions.find((a) => a.bedId === bed.id);
      let colorState: BedColorState = 'green';

      if (bed.status === 'maintenance') {
        colorState = 'orange';
      } else if (bed.status === 'reserved') {
        colorState = 'yellow';
      } else if (bed.status === 'occupied' && admission) {
        colorState = 'red';
      } else if (bed.status === 'vacant') {
        colorState = 'green';
      }

      return {
        bed,
        admission,
        colorState,
      };
    });
  }, [beds, admissions]);

  // Group beds by room number
  const bedsByRoom = useMemo(() => {
    const grouped: { [key: string]: typeof bedStates } = {};
    bedStates.forEach((bs) => {
      const room = bs.bed.roomNumber || 'Unknown';
      if (!grouped[room]) grouped[room] = [];
      grouped[room].push(bs);
    });
    return grouped;
  }, [bedStates]);

  // Color legend
  const colorLegend: { color: BedColorState; label: string; description: string }[] = [
    { color: 'green', label: 'Vacant', description: 'Available for admission' },
    { color: 'red', label: 'Occupied', description: 'Patient admitted' },
    { color: 'yellow', label: 'Reserved', description: 'Pending or reserved' },
    { color: 'orange', label: 'Maintenance', description: 'Under maintenance' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Legend */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colorLegend.map((item) => (
            <div key={item.color} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: {
                    green: '#22c55e',
                    red: '#ef4444',
                    yellow: '#eab308',
                    orange: '#f97316',
                  }[item.color],
                }}
              />
              <div className="text-xs">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bed Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
              <p className="text-gray-500">Loading beds...</p>
            </div>
          </div>
        ) : bedStates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No beds found in this ward</p>
              <p className="text-xs text-gray-400">Check ward selection or try refreshing</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(bedsByRoom).map(([room, roomBeds]) => (
              <div key={room} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 px-2">
                  Room {room}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {roomBeds.map(({ bed, admission, colorState }) => (
                    <BedCard
                      key={bed.id}
                      bed={bed}
                      admission={admission}
                      colorState={colorState}
                      isSelected={selectedBedId === bed.id}
                      onClick={() => onBedClick(bed.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex gap-4">
            <span>
              <span className="font-medium">{bedStates.filter((b) => b.colorState === 'green').length}</span> Vacant
            </span>
            <span>
              <span className="font-medium">{bedStates.filter((b) => b.colorState === 'red').length}</span> Occupied
            </span>
            <span>
              <span className="font-medium">{bedStates.filter((b) => b.colorState === 'yellow').length}</span> Pending
            </span>
            <span>
              <span className="font-medium">{bedStates.filter((b) => b.colorState === 'orange').length}</span> Maintenance
            </span>
          </div>
          <span>Total: {bedStates.length} beds</span>
        </div>
      </div>
    </div>
  );
}

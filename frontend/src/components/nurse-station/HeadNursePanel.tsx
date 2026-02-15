'use client';

import React from 'react';
import { Ward } from '@/types/nurse-station';

interface HeadNursePanelProps {
  selectedWardId: string | null;
  wards: Ward[];
  onRefresh: () => void;
}

export default function HeadNursePanel({
  selectedWardId,
  wards,
  onRefresh,
}: HeadNursePanelProps) {
  const selectedWard = wards.find((w) => w.id === selectedWardId);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Head Nurse Panel</h3>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {selectedWard ? (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">{selectedWard.name}</p>
            <p className="text-xs text-blue-700 mt-1">
              Floor {selectedWard.floorNumber} &bull; {selectedWard.building}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {selectedWard.totalBeds} beds total
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Ward Overview</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                <p className="text-lg font-bold text-green-700">{selectedWard.totalBeds}</p>
                <p className="text-xs text-green-600">Total Beds</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                <p className="text-lg font-bold text-gray-700">{selectedWard.code}</p>
                <p className="text-xs text-gray-600">Ward Code</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Select a ward to view details</p>
        </div>
      )}

      {/* Ward List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">All Wards</h4>
        {wards.map((ward) => (
          <div
            key={ward.id}
            className={`p-2 rounded border text-sm cursor-pointer transition-colors ${
              ward.id === selectedWardId
                ? 'bg-blue-100 border-blue-300 text-blue-900'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <p className="font-medium">{ward.name}</p>
            <p className="text-xs text-gray-500">{ward.totalBeds} beds &bull; {ward.building}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

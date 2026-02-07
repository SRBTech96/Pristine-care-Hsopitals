'use client';

import React from 'react';
import { Ward } from '@/types/nurse-station';
import { RefreshCw } from 'lucide-react';

interface WardSelectorProps {
  wards: Ward[];
  selectedWardId: string | null;
  onWardChange: (wardId: string) => void;
  isHeadNurse: boolean;
  onRefresh: () => void;
  loading: boolean;
}

export default function WardSelector({
  wards,
  selectedWardId,
  onWardChange,
  isHeadNurse,
  onRefresh,
  loading,
}: WardSelectorProps) {
  const selectedWard = wards.find((w) => w.id === selectedWardId);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Ward Selection */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Ward / Floor
        </label>
        <div className="flex gap-2 flex-wrap">
          {wards.length > 0 ? (
            wards.map((ward) => (
              <button
                key={ward.id}
                onClick={() => onWardChange(ward.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedWardId === ward.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="block text-xs opacity-75">
                  Floor {ward.floorNumber}
                </span>
                {ward.name}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No wards available</p>
          )}
        </div>
      </div>

      {/* Ward Details & Refresh Button */}
      {selectedWard && (
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-2">
            <p className="font-medium text-gray-900">{selectedWard.name}</p>
            <p className="text-xs text-gray-500">
              Total Beds: {selectedWard.totalBeds}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
            <span className="text-xs font-medium">Refresh</span>
          </button>
        </div>
      )}
    </div>
  );
}

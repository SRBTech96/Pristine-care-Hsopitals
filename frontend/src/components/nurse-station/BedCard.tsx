'use client';

import React from 'react';
import { Bed, InpatientAdmission } from '@/types/nurse-station';
import { AlertCircle, User } from 'lucide-react';

interface BedCardProps {
  bed: Bed;
  admission: InpatientAdmission | undefined;
  colorState: 'green' | 'red' | 'yellow' | 'orange';
  isSelected: boolean;
  onClick: () => void;
}

export default function BedCard({
  bed,
  admission,
  colorState,
  isSelected,
  onClick,
}: BedCardProps) {
  const colorMap = {
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  };

  const colors = colorMap[colorState];

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border-2 transition-all hover:shadow-md ${colors.bg} ${
        isSelected
          ? `${colors.border} shadow-lg ring-2 ring-offset-2 ring-blue-500`
          : `${colors.border} border-opacity-40`
      } text-left`}
    >
      {/* Bed Number */}
      <div className="mb-2">
        <p className={`font-bold text-lg ${colors.text}`}>{bed.bedCode}</p>
        <p className="text-xs text-gray-500">Room {bed.roomNumber}</p>
      </div>

      {/* Patient Info or Status */}
      {admission && admission.patient ? (
        <>
          {/* Patient Name */}
          <div className="mb-1 min-h-8">
            <p className="text-sm font-medium text-gray-900 truncate flex items-start gap-1">
              <User className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">
                {admission.patient.firstName} {admission.patient.lastName}
              </span>
            </p>
          </div>

          {/* Diagnosis */}
          {admission.chiefComplaint && (
            <p className="text-xs text-gray-600 truncate">{admission.chiefComplaint}</p>
          )}

          {/* Doctor */}
          {admission.attendingDoctor && (
            <p className="text-xs text-gray-500 truncate">
              Dr. {admission.attendingDoctor.firstName}
            </p>
          )}

          {/* Emergency Badge */}
          {admission.status !== 'active' && (
            <div className="mt-1 flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs font-medium capitalize">
                {admission.status}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-gray-400 italic">
          {bed.status === 'maintenance' ? 'Under Maintenance' : 'No Patient'}
        </div>
      )}
    </button>
  );
}

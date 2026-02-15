'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import WardDashboard from '@/components/nurse-station/WardDashboard';
import { AlertCircle } from 'lucide-react';

export default function NurseStationPage() {
  const params = useParams();
  const wardId = params?.wardId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('STAFF_NURSE');
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    // In a real app, you would fetch the current user from auth context
    // For now, using mock data
    setCurrentUser({ id: 'nurse-1', firstName: 'Sarah', lastName: 'Johnson' });
    setLoading(false);
  }, []);

  if (!wardId) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Invalid Ward</p>
            <p className="text-sm text-red-700 mt-1">
              Please select a valid ward to access the Nurse Station.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Nurse Station...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <WardDashboard
          wardId={wardId}
          userRole={userRole}
          currentUser={currentUser || undefined}
        />
      </div>
    </div>
  );
}

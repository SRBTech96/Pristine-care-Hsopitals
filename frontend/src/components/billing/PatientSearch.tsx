"use client";

import React, { useState, useCallback } from "react";
import { Search, Loader, AlertCircle } from "lucide-react";
import { Patient } from "@/types";
import { billingApi } from "@/lib/billing-api";

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  disabled?: boolean;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  onPatientSelect,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patients = await billingApi.searchPatients(query);
      setResults(patients);
      setShowResults(true);
    } catch (err) {
      setError("Failed to search patients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Search Patient *
      </label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter patient name, ID, or UHID..."
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="w-5 h-5 text-pristine-600 animate-spin" />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="max-h-64 overflow-y-auto">
              {results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-left px-4 py-3 hover:bg-pristine-50 border-b border-gray-200 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {patient.uhid && <span>UHID: {patient.uhid} • </span>}
                    {patient.phone}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {showResults && results.length === 0 && !loading && searchQuery && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-600">
            No patients found
          </div>
        )}
      </div>
    </div>
  );
};

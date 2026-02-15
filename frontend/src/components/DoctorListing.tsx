"use client";

import React, { useState, useEffect } from "react";
import { DepartmentGroup } from "@/types";
import { groupDoctorsByDepartment } from "@/lib/doctor-utils";
import { appointmentApi } from "@/lib/appointment-api";
import { DepartmentSection } from "./DepartmentSection";
import { AlertCircle, Loader } from "lucide-react";

interface DoctorListingProps {
  title?: string;
  subtitle?: string;
}

export const DoctorListing: React.FC<DoctorListingProps> = ({
  title = "Our Medical Team",
  subtitle = "Expert physicians and specialists dedicated to your health",
}) => {
  const [departments, setDepartments] = useState<DepartmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const publicDoctors = await appointmentApi.listPublicDoctors();
        const doctors = publicDoctors.map((doc) => ({
          id: doc.id,
          firstName: doc.firstName,
          lastName: doc.lastName,
          email: doc.email,
          phone: doc.phone || "",
          qualifications: [],
          specialization: doc.specializationName,
          yearsOfExperience: doc.yearsOfExperience,
          registrationNumber: undefined,
          bio: undefined,
        }));
        const grouped = groupDoctorsByDepartment(doctors);
        setDepartments(grouped);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        setError("Failed to load doctor information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-b from-pristine-50 to-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-pristine-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading doctor information...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Unable to Load Doctors</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Departments List */}
        {!loading && !error && departments.length > 0 && (
          <div className="space-y-0">
            {departments.map((department) => (
              <DepartmentSection
                key={department.specialization}
                department={department}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && departments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">
              No doctors available at the moment.
            </p>
            <p className="text-gray-500 text-sm">
              Please check back later or contact us directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

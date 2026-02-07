import React from "react";
import { DepartmentGroup } from "@/types";
import { DoctorCard } from "./DoctorCard";
import { getDepartmentIcon } from "@/lib/doctor-utils";

interface DepartmentSectionProps {
  department: DepartmentGroup;
}

export const DepartmentSection: React.FC<DepartmentSectionProps> = ({
  department,
}) => {
  const icon = getDepartmentIcon(department.specialization);

  return (
    <section className="py-12 md:py-16 border-b border-gray-200 last:border-b-0">
      {/* Department Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{icon}</div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {department.departmentName}
            </h2>
            <p className="text-gray-600 mt-1">
              Specialized care and expertise in {department.departmentName.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="divider mt-6" />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {department.doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {/* Department Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="bg-pristine-50 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Specialists</p>
            <p className="text-3xl font-bold text-pristine-700">
              {department.doctors.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Experience</p>
            <p className="text-3xl font-bold text-pristine-700">
              {Math.round(
                department.doctors.reduce((sum, doc) => sum + doc.yearsOfExperience, 0) /
                  department.doctors.length
              )}+ yrs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

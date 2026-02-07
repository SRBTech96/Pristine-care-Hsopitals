import React from "react";
import { Doctor } from "@/types";
import { formatDoctorName, getDoctorTitle, getExperienceBadge } from "@/lib/doctor-utils";
import { Mail, Phone, Award } from "lucide-react";

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <div className="card-premium group cursor-pointer">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {formatDoctorName(doctor)}
          </h3>
          <p className="text-sm text-pristine-600 font-semibold mb-3">
            {doctor.specialization}
          </p>
        </div>

        {/* Experience Badge */}
        <div className="ml-4">
          <div className="bg-pristine-50 text-pristine-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
            {doctor.yearsOfExperience}+ yrs
          </div>
        </div>
      </div>

      {/* Qualifications */}
      {doctor.qualifications && doctor.qualifications.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-700 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-pristine-600" />
            <span className="font-semibold">Qualifications</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {doctor.qualifications.map((qual, idx) => (
              <span
                key={idx}
                className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {qual}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio/Description */}
      {doctor.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {doctor.bio}
        </p>
      )}

      {/* Contact Information */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        {doctor.email && (
          <a
            href={`mailto:${doctor.email}`}
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-pristine-600 smooth-transition"
          >
            <Mail className="w-4 h-4" />
            <span className="text-xs md:text-sm">{doctor.email}</span>
          </a>
        )}

        {doctor.phone && (
          <a
            href={`tel:${doctor.phone}`}
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-pristine-600 smooth-transition"
          >
            <Phone className="w-4 h-4" />
            <span className="text-xs md:text-sm">{doctor.phone}</span>
          </a>
        )}

        {doctor.registrationNumber && (
          <p className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-semibold">Reg:</span>
            {doctor.registrationNumber}
          </p>
        )}
      </div>

      {/* Experience Level */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Level
          </span>
          <span className="text-sm font-bold text-pristine-700">
            {getExperienceBadge(doctor.yearsOfExperience)}
          </span>
        </div>
      </div>

      {/* Hover effect indicator */}
      <div className="absolute inset-0 rounded-lg border-2 border-pristine-500 opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none" />
    </div>
  );
};

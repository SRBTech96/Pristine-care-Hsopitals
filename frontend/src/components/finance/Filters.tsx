"use client";

import React from "react";

interface FiltersProps {
  startDate?: string;
  endDate?: string;
  doctors?: { id: string; name: string }[];
  departments?: { id: string; name: string }[];
  onChange: (filters: { startDate?: string; endDate?: string; doctorId?: string; departmentId?: string }) => void;
}

export const Filters: React.FC<FiltersProps> = ({ startDate, endDate, doctors = [], departments = [], onChange }) => {
  const [s, setS] = React.useState(startDate || "");
  const [e, setE] = React.useState(endDate || "");
  const [doctor, setDoctor] = React.useState("");
  const [department, setDepartment] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => onChange({ startDate: s || undefined, endDate: e || undefined, doctorId: doctor || undefined, departmentId: department || undefined }), 300);
    return () => clearTimeout(t);
  }, [s, e, doctor, department]);

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm text-gray-700">Start Date</label>
          <input type="date" value={s} onChange={(v) => setS(v.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">End Date</label>
          <input type="date" value={e} onChange={(v) => setE(v.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Doctor</label>
          <select value={doctor} onChange={(v) => setDoctor(v.target.value)} className="mt-1 block w-full border rounded px-2 py-1">
            <option value="">All</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Department</label>
          <select value={department} onChange={(v) => setDepartment(v.target.value)} className="mt-1 block w-full border rounded px-2 py-1">
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

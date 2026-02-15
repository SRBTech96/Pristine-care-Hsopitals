"use client";

import React from "react";
import { AuthGate } from "@/components/internal/AuthGate";
import { InternalShell } from "@/components/internal/InternalShell";
import { getMyDoctorProfile, getDoctorAvailability } from "@/lib/doctor-api";
import { listAppointmentsByDoctor, AppointmentRecord } from "@/lib/appointments-api";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorPage() {
  return (
    <AuthGate allowedRoles={["DOCTOR"]}>
      {(user) => <DoctorDashboard user={user} />}
    </AuthGate>
  );
}

function DoctorDashboard({ user }: { user: any }) {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [appointments, setAppointments] = React.useState<AppointmentRecord[]>([]);
  const [availability, setAvailability] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profileRes = await getMyDoctorProfile();
        setProfile(profileRes);
        const [slots, appts] = await Promise.all([
          getDoctorAvailability(profileRes.id),
          listAppointmentsByDoctor(profileRes.id),
        ]);
        setAvailability(slots);
        setAppointments(appts.slice(0, 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navItems = [
    { label: "Overview", href: "/doctor" },
    { label: "Appointments", href: "/doctor" },
    { label: "Availability", href: "/doctor" },
  ];

  return (
    <InternalShell
      user={user}
      title="Doctor Workspace"
      subtitle="Appointments, availability, and patient follow-ups"
      navItems={navItems}
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Profile</p>
          <p className="text-lg font-semibold text-white mt-3">
            {profile ? `Dr. ${user.firstName} ${user.lastName}` : "Loading"}
          </p>
          {profile && (
            <p className="text-xs text-slate-400 mt-2">Experience: {profile.yearsOfExperience} years</p>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Upcoming</p>
          <p className="text-2xl font-semibold text-white mt-3">{appointments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Next 10 appointments</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Availability Slots</p>
          <p className="text-2xl font-semibold text-white mt-3">{availability?.slots?.length || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Active weekly slots</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
          {loading && <p className="text-sm text-slate-400 mt-4">Loading appointments...</p>}
          {!loading && appointments.length === 0 && (
            <p className="text-sm text-slate-400 mt-4">No upcoming appointments.</p>
          )}
          <div className="mt-4 space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-white">{apt.appointmentNumber}</p>
                <p className="text-xs text-slate-400">{new Date(apt.scheduledAt).toLocaleString()}</p>
                {apt.reasonForVisit && <p className="text-xs text-slate-300 mt-1">{apt.reasonForVisit}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Weekly Availability</h3>
          <div className="mt-4 space-y-3">
            {availability?.slots?.length ? (
              availability.slots.map((slot: any) => (
                <div key={slot.id} className="border border-white/10 rounded-xl p-4">
                  <p className="text-sm font-semibold text-white">{dayNames[slot.dayOfWeek]}</p>
                  <p className="text-xs text-slate-400">{slot.startTime} - {slot.endTime} ({slot.slotDurationMinutes}m)</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No active slots configured.</p>
            )}
          </div>
        </div>
      </section>
    </InternalShell>
  );
}

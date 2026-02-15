"use client";

import React from "react";
import { appointmentApi, PublicDoctor, AvailabilitySlot } from "@/lib/appointment-api";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

const RECEPTION_PHONE = "+919876543210";

function parseTimeToMinutes(timeValue: string): number {
  const [hh, mm, ss] = timeValue.split(":").map((v) => parseInt(v, 10));
  return (hh || 0) * 60 + (mm || 0) + ((ss || 0) > 0 ? 0 : 0);
}

function minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function formatTimeDisplay(timeValue: string): string {
  const [hh, mm] = timeValue.split(":").map((v) => parseInt(v, 10));
  const date = new Date();
  date.setHours(hh || 0, mm || 0, 0, 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildSlotsForDay(slots: AvailabilitySlot[]): string[] {
  const times: string[] = [];
  slots.forEach((slot) => {
    const start = parseTimeToMinutes(slot.startTime);
    const end = parseTimeToMinutes(slot.endTime);
    const step = slot.slotDurationMinutes || 15;
    for (let t = start; t + step <= end; t += step) {
      times.push(minutesToTime(t));
    }
  });
  return Array.from(new Set(times));
}

function isFutureTime(selectedDate: string, timeValue: string): boolean {
  const now = new Date();
  const [hh, mm] = timeValue.split(":").map((v) => parseInt(v, 10));
  const target = new Date(`${selectedDate}T00:00:00`);
  target.setHours(hh || 0, mm || 0, 0, 0);
  return target.getTime() > now.getTime();
}

export const AppointmentBookingForm: React.FC = () => {
  const [doctors, setDoctors] = React.useState<PublicDoctor[]>([]);
  const [departmentId, setDepartmentId] = React.useState("");
  const [doctorId, setDoctorId] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([]);
  const [selectedTime, setSelectedTime] = React.useState("");
  const [loadingDoctors, setLoadingDoctors] = React.useState(true);
  const [loadingTimes, setLoadingTimes] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = React.useState<{ date: string; time: string } | null>(null);

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [reasonForVisit, setReasonForVisit] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const departmentOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    doctors.forEach((doc) => {
      if (!map.has(doc.departmentId)) {
        map.set(doc.departmentId, doc.departmentName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [doctors]);

  const filteredDoctors = React.useMemo(() => {
    if (!departmentId) return [];
    return doctors.filter((doc) => doc.departmentId === departmentId);
  }, [doctors, departmentId]);

  const loadDoctors = React.useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const data = await appointmentApi.listPublicDoctors();
      setDoctors(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  React.useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  React.useEffect(() => {
    setDoctorId("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes([]);
  }, [departmentId]);

  React.useEffect(() => {
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes([]);
  }, [doctorId]);

  const loadTimes = React.useCallback(async () => {
    if (!doctorId || !selectedDate) return;
    setLoadingTimes(true);
    setError(null);
    setNextAvailable(null);

    try {
      const date = new Date(`${selectedDate}T00:00:00`);
      const dayOfWeek = date.getDay();
      const slots = await appointmentApi.getDoctorAvailabilityByDay(doctorId, dayOfWeek);
      let times = buildSlotsForDay(slots).filter((t) => isFutureTime(selectedDate, t));

      if (times.length === 0) {
        setAvailableTimes([]);

        const fullAvailability = await appointmentApi.getDoctorAvailability(doctorId);
        const slotMap = new Map<number, string[]>();
        fullAvailability.slots.forEach((slot) => {
          const list = slotMap.get(slot.dayOfWeek) || [];
          list.push(...buildSlotsForDay([slot]));
          slotMap.set(slot.dayOfWeek, list);
        });

        const startDate = new Date(`${selectedDate}T00:00:00`);
        for (let i = 0; i < 14; i += 1) {
          const checkDate = new Date(startDate);
          checkDate.setDate(startDate.getDate() + i + 1);
          const day = checkDate.getDay();
          const daySlots = slotMap.get(day) || [];
          if (daySlots.length > 0) {
            const nextTime = daySlots.sort()[0];
            setNextAvailable({
              date: checkDate.toISOString().slice(0, 10),
              time: nextTime,
            });
            break;
          }
        }
        return;
      }

      setAvailableTimes(times);
    } catch (err) {
      console.error(err);
      setError("Failed to load available times.");
    } finally {
      setLoadingTimes(false);
    }
  }, [doctorId, selectedDate]);

  React.useEffect(() => {
    loadTimes();
  }, [loadTimes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!departmentId || !doctorId || !selectedDate || !selectedTime) {
      setError("Please select department, doctor, date, and time.");
      return;
    }

    if (!fullName || !phone || !email) {
      setError("Please provide your name, phone, and email.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await appointmentApi.createAppointmentRequest({
        fullName,
        phone,
        email,
        departmentId,
        doctorId,
        requestedDate: selectedDate,
        requestedTime: selectedTime,
        reasonForVisit: reasonForVisit || undefined,
      });

      setSuccess(response.message || "Appointment request submitted.");
      setFullName("");
      setPhone("");
      setEmail("");
      setReasonForVisit("");
      setSelectedTime("");
    } catch (err) {
      console.error(err);
      setError("Failed to submit appointment request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book an Appointment</h2>
          <p className="text-sm text-gray-600">Choose your department, doctor, and preferred time.</p>
        </div>
        <a
          href={`tel:${RECEPTION_PHONE}`}
          className="text-sm font-semibold text-pristine-600 hover:text-pristine-700"
        >
          Call Reception
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Department</label>
            {loadingDoctors ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin" /> Loading departments...
              </div>
            ) : (
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
              >
                <option value="">Select department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={!departmentId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500 disabled:bg-gray-100"
            >
              <option value="">Select doctor</option>
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.firstName} {doc.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Date</label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!doctorId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Available Times</label>
            {loadingTimes ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin" /> Loading times...
              </div>
            ) : (
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || availableTimes.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500 disabled:bg-gray-100"
              >
                <option value="">
                  {availableTimes.length === 0 ? "No slots available" : "Select time"}
                </option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatTimeDisplay(time)}
                  </option>
                ))}
              </select>
            )}
            {!loadingTimes && availableTimes.length === 0 && nextAvailable && (
              <p className="text-xs text-gray-600 mt-2">
                Next available: {nextAvailable.date} at {formatTimeDisplay(nextAvailable.time)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
              placeholder="+91"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Reason for Visit (optional)</label>
          <textarea
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pristine-500"
            placeholder="Describe symptoms or reason"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-pristine-600 hover:bg-pristine-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {submitting ? "Submitting..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
};

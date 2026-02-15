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
  const [weeklySlots, setWeeklySlots] = React.useState<AvailabilitySlot[]>([]);
  const [calendarMonth, setCalendarMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedTime, setSelectedTime] = React.useState("");
  const [loadingDoctors, setLoadingDoctors] = React.useState(true);
  const [loadingTimes, setLoadingTimes] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = React.useState<{ date: string; time: string } | null>(null);

  const [patientName, setPatientName] = React.useState("");
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
    setWeeklySlots([]);
  }, [doctorId]);

  React.useEffect(() => {
    const loadWeekly = async () => {
      if (!doctorId) return;
      try {
        const availability = await appointmentApi.getDoctorAvailability(doctorId);
        setWeeklySlots(availability.slots || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadWeekly();
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

        const slotMap = new Map<number, string[]>();
        weeklySlots.forEach((slot) => {
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
  }, [doctorId, selectedDate, weeklySlots]);

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

    if (!patientName || !phone || !email) {
      setError("Please provide your name, phone, and email.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await appointmentApi.createAppointmentRequest({
        fullName: patientName,
        phone,
        email,
        departmentId,
        doctorId,
        requestedDate: selectedDate,
        requestedTime: selectedTime,
        reasonForVisit: reasonForVisit || undefined,
      });

      setSuccess(response.message || "Appointment request submitted.");
      setPatientName("");
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

  const startOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const availableDays = new Set(weeklySlots.map((slot) => slot.dayOfWeek));

  const calendarCells = Array.from({ length: startDay + daysInMonth }, (_, idx) => {
    if (idx < startDay) return null;
    return idx - startDay + 1;
  });

  const isPastDate = (day: number) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  };

  const isAvailableDay = (day: number) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return availableDays.has(date.getDay());
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-800 mb-2">Select Date</label>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="text-sm font-semibold text-gray-600 hover:text-pristine-600"
                >
                  Prev
                </button>
                <div className="text-sm font-semibold text-gray-800">
                  {calendarMonth.toLocaleString([], { month: "long", year: "numeric" })}
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="text-sm font-semibold text-gray-600 hover:text-pristine-600"
                >
                  Next
                </button>
              </div>
              <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, idx) => {
                  if (!day) return <div key={idx} />;
                  const disabled = !doctorId || isPastDate(day);
                  const available = doctorId && isAvailableDay(day);
                  const dateValue = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                  const iso = dateValue.toISOString().slice(0, 10);
                  const isSelected = selectedDate === iso;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedDate(iso)}
                      className={`rounded-lg py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-pristine-600 text-white"
                          : available
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-white text-gray-400 border border-gray-200"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {!doctorId && (
                <p className="text-xs text-gray-500 mt-3">Select a doctor to view availability.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Available Times</label>
          {loadingTimes ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader className="w-4 h-4 animate-spin" /> Loading times...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableTimes.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-sm text-gray-500">
                  No slots available for the selected date.
                </div>
              )}
              {availableTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    selectedTime === time
                      ? "bg-pristine-600 text-white border-pristine-600"
                      : "bg-white border-gray-200 text-gray-700 hover:border-pristine-400"
                  }`}
                >
                  {formatTimeDisplay(time)}
                </button>
              ))}
            </div>
          )}
          {!loadingTimes && availableTimes.length === 0 && nextAvailable && (
            <p className="text-xs text-gray-600 mt-2">
              Next available: {nextAvailable.date} at {formatTimeDisplay(nextAvailable.time)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
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

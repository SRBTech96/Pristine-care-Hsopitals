import { internalClient } from "./internal-api";

export interface AppointmentRecord {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  roomNumber?: string;
  reasonForVisit?: string;
  consultationNotes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export async function listAppointmentsByDoctor(doctorId: string): Promise<AppointmentRecord[]> {
  const res = await internalClient.get<AppointmentRecord[]>(`/appointments/doctor/${doctorId}`);
  return res.data || [];
}

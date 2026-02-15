import { internalClient } from "./internal-api";

export interface DoctorProfile {
  id: string;
  userId: string;
  registrationNumber: string;
  specializationId: string;
  departmentId: string;
  qualifications: string;
  yearsOfExperience: number;
  consultationFee?: number;
  isAvailable: boolean;
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface AvailabilityResponse {
  doctorId: string;
  doctorName?: string;
  specializationId?: string;
  departmentId?: string;
  consultationFee?: number;
  slots: AvailabilitySlot[];
}

export async function getMyDoctorProfile(): Promise<DoctorProfile> {
  const res = await internalClient.get<DoctorProfile>("/doctors/me");
  return res.data;
}

export async function getDoctorAvailability(doctorId: string): Promise<AvailabilityResponse> {
  const res = await internalClient.get<AvailabilityResponse>(`/doctors/${doctorId}/availability`);
  return res.data;
}

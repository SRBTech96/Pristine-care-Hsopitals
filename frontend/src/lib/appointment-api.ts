import axios from "axios";
import { CORE_API_BASE_URL } from "./api-config";

export interface PublicDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName: string;
  specializationId: string;
  specializationName: string;
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

export interface AppointmentRequestPayload {
  fullName: string;
  phone: string;
  email: string;
  departmentId: string;
  doctorId: string;
  requestedDate: string;
  requestedTime: string;
  reasonForVisit?: string;
}

export interface AppointmentRequestResponse {
  requestId: string;
  status: string;
  message: string;
}

class AppointmentApiClient {
  private client = axios.create({
    baseURL: CORE_API_BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  async listPublicDoctors(departmentId?: string, specializationId?: string): Promise<PublicDoctor[]> {
    const res = await this.client.get<PublicDoctor[]>("/public/doctors", {
      params: { departmentId, specializationId },
    });
    return res.data || [];
  }

  async getDoctorAvailability(doctorId: string): Promise<AvailabilityResponse> {
    const res = await this.client.get<AvailabilityResponse>(`/public/doctors/${doctorId}/availability`);
    return res.data;
  }

  async getDoctorAvailabilityByDay(doctorId: string, dayOfWeek: number): Promise<AvailabilitySlot[]> {
    const res = await this.client.get<AvailabilitySlot[]>(`/public/doctors/${doctorId}/availability/day`, {
      params: { dayOfWeek },
    });
    return res.data || [];
  }

  async createAppointmentRequest(payload: AppointmentRequestPayload): Promise<AppointmentRequestResponse> {
    const res = await this.client.post<AppointmentRequestResponse>("/public/appointments", payload);
    return res.data;
  }
}

export const appointmentApi = new AppointmentApiClient();

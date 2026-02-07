export class AppointmentResponseDto {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  roomNumber?: string;
  reasonForVisit?: string;
  consultationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

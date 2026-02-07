export class AvailabilitySlotDto {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DoctorAvailabilityResponseDto {
  doctorId: string;
  doctorName: string;
  specializationId: string;
  departmentId: string;
  consultationFee?: number;
  slots: AvailabilitySlotDto[];
}

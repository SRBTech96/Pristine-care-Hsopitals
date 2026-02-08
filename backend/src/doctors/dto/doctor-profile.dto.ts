export class DoctorProfileDto {
  id!: string;
  userId!: string;
  registrationNumber!: string;
  specializationId!: string;
  departmentId!: string;
  qualifications!: string;
  yearsOfExperience!: number;
  consultationFee?: number;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

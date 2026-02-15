export class PublicDoctorDto {
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

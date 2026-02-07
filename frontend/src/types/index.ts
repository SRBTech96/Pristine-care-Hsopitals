export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualifications: string[];
  specialization: string;
  yearsOfExperience: number;
  registrationNumber?: string;
  bio?: string;
}

export interface DepartmentGroup {
  departmentName: string;
  specialization: string;
  doctors: Doctor[];
  icon?: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
}

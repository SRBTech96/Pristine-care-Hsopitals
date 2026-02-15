// Ward & Bed Types
export interface Ward {
  id: string;
  name: string;
  code: string;
  floorNumber: number;
  building: string;
  totalBeds: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  bedCode: string;
  wardId: string;
  roomNumber: string;
  floorNumber: number;
  bedPosition: string;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  currentPatientId: string | null;
  admissionDate: string | null;
  estimatedDischargeDate: string | null;
  specialRequirements: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  currentPatient?: Patient;
  ward?: Ward;
}

// Patient Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  createdAt: string;
  updatedAt: string;
}

// Admission Types
export interface InpatientAdmission {
  id: string;
  patientId: string;
  bedId: string;
  wardId: string;
  admissionDate: string;
  dischargeDate: string | null;
  admissionType: 'emergency' | 'scheduled' | 'transfer';
  attendingDoctorId: string;
  chiefComplaint: string;
  admissionNotes: string | null;
  dischargeSummary: string | null;
  status: 'active' | 'discharged' | 'transferred' | 'deceased' | 'critical' | 'stable' | 'ready_for_discharge' | 'in_treatment';
  isIcu: boolean;
  isNicu: boolean;
  createdAt: string;
  updatedAt: string;
  // Denormalized / computed fields (may come from API joins)
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  dateOfBirth?: string;
  admissionDateTime?: string;
  primaryDiagnosis?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Populated fields
  patient?: Patient;
  bed?: Bed;
  ward?: Ward;
  attendingDoctor?: Doctor;
  doctorOrders?: DoctorOrder[];
  medicationSchedules?: MedicationSchedule[];
  vitalsRecords?: VitalsRecord[];
  emergencyEvents?: EmergencyEvent[];
}

// Doctor Types
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Doctor Order Types
export interface DoctorOrder {
  id: string;
  inpatientAdmissionId: string;
  doctorId: string;
  orderDate: string;
  orderType: 'medication' | 'procedure' | 'investigation' | 'diet' | 'activity' | 'observation';
  description: string;
  instructions: string | null;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  scheduledDate: string | null;
  expectedCompletionDate: string | null;
  approvalsRequired: number;
  approvedById: string | null;
  approvedAt: string | null;
  cancelledById: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  doctor?: Doctor;
  medicationSchedules?: MedicationSchedule[];
}

// Medication Schedule Types
export interface MedicationSchedule {
  id: string;
  doctorOrderId: string;
  inpatientAdmissionId: string;
  medicationName: string;
  dosage: number;
  unit: string;
  frequency: string;
  route: 'oral' | 'IV' | 'IM' | 'SC' | 'transdermal' | 'topical' | 'inhalation';
  startDate: string;
  endDate: string | null;
  durationDays: number | null;
  specialInstructions: string | null;
  contraindications: string | null;
  allergiesToCheck: string | null;
  requiresMonitoring: boolean;
  monitoringParameters: string[] | null;
  prescribingDoctorId: string;
  prescribedAt: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  createdAt: string;
  updatedAt: string;
  // Populated fields
  administrations?: MedicationAdministration[];
  prescribingDoctor?: Doctor;
}

// Medication Administration Types
export interface MedicationAdministration {
  id: string;
  medicationScheduleId: string;
  inpatientAdmissionId: string;
  scheduledTime: string;
  administeredTime: string | null;
  administeredById: string | null;
  status: 'pending' | 'administered' | 'refused' | 'held' | 'delayed' | 'not_given' | 'withheld';
  reasonIfNotGiven: string | null;
  actualDosage: number | null;
  routeUsed: string | null;
  siteOfAdministration: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  nurseNotes: string | null;
  patientResponse: string | null;
  sideEffectsObserved: boolean;
  sideEffectsDetails: string | null;
  verifiedById: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  medicationSchedule?: MedicationSchedule;
  administeredBy?: Doctor;
  verifiedBy?: Doctor;
}

// Vitals Record Types
export interface VitalsRecord {
  id: string;
  inpatientAdmissionId: string;
  recordedById: string;
  recordedAt: string;
  temperatureCelsius: number;
  heartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  respiratoryRateRpm: number;
  oxygenSaturationPercent: number;
  bloodGlucoseMmol: number;
  weightKg: number | null;
  heightCm: number | null;
  painScore: number; // 0-10
  gcsScore: number | null;
  consciousnessLevel: string | null;
  urineOutputMl: number | null;
  bowelMovementStatus: string | null;
  notes: string | null;
  abnormalFindings: boolean;
  reportedToDoctorId: string | null;
  reportedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  recordedBy?: Doctor;
  reportedToDoctor?: Doctor;
}

// Emergency Event Types
export interface EmergencyEvent {
  id: string;
  inpatientAdmissionId: string | null;
  patientId: string;
  reportedById: string;
  eventType: string; // cardiac_arrest, respiratory_distress, seizure, anaphylaxis, severe_bleeding, etc.
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  description: string;
  timeOfEvent: string;
  responseStartTime: string | null;
  responseEndTime: string | null;
  doctorsNotifiedIds: string[];
  notifiedAt: string | null;
  actionsTaken: string | null;
  outcome: string | null;
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated';
  resolvingDoctorId: string | null;
  resolvedAt: string | null;
  followUpRequired: boolean;
  followUpNotes: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  patient?: Patient;
  reportedBy?: Doctor;
  resolvingDoctor?: Doctor;
}

// Nurse Assignment Types
export interface NurseAssignment {
  id: string;
  nurseId: string;
  wardId: string;
  floorNumber: number | null;
  assignedBeds: string[];
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: string;
  assignedById: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  nurse?: Doctor;
  ward?: Ward;
  assignedBy?: Doctor;
}

// User/Doctor Type for auth context
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  sessionToken: string;
}

// UI-specific types
export interface BedGridState {
  bedId: string;
  bedCode: string;
  roomNumber: string;
  floorNumber: number;
  patientName: string | null;
  diagnosis: string | null;
  doctorName: string | null;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  colorState: 'green' | 'red' | 'yellow' | 'orange';
}

export interface MedicationStatus {
  medicationScheduleId: string;
  medicationName: string;
  dosage: number;
  unit: string;
  route: string;
  scheduledTime: string;
  actualStatus: 'pending' | 'given' | 'delayed' | 'missed' | 'withheld';
  administeredBy?: string;
  administeredAt?: string;
  reason?: string;
}

export interface NurseHandover {
  id: string;
  wardId: string;
  patientId?: string;
  inpatientAdmissionId?: string;
  nurseId?: string;
  outgoingNurseId?: string;
  incomingNurseId?: string;
  status: 'pending' | 'acknowledged' | 'reviewed';
  handoverTemplate?: string;
  handoverDateTime?: string;
  keyPoints?: string;
  clinicalUpdate?: string;
  clinicalNotes?: string;
  tasksPending?: string[];
  riskAlerts?: string;
  familyReferrals?: string;
  bedLocation?: string;
  pendingMedications?: string;
  criticalPatients?: string;
  pendingLabs?: string;
  patientIds?: string[];
  acknowledgedAt?: string;
  reviewedByNurseId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  nurse?: { firstName: string; lastName: string };
  toShift?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyRequest {
  id: string;
  wardId: string;
  itemName: string;
  category: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';
  requestDateTime: string;
  fulfilledDateTime?: string;
  notes?: string;
  requestedById?: string;
  createdAt: string;
  updatedAt: string;
}

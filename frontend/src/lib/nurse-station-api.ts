import axios, { AxiosInstance } from 'axios';
import { CORE_API_BASE_URL } from './api-config';

class NurseStationAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${CORE_API_BASE_URL}/nurse-station`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Nurse Assignments
  async createNurseAssignment(data: any) {
    return this.api.post('/assignments', data);
  }

  async listNurseAssignments(wardId?: string, nurseId?: string) {
    return this.api.get('/assignments', {
      params: { wardId, nurseId },
    });
  }

  async updateNurseAssignment(id: string, data: any) {
    return this.api.patch(`/assignments/${id}`, data);
  }

  // Inpatient Admissions
  async createInpatientAdmission(data: any) {
    return this.api.post('/admissions', data);
  }

  async listInpatientAdmissions(wardId?: string, status?: string, isIcu?: boolean, isNicu?: boolean) {
    return this.api.get('/admissions', {
      params: { wardId, status, isIcu, isNicu },
    });
  }

  async getInpatientAdmission(id: string) {
    return this.api.get(`/admissions/${id}`);
  }

  async dischargePatient(id: string, data: any) {
    return this.api.patch(`/admissions/${id}/discharge`, data);
  }

  // Doctor Orders
  async createDoctorOrder(data: any) {
    return this.api.post('/doctor-orders', data);
  }

  async listDoctorOrders(admissionId: string, status?: string, orderType?: string) {
    return this.api.get('/doctor-orders', {
      params: { admissionId, status, orderType },
    });
  }

  async getDoctorOrder(id: string) {
    return this.api.get(`/doctor-orders/${id}`);
  }

  // Medication Schedules
  async createMedicationSchedule(data: any) {
    return this.api.post('/medication-schedules', data);
  }

  async listMedicationSchedules(admissionId: string, status?: string) {
    return this.api.get('/medication-schedules', {
      params: { admissionId, status },
    });
  }

  // Medication Administration
  async executeMedication(data: any) {
    return this.api.post('/medication-administration/execute', data);
  }

  async skipMedication(data: any) {
    return this.api.post('/medication-administration/skip', data);
  }

  async getMedicationAdministration(id: string) {
    return this.api.get(`/medication-administration/${id}`);
  }

  // Vital Signs
  async recordVitals(data: any) {
    return this.api.post('/vital-signs', data);
  }

  async listPatientVitals(admissionId: string) {
    return this.api.get('/vital-signs', {
      params: { admissionId },
    });
  }

  async getAdmissionVitals(admissionId: string, timeRange: '6h' | '12h' | '24h' | '7d') {
    return this.api.get(`/vital-signs/${admissionId}`, {
      params: { timeRange },
    });
  }

  // Emergency Events
  async raiseEmergencyEvent(data: any) {
    return this.api.post('/emergency-events', data);
  }

  async listEmergencyEvents(wardId?: string, status?: string, severity?: string) {
    return this.api.get('/emergency-events', {
      params: { wardId, status, severity },
    });
  }

  async getEmergencyEvent(id: string) {
    return this.api.get(`/emergency-events/${id}`);
  }

  async acknowledgeEmergencyEvent(id: string) {
    return this.api.patch(`/emergency-events/${id}/acknowledge`);
  }

  // Supply Requests
  async requestSupply(data: any) {
    return this.api.post('/supply-requests', data);
  }

  async listSupplyRequests(wardId?: string, status?: string) {
    return this.api.get('/supply-requests', {
      params: { wardId, status },
    });
  }

  async fulfillSupplyRequest(id: string) {
    return this.api.patch(`/supply-requests/${id}/fulfill`);
  }

  // Nurse Handovers
  async createNurseHandover(data: any) {
    return this.api.post('/nurse-handovers', data);
  }

  async listNurseHandovers(wardId?: string, nurseId?: string) {
    return this.api.get('/nurse-handovers', {
      params: { wardId, nurseId },
    });
  }

  async getNurseHandover(id: string) {
    return this.api.get(`/nurse-handovers/${id}`);
  }

  // Ward Communication
  async sendWardMessage(data: any) {
    return this.api.post('/ward-messages', data);
  }

  async listWardMessages(wardId: string, patientId?: string) {
    return this.api.get('/ward-messages', {
      params: { wardId, patientId },
    });
  }

  // Beds
  async listBeds(wardId?: string, status?: string) {
    return this.api.get('/beds', {
      params: { wardId, status },
    });
  }

  async getBed(id: string) {
    return this.api.get(`/beds/${id}`);
  }

  // Wards
  async listWards() {
    return this.api.get('/wards');
  }

  async getWard(id: string) {
    return this.api.get(`/wards/${id}`);
  }
}

export const nurseStationAPI = new NurseStationAPI();

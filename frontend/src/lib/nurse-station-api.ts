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
  async createNurseAssignment(data: any): Promise<any> {
    const res = await this.api.post('/assignments', data);
    return res.data;
  }

  async listNurseAssignments(wardId?: string, nurseId?: string): Promise<any> {
    const res = await this.api.get('/assignments', {
      params: { wardId, nurseId },
    });
    return res.data;
  }

  async updateNurseAssignment(id: string, data: any): Promise<any> {
    const res = await this.api.patch(`/assignments/${id}`, data);
    return res.data;
  }

  // Inpatient Admissions
  async createInpatientAdmission(data: any): Promise<any> {
    const res = await this.api.post('/admissions', data);
    return res.data;
  }

  async listInpatientAdmissions(
    wardId?: string,
    status?: string,
    isIcu?: boolean,
    isNicu?: boolean
  ): Promise<any> {
    const res = await this.api.get('/admissions', {
      params: { wardId, status, isIcu, isNicu },
    });
    return res.data;
  }

  async getInpatientAdmission(id: string): Promise<any> {
    const res = await this.api.get(`/admissions/${id}`);
    return res.data;
  }

  async dischargePatient(id: string, data: any): Promise<any> {
    const res = await this.api.patch(`/admissions/${id}/discharge`, data);
    return res.data;
  }

  // Doctor Orders
  async createDoctorOrder(data: any): Promise<any> {
    const res = await this.api.post('/doctor-orders', data);
    return res.data;
  }

  async listDoctorOrders(admissionId: string, status?: string, orderType?: string): Promise<any> {
    const res = await this.api.get('/doctor-orders', {
      params: { admissionId, status, orderType },
    });
    return res.data;
  }

  async getDoctorOrder(id: string): Promise<any> {
    const res = await this.api.get(`/doctor-orders/${id}`);
    return res.data;
  }

  // Medication Schedules
  async createMedicationSchedule(data: any): Promise<any> {
    const res = await this.api.post('/medication-schedules', data);
    return res.data;
  }

  async listMedicationSchedules(admissionId: string, status?: string): Promise<any> {
    const res = await this.api.get('/medication-schedules', {
      params: { admissionId, status },
    });
    return res.data;
  }

  // Medication Administration
  async executeMedication(data: any): Promise<any> {
    const res = await this.api.post('/medication-administration/execute', data);
    return res.data;
  }

  async skipMedication(data: any): Promise<any> {
    const res = await this.api.post('/medication-administration/skip', data);
    return res.data;
  }

  async getMedicationAdministration(id: string): Promise<any> {
    const res = await this.api.get(`/medication-administration/${id}`);
    return res.data;
  }

  // Vital Signs
  async recordVitals(data: any): Promise<any> {
    const res = await this.api.post('/vital-signs', data);
    return res.data;
  }

  async listPatientVitals(admissionId: string): Promise<any> {
    const res = await this.api.get('/vital-signs', {
      params: { admissionId },
    });
    return res.data;
  }

  async getAdmissionVitals(admissionId: string, timeRange: '6h' | '12h' | '24h' | '7d'): Promise<any> {
    const res = await this.api.get(`/vital-signs/${admissionId}`, {
      params: { timeRange },
    });
    return res.data;
  }

  // Emergency Events
  async raiseEmergencyEvent(data: any): Promise<any> {
    const res = await this.api.post('/emergency-events', data);
    return res.data;
  }

  async listEmergencyEvents(wardId?: string, status?: string, severity?: string): Promise<any> {
    const res = await this.api.get('/emergency-events', {
      params: { wardId, status, severity },
    });
    return res.data;
  }

  async getEmergencyEvent(id: string): Promise<any> {
    const res = await this.api.get(`/emergency-events/${id}`);
    return res.data;
  }

  async acknowledgeEmergencyEvent(id: string): Promise<any> {
    const res = await this.api.patch(`/emergency-events/${id}/acknowledge`);
    return res.data;
  }

  // Supply Requests
  async requestSupply(data: any): Promise<any> {
    const res = await this.api.post('/supply-requests', data);
    return res.data;
  }

  async listSupplyRequests(wardId?: string, status?: string): Promise<any> {
    const res = await this.api.get('/supply-requests', {
      params: { wardId, status },
    });
    return res.data;
  }

  async fulfillSupplyRequest(id: string): Promise<any> {
    const res = await this.api.patch(`/supply-requests/${id}/fulfill`);
    return res.data;
  }

  // Nurse Handovers
  async createNurseHandover(data: any): Promise<any> {
    const res = await this.api.post('/nurse-handovers', data);
    return res.data;
  }

  async listNurseHandovers(wardId?: string, nurseId?: string): Promise<any> {
    const res = await this.api.get('/nurse-handovers', {
      params: { wardId, nurseId },
    });
    return res.data;
  }

  async getNurseHandover(id: string): Promise<any> {
    const res = await this.api.get(`/nurse-handovers/${id}`);
    return res.data;
  }

  // Ward Communication
  async sendWardMessage(data: any): Promise<any> {
    const res = await this.api.post('/ward-messages', data);
    return res.data;
  }

  async listWardMessages(wardId: string, patientId?: string): Promise<any> {
    const res = await this.api.get('/ward-messages', {
      params: { wardId, patientId },
    });
    return res.data;
  }

  // Beds
  async listBeds(wardId?: string, status?: string): Promise<any> {
    const res = await this.api.get('/beds', {
      params: { wardId, status },
    });
    return res.data;
  }

  async getBed(id: string): Promise<any> {
    const res = await this.api.get(`/beds/${id}`);
    return res.data;
  }

  // Wards
  async listWards(): Promise<any> {
    const res = await this.api.get('/wards');
    return res.data;
  }

  async getWard(id: string): Promise<any> {
    const res = await this.api.get(`/wards/${id}`);
    return res.data;
  }
}

export const nurseStationAPI = new NurseStationAPI();

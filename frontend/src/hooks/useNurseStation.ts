import { useState, useCallback, useEffect } from 'react';
import { InpatientAdmission } from '@/types/nurse-station';
import { nurseStationAPI } from '@/lib/nurse-station-api';

interface UseNurseStationOptions {
  wardId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNurseStation({
  wardId,
  autoRefresh = true,
  refreshInterval = 30000,
}: UseNurseStationOptions) {
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all admissions for the ward
  const loadAdmissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.listInpatientAdmissions(wardId);
      setAdmissions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admissions');
    } finally {
      setLoading(false);
    }
  }, [wardId]);

  // Get a single admission by ID
  const getAdmission = useCallback(
    async (admissionId: string) => {
      try {
        const data = await nurseStationAPI.getInpatientAdmission(admissionId);
        return data;
      } catch (err: any) {
        setError('Failed to load admission');
        return null;
      }
    },
    []
  );

  // Record vital signs
  const recordVitals = useCallback(
    async (admissionId: string, vitals: any) => {
      try {
        await nurseStationAPI.recordVitals({
          inpatientAdmissionId: admissionId,
          ...vitals,
        });
        await loadAdmissions();
        return true;
      } catch (err: any) {
        setError('Failed to record vitals');
        return false;
      }
    },
    [loadAdmissions]
  );

  // Raise emergency event
  const raiseEmergency = useCallback(
    async (admissionId: string, emergencyData: any) => {
      try {
        await nurseStationAPI.raiseEmergencyEvent({
          inpatientAdmissionId: admissionId,
          wardId,
          ...emergencyData,
        });
        return true;
      } catch (err: any) {
        setError('Failed to raise emergency event');
        return false;
      }
    },
    [wardId]
  );

  // Request supply
  const requestSupply = useCallback(
    async (admissionId: string, supplyData: any) => {
      try {
        await nurseStationAPI.requestSupply({
          inpatientAdmissionId: admissionId,
          wardId,
          ...supplyData,
        });
        return true;
      } catch (err: any) {
        setError('Failed to request supply');
        return false;
      }
    },
    [wardId]
  );

  // Create handover
  const createHandover = useCallback(
    async (admissionId: string, handoverData: any) => {
      try {
        await nurseStationAPI.createNurseHandover({
          inpatientAdmissionId: admissionId,
          wardId,
          ...handoverData,
        });
        return true;
      } catch (err: any) {
        setError('Failed to create handover');
        return false;
      }
    },
    [wardId]
  );

  // Send message
  const sendMessage = useCallback(
    async (messageData: any) => {
      try {
        await nurseStationAPI.sendWardMessage({
          wardId,
          ...messageData,
        });
        return true;
      } catch (err: any) {
        setError('Failed to send message');
        return false;
      }
    },
    [wardId]
  );

  // Get vital signs for an admission
  const getVitals = useCallback(
    async (admissionId: string, timeRange: '6h' | '12h' | '24h' | '7d') => {
      try {
        const data = await nurseStationAPI.getAdmissionVitals(admissionId, timeRange);
        return data || [];
      } catch (err: any) {
        setError('Failed to load vital signs');
        return [];
      }
    },
    []
  );

  // Get emergency events
  const getEmergencies = useCallback(
    async (status?: string) => {
      try {
        const data = await nurseStationAPI.listEmergencyEvents(wardId, status);
        return data || [];
      } catch (err: any) {
        setError('Failed to load emergency events');
        return [];
      }
    },
    [wardId]
  );

  // Filter admissions by status
  const getAdmissionsByStatus = useCallback(
    (status: string) => {
      return admissions.filter((a) => a.status === status);
    },
    [admissions]
  );

  // Get critical patients
  const getCriticalPatients = useCallback(() => {
    return admissions.filter((a) => a.status === 'critical');
  }, [admissions]);

  // Get patients ready for discharge
  const getDischargeReadyPatients = useCallback(() => {
    return admissions.filter((a) => a.status === 'ready_for_discharge');
  }, [admissions]);

  // Discharge a patient
  const dischargePatient = useCallback(
    async (admissionId: string, dischargeData: any) => {
      try {
        await nurseStationAPI.dischargePatient(admissionId, dischargeData);
        await loadAdmissions();
        return true;
      } catch (err: any) {
        setError('Failed to discharge patient');
        return false;
      }
    },
    [loadAdmissions]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    loadAdmissions();

    if (!autoRefresh) return;

    const interval = setInterval(loadAdmissions, refreshInterval);
    return () => clearInterval(interval);
  }, [loadAdmissions, autoRefresh, refreshInterval]);

  return {
    // State
    admissions,
    loading,
    error,

    // Actions
    loadAdmissions,
    getAdmission,
    recordVitals,
    raiseEmergency,
    requestSupply,
    createHandover,
    sendMessage,
    getVitals,
    getEmergencies,
    dischargePatient,
    clearError,

    // Filters
    getAdmissionsByStatus,
    getCriticalPatients,
    getDischargeReadyPatients,
  };
}

/**
 * Hook for managing a single patient
 */
export function usePatient(admissionId: string) {
  const [admission, setAdmission] = useState<InpatientAdmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatient = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.getInpatientAdmission(admissionId);
      setAdmission(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  return { admission, loading, error, loadPatient };
}

/**
 * Hook for managing vital signs
 */
export function usePatientVitals(admissionId: string) {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h' | '7d'>(
    '24h'
  );

  const loadVitals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.getAdmissionVitals(admissionId, timeRange);
      setVitals(data || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to load vital signs');
    } finally {
      setLoading(false);
    }
  }, [admissionId, timeRange]);

  const addVital = useCallback(
    async (vitalData: any) => {
      try {
        await nurseStationAPI.recordVitals({
          inpatientAdmissionId: admissionId,
          ...vitalData,
        });
        await loadVitals();
        return true;
      } catch (err: any) {
        setError('Failed to record vital');
        return false;
      }
    },
    [admissionId, loadVitals]
  );

  const changeTimeRange = useCallback(
    (range: '6h' | '12h' | '24h' | '7d') => {
      setTimeRange(range);
    },
    []
  );

  useEffect(() => {
    loadVitals();
  }, [loadVitals]);

  return {
    vitals,
    loading,
    error,
    timeRange,
    loadVitals,
    addVital,
    changeTimeRange,
  };
}

/**
 * Hook for managing emergency events
 */
export function useEmergencyEvents(wardId: string) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('reported');

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.listEmergencyEvents(wardId, filter);
      setEvents(data || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to load emergency events');
    } finally {
      setLoading(false);
    }
  }, [wardId, filter]);

  const raiseEvent = useCallback(
    async (eventData: any) => {
      try {
        await nurseStationAPI.raiseEmergencyEvent({
          wardId,
          ...eventData,
        });
        await loadEvents();
        return true;
      } catch (err: any) {
        setError('Failed to raise emergency event');
        return false;
      }
    },
    [wardId, loadEvents]
  );

  const acknowledge = useCallback(
    async (eventId: string) => {
      try {
        await nurseStationAPI.acknowledgeEmergencyEvent(eventId);
        await loadEvents();
        return true;
      } catch (err: any) {
        setError('Failed to acknowledge event');
        return false;
      }
    },
    [loadEvents]
  );

  const changeFilter = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    filter,
    loadEvents,
    raiseEvent,
    acknowledge,
    changeFilter,
  };
}

/**
 * Hook for managing ward communication
 */
export function useWardMessages(wardId: string, patientId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nurseStationAPI.listWardMessages(wardId, patientId);
      setMessages(data || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [wardId, patientId]);

  const sendMessage = useCallback(
    async (messageData: any) => {
      try {
        await nurseStationAPI.sendWardMessage({
          wardId,
          ...messageData,
        });
        await loadMessages();
        return true;
      } catch (err: any) {
        setError('Failed to send message');
        return false;
      }
    },
    [wardId, loadMessages]
  );

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    sendMessage,
  };
}

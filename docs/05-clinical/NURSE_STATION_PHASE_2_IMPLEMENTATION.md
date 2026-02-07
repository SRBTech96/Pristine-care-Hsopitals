# Hospital Nurse Station Phase 2 - Implementation Guide

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- React 18+
- TypeScript 5+
- Existing Nurse Station Phase 1 implemented

### Installation

1. **Create database tables** (migrations already prepared)
```bash
npm run typeorm migration:run
```

2. **Register services in DI container**
```typescript
// backend/src/app.module.ts
import { ShiftHandoverService } from './services/ShiftHandoverService';
import { NurseAlertService } from './services/NurseAlertService';
import { NursingNoteService } from './services/NursingNoteService';
import { NurseTaskService } from './services/NurseTaskService';
import { QualityMetricsService } from './services/QualityMetricsService';

@Module({
  imports: [TypeOrmModule.forFeature([
    ShiftHandover, NursingNote, NurseAlert, 
    NurseTask, NurseQualityMetric
  ])],
  providers: [
    ShiftHandoverService,
    NurseAlertService,
    NursingNoteService,
    NurseTaskService,
    QualityMetricsService,
  ],
  exports: [
    ShiftHandoverService,
    NurseAlertService,
    NursingNoteService,
    NurseTaskService,
    QualityMetricsService,
  ],
})
export class Phase2Module { }
```

3. **Register controllers**
```typescript
// backend/src/app.module.ts
import { ShiftHandoverController } from './controllers/ShiftHandoverController';
import { NursingNoteController } from './controllers/NursingNoteController';
import { NurseAlertController } from './controllers/NurseAlertController';
import { NurseTaskController } from './controllers/NurseTaskController';
import { QualityMetricsController } from './controllers/QualityMetricsController';

@Module({
  controllers: [
    ShiftHandoverController,
    NursingNoteController,
    NurseAlertController,
    NurseTaskController,
    QualityMetricsController,
  ],
})
export class Phase2Module { }
```

4. **Initialize repositories in services**
```typescript
// If using constructor injection (recommended)
constructor(
  @InjectRepository(ShiftHandover)
  private shiftHandoverRepository: Repository<ShiftHandover>,
) {
  this.service = new ShiftHandoverService(
    this.shiftHandoverRepository
  );
}
```

## Component Integration

### 1. Shift Handover

**Import in Ward Dashboard**
```typescript
import { ShiftHandoverComponent } from '@/components/NurseStation/Phase2/ShiftHandoverComponent';

export const WardDashboard = () => {
  const handleHandoverSubmit = async (data: HandoverData) => {
    try {
      const response = await apiClient.post('/shift-handovers', data);
      showNotification('Handover submitted', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div>
      <ShiftHandoverComponent
        wardId={wardId}
        currentNurseId={currentNurseId}
        onHandoverSubmit={handleHandoverSubmit}
      />
    </div>
  );
};
```

**Usage within PatientCard**
```typescript
// When shift ending, nurses submit handover via modal
<ShiftHandoverComponent wardId={wardId} />
```

### 2. Nursing Notes

**Integrate into PatientCard**
```typescript
import { NursingNotesComponent } from '@/components/NurseStation/Phase2/NursingNotesComponent';

export const PatientCard = ({ patient }) => {
  const handleNoteSubmit = async (note: NursingNote) => {
    const response = await apiClient.post('/nursing-notes', note);
    showNotification('Note saved', 'success');
  };

  return (
    <div className="tabs">
      <Tab label="Vitals">
        <VitalsChartsTab patient={patient} />
      </Tab>
      
      <Tab label="Notes">
        <NursingNotesComponent
          wardId={wardId}
          patientId={patient.id}
          currentNurseId={currentNurseId}
          onNoteSubmit={handleNoteSubmit}
        />
      </Tab>
    </div>
  );
};
```

### 3. Nurse Alerts

**Integrate into main WardDashboard (top bar)**
```typescript
import { NurseAlertComponent } from '@/components/NurseStation/Phase2/NurseAlertComponent';

const WardDashboard = () => {
  const [alerts, setAlerts] = useState<NurseAlert[]>([]);

  useEffect(() => {
    // Fetch alerts every 30 seconds
    const interval = setInterval(async () => {
      const response = await apiClient.get(`/wards/${wardId}/alerts`);
      setAlerts(response.data);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [wardId]);

  return (
    <div>
      <NurseAlertComponent
        wardId={wardId}
        alerts={alerts}
      />
      
      <PatientGrid patients={patients} />
    </div>
  );
};
```

### 4. Task Queue

**Integrate alongside Ward Dashboard**
```typescript
import { NurseTaskQueueComponent } from '@/components/NurseStation/Phase2/NurseTaskQueueComponent';

const WardDashboard = () => {
  const [tasks, setTasks] = useState<NurseTask[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await apiClient.get(`/wards/${wardId}/queue`);
      setTasks(response.data);
    };
    
    fetchTasks();
    const interval = setInterval(fetchTasks, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [wardId]);

  const handleTaskCreate = async (task: NurseTask) => {
    const response = await apiClient.post('/nurse-tasks', task);
    setTasks([...tasks, response.data]);
  };

  const handleTaskUpdate = async (task: NurseTask) => {
    const response = await apiClient.put(`/nurse-tasks/${task.id}`, task);
    setTasks(tasks.map(t => t.id === task.id ? response.data : t));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <PatientGrid patients={patients} />
      </div>
      <div className="lg:col-span-1">
        <NurseTaskQueueComponent
          wardId={wardId}
          tasks={tasks}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </div>
  );
};
```

### 5. Quality Dashboard

**Create new page for Head Nurses**
```typescript
// pages/dashboard/quality.tsx
import { HeadNurseQualityDashboard } from '@/components/NurseStation/Phase2/HeadNurseQualityDashboard';

export default function QualityDashboardPage() {
  const [metrics, setMetrics] = useState<NurseMetric[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await apiClient.get(`/wards/${wardId}/metrics`);
      setMetrics(response.data);
    };
    
    fetchMetrics();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <HeadNurseQualityDashboard
        wardId={wardId}
        metrics={metrics}
      />
    </div>
  );
}
```

**Sidebar Menu Addition**
```typescript
const menuItems = [
  // ... existing items
  {
    label: 'Quality Dashboard',
    path: '/dashboard/quality',
    icon: BarChart3,
    roles: ['HEAD_NURSE', 'ADMIN'],
  },
];
```

## API Integration Examples

### Creating a Shift Handover
```typescript
const createHandover = async (wardId: string, nurseId: string) => {
  const response = await apiClient.post('/shift-handovers', {
    wardId,
    fromNurseId: nurseId,
    toNurseId: incomingNurseId,
    notes: 'All patients stable. Mrs. Kumar in bed 3 needs blood draw at 2 PM.',
    patients: [
      { patientId: 'P001', name: 'Mrs. Kumar', status: 'stable' },
      { patientId: 'P002', name: 'Mr. Singh', status: 'post-op day 2' },
    ],
    criticalItems: [
      {
        patientId: 'P001',
        description: 'Pending lab results for diabetes screening',
        severity: 'high',
      },
    ],
  });
  
  return response.data;
};
```

### Creating a Nursing Note
```typescript
const createSoapNote = async (patientId: string) => {
  const response = await apiClient.post('/nursing-notes', {
    patientId,
    wardId,
    nurseId: currentNurseId,
    noteType: 'soap',
    soapData: {
      subjective: 'Patient reports pain 6/10 in left knee. Denies fever, nausea.',
      objective: 'BP 130/85, HR 88, Temp 98.6F. Left knee swollen ~2cm diameter.',
      assessment: 'Post-operative day 2 knee replacement. Pain controlled. No signs infection.',
      plan: 'Continue ice therapy. Pain meds 4-6 hours. Physical therapy evaluation tomorrow.',
    },
  });
  
  return response.data;
};
```

### Acknowledging an Alert
```typescript
const acknowledgeAlert = async (alertId: string) => {
  const response = await apiClient.put(`/nurse-alerts/${alertId}/acknowledge`, {
    acknowledgedNotes: 'Additional meds ordered. Will administer at next window.',
  });
  
  return response.data;
};
```

### Creating a Task
```typescript
const createTask = async (patientId: string) => {
  const response = await apiClient.post('/nurse-tasks', {
    wardId,
    taskType: 'vitals',
    assignedTo: currentNurseId,
    patientId,
    priority: 'high',
    dueTime: new Date(Date.now() + 30 * 60000), // 30 min from now
    description: 'Record vital signs for post-op monitoring',
  });
  
  return response.data;
};
```

### Completing a Task
```typescript
const completeTask = async (taskId: string) => {
  const response = await apiClient.put(`/nurse-tasks/${taskId}/status`, {
    status: 'completed',
    notes: 'Vitals recorded: BP 128/82, HR 85, Temp 98.7F',
  });
  
  return response.data;
};
```

### Fetching Ward Quality Metrics
```typescript
const fetchWardMetrics = async (wardId: string) => {
  const response = await apiClient.get(`/wards/${wardId}/metrics`);
  
  // Returns: { medicationCompliance: 92.5, taskCompletion: 88.3, ... }
  return response.data;
};
```

## State Management Integration

### Using with Zustand (Recommended)
```typescript
// stores/nurseStationStore.ts
import { create } from 'zustand';

interface NurseStationStore {
  // Handovers
  handovers: ShiftHandover[];
  setHandovers: (handovers: ShiftHandover[]) => void;
  createHandover: (data: any) => Promise<void>;
  
  // Alerts
  alerts: NurseAlert[];
  setAlerts: (alerts: NurseAlert[]) => void;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  
  // Tasks
  tasks: NurseTask[];
  setTasks: (tasks: NurseTask[]) => void;
  completeTask: (taskId: string) => Promise<void>;
  
  // Metrics
  metrics: NurseQualityMetric[];
  setMetrics: (metrics: NurseQualityMetric[]) => void;
}

export const useNurseStationStore = create<NurseStationStore>((set) => ({
  handovers: [],
  setHandovers: (handovers) => set({ handovers }),
  createHandover: async (data) => {
    const response = await apiClient.post('/shift-handovers', data);
    set((state) => ({
      handovers: [response.data, ...state.handovers],
    }));
  },
  
  // ... other methods
}));

// Usage in component
const { alerts, acknowledgeAlert } = useNurseStationStore();
```

### Using with Redux
```typescript
// reducers/alertSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledge',
  async (alertId: string) => {
    const response = await apiClient.put(`/nurse-alerts/${alertId}/acknowledge`);
    return response.data;
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    items: [],
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(acknowledgeAlert.pending, (state) => {
        state.loading = true;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        state.items = state.items.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        );
        state.loading = false;
      });
  },
});

export default alertSlice.reducer;
```

## Real-time Updates

### Using WebSockets (Recommended for alerts)
```typescript
// hooks/useAlertSubscription.ts
import { useEffect } from 'react';
import io from 'socket.io-client';

export const useAlertSubscription = (wardId: string) => {
  const socket = io(process.env.REACT_APP_API_URL);
  
  useEffect(() => {
    socket.on('connect', () => {
      socket.emit('join-ward', wardId);
    });
    
    socket.on('alert:new', (alert: NurseAlert) => {
      console.log('New alert:', alert);
      // Update UI state
    });
    
    socket.on('alert:updated', (alert: NurseAlert) => {
      console.log('Alert updated:', alert);
    });
    
    return () => socket.disconnect();
  }, [wardId]);
};

// Usage in component
const WardDashboard = () => {
  useAlertSubscription(wardId);
  // ...
};
```

### Polling Fallback
```typescript
const useAlertPolling = (wardId: string) => {
  const [alerts, setAlerts] = useState<NurseAlert[]>([]);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      const response = await apiClient.get(`/wards/${wardId}/alerts`);
      setAlerts(response.data);
    };
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [wardId]);
  
  return alerts;
};
```

## Testing

### Unit Testing Services
```typescript
// ShiftHandoverService.test.ts
import { ShiftHandoverService } from './ShiftHandoverService';

describe('ShiftHandoverService', () => {
  let service: ShiftHandoverService;
  let mockRepository: any;
  
  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    service = new ShiftHandoverService(mockRepository);
  });
  
  it('should create handover with audit log', async () => {
    const data = {
      wardId: 'ward-1',
      fromNurseId: 'nurse-1',
      toNurseId: 'nurse-2',
      notes: 'All stable',
      patients: [],
      criticalItems: [],
      createdBy: 'nurse-1',
    };
    
    mockRepository.create.mockReturnValue(data);
    mockRepository.save.mockResolvedValue({
      ...data,
      id: 'handover-1',
      auditLog: '{"timestamp":"...","userId":"nurse-1","message":"Handover created"}',
    });
    
    const result = await service.createHandover(data);
    
    expect(result.id).toBe('handover-1');
    expect(result.auditLog).toBeDefined();
  });
});
```

### Integration Testing Components
```typescript
// NursingNotesComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NursingNotesComponent } from './NursingNotesComponent';

describe('NursingNotesComponent', () => {
  it('should create SOAP note', async () => {
    const handleSubmit = jest.fn();
    
    render(
      <NursingNotesComponent
        wardId="ward-1"
        currentNurseId="nurse-1"
        onNoteSubmit={handleSubmit}
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText(/patient id/i), {
      target: { value: 'P001' },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/subjective/i), {
      target: { value: 'Patient reports pain' },
    });
    
    fireEvent.click(screen.getByText(/save note/i));
    
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'P001',
        noteType: 'soap',
      })
    );
  });
});
```

## Troubleshooting

### Audit Log Not Appearing
**Problem:** Audit logs empty after operations

**Solution:**
```typescript
// Verify logAudit is called in service methods
private logAudit(message: string, userId: string): string {
  return JSON.stringify({ 
    timestamp: new Date().toISOString(), 
    userId, 
    message 
  });
}

// And auditLog is appended:
entity.auditLog = (entity.auditLog || '') + '\n' + this.logAudit('action', userId);
```

### Metrics Not Calculating
**Problem:** Quality metrics dashboard empty

**Solution:**
```typescript
// Run calculation job (daily or on-demand)
const calculateMetrics = async (wardId: string, date: Date) => {
  const tasks = await taskService.getTasksByWard(wardId);
  const taskCompletion = (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100;
  
  const alerts = await alertService.getAlertsByWard(wardId);
  const alertAck = (alerts.filter(a => a.status !== 'open').length / alerts.length) * 100;
  
  // Save to database
  await metricsService.createOrUpdateMetrics(wardId, nurseId, date, {
    taskCompletionRate: taskCompletion,
    handoverAcknowledgementRate: alertAck,
    // ... other metrics
  });
};
```

### Performance Issues on Dashboard
**Problem:** Quality dashboard slow with many nurses

**Solution:**
- Add indexes: `CREATE INDEX idx_metric_wardid ON nurse_quality_metrics(ward_id)`
- Implement caching: Cache ward-level KPIs for 5 minutes
- Denormalize: Pre-calculate and store average rates
- Pagination: Show top 20 nurses, pagination for rest

## Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_handover_wardid ON shift_handovers(ward_id);
CREATE INDEX idx_handover_status ON shift_handovers(status);
CREATE INDEX idx_alert_wardid ON nurse_alerts(ward_id);
CREATE INDEX idx_alert_severity ON nurse_alerts(severity);
CREATE INDEX idx_task_wardid ON nurse_tasks(ward_id);
CREATE INDEX idx_task_duetime ON nurse_tasks(due_time);
CREATE INDEX idx_metric_wardid_date ON nurse_quality_metrics(ward_id, metric_date);
CREATE INDEX idx_note_patientid ON nursing_notes(patient_id);
```

### Query Optimization
```typescript
// Instead of: SELECT * FROM notes WHERE ward_id = ?
// Use: SELECT id, patient_id, created_at, note_type FROM notes WHERE ward_id = ? LIMIT 100

// Join only needed relations
const notes = await repository.find({
  where: { wardId },
  relations: ['patient'], // Only load patient, not all relations
  select: ['id', 'patientId', 'createdAt', 'noteType'],
  take: 100,
});
```

### Caching Strategy
```typescript
// Cache ward KPIs for 5 minutes
const getWardKpis = async (wardId: string) => {
  const cacheKey = `ward_kpis_${wardId}`;
  
  // Check cache first
  let kpis = await cache.get(cacheKey);
  if (!kpis) {
    kpis = await calculateKpis(wardId);
    await cache.set(cacheKey, kpis, { ttl: 300 }); // 5 minutes
  }
  
  return kpis;
};
```

## Deployment Checklist

- [ ] Database migrations run successfully
- [ ] All environment variables configured
- [ ] Services registered in AppModule
- [ ] Controllers registered in AppModule
- [ ] Routes configured in main app file
- [ ] JWT authentication middleware setup
- [ ] API documentation generated
- [ ] UI components integrated into main dashboard
- [ ] Real-time WebSocket connections tested
- [ ] Performance testing (load tests on dashboard)
- [ ] Security testing (audit log integrity, access control)
- [ ] Data privacy audit (HIPAA compliance)
- [ ] User training materials prepared
- [ ] Rollback plan prepared

## Next Steps

1. **Backend completion:** Implement remaining services if not all created
2. **API Testing:** Write and run Postman tests for all endpoints
3. **Frontend Integration:** Integrate components into existing Nurse Station UI
4. **Real-time Features:** Connect WebSocket for live alerts
5. **Reporting:** Add PDF export for quality metrics reports
6. **Mobile:** Adapt dashboard for mobile/tablet nursing staff
7. **Notifications:** Add email/SMS alerts for critical items
8. **Analytics:** Implement advanced analytics and trend analysis

## Related Documentation

- [Phase 2 Features Overview](NURSE_STATION_PHASE_2_README.md)
- [Phase 1 Documentation](NURSE_STATION_README.md)
- [Component API Reference](NURSE_STATION_COMPONENTS.md)
- Backend Service Files: `backend/src/services/`
- Frontend Components: `frontend/src/components/NurseStation/Phase2/`

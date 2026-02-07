# Nurse Station Component Reference

## Overview

Complete reference for all Nurse Station module components, hooks, and their APIs.

## Components

### WardDashboard

Main dashboard component for managing all patients in a ward.

**Location**: `@/components/nurse-station/WardDashboard.tsx`

**Props**:
```typescript
interface WardDashboardProps {
  wardId: string;
  userRole: string;
  currentUser?: { id: string; firstName: string; lastName: string };
}
```

**Features**:
- Real-time patient list with 30-second auto-refresh
- Grid and list view modes
- Advanced filtering by status
- Search by patient name or ID
- Sorting by bed number, name, or admission time
- Statistical overview cards
- Patient count by status

**State Management**:
- `admissions`: Array of InpatientAdmission
- `loading`: Boolean
- `error`: String or null
- `viewMode`: 'grid' | 'list'
- `filterStatus`: Status filter value
- `searchQuery`: Search string
- `sortBy`: Sort field

**Events**:
- Refresh button triggers data reload
- Patient selection for detail view
- Filter/sort changes update display

---

### PatientCard

Individual patient information card with comprehensive tabbed interface.

**Location**: `@/components/nurse-station/PatientCard.tsx`

**Props**:
```typescript
interface PatientCardProps {
  admission: InpatientAdmission;
  ward?: Ward;
  userRole: string;
  currentUser?: User;
}
```

**Features**:
- Expandable/collapsible card design
- 6 tabbed sections:
  - Overview: Demographics, medical history
  - Vitals: Vital signs with trends
  - Messages: Ward communication
  - Emergency: Emergency event management
  - Supplies: Supply requests
  - Handover: Shift handover notes
- Status badge display
- Quick patient metrics
- Collapsed state showing key info

**Tabs**:
1. **Overview**: Patient demographics, medical history, allergies, medications, emergency contact
2. **Vitals**: Real-time vital signs with time range selection
3. **Messages**: Ward messaging interface
4. **Emergency**: Emergency event creation and history
5. **Supplies**: Supply request form and history
6. **Handover**: Shift handover documentation

---

### VitalsChartsTab

Vital signs monitoring and trend analysis component.

**Location**: `@/components/nurse-station/VitalsChartsTab.tsx`

**Props**:
```typescript
interface VitalsChartsTabProps {
  admission: InpatientAdmission;
}
```

**Features**:
- Real-time vital sign cards
- 5 vital sign types:
  - Heart Rate (60-100 bpm normal)
  - Temperature (36.5-37.5°C normal)
  - Respiratory Rate (12-20 breaths/min normal)
  - O2 Saturation (95-100% normal)
  - Blood Pressure (90-120/60-80 mmHg normal)
- Status indicators (normal, low, high, unknown)
- Time range selector (6h, 12h, 24h, 7d)
- Trend analysis with change indicators
- Abnormal value highlighting
- Action items list

**Vital Status Colors**:
- Green: Normal range
- Red: Abnormal (high or low)
- Blue: Below normal
- Orange: Above normal

**Data Structure**:
```typescript
interface VitalRecord {
  timestamp: Date;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}
```

---

### EmergencyTab

Emergency event management and tracking component.

**Location**: `@/components/nurse-station/EmergencyTab.tsx`

**Props**:
```typescript
interface EmergencyTabProps {
  admission: InpatientAdmission;
  userRole: string;
}
```

**Features** (Staff Nurses only):
- Emergency type selection (9 types)
- Severity classification (low, medium, high, critical)
- Automatic doctor notification
- Event status tracking
- History with detailed information
- Outcome tracking

**Emergency Types**:
1. Cardiac arrest
2. Respiratory distress
3. Seizure
4. Anaphylaxis
5. Severe bleeding
6. Code blue
7. Septic shock
8. Acute abdomen
9. Other

**Event Status Flow**:
```
Reported → Acknowledged → In Progress → Resolved
                ↓
            Escalated
```

**Data Structure**:
```typescript
interface EmergencyEvent {
  id: string;
  patientId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated';
  description: string;
  location: string;
  timeOfEvent: Date;
  reportedBy?: NurseUser;
  resolvingDoctor?: Doctor;
  actionsTaken?: string;
  outcome?: string;
}
```

---

### SuppliesTab

Medical supply request management component.

**Location**: `@/components/nurse-station/SuppliesTab.tsx`

**Props**:
```typescript
interface SuppliesTabProps {
  admission: InpatientAdmission;
  wardId: string;
  userRole: string;
}
```

**Features** (Staff Nurses only):
- Supply request form with validation
- Category selection (8 categories)
- Quantity specification
- Urgency level selection
- Optional notes
- Request history tracking
- Fulfillment status

**Supply Categories**:
1. Dressings & Wound Care
2. IV & Infusion
3. Medications
4. Diagnostic Equipment
5. Monitoring Devices
6. Personal Care
7. Linens & Hygiene
8. Other

**Urgency Levels**:
- Scheduled: No time constraint
- Routine: Normal priority
- Urgent: Priority needed soon
- STAT: Critical immediate need

**Request Status**:
- Pending: Waiting to be fulfilled
- Fulfilled: Completed
- Cancelled: Cancelled request

**Data Structure**:
```typescript
interface SupplyRequest {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  urgency: 'scheduled' | 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'fulfilled' | 'cancelled';
  requestDateTime: Date;
  fulfilledDateTime?: Date;
  notes?: string;
  patientId: string;
  inpatientAdmissionId: string;
}
```

---

### HandoverTab

Shift handover documentation component.

**Location**: `@/components/nurse-station/HandoverTab.tsx`

**Props**:
```typescript
interface HandoverTabProps {
  admission: InpatientAdmission;
  wardId: string;
  userRole: string;
}
```

**Features** (Staff Nurses only):
- Handover template selection (10 templates)
- Key points summary
- Detailed clinical updates
- Pending tasks management
- Risk alerts documentation
- Family communication notes
- Handover history

**Handover Templates**:
1. General Shift Handover
2. Post-Operative Care
3. Critical Condition Update
4. Discharge Planning
5. Pain Management Review
6. Infection Control Alert
7. Medication Review
8. Behavioral/Psychological Notes
9. Family Communication
10. Other

**Form Fields**:
- Template selection (required)
- Key Points (optional)
- Clinical Update (required)
- Tasks Pending (multiple entries)
- Risk Alerts (optional)
- Family Referrals (optional)

**Data Structure**:
```typescript
interface NurseHandover {
  id: string;
  patientId: string;
  handoverTemplate: string;
  keyPoints?: string;
  clinicalUpdate: string;
  tasksPending: string[];
  riskAlerts?: string;
  familyReferrals?: string;
  handoverDateTime: Date;
  nurse?: NurseUser;
  toShift?: string;
}
```

---

### CommunicationTab

Ward messaging and communication component.

**Location**: `@/components/nurse-station/CommunicationTab.tsx`

**Props**:
```typescript
interface CommunicationTabProps {
  admission: InpatientAdmission;
  ward?: Ward;
  userRole: string;
  currentUser?: User;
}
```

**Features**:
- Real-time message display
- 3 message types (General, Alert, Reminder)
- Doctor and ward contact information
- Auto-refresh every 10 seconds
- Message character limit (500)
- Recipient selection
- Timestamp display

**Message Types**:
- **General**: Standard ward communication
- **Alert**: Critical/urgent information
- **Reminder**: Task reminders and notifications

**Contact Display**:
- Attending doctor name and phone
- Ward name and bed location

**Data Structure**:
```typescript
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  recipientIds: string[];
  type: 'general' | 'alert' | 'reminder';
}
```

---

## Custom Hooks

### useNurseStation

Main hook for ward-level operations.

**Location**: `@/hooks/useNurseStation.ts`

**Usage**:
```typescript
const {
  admissions,
  loading,
  error,
  loadAdmissions,
  getAdmission,
  recordVitals,
  raiseEmergency,
  requestSupply,
  createHandover,
  sendMessage,
  getVitals,
  getEmergencies,
  getCriticalPatients,
  getDischargeReadyPatients,
  dischargePatient,
  clearError,
} = useNurseStation({
  wardId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
});
```

**Returns**:
- `admissions`: InpatientAdmission[]
- `loading`: Boolean
- `error`: String | null
- Action methods for all operations

---

### usePatient

Single patient data management.

**Location**: `@/hooks/useNurseStation.ts`

**Usage**:
```typescript
const { admission, loading, error, loadPatient } = usePatient(admissionId);
```

**Returns**:
- `admission`: InpatientAdmission | null
- `loading`: Boolean
- `error`: String | null
- `loadPatient()`: Function to reload data

---

### usePatientVitals

Vital signs data management.

**Location**: `@/hooks/useNurseStation.ts`

**Usage**:
```typescript
const {
  vitals,
  loading,
  error,
  timeRange,
  loadVitals,
  addVital,
  changeTimeRange,
} = usePatientVitals(admissionId);
```

**Time Ranges**: '6h' | '12h' | '24h' | '7d'

---

### useEmergencyEvents

Emergency event management.

**Location**: `@/hooks/useNurseStation.ts`

**Usage**:
```typescript
const {
  events,
  loading,
  error,
  filter,
  loadEvents,
  raiseEvent,
  acknowledge,
  changeFilter,
} = useEmergencyEvents(wardId);
```

---

### useWardMessages

Ward messaging management.

**Location**: `@/hooks/useNurseStation.ts`

**Usage**:
```typescript
const {
  messages,
  loading,
  error,
  loadMessages,
  sendMessage,
} = useWardMessages(wardId, patientId);
```

---

## API Client

### nurseStationAPI

API client for backend communication.

**Location**: `@/lib/nurse-station-api.ts`

**Key Methods**:

**Admissions**:
- `listInpatientAdmissions(wardId?, status?, isIcu?, isNicu?)`
- `getInpatientAdmission(id)`
- `createInpatientAdmission(data)`
- `dischargePatient(id, data)`

**Vital Signs**:
- `recordVitals(data)`
- `getAdmissionVitals(admissionId, timeRange)`
- `listPatientVitals(admissionId)`

**Emergency Events**:
- `raiseEmergencyEvent(data)`
- `listEmergencyEvents(wardId?, status?, severity?)`
- `acknowledgeEmergencyEvent(id)`
- `getEmergencyEvent(id)`

**Supplies**:
- `requestSupply(data)`
- `listSupplyRequests(wardId?, status?)`
- `fulfillSupplyRequest(id)`

**Handovers**:
- `createNurseHandover(data)`
- `listNurseHandovers(wardId?, nurseId?)`
- `getNurseHandover(id)`

**Messages**:
- `sendWardMessage(data)`
- `listWardMessages(wardId, patientId?)`

**Ward Info**:
- `listWards()`
- `getWard(id)`
- `listBeds(wardId?, status?)`
- `getBed(id)`

---

## Type Definitions

All types located in `@/types/nurse-station.ts`

**Core Types**:
- InpatientAdmission
- EmergencyEvent
- SupplyRequest
- NurseHandover
- Ward
- Bed
- Doctor
- NurseUser
- VitalSigns

---

## Integration Points

### Required Backend Endpoints

All endpoints should be prefixed with `/api/nurse-station`

- `GET/POST /admissions`
- `GET/POST /vital-signs`
- `GET/POST /emergency-events`
- `GET/POST /supply-requests`
- `GET/POST /nurse-handovers`
- `GET/POST /ward-messages`
- `GET /wards`
- `GET /beds`

### Authentication

All API requests include Bearer token in Authorization header:
```
Authorization: Bearer {token}
```

Token retrieved from localStorage: `authToken`

---

## Related Documentation

- [Overview](./NURSE_STATION_README.md)
- [Implementation Guide](./NURSE_STATION_IMPLEMENTATION.md)

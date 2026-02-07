# Ward-Based Nurse Station Module

## Overview

The Nurse Station module provides backend support for ward-based clinical operations including:
- Nurse assignments to wards/floors
- Patient admissions and discharges
- Doctor orders (read-only for nurses)
- Medication schedules and administration tracking
- Vital signs recording with abnormality detection
- Emergency event reporting and escalation

## Architecture

### Entities
- **NurseAssignment**: Track nurse assignments to wards/floors with shift times
- **InpatientAdmission**: Patient hospital admissions linked to beds
- **DoctorOrder**: Doctor-issued orders (medication, procedures, investigations, etc.)
- **MedicationSchedule**: Prescription details with dosage, frequency, monitoring parameters
- **MedicationAdministration**: Actual medication administration records by nurses
- **VitalsRecord**: Patient vital signs recordings with abnormality flagging
- **EmergencyEvent**: Emergency situations (cardiac arrest, respiratory distress, etc.)

### Access Control

| Role          | Permissions |
|---------------|-------------|
| STAFF_NURSE   | Record vitals, execute medications, raise emergency events, view orders/schedules |
| HEAD_NURSE    | Assign nurses, admit/discharge patients, manage ward operations, approve medications |
| DOCTOR        | Create orders, write medication schedules, acknowledge/resolve emergencies |
| ADMIN         | All access (system administration) |

## API Endpoints

### Nurse Assignments
> HEAD_NURSE role required for modifications

#### Create Assignment
```http
POST /api/nurse-station/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "nurseId": "uuid",
  "wardId": "uuid",
  "floorNumber": 2,
  "assignedBeds": ["bed-001", "bed-002"],
  "shiftStartTime": "09:00",
  "shiftEndTime": "17:00",
  "shiftDate": "2024-01-15",
  "notes": "Primary care assignment"
}
```

#### List Assignments
```http
GET /api/nurse-station/assignments?wardId=uuid&nurseId=uuid
Authorization: Bearer {token}
```

#### Update Assignment
```http
PATCH /api/nurse-station/assignments/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignedBeds": ["bed-001", "bed-002", "bed-003"],
  "status": "active",
  "notes": "Updated bed assignment"
}
```

### Inpatient Admissions
> HEAD_NURSE and DOCTOR roles required for modifications

#### Admit Patient
```http
POST /api/nurse-station/admissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "uuid",
  "bedId": "uuid",
  "wardId": "uuid",
  "admissionType": "emergency|scheduled|transfer",
  "attendingDoctorId": "uuid",
  "chiefComplaint": "Severe chest pain",
  "admissionNotes": "Patient admitted via ER",
  "isIcu": true,
  "isNicu": false
}
```

#### List Admissions
```http
GET /api/nurse-station/admissions?wardId=uuid&status=active&isIcu=true&isNicu=false
Authorization: Bearer {token}
```

#### Get Admission Details
```http
GET /api/nurse-station/admissions/{id}
Authorization: Bearer {token}
```

#### Discharge Patient
```http
PATCH /api/nurse-station/admissions/{id}/discharge
Authorization: Bearer {token}
Content-Type: application/json

{
  "dischargeSummary": "Patient stable, discharged with medications",
  "dischargeDate": "2024-01-20"
}
```

### Doctor Orders
> Read-only for STAFF_NURSE and HEAD_NURSE; DOCTOR creates orders

#### Create Doctor Order
```http
POST /api/nurse-station/doctor-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "inpatientAdmissionId": "uuid",
  "orderType": "medication|procedure|investigation|diet|activity|observation",
  "description": "IV Ceftriaxone 1g",
  "instructions": "Administer every 8 hours for 5 days",
  "priority": "routine|urgent|stat",
  "scheduledDate": "2024-01-15",
  "expectedCompletionDate": "2024-01-20",
  "approvalsRequired": 1
}
```

#### List Doctor Orders
```http
GET /api/nurse-station/doctor-orders?admissionId=uuid&status=active&orderType=medication
Authorization: Bearer {token}
```

#### Get Order Details
```http
GET /api/nurse-station/doctor-orders/{id}
Authorization: Bearer {token}
```

### Medication Schedules
> DOCTOR creates; STAFF_NURSE and HEAD_NURSE read

#### Create Medication Schedule
```http
POST /api/nurse-station/medication-schedules
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctorOrderId": "uuid",
  "inpatientAdmissionId": "uuid",
  "medicationName": "Ceftriaxone",
  "dosage": 1,
  "unit": "g",
  "frequency": "Every 8 hours",
  "route": "IV",
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "durationDays": 5,
  "specialInstructions": "Push slowly, monitor for reactions",
  "contraindications": "Penicillin allergy",
  "allergiesToCheck": "Beta-lactams",
  "requiresMonitoring": true,
  "monitoringParameters": ["Temperature", "Rash", "Anaphylaxis"]
}
```

#### List Medication Schedules
```http
GET /api/nurse-station/medication-schedules?admissionId=uuid&status=active
Authorization: Bearer {token}
```

### Medication Administration
> STAFF_NURSE executes; read-access also available

#### Execute Medication
```http
POST /api/nurse-station/medication-administration/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "medicationScheduleId": "uuid",
  "actualDosage": 1,
  "routeUsed": "IV",
  "siteOfAdministration": "Right arm",
  "batchNumber": "LOT2024001",
  "expiryDate": "2025-01-15",
  "nurseNotes": "Administered without complications",
  "patientResponse": "Tolerated well",
  "sideEffectsObserved": false,
  "sideEffectsDetails": null
}
```

#### Skip Medication
```http
POST /api/nurse-station/medication-administration/skip
Authorization: Bearer {token}
Content-Type: application/json

{
  "medicationScheduleId": "uuid",
  "reason": "Patient refused medication",
  "notes": "Patient expressed concern about side effects"
}
```

#### Get Administration Record
```http
GET /api/nurse-station/medication-administration/{id}
Authorization: Bearer {token}
```

### Vital Signs
> STAFF_NURSE records; all roles can read

#### Record Vitals
```http
POST /api/nurse-station/vital-signs
Authorization: Bearer {token}
Content-Type: application/json

{
  "inpatientAdmissionId": "uuid",
  "temperatureCelsius": 37.2,
  "heartRateBpm": 76,
  "systolicBp": 120,
  "diastolicBp": 80,
  "respiratoryRateRpm": 16,
  "oxygenSaturationPercent": 98,
  "bloodGlucoseMmol": 5.5,
  "weightKg": 75,
  "heightCm": 175,
  "painScore": 2,
  "gcsScore": 15,
  "consciousnessLevel": "alert",
  "urineOutputMl": 450,
  "bowelMovementStatus": "normal",
  "notes": "Patient in stable condition",
  "abnormalFindings": false,
  "reportToDoctorId": null
}
```

If `abnormalFindings: true`, doctor is auto-notified for review.

#### List Patient Vitals
```http
GET /api/nurse-station/vital-signs?admissionId=uuid
Authorization: Bearer {token}
```

### Emergency Events
> STAFF_NURSE raises; DOCTOR acknowledges/resolves

#### Raise Emergency Event
```http
POST /api/nurse-station/emergency-events
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "uuid",
  "inpatientAdmissionId": "uuid",
  "eventType": "cardiac_arrest|respiratory_distress|seizure|anaphylaxis|severe_bleeding",
  "severity": "critical|high|medium|low",
  "location": "ICU Bed 5",
  "description": "Patient became unresponsive, chest compressions initiated",
  "doctorsToNotify": ["doctor-uuid-1", "doctor-uuid-2"]
}
```

#### List Emergency Events
```http
GET /api/nurse-station/emergency-events?status=reported&severity=critical
Authorization: Bearer {token}
```

#### Get Event Details
```http
GET /api/nurse-station/emergency-events/{id}
Authorization: Bearer {token}
```

#### Acknowledge Emergency Event (DOCTOR only)
```http
PATCH /api/nurse-station/emergency-events/{id}/acknowledge
Authorization: Bearer {token}
```

## Workflows

### Medication Administration Workflow

1. **DOCTOR** creates DoctorOrder (e.g., "Give Ceftriaxone")
2. **DOCTOR** creates MedicationSchedule with dosage, frequency, route
3. **STAFF_NURSE** views pending medications
4. **STAFF_NURSE** either:
   - Executes medication → MedicationAdministration record created with status `administered`
   - Skips medication → MedicationAdministration record created with status `not_given`/`refused`/`held`
5. **Records audit trail**: timestamp, nurse ID, dosage, site, batch number, side effects

### Vital Signs with Escalation

1. **STAFF_NURSE** records patient vital signs (temperature, BP, HR, O2, etc.)
2. **System flags if abnormal**: e.g., Temp > 39°C or < 35°C
3. **If abnormal flagged**: Doctor auto-notified
4. **DOCTOR** reviews abnormal findings and may create follow-up orders

### Emergency Event Response

1. **STAFF_NURSE** raises emergency event (e.g., cardiac arrest)
2. **System notifies** doctors listed in `doctorsToNotify`
3. **DOCTOR** acknowledges event (status → `in_progress`)
4. **DOCTOR** resolves event (status → `resolved`) with outcome and follow-up notes
5. **Audit trail**: Reporter, response time, actions taken, resolution

## Database Schema

### Key Tables

```sql
-- Nurse Assignments
CREATE TABLE nurse_assignments (
  id UUID PRIMARY KEY,
  nurse_id UUID NOT NULL REFERENCES users(id),
  ward_id UUID NOT NULL REFERENCES wards(id),
  floor_number INT,
  assigned_beds JSONB DEFAULT '[]',
  shift_start_time TIME,
  shift_end_time TIME,
  shift_date DATE,
  assigned_by_id UUID REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inpatient Admissions
CREATE TABLE inpatient_admissions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  bed_id UUID REFERENCES beds(id),
  ward_id UUID NOT NULL REFERENCES wards(id),
  admission_date TIMESTAMP NOT NULL,
  discharge_date TIMESTAMP,
  admission_type VARCHAR(50) CHECK (admission_type IN ('emergency', 'scheduled', 'transfer')),
  attending_doctor_id UUID REFERENCES users(id),
  chief_complaint TEXT,
  admission_notes TEXT,
  discharge_summary TEXT,
  status VARCHAR(50) CHECK (status IN ('active', 'discharged', 'transferred', 'deceased')),
  is_icu BOOLEAN DEFAULT FALSE,
  is_nicu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Orders
CREATE TABLE doctor_orders (
  id UUID PRIMARY KEY,
  inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  order_date TIMESTAMP NOT NULL,
  order_type VARCHAR(50) CHECK (order_type IN ('medication', 'procedure', 'investigation', 'diet', 'activity', 'observation')),
  description TEXT NOT NULL,
  instructions TEXT,
  priority VARCHAR(50) CHECK (priority IN ('routine', 'urgent', 'stat')),
  status VARCHAR(50) CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
  scheduled_date DATE,
  expected_completion_date DATE,
  approvals_required INT DEFAULT 1,
  approved_by_id UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  cancelled_by_id UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication Schedules
CREATE TABLE medication_schedules (
  id UUID PRIMARY KEY,
  doctor_order_id UUID NOT NULL REFERENCES doctor_orders(id),
  inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id),
  medication_name VARCHAR(255) NOT NULL,
  dosage DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  frequency VARCHAR(100),
  route VARCHAR(50) CHECK (route IN ('oral', 'IV', 'IM', 'SC', 'transdermal', 'topical', 'inhalation')),
  start_date DATE,
  end_date DATE,
  duration_days INT,
  special_instructions TEXT,
  contraindications TEXT,
  allergies_to_check TEXT,
  requires_monitoring BOOLEAN DEFAULT FALSE,
  monitoring_parameters JSONB DEFAULT '[]',
  prescribing_doctor_id UUID REFERENCES users(id),
  prescribed_at TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication Administration
CREATE TABLE medication_administrations (
  id UUID PRIMARY KEY,
  medication_schedule_id UUID NOT NULL REFERENCES medication_schedules(id),
  inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id),
  scheduled_time TIMESTAMP,
  administered_time TIMESTAMP,
  administered_by_id UUID REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN ('pending', 'administered', 'refused', 'held', 'delayed', 'not_given')),
  reason_if_not_given TEXT,
  actual_dosage DECIMAL(10, 2),
  route_used VARCHAR(50),
  site_of_administration VARCHAR(100),
  batch_number VARCHAR(50),
  expiry_date DATE,
  nurse_notes TEXT,
  patient_response TEXT,
  side_effects_observed BOOLEAN DEFAULT FALSE,
  side_effects_details TEXT,
  verified_by_id UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vital Signs Records
CREATE TABLE vitals_records (
  id UUID PRIMARY KEY,
  inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id),
  recorded_by_id UUID NOT NULL REFERENCES users(id),
  recorded_at TIMESTAMP NOT NULL,
  temperature_celsius DECIMAL(4, 2),
  heart_rate_bpm INT,
  systolic_bp INT,
  diastolic_bp INT,
  respiratory_rate_rpm INT,
  oxygen_saturation_percent DECIMAL(5, 2),
  blood_glucose_mmol DECIMAL(6, 2),
  weight_kg DECIMAL(6, 2),
  height_cm INT,
  pain_score INT CHECK (pain_score >= 0 AND pain_score <= 10),
  gcs_score INT,
  consciousness_level VARCHAR(100),
  urine_output_ml INT,
  bowel_movement_status VARCHAR(100),
  notes TEXT,
  abnormal_findings BOOLEAN DEFAULT FALSE,
  reported_to_doctor_id UUID REFERENCES users(id),
  reported_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Events
CREATE TABLE emergency_events (
  id UUID PRIMARY KEY,
  inpatient_admission_id UUID REFERENCES inpatient_admissions(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  reported_by_id UUID NOT NULL REFERENCES users(id),
  event_type VARCHAR(100),
  severity VARCHAR(50) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  location VARCHAR(255),
  description TEXT,
  time_of_event TIMESTAMP NOT NULL,
  response_start_time TIMESTAMP,
  response_end_time TIMESTAMP,
  doctors_notified_ids JSONB DEFAULT '[]',
  notified_at TIMESTAMP,
  actions_taken TEXT,
  outcome TEXT,
  status VARCHAR(50) CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'escalated')),
  resolving_doctor_id UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

All endpoints use standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200  | Success (GET, PATCH) |
| 201  | Created (POST) |
| 400  | Bad Request (invalid input) |
| 401  | Unauthorized (no token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found (entity doesn't exist) |
| 409  | Conflict (e.g., bed not vacant) |
| 500  | Internal Server Error |

## Audit Logging

All write operations (POST, PATCH) are automatically logged:
- User ID performing action
- Entity type and ID
- Action (create, update, discharge)
- Timestamp
- New values

Audit logs are stored in `audit_logs` table for compliance and traceability.

## Integration Notes

### Notification Service (TODO)
- Emergency events should trigger real-time notifications to doctors
- Abnormal vital signs should alert attending doctor
- Medication verification should notify nurse/doctor upon completion

### Bed Management Integration
- Admission automatically updates bed status to "occupied"
- Discharge automatically updates bed status to "vacant"
- Bed assignment linked to nurse assignments

### Doctor Order Approval Workflow
- Doctor orders can require multiple approvals
- Approval tracking: `approvalsRequired`, `approvedById`, `approvedAt`
- Current implementation: read-only for nurses (approval workflow in progress)

## Testing Checklist

- [ ] Create nurse assignment → verify nurse can see assigned beds
- [ ] Admit patient → verify bed status updates to occupied
- [ ] Create medication schedule → verify visible to nurses
- [ ] Execute medication → verify record created, audit logged
- [ ] Record vital signs (abnormal) → verify doctor notified
- [ ] Record vital signs (normal) → verify no notification
- [ ] Raise emergency event → verify doctors notified
- [ ] Acknowledge emergency → verify status updates
- [ ] Discharge patient → verify bed status updates to vacant
- [ ] Verify audit logs → all writes logged with user/timestamp
- [ ] Test RBAC → unauthorized roles receive 403 errors


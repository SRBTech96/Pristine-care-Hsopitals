# AppointmentsModule - Pristine Hospital

This module implements **concurrency-safe appointment booking** with row-level ownership enforcement and audit logging.

## Features

### 1. **Optimistic Locking for Concurrency Safety**
- Each appointment has a `version` field (starts at 1)
- When updating or cancelling, clients must include the current version
- If the version doesn't match the database, a `ConflictException` is thrown
- Clients must refresh and retry with the new version
- Prevents race conditions in high-concurrency booking scenarios

**Example conflict resolution:**
```
Client A reads: version=1
Client B reads: version=1
Client B saves: version -> 2
Client A tries to save with version=1 -> CONFLICT
Client A refetches: version=2
Client A retries with version=2 -> SUCCESS
```

### 2. **Row-Level Ownership Enforcement**
- `@Ownership` decorator on each endpoint ensures:
  - Patients can only view/manage their own appointments
  - Doctors can only view appointments they are assigned to
  - Admins bypass ownership checks
  - Unauthorized access returns 403 Forbidden

### 3. **Audit Logging**
- `@Auditable` decorator logs all appointments access/mutations to `data_access_logs` and `audit_logs`
- Tracks: user ID, resource ID, action (view/create/update/delete), IP address, timestamp
- Immutable audit trail for compliance

## Endpoints

### GET `/api/appointments/:id`
- Retrieves appointment by ID
- Requires: Patient/Doctor/Admin ownership
- Audited: view access
- Response: `AppointmentResponseDto`

**Example response:**
```json
{
  "id": "uuid",
  "appointmentNumber": "APT-1707331200000-abc12345",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "departmentId": "dept-uuid",
  "scheduledAt": "2026-02-10T10:00:00Z",
  "durationMinutes": 30,
  "status": "scheduled",
  "version": 1,
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T..."
}
```

### POST `/api/appointments`
- Creates a new appointment
- Body: `CreateAppointmentDto`
- Audited: create action
- Response: `AppointmentResponseDto` with version=1

**Example request:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "departmentId": "dept-uuid",
  "scheduledAt": "2026-02-10T10:00:00Z",
  "durationMinutes": 30,
  "reasonForVisit": "Routine checkup"
}
```

### PATCH `/api/appointments/:id`
- Updates consultation notes (doctor adds notes after appointment)
- **REQUIRED:** Include `version` in body to handle concurrency
- Body: `UpdateAppointmentDto`
- Throws: `ConflictException` if version mismatch
- Audited: update action

**Example request:**
```json
{
  "consultationNotes": "Patient shows signs of...",
  "version": 1
}
```

### DELETE `/api/appointments/:id`
- Cancels an appointment
- **REQUIRED:** Include `version` in body
- Body: `CancelAppointmentDto`
- Throws: `ConflictException` if version mismatch or already cancelled
- Audited: delete action

**Example request:**
```json
{
  "cancellationReason": "Patient requested reschedule",
  "version": 1
}
```

## Technology Stack

- **TypeORM** with optimistic locking via `version` field
- **NestJS Guards**: JwtAuthGuard, RolesGuard, OwnershipGuard
- **Decorators**: @Ownership, @Auditable, @Roles
- **Validation**: class-validator DTOs

## Security

✓ Zero Trust: All endpoints require JWT + RBAC + ownership check
✓ No bulk data exposure: ownerField ensures single-resource access
✓ Audit trail: All mutations logged to database
✓ Concurrency safe: Optimistic locking prevents lost updates
✓ Version-based conflict handling: Clients know when to retry

## Testing

Run unit tests:
```bash
npm test -- appointments.service.spec.ts
```

Tests cover:
- Version increment on update
- ConflictException on version mismatch
- Status transitions (scheduled -> cancelled)
- Appointment creation with ID generation

# DoctorsModule - Pristine Hospital

This module provides secure access to doctor profiles and availability slots, designed to integrate with the AppointmentsModule for booking workflows.

## Features

### 1. **Doctor Profile Management**
- Doctor registration information: qualifications, specialization, department, years of experience
- Consultation fee tracking
- Doctor availability status (online/offline)
- Immutable audit trail of profile changes

### 2. **Availability Slots**
- Recurring weekly availability (day of week + time range)
- Configurable slot duration (30 min, 45 min, 60 min, etc.)
- Enable/disable slots per doctor
- Quick lookup for available time slots

### 3. **Department Linkage**
- Doctors linked to departments (Cardiology, Surgery, etc.)
- Quick lookup of all available doctors in a department
- Department-based filtering for patient booking

### 4. **Audit Logging**
- All doctor profile views logged to `data_access_logs`
- Availability queries audited
- Immutable audit trail for compliance

## Entities

### Doctor
Maps to `doctors` table.

```typescript
{
  id: UUID;
  userId: UUID; // Link to users table for auth
  registrationNumber: string; // Medical council registration
  specializationId: UUID; // Foreign key to specializations
  departmentId: UUID; // Foreign key to departments
  qualifications: string; // MD, MBBS, etc.
  yearsOfExperience: number;
  consultationFee?: decimal; // Optional fee per consultation
  isAvailable: boolean; // Can accept new bookings?
  createdAt: timestamptz;
  updatedAt: timestamptz;
}
```

### DoctorAvailabilitySlot
Maps to `doctor_availability_slots` table.

```typescript
{
  id: UUID;
  doctorId: UUID; // Foreign key to doctors
  dayOfWeek: number; // 0=Sunday through 6=Saturday
  startTime: string; // HH:mm format, e.g., "09:00"
  endTime: string; // HH:mm format, e.g., "17:00"
  slotDurationMinutes: number; // Individual slot size (30, 45, 60)
  isActive: boolean; // Can schedule in this slot?
  createdAt: timestamptz;
  updatedAt: timestamptz;
}
```

## Endpoints

### GET `/api/doctors/:id`
Retrieve doctor profile by ID.

**Requires:** JWT auth + RBAC (PATIENT, DOCTOR, ADMIN)
**Audited:** YES (view access)

**Response (200):**
```json
{
  "id": "doc-uuid",
  "userId": "user-uuid",
  "registrationNumber": "REG-12345",
  "specializationId": "spec-uuid",
  "departmentId": "dept-uuid",
  "qualifications": "MD, MBBS, Fellowship in Cardiology",
  "yearsOfExperience": 15,
  "consultationFee": 500.00,
  "isAvailable": true,
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T..."
}
```

### GET `/api/doctors/:id/availability`
Get all weekly availability slots for a doctor.

**Requires:** JWT auth + RBAC (PATIENT, DOCTOR, ADMIN)
**Audited:** YES (view availability_slots)

**Response (200):**
```json
{
  "doctorId": "doc-uuid",
  "doctorName": "Dr. John Smith",
  "specializationId": "spec-uuid",
  "departmentId": "dept-uuid",
  "consultationFee": 500.00,
  "slots": [
    {
      "id": "slot-uuid",
      "doctorId": "doc-uuid",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDurationMinutes": 30,
      "isActive": true,
      "createdAt": "2026-02-07T...",
      "updatedAt": "2026-02-07T..."
    },
    {
      "id": "slot-uuid-2",
      "doctorId": "doc-uuid",
      "dayOfWeek": 2,
      "startTime": "10:00",
      "endTime": "16:00",
      "slotDurationMinutes": 30,
      "isActive": true,
      "createdAt": "2026-02-07T...",
      "updatedAt": "2026-02-07T..."
    }
  ]
}
```

### GET `/api/doctors/:id/availability/day?dayOfWeek=1`
Get availability slots for a specific day of week (0-6).

**Requires:** JWT auth + RBAC
**Audited:** YES
**Query Parameters:**
- `dayOfWeek` (required): 0=Sunday, 1=Monday, ..., 6=Saturday

**Response (200):**
```json
[
  {
    "id": "slot-uuid",
    "doctorId": "doc-uuid",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDurationMinutes": 30,
    "isActive": true,
    "createdAt": "2026-02-07T...",
    "updatedAt": "2026-02-07T..."
  }
]
```

### GET `/api/doctors/department/:departmentId`
List all available doctors in a department.

**Requires:** JWT auth + RBAC (PATIENT, ADMIN)
**Audited:** YES (list access)

**Response (200):**
```json
[
  {
    "id": "doc-1-uuid",
    "userId": "user-uuid",
    "registrationNumber": "REG-12345",
    "specializationId": "spec-uuid",
    "departmentId": "dept-uuid",
    "qualifications": "MD, MBBS",
    "yearsOfExperience": 15,
    "consultationFee": 500.00,
    "isAvailable": true,
    "createdAt": "2026-02-07T...",
    "updatedAt": "2026-02-07T..."
  }
]
```

## Integration with AppointmentsModule

When a client books an appointment:

1. **Patient views doctors** in a department: `GET /api/doctors/department/:departmentId`
2. **Patient checks availability**: `GET /api/doctors/:doctorId/availability`
3. **Patient selects a time slot** (e.g., Monday 09:00-09:30 for 30-min slot)
4. **Patient books appointment**: `POST /api/appointments` with:
   ```json
   {
     "patientId": "patient-uuid",
     "doctorId": "doctor-uuid",
     "departmentId": "department-uuid",
     "scheduledAt": "2026-02-10T09:00:00Z",
     "durationMinutes": 30,
     "reasonForVisit": "Routine checkup"
   }
   ```
5. **AppointmentsService validates booking** against availability slots

### Future Enhancement: Slot-Level Booking
To prevent double-booking, you can:
- Add a `booked_slots` table tracking which time slots are reserved
- Check availability before confirming appointment:
  ```sql
  SELECT * FROM doctor_availability_slots
  WHERE doctor_id = ? AND day_of_week = ? AND start_time <= ? AND end_time >= ?
  AND NOT EXISTS(
    SELECT 1 FROM appointments 
    WHERE doctor_id = ? AND status != 'cancelled' 
    AND scheduled_at BETWEEN ? AND ?
  );
  ```

## Security

✓ **Zero Trust**: All endpoints require JWT + RBAC
✓ **Role-Based Access**: Patients can view profiles, Doctors view self, Admins manage
✓ **Audit Trail**: Every view/list logged to data_access_logs
✓ **No PII leaks**: Response DTOs exclude sensitive fields
✓ **Department-scoped queries**: Doctors only see department assignments

## Testing

Run unit tests:
```bash
npm test -- doctors.service.spec.ts
```

Tests cover:
- findById: fetch doctor profile
- getAvailabilitySlots: retrieve weekly schedule
- findByDepartment: list available doctors
- NotFoundException scenarios

## Example Usage Flow

### Step 1: Find doctors in Cardiology
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/doctors/department/cardiology-dept-id
```

### Step 2: Get doctor availability
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/doctors/doctor-id/availability
```

### Step 3: Check availability for Monday
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/api/doctors/doctor-id/availability/day?dayOfWeek=1"
```

### Step 4: Book appointment (use AppointmentsModule)
```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-id",
    "doctorId": "doctor-id",
    "departmentId": "dept-id",
    "scheduledAt": "2026-02-10T09:00:00Z",
    "durationMinutes": 30
  }' \
  http://localhost:3000/api/appointments
```

## Configuration

Availability slots are typically **seeded at deployment time** via a migration script:

```typescript
// Example: seed default availability
const slot = slotsRepo.create({
  doctorId: 'doc-uuid',
  dayOfWeek: 1, // Monday
  startTime: '09:00',
  endTime: '17:00',
  slotDurationMinutes: 30,
  isActive: true
});
await slotsRepo.save(slot);
```

Or via an **admin endpoint** (not yet implemented):
```
POST /api/doctors/:doctorId/availability-slots
```

## Future Enhancements

- [ ] Admin endpoint to manage availability slots (create, update, disable)
- [ ] Block-out dates (vacation, emergencies)
- [ ] Dynamic slot availability based on actual appointments
- [ ] Doctor ratings/reviews from patients
- [ ] Specialization-level filtering
- [ ] Geographic availability (clinic location)

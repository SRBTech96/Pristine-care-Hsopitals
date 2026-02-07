# CRM Core Module - Pristine Hospital

This module implements a minimal but functional CRM system for Pristine Hospital, tracking patient leads, follow-ups, visit attribution to doctors, and discount approvals with full audit trail.

## Features

### 1. **Patient Leads Management**
Track potential patients from initial inquiry to conversion:
- Lead source tracking (referral, website, walk-in, advertisement, employee referral)
- Lead status workflow (new → contacted → qualified → converted/lost)
- Interest/specialization tagging
- Custom notes and history

### 2. **Follow-Ups Scheduling**
Ensure follow-up actions are tracked and completed:
- Schedule follow-ups (call, email, SMS, in-person visit)
- Assign doctors to follow-ups
- Mark as completed with outcome tracking
- Automatic reminders via audit logs

### 3. **Visit Attribution**
Link patient appointments/visits to doctor referrals and marketing channels:
- Track which appointment came from a lead
- Attribution types (direct, referral, lead_conversion, email_campaign)
- Multi-doctor attribution for complex cases
- ROI analysis by doctor/channel

### 4. **Discount Approval Tracking**
Enforce governance on discount approvals:
- **ADMIN-only** approval of discounts
- Track who approved each discount with timestamp
- Discount percentage or amount
- Expiration dates and status lifecycle
- Audit trail for compliance

### 5. **Audit Logging**
All CRM operations are immutably logged to `data_access_logs` and `audit_logs`:
- Every lead created, updated, viewed
- Follow-ups scheduled and completed
- Discount approvals and usage
- User attribution for accountability

## Entities

### PatientLead
Maps to `patient_leads` table.

```typescript
{
  id: UUID;
  name: string;
  phone?: string;
  email?: string;
  source?: string; // referral, website, walk-in, advertisement
  status: string; // new, contacted, qualified, converted, lost
  interestedIn?: string; // specialization/department
  notes?: string;
  createdAt: timestamptz;
  updatedAt: timestamptz;
  createdBy: UUID;
  updatedBy?: UUID;
}
```

### FollowUp
Maps to `follow_ups` table.

```typescript
{
  id: UUID;
  leadId: UUID;
  doctorId?: UUID; // Assigned doctor
  scheduledDate: timestamptz;
  followUpType: string; // call, email, sms, in_person_visit
  status: string; // pending, completed, missed, cancelled
  notes?: string;
  outcome?: string; // Result of follow-up
  completedAt?: timestamptz;
  completedBy?: UUID;
  createdAt: timestamptz;
  createdBy: UUID;
}
```

### VisitAttribution
Maps to `visit_attribution` table. Links appointments to lead sources.

```typescript
{
  id: UUID;
  patientId: UUID;
  appointmentId: UUID;
  doctorId: UUID;
  leadId?: UUID; // Which lead converted
  attributionType: string; // direct, referral, lead_conversion, email_campaign
  notes?: string;
  createdAt: timestamptz;
  createdBy: UUID;
}
```

### DiscountApproval
Maps to `discount_approvals` table. **IMMUTABLE audit trail of approvals.**

```typescript
{
  id: UUID;
  targetType: string; // appointment, patient_lead, bundle, service
  targetId: UUID;
  discountPercentage?: int; // 0-100
  discountAmount?: decimal;
  reason?: string; // Why discount approved
  approvedBy: UUID; // ADMIN who approved (immutable)
  approvalDate: timestamptz; // When approved (immutable)
  expiresAt?: timestamptz;
  status: string; // pending, approved, rejected, expired, used
  createdAt: timestamptz;
  createdBy: UUID;
}
```

## Endpoints

### LEADS

#### POST `/api/crm/leads`
Create a new patient lead.

**Requires:** JWT + RBAC (ADMIN, STAFF)
**Audited:** YES (create action)

**Request body:**
```json
{
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "email": "rajesh@example.com",
  "source": "website",
  "interestedIn": "Cardiology",
  "notes": "Referred by Dr. Sharma"
}
```

**Response (201):**
```json
{
  "id": "lead-uuid",
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "email": "rajesh@example.com",
  "source": "website",
  "status": "new",
  "interestedIn": "Cardiology",
  "notes": "Referred by Dr. Sharma",
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T..."
}
```

#### GET `/api/crm/leads/:id`
Get lead details.

**Requires:** JWT + RBAC (ADMIN, STAFF, DOCTOR)
**Audited:** YES (view action)

**Response (200):** Lead object (see above)

#### GET `/api/crm/leads?status=new&source=website`
List leads with optional filters.

**Requires:** JWT + RBAC (ADMIN, STAFF)
**Audited:** YES (list action)
**Query parameters:**
- `status` (optional): Filter by status (new, contacted, qualified, converted, lost)
- `source` (optional): Filter by source (website, referral, walk-in)

**Response (200):**
```json
[
  { /* lead object */ },
  { /* lead object */ }
]
```

#### PATCH `/api/crm/leads/:id`
Update lead status or notes (typically: new → contacted → qualified → converted).

**Requires:** JWT + RBAC (ADMIN, STAFF)
**Audited:** YES (update action)

**Request body:**
```json
{
  "status": "qualified",
  "notes": "Patient interested in consultation, scheduled appointment"
}
```

**Response (200):** Updated lead object

### FOLLOW-UPS

#### POST `/api/crm/follow-ups`
Schedule a follow-up action.

**Requires:** JWT + RBAC (ADMIN, STAFF, DOCTOR)
**Audited:** YES (create action)

**Request body:**
```json
{
  "leadId": "lead-uuid",
  "doctorId": "doctor-uuid",
  "scheduledDate": "2026-02-14T10:00:00Z",
  "followUpType": "call",
  "notes": "Reminder to confirm appointment"
}
```

**Response (201):**
```json
{
  "id": "follow-up-uuid",
  "leadId": "lead-uuid",
  "doctorId": "doctor-uuid",
  "scheduledDate": "2026-02-14T10:00:00Z",
  "followUpType": "call",
  "status": "pending",
  "notes": "Reminder to confirm appointment",
  "createdAt": "2026-02-07T...",
  "completedAt": null
}
```

#### GET `/api/crm/follow-ups/:id`
Get follow-up details.

**Requires:** JWT + RBAC (ADMIN, STAFF, DOCTOR)
**Audited:** YES

**Response (200):** Follow-up object

#### GET `/api/crm/leads/:leadId/follow-ups`
List all follow-ups for a lead.

**Requires:** JWT + RBAC (ADMIN, STAFF, DOCTOR)
**Audited:** YES (list action)

**Response (200):**
```json
[
  { /* follow-up object */ },
  { /* follow-up object */ }
]
```

#### PATCH `/api/crm/follow-ups/:id/complete`
Mark follow-up as completed.

**Requires:** JWT + RBAC (ADMIN, STAFF, DOCTOR)
**Audited:** YES (update action)

**Request body:**
```json
{
  "outcome": "Patient confirmed appointment for Feb 10, 2026",
  "notes": "Called patient at 10:30 AM, got confirmation"
}
```

**Response (200):**
```json
{
  "id": "follow-up-uuid",
  "status": "completed",
  "outcome": "Patient confirmed appointment for Feb 10, 2026",
  "notes": "Called patient at 10:30 AM, got confirmation",
  "completedAt": "2026-02-07T10:30:00Z",
  "createdAt": "2026-02-07T..."
}
```

### DISCOUNTS

#### POST `/api/crm/discounts`
Approve a discount **(ADMIN ONLY)**.

**Requires:** JWT + RBAC (ADMIN)
**Audited:** YES (create action)

**Important:** User must have ADMIN role. ForbiddenException thrown otherwise.

**Request body:**
```json
{
  "targetType": "appointment",
  "targetId": "appointment-uuid",
  "discountPercentage": 15,
  "reason": "Senior citizen discount",
  "expiresAt": "2026-03-07T23:59:59Z"
}
```

**Response (201):**
```json
{
  "id": "discount-uuid",
  "targetType": "appointment",
  "targetId": "appointment-uuid",
  "discountPercentage": 15,
  "discountAmount": null,
  "reason": "Senior citizen discount",
  "approvedBy": "admin-user-uuid",
  "approvalDate": "2026-02-07T10:45:00Z",
  "expiresAt": "2026-03-07T23:59:59Z",
  "status": "approved",
  "createdAt": "2026-02-07T..."
}
```

**Audit Trail for Discount Approval:**
```
Entry in audit_logs:
{
  "entityType": "discount_approvals",
  "entityId": "discount-uuid",
  "action": "CREATE",
  "actorId": "admin-user-uuid",
  "actorRole": "ADMIN",
  "oldValues": null,
  "newValues": { /* discount object */ },
  "severity": "warning",
  "createdAt": "2026-02-07T..."
}

Entry in data_access_logs:
{
  "userId": "admin-user-uuid",
  "accessType": "create",
  "resourceType": "discount_approvals",
  "resourceId": "discount-uuid",
  "success": true,
  "createdAt": "2026-02-07T..."
}
```

#### GET `/api/crm/discounts/:id`
Get discount approval details.

**Requires:** JWT + RBAC (ADMIN, STAFF)
**Audited:** YES (view action)

**Response (200):** Discount approval object

#### GET `/api/crm/discounts?targetType=appointment&targetId=apt-uuid`
List discounts for a target (e.g., all discounts on an appointment).

**Requires:** JWT + RBAC (ADMIN, STAFF)
**Audited:** YES (list action)
**Query parameters:**
- `targetType` (required): appointment, patient_lead, bundle, service
- `targetId` (required): UUID of the target

**Response (200):**
```json
[
  { /* discount approval object */ },
  { /* discount approval object */ }
]
```

## Security

✓ **Zero Trust:** All endpoints require JWT + RBAC
✓ **Role-Based Access:**
  - STAFF can create/manage leads and follow-ups
  - DOCTOR can view leads and update follow-ups
  - **ADMIN ONLY** can approve discounts (enforced in CrmService)
✓ **Audit Trail:** Every action immutably logged
  - Discount approvals include `approvedBy` (who approved) and `approvalDate`
  - All lead/follow-up changes tracked with `createdBy`/`updatedBy`
✓ **Compliance:** Full audit log for regulatory audits

## Example Workflow

### Step 1: Lead Created
```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Singh",
    "phone": "+919123456789",
    "email": "priya@example.com",
    "source": "website",
    "interestedIn": "Neurology"
  }' \
  http://localhost:3000/api/crm/leads
```

**Result:** Lead created with status `new` (id: `lead-uuid`)

### Step 2: Follow-Up Scheduled
```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "lead-uuid",
    "doctorId": "doctor-uuid",
    "scheduledDate": "2026-02-10T14:00:00Z",
    "followUpType": "call",
    "notes": "Call to confirm availability"
  }' \
  http://localhost:3000/api/crm/follow-ups
```

### Step 3: Follow-Up Completed
```bash
curl -X PATCH \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "Patient booked appointment",
    "notes": "Confirmed for Feb 10 at 2 PM"
  }' \
  http://localhost:3000/api/crm/follow-ups/follow-up-uuid/complete
```

### Step 4: Lead Status Updated → Converted
```bash
curl -X PATCH \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "converted",
    "notes": "Patient converted; appointment confirmed"
  }' \
  http://localhost:3000/api/crm/leads/lead-uuid
```

### Step 5: Discount Approved (ADMIN ONLY)
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetType": "appointment",
    "targetId": "appointment-uuid",
    "discountPercentage": 10,
    "reason": "First-time patient discount",
    "expiresAt": "2026-03-07T23:59:59Z"
  }' \
  http://localhost:3000/api/crm/discounts
```

**Result:** Discount approved with immutable `approvedBy` and `approvalDate` fields

## Testing

Run unit tests:
```bash
npm test -- crm.service.spec.ts
```

Tests cover:
- createLead: Create new lead
- getLead: Retrieve lead
- updateLead: Update status/notes
- createFollowUp: Schedule follow-up
- completeFollowUp: Mark completed
- approveDiscount: ADMIN approval
- ForbiddenException for non-ADMIN discount approval

## Future Enhancements

- [ ] Lead scoring algorithm (hot/warm/cold)
- [ ] Automated email/SMS follow-up via CRM triggers
- [ ] Dashboard: conversion rate, follow-up completion rate
- [ ] Doctor performance: leads assigned → conversions
- [ ] Marketing campaign attribution
- [ ] Bulk follow-up via batch jobs
- [ ] Lead reassignment between staff
- [ ] Discount auto-expiration job

# Lab & Diagnostics Module - Pristine Hospital

## Overview

Core laboratory diagnostics module handling:

- Lab tests (master catalog with turnaround time and cost)
- Lab orders (patient requests linked to appointments/doctors)
- Sample tracking (collection with quality control)
- Report publishing (with approval workflow: draft → pending_approval → approved → published)
- Lab billing linkage (cost retrieval for revenue tracking)
- Strict role-based access (Lab Manager, Pathologist, Lab Tech, Doctor, Finance)
- Audit logging on all operations

## Entities
- `lab_tests` (master test definitions)
- `lab_orders` (patient test requests)
- `lab_samples` (collected sample tracking)
- `lab_reports` (published test results with approval status)

## RBAC Roles

- **ADMIN**: Full access (create tests, orders, samples, reports, approve)
- **LAB_MANAGER**: Order management, sample collection, report workflow
- **PATHOLOGIST**: Report creation and approval (sign-off on results)
- **LAB_TECH**: Sample collection and report creation
- **DOCTOR**: Order creation and view test list
- **STAFF**: Order/test list access, sample tracking
- **FINANCE**: Billing linkage endpoint for cost retrieval
- **PATIENT**: View own orders and published reports (future enhancement)

## Control Flow

### Order to Result
```
1. DOCTOR creates order (POST /lab/orders)
   → Status: pending

2. LAB_TECH collects sample (POST /lab/samples)
   → Status: sample_collected
   → Sample code generated

3. LAB_TECH/PATHOLOGIST publishes report (POST /lab/reports)
   → Status: draft

4. PATHOLOGIST approves report (PATCH /lab/reports/:id/approve)
   → Status: approved
   → Approval date set

5. LAB_MANAGER publishes (PATCH /lab/reports/:id/publish)
   → Status: published
   → Report ready for patient
```

## API Endpoints

### Tests
- `POST /lab/tests` [ADMIN, LAB_MANAGER]
- `GET /lab/tests` [ADMIN, LAB_MANAGER, DOCTOR, STAFF]
- `GET /lab/tests/:id` [ADMIN, LAB_MANAGER, DOCTOR, STAFF]

### Orders
- `POST /lab/orders` [ADMIN, DOCTOR, STAFF]
- `GET /lab/orders/:id` [ADMIN, LAB_MANAGER, DOCTOR, STAFF, PATIENT]
- `GET /lab/orders?patientId=` [ADMIN, LAB_MANAGER, DOCTOR, STAFF]
- `PATCH /lab/orders/:id/status` [ADMIN, LAB_MANAGER]

### Samples
- `POST /lab/samples` [ADMIN, LAB_MANAGER, LAB_TECH]
- `GET /lab/samples/:id` [ADMIN, LAB_MANAGER, LAB_TECH, DOCTOR, STAFF]

### Reports
- `POST /lab/reports` [ADMIN, LAB_MANAGER, PATHOLOGIST, LAB_TECH]
- `GET /lab/reports/:id` [ADMIN, LAB_MANAGER, PATHOLOGIST, DOCTOR, STAFF, PATIENT]
- `PATCH /lab/reports/:id/approve` [ADMIN, LAB_MANAGER, PATHOLOGIST]
- `PATCH /lab/reports/:id/publish` [ADMIN, LAB_MANAGER, PATHOLOGIST]

### Billing
- `GET /lab/orders/:orderId/billing` [ADMIN, LAB_MANAGER, FINANCE] → returns { orderId, testId, amount }

## Sample Quality Control

Sample quality tracked:
- `good` (acceptable)
- `degraded` (usable with caution)
- `contaminated` (reject, recollect)
- `insufficient` (recollect)

## Report Workflow

Reports require pathologist approval before publication (strict sign-off):
1. `draft` - initial entry
2. `pending_approval` - awaiting pathologist review
3. `approved` - pathologist has signed
4. `published` - available to patient/doctor

## Audit Trail

All operations logged:
- Test creation/updates
- Order creation/status changes
- Sample collection (with collector ID)
- Report publishing, approvals
- Billing queries

## Billing Integration

Finance module calls:
```
GET /lab/orders/{orderId}/billing
→ { orderId, testId, amount }
```

Used to create pending revenue entries for lab services.

## Future Enhancements
- Bulk order upload (CSV)
- FHIR HL7 report export
- Lab KPI dashboard (turnaround time, error rate)
- Automated sample expiry tracking
- Test result interpretation engine
- Patient mobile app integration for report delivery


# HR & Payroll Module - Pristine Hospital

## Overview

The HR & Payroll Module is the core human resources management system for Pristine Hospital. It manages:

- **Employee Master Data**: Centralized registry for doctors and staff
- **Salary Structure**: Flexible compensation management with allowances and deductions
- **Monthly Payroll**: Automated salary processing with approval workflows
- **Leave Management**: Leave request tracking, approval process, and balance calculations
- **Offer Letters**: Job offer and appointment letter generation and tracking

## Architecture

### Entities

#### 1. HrEmployee (hr_employees table)

Master record for all employees - doctors and staff.

```sql
CREATE TABLE hr_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., EMP-001, DOC-001
  employee_type VARCHAR(50) NOT NULL, -- 'doctor', 'staff'
  department_id UUID NOT NULL,
  designation VARCHAR(100) NOT NULL,
  date_of_joining DATE NOT NULL,
  date_of_termination DATE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'on_leave', 'terminated', 'resigned'
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  pan_number VARCHAR(20),
  aadhaar_number VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL
);
```

**Key Fields:**
- `employee_id`: Auto-generated unique identifier (EMP-001, DOC-001, etc.)
- `employee_type`: Distinguishes doctors from staff
- `status`: Tracks employment status across lifecycle
- Banking/emergency: Support for payroll disbursement

#### 2. SalaryStructure (salary_structures table)

Flexible salary definition with JSON-based allowances and deductions.

```sql
CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  effective_from DATE NOT NULL,
  effective_till DATE,
  base_salary DECIMAL(12, 2) NOT NULL,
  allowances JSONB DEFAULT '{}', -- e.g., {house_rent: 10000, medical: 5000}
  deductions JSONB DEFAULT '{}', -- e.g., {pf: 1800, gratuity: 500}
  gross_salary DECIMAL(12, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  approved_by UUID, -- HR manager who approved
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL
);
```

**Salary Calculation Example:**
```
Base Salary: 100,000
Allowances:
  - House Rent: 10,000
  - Medical: 5,000
  - Travel: 3,000
Total Allowances: 18,000

Gross Salary: 118,000 (Base + Allowances)

Standard Deductions (Monthly):
  - PF (Provident Fund): 1,800 (12% of base)
  - Gratuity: 500
Total Deductions: 2,300

Net Monthly (before other deductions): 115,700
```

#### 3. PayrollRecord (payroll_records table)

Monthly payroll processing with approval chain.

```sql
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  month_year DATE NOT NULL, -- First day of month
  base_salary DECIMAL(12, 2) NOT NULL,
  allowances DECIMAL(12, 2) NOT NULL,
  deductions DECIMAL(12, 2) NOT NULL,
  gross_salary DECIMAL(12, 2) NOT NULL,
  net_salary DECIMAL(12, 2) NOT NULL,
  unpaid_leave_days INT DEFAULT 0,
  leave_deduction DECIMAL(12, 2) DEFAULT 0, -- base_salary / 30 * unpaid_leave_days
  bonus_amount DECIMAL(12, 2),
  bonus_reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'paid', 'failed'
  payment_date TIMESTAMPTZ,
  payment_reference VARCHAR(100), -- Bank transfer ID
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  processed_by UUID, -- HR manager who processed
  approved_by UUID -- Finance manager who approved payment
);
```

**Approval Workflow:**
```
DRAFT → PENDING → PROCESSED → PAID
                    ↓
                  FAILED (retry)
```

#### 4. HrLeaveRecord (hr_leave_records table)

Leave request tracking and approval.

```sql
CREATE TABLE hr_leave_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  leave_type VARCHAR(50) NOT NULL, -- 'sick', 'casual', 'earned', 'unpaid', 'maternity'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_days INT NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  approval_comments TEXT,
  approved_by UUID, -- HR manager who approved
  approval_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL
);
```

**Leave Types & Annual Limits:**
- **Sick Leave**: 12 days per year (doctor's note required)
- **Casual Leave**: 10 days per year (no reason required)
- **Earned Leave**: 20 days per year (carried forward, max 10 days)
- **Maternity Leave**: 180 days (statutory, females only)
- **Unpaid Leave**: Unlimited (deducted from salary)

#### 5. HrOfferLetter (hr_offer_letters table)

Job offer and appointment letter management.

```sql
CREATE TABLE hr_offer_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  offer_date DATE NOT NULL,
  designation VARCHAR(100) NOT NULL,
  department_id UUID NOT NULL,
  salary DECIMAL(12, 2) NOT NULL,
  joining_date DATE,
  terms TEXT, -- JSON or contract terms
  offer_letter_url TEXT, -- URL to generated PDF
  acceptance_date DATE,
  signing_date DATE,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'signed', 'expired'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID
);
```

**Status Lifecycle:**
```
DRAFT → SENT → ACCEPTED → SIGNED
         ↓
       REJECTED
         ↓
       EXPIRED
```

## API Endpoints

### Employee Management

#### Create Employee
```http
POST /hr/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-uuid",
  "employeeId": "EMP-001",
  "employeeType": "doctor",
  "departmentId": "dept-uuid",
  "designation": "General Practitioner",
  "dateOfJoining": "2024-01-01",
  "bankAccountNumber": "1234567890",
  "panNumber": "ABCDE1234F",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+91-9876543210"
}

Response: 201 Created
{
  "id": "emp-uuid",
  "employeeId": "EMP-001",
  "designation": "General Practitioner",
  "employeeType": "doctor",
  "status": "active",
  "dateOfJoining": "2024-01-01T00:00:00Z"
}
```

#### Get Employee
```http
GET /hr/employees/{employeeId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "emp-uuid",
  "employeeId": "EMP-001",
  "designation": "General Practitioner",
  "employeeType": "doctor",
  "departmentId": "dept-uuid",
  "status": "active",
  "dateOfJoining": "2024-01-01T00:00:00Z"
}
```

#### List Employees
```http
GET /hr/employees?departmentId={deptId}
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "emp-uuid",
    "employeeId": "EMP-001",
    "designation": "General Practitioner",
    "status": "active"
  }
]
```

#### Update Employee
```http
PATCH /hr/employees/{employeeId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "designation": "Senior General Practitioner",
  "status": "on_leave"
}

Response: 200 OK
```

### Salary Structure Management

#### Create Salary Structure
```http
POST /hr/salary-structures
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-uuid",
  "effectiveFrom": "2024-01-01",
  "baseSalary": 100000,
  "allowances": {
    "house_rent": 10000,
    "medical": 5000,
    "travel": 3000,
    "dearness": 2000
  },
  "deductions": {
    "pf": 1800,
    "gratuity": 500,
    "loan": 2000
  },
  "notes": "Approved for 2024"
}

Response: 201 Created
{
  "id": "sal-uuid",
  "employeeId": "emp-uuid",
  "baseSalary": 100000,
  "grossSalary": 120000,
  "isActive": true
}
```

#### List Salary Structures
```http
GET /hr/salary-structures/{employeeId}
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "sal-uuid-2024",
    "baseSalary": 100000,
    "effectiveFrom": "2024-01-01",
    "isActive": true
  },
  {
    "id": "sal-uuid-2023",
    "baseSalary": 95000,
    "effectiveFrom": "2023-01-01",
    "effectiveTill": "2023-12-31",
    "isActive": false
  }
]
```

### Payroll Processing

#### Process Monthly Payroll
```http
POST /hr/payroll/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-uuid",
  "monthYear": "2024-01-01",
  "unpaidLeaveDays": 2,
  "deductions": 1800,
  "bonusAmount": 5000,
  "bonusReason": "Performance bonus Q4 2023",
  "remarks": "Regular payroll for January"
}

Response: 201 Created
{
  "id": "payroll-uuid",
  "employeeId": "emp-uuid",
  "monthYear": "2024-01-01T00:00:00Z",
  "baseSalary": 100000,
  "grossSalary": 120000,
  "netSalary": 123200,
  "status": "pending",
  "unpaidLeaveDays": 2,
  "leaveDeduction": 6666.67
}
```

**Payroll Calculation Example:**
```
Month: January 2024
Employee: Dr. Rajesh Kumar (EMP-DOC-001)

Base Salary: 100,000
Allowances: 20,000
Gross Salary: 120,000
Standard Deductions: 2,300

Unpaid Leave Days: 2
Leave Deduction (100,000/30 * 2): 6,666.67

Bonus: 5,000

NET PAYROLL:
Gross Salary: 120,000
- Standard Deductions: 2,300
- Leave Deduction: 6,666.67
+ Bonus: 5,000
= Net Salary: 116,033.33

Status: PENDING (awaiting HR approval)
```

#### Approve Payroll
```http
PATCH /hr/payroll/{payrollId}/approve
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "payroll-uuid",
  "status": "processed",
  "processedBy": "hr-user-uuid"
}
```

#### Mark Payroll as Paid
```http
PATCH /hr/payroll/{payrollId}/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentReference": "BANK-TRANSFER-2024-001"
}

Response: 200 OK
{
  "id": "payroll-uuid",
  "status": "paid",
  "paymentDate": "2024-01-10T10:30:00Z",
  "paymentReference": "BANK-TRANSFER-2024-001"
}
```

#### Get Payroll History
```http
GET /hr/payroll/{employeeId}?limit=12
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "payroll-uuid-jan",
    "monthYear": "2024-01-01T00:00:00Z",
    "baseSalary": 100000,
    "netSalary": 116033.33,
    "status": "paid",
    "paymentDate": "2024-01-10T00:00:00Z"
  },
  {
    "id": "payroll-uuid-dec",
    "monthYear": "2023-12-01T00:00:00Z",
    "baseSalary": 95000,
    "netSalary": 110000,
    "status": "paid",
    "paymentDate": "2023-12-10T00:00:00Z"
  }
]
```

### Leave Management

#### Create Leave Request
```http
POST /hr/leaves
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-uuid",
  "leaveType": "sick",
  "startDate": "2024-02-15",
  "endDate": "2024-02-17",
  "numberOfDays": 3,
  "reason": "Medical checkup"
}

Response: 201 Created
{
  "id": "leave-uuid",
  "leaveType": "sick",
  "numberOfDays": 3,
  "status": "pending"
}
```

#### Approve Leave Request
```http
PATCH /hr/leaves/{leaveId}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "approvalComments": "Approved. Please submit medical report."
}

Response: 200 OK
{
  "id": "leave-uuid",
  "status": "approved",
  "approvedBy": "hr-user-uuid",
  "approvalDate": "2024-02-10T11:00:00Z"
}
```

#### Reject Leave Request
```http
PATCH /hr/leaves/{leaveId}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "rejectionReason": "Leave quota exhausted for this month"
}

Response: 200 OK
{
  "id": "leave-uuid",
  "status": "rejected",
  "approvedBy": "hr-user-uuid",
  "approvalDate": "2024-02-10T11:00:00Z"
}
```

#### Get Leave Balance
```http
GET /hr/leaves/{employeeId}/balance?year=2024
Authorization: Bearer {token}

Response: 200 OK
{
  "sick": {
    "used": 3,
    "remaining": 9
  },
  "casual": {
    "used": 5,
    "remaining": 5
  },
  "earned": {
    "used": 10,
    "remaining": 10
  },
  "unpaid": {
    "used": 2,
    "remaining": null
  },
  "maternity": {
    "used": 0,
    "remaining": 180
  }
}
```

### Offer Letter Management

#### Create Offer Letter
```http
POST /hr/offer-letters
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "emp-uuid",
  "offerDate": "2024-01-01",
  "designation": "Senior General Practitioner",
  "departmentId": "dept-uuid",
  "salary": 150000,
  "joiningDate": "2024-02-01",
  "terms": "Offer valid for 30 days from offer date"
}

Response: 201 Created
{
  "id": "offer-uuid",
  "employeeId": "emp-uuid",
  "designation": "Senior General Practitioner",
  "salary": 150000,
  "status": "draft"
}
```

#### Update Offer Letter Status
```http
PATCH /hr/offer-letters/{offerId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "sent"
}

Response: 200 OK
{
  "id": "offer-uuid",
  "status": "sent",
  "updatedAt": "2024-01-02T10:00:00Z"
}
```

#### Get Offer Letters
```http
GET /hr/offer-letters?employeeId={empId}
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "offer-uuid",
    "designation": "Senior General Practitioner",
    "salary": 150000,
    "status": "signed",
    "signingDate": "2024-01-15T00:00:00Z"
  }
]
```

## Security & Audit

### RBAC (Role-Based Access Control)

**Roles with HR Module Access:**

- **ADMIN**: Full access to all HR operations
- **HR_MANAGER**: Employee, salary, payroll, leave, offer letter management
- **DOCTOR/STAFF**: Can view own employee profile, request leaves, view offer letters
- **PATIENT**: No access

### Audit Trail

All HR operations are logged:
- Employee creation/updates
- Salary structure changes
- Payroll processing and approvals
- Leave requests and approvals
- Offer letter status changes

**Audit Log Entry Example:**
```json
{
  "id": "audit-uuid",
  "action": "HR_APPROVE_PAYROLL",
  "resource_type": "PayrollRecord",
  "resource_id": "payroll-uuid",
  "user_id": "hr-user-uuid",
  "timestamp": "2024-01-10T11:00:00Z",
  "ip_address": "192.168.1.100",
  "details": {
    "payrollId": "payroll-uuid",
    "employeeId": "emp-uuid",
    "monthYear": "2024-01-01",
    "approvedAmount": 116033.33
  }
}
```

## Leave Balance Calculation Logic

**Annual Limits (Pristine Hospital Policy):**
```
Year 2024:

Sick Leave:
- Annual Quota: 12 days
- Used: 3 days (approved)
- Remaining: 9 days

Casual Leave:
- Annual Quota: 10 days
- Used: 5 days (approved)
- Remaining: 5 days

Earned Leave:
- Annual Quota: 20 days
- Carryforward Limit: 10 days
- Used: 10 days (approved)
- Remaining (current year): 10 days
- Available (with carryforward): 15 days

Maternity Leave:
- Annual Quota: 180 days (statutory)
- Used: 0 days
- Remaining: 180 days

Unpaid Leave:
- Quota: Unlimited
- Used: 2 days
- Remaining: Unlimited
```

**Payroll Deduction for Unpaid Leave:**
```
Monthly Calculation:
Base Salary: 100,000
Days in Month: 30
Daily Rate: 100,000 / 30 = 3,333.33

Unpaid Leave Days: 2
Leave Deduction: 3,333.33 * 2 = 6,666.67

This deduction is applied to the NET SALARY in monthly payroll
```

## Workflow Examples

### Employee Onboarding Flow

```
1. HR Creates Employee Record
   - POST /hr/employees
   - Status: ACTIVE
   
2. HR Defines Salary Structure
   - POST /hr/salary-structures
   - Status: ACTIVE
   
3. HR Creates Offer Letter
   - POST /hr/offer-letters
   - Status: DRAFT
   
4. HR Updates Offer Letter to SENT
   - PATCH /hr/offer-letters/{id}/status
   - Status: SENT
   
5. Employee (Doctor) Accepts Offer
   - PATCH /hr/offer-letters/{id}/status
   - Status: ACCEPTED
   - acceptance_date: set
   
6. HR Updates to SIGNED
   - PATCH /hr/offer-letters/{id}/status
   - Status: SIGNED
   - signing_date: set
   
7. First Payroll Processed
   - POST /hr/payroll/process
   - Status: PENDING
   
8. HR Manager Approves Payroll
   - PATCH /hr/payroll/{id}/approve
   - Status: PROCESSED
   
9. Finance Manager Marks as PAID
   - PATCH /hr/payroll/{id}/pay
   - Status: PAID
   - payment_date: set
   - payment_reference: BANK-001
```

### Monthly Payroll Processing Flow

```
Day 1-25: Employees request leave via
  - POST /hr/leaves
  - Status: PENDING

Day 26: HR Approves/Rejects Leaves
  - PATCH /hr/leaves/{id}/approve
  - PATCH /hr/leaves/{id}/reject
  - Status: APPROVED/REJECTED

Day 27: HR Generates Monthly Payroll
  - POST /hr/payroll/process
  - Pull: Salary Structure + Leave Approvals
  - Calculate: Leave Deductions, Bonuses
  - Status: PENDING

Day 28: HR Reviews & Approves Payroll
  - PATCH /hr/payroll/{id}/approve
  - Status: PROCESSED

Day 29-30: Finance Disburses & Updates
  - PATCH /hr/payroll/{id}/pay
  - Payment Reference: Bank Transfer ID
  - Status: PAID

Month+1, Day 5: Payroll History Available
  - GET /hr/payroll/{employeeId}
  - Returns last 12 months of payroll
```

## Integration with Other Modules

### Appointment Module
- Leave approval affects appointment availability
- When employee has approved leave, mark as unavailable

### Patients Module
- Doctor availability linked to HR leave status
- Patients cannot book appointments during doctor's approved leave

### Authentication Module
- All HR endpoints use JwtAuthGuard + RolesGuard
- User must have ADMIN or HR_MANAGER role for sensitive operations

## Database Constraints

```sql
-- Foreign Keys
ALTER TABLE hr_employees
ADD CONSTRAINT fk_hr_employee_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE hr_employees
ADD CONSTRAINT fk_hr_employee_department_id 
FOREIGN KEY (department_id) REFERENCES departments(id);

-- Unique Constraints
ALTER TABLE hr_employees
ADD UNIQUE(employee_id);

-- Check Constraints (PostgreSQL)
ALTER TABLE payroll_records
ADD CONSTRAINT chk_payroll_status 
CHECK (status IN ('pending', 'processed', 'paid', 'failed'));

ALTER TABLE hr_leave_records
ADD CONSTRAINT chk_leave_dates 
CHECK (end_date >= start_date);
```

## Testing Examples

### Unit Test: Process Payroll
```typescript
it('should process monthly payroll with leave deduction', async () => {
  const employee = { id: 'emp-123', employeeId: 'EMP-001' };
  const salaryStructure = {
    baseSalary: 100000,
    allowances: { house_rent: 10000 },
    grossSalary: 110000,
  };

  const payroll = await hrService.processPayroll('emp-123', {
    monthYear: '2024-01-01',
    unpaidLeaveDays: 2,
  });

  expect(payroll.leaveDeduction).toBe((100000 / 30) * 2);
  expect(payroll.netSalary).toBe(110000 - 2300 - 6666.67);
  expect(payroll.status).toBe('pending');
});
```

### Integration Test: Full Payroll Approval Workflow
```typescript
it('should complete full payroll workflow', async () => {
  // 1. Create payroll (HR)
  const payroll = await hrService.processPayroll('emp-123', { monthYear: '2024-01-01' });
  expect(payroll.status).toBe('pending');

  // 2. Approve payroll (HR Manager)
  const approved = await hrService.approvePayroll(payroll.id, 'hr-mgr-uuid');
  expect(approved.status).toBe('processed');
  expect(approved.processedBy).toBe('hr-mgr-uuid');

  // 3. Mark as paid (Finance)
  const paid = await hrService.markPayrollAsPaid(
    payroll.id,
    'BANK-TRANSFER-2024-001',
    'finance-uuid'
  );
  expect(paid.status).toBe('paid');
  expect(paid.paymentReference).toBe('BANK-TRANSFER-2024-001');
});
```

## Configuration & Customization

### Leave Policy Configuration
Modify leave limits in `getLeaveBalance()` method:
```typescript
const leaveLimits = {
  sick: 12,      // Change to 15 for more
  casual: 10,    // Change to 12 for more
  earned: 20,    // Change as per policy
  maternity: 180,
  unpaid: Infinity,
};
```

### Salary Deduction Rules
Customize in `processPayroll()` method:
```typescript
const leaveDeduction = dto.unpaidLeaveDays * (salaryStructure.baseSalary / 30);
// Add other deductions here based on policy
```

## Error Handling

**Common Errors:**

| Error | Cause | Resolution |
|-------|-------|-----------|
| NotFoundException | Employee/Payroll/Leave not found | Verify IDs exist in database |
| BadRequestException | Payroll already processed | Monthly payroll already created |
| BadRequestException | Leave already approved | Cannot modify approved leave |
| BadRequestException | Invalid leave type | Use: sick, casual, earned, unpaid, maternity |
| ForbiddenException | Non-ADMIN trying payroll approval | Only HR_MANAGER/ADMIN can approve |

## Performance Optimization

### Indexes
```sql
CREATE INDEX idx_hr_employees_department_id 
ON hr_employees(department_id);

CREATE INDEX idx_hr_employees_status 
ON hr_employees(status);

CREATE INDEX idx_payroll_records_employee_month 
ON payroll_records(employee_id, month_year);

CREATE INDEX idx_hr_leave_records_employee_status 
ON hr_leave_records(employee_id, status);
```

### Caching Strategy
- Cache active salary structures (change frequency: low)
- Cache leave balance calculations (refresh monthly)
- Cache department employee lists (refresh on employee changes)

## Future Enhancements

1. **Batch Payroll Processing**: Process entire department payroll in one operation
2. **Bonus Management**: Create reusable bonus templates for campaigns
3. **Leave Carryforward Automation**: Auto-carryforward earned leave with limits
4. **Attendance Integration**: Link leaves to attendance records
5. **Compliance Reports**: Generate statutory compliance documents (EPF, ESI, TDS)
6. **Mobile App**: Leave request and offer letter viewing on mobile
7. **Email Notifications**: Offer letter sent, leave approved, payroll processed
8. **Tax Calculation**: Auto-calculate TDS based on gross salary

## Support & Documentation

For implementation questions, refer to:
- `HR.md` - This file
- `backend/test/hr.service.spec.ts` - Unit test examples
- `backend/src/hr/` - Source code implementation

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Module Status**: PRODUCTION-READY  
**Tested with**: NestJS 10.x, TypeORM 0.3.x, Node.js 18.x

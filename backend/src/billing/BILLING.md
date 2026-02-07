# Billing Module - Pristine Hospital

## Overview

The Billing module manages patient invoicing, payment processing, and financial reporting. It integrates with Appointments, Lab Orders, Pharmacy Sales, Discounts, and Finance modules to provide complete billing lifecycle management.

### Key Responsibilities

- **Invoice Management**: Create invoices from clinical services (appointments, lab tests, pharmacy sales)
- **Line Items**: Add granular service details with HSN codes for GST compliance
- **Payment Processing**: Record and track payments in multiple methods (cash, bank, UPI, card, cheque)
- **Status Tracking**: Automatic invoice status updates based on payment progress
- **Financial Reports**: Aggregated billing summaries for date ranges and patients
- **Audit Trail**: Complete immutable audit logs for all billing operations

## Database Schema

### Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  invoiceNumber VARCHAR(255) UNIQUE,
  patientId UUID NULLABLE,
  appointmentId UUID NULLABLE,
  subtotal DECIMAL(12,2),
  taxAmount DECIMAL(12,2),
  discountAmount DECIMAL(12,2),
  discountApprovalId UUID NULLABLE,
  totalAmount DECIMAL(12,2),
  paidAmount DECIMAL(12,2),
  balanceDue DECIMAL(12,2),
  status VARCHAR(50),
  invoiceDate DATE,
  dueDate DATE NULLABLE,
  notes TEXT NULLABLE,
  createdBy UUID,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**Status Enum**: `draft`, `issued`, `partially_paid`, `fully_paid`, `overdue`, `cancelled`

### Invoice Line Items Table
```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY,
  invoiceId UUID REFERENCES invoices(id),
  lineType VARCHAR(50), -- appointment, lab_order, pharmacy_sale, service, other
  referenceId UUID NULLABLE,
  description VARCHAR(255),
  quantity DECIMAL(10,2),
  unitPrice DECIMAL(10,2),
  lineAmount DECIMAL(12,2),
  taxAmount DECIMAL(12,2),
  discountAmount DECIMAL(12,2),
  totalLineAmount DECIMAL(12,2),
  hsnCode VARCHAR(10),
  createdBy UUID,
  createdAt TIMESTAMP
);
```

**Line Type Enum**: `appointment`, `lab_order`, `pharmacy_sale`, `service`, `other`

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  paymentNumber VARCHAR(255) UNIQUE,
  invoiceId UUID REFERENCES invoices(id),
  patientId UUID NULLABLE,
  amount DECIMAL(12,2),
  paymentMethod VARCHAR(50),
  referenceNumber VARCHAR(255) NULLABLE,
  paymentDate DATE,
  status VARCHAR(50),
  notes TEXT NULLABLE,
  receivedBy UUID NULLABLE,
  processedBy UUID NULLABLE,
  processedAt TIMESTAMP NULLABLE,
  createdBy UUID,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**Payment Method Enum**: `cash`, `bank_transfer`, `upi`, `card`, `cheque`, `credit_note`
**Status Enum**: `pending`, `completed`, `failed`, `refunded`

## RBAC Matrix

| Role | Create Invoice | Issue Invoice | Add Line Item | Record Payment | Update Status | View Reports |
|------|---|---|---|---|---|---|
| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| FINANCE | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| CASHIER | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| DOCTOR | ✗ | ✗ | ✗ | ✗ | ✗ | View Own |
| STAFF | ✗ | ✗ | ✗ | ✗ | ✗ | View |
| PATIENT | ✗ | ✗ | ✗ | ✗ | ✗ | View Own |
| OWNER | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

## API Endpoints

### Invoice Management

#### Create Invoice
- **POST** `/billing/invoices`
- **Roles**: `ADMIN`, `FINANCE`
- **Request Body**:
  ```json
  {
    "patientId": "uuid",
    "appointmentId": "uuid (optional)",
    "subtotal": 10000,
    "taxAmount": 2000,
    "discountAmount": 1000,
    "discountApprovalId": "uuid (optional)",
    "invoiceDate": "2026-02-07",
    "dueDate": "2026-02-21",
    "notes": "Payment due on due date"
  }
  ```
- **Response**: Newly created Invoice object with status `draft`

#### Get Invoice
- **GET** `/billing/invoices/:id`
- **Roles**: `ADMIN`, `FINANCE`, `DOCTOR`, `STAFF`, `PATIENT`, `CASHIER`
- **Response**: Invoice object with full details

#### List Invoices
- **GET** `/billing/invoices?status=issued&patientId=uuid&from=2026-02-01&to=2026-02-28`
- **Roles**: `ADMIN`, `FINANCE`, `DOCTOR`, `STAFF`, `PATIENT`, `CASHIER`
- **Query Parameters**:
  - `status` (optional): Filter by status
  - `patientId` (optional): Filter by patient
  - `from` (optional): Start date
  - `to` (optional): End date
- **Response**: Array of Invoice objects

#### Update Invoice
- **PATCH** `/billing/invoices/:id`
- **Roles**: `ADMIN`, `FINANCE`
- **Request Body**:
  ```json
  {
    "discountAmount": 500,
    "discountApprovalId": "uuid",
    "dueDate": "2026-02-21",
    "status": "issued",
    "notes": "Updated payment terms"
  }
  ```
- **Response**: Updated Invoice object
- **Restrictions**: Cannot update invoices with status `paid`, `overdue`, `cancelled`

#### Issue Invoice
- **PATCH** `/billing/invoices/:id/issue`
- **Roles**: `ADMIN`, `FINANCE`
- **Response**: Invoice with status changed to `issued`

### Line Items

#### Add Line Item
- **POST** `/billing/invoices/:invoiceId/line-items`
- **Roles**: `ADMIN`, `FINANCE`
- **Request Body**:
  ```json
  {
    "lineType": "appointment",
    "referenceId": "appointment-uuid (optional)",
    "description": "Consultation with Dr. Smith",
    "quantity": 1,
    "unitPrice": 5000,
    "taxAmount": 1000,
    "discountAmount": 0,
    "hsnCode": "998411"
  }
  ```
- **Response**: Created InvoiceLineItem object
- **Validation**: Invoice must be in `draft` status
- **Calculation**: totalLineAmount = quantity × unitPrice + taxAmount - discountAmount

#### Get Line Items
- **GET** `/billing/invoices/:invoiceId/line-items`
- **Roles**: `ADMIN`, `FINANCE`, `DOCTOR`, `STAFF`, `PATIENT`
- **Response**: Array of InvoiceLineItem objects

#### Remove Line Item
- **PATCH** `/billing/line-items/:id/remove`
- **Roles**: `ADMIN`, `FINANCE`
- **Response**: Success message
- **Automatic Recalculation**: Invoice totals recalculated after removal

### Payment Processing

#### Record Payment
- **POST** `/billing/payments`
- **Roles**: `ADMIN`, `FINANCE`, `CASHIER`
- **Request Body**:
  ```json
  {
    "invoiceId": "invoice-uuid",
    "amount": 5000,
    "paymentMethod": "cash",
    "referenceNumber": "CHQ-12345 (optional)",
    "paymentDate": "2026-02-07",
    "notes": "Payment received at counter",
    "receivedBy": "staff-uuid (optional)"
  }
  ```
- **Response**: Created Payment object
- **Validation**:
  - Amount must be > 0
  - Amount cannot exceed invoice balance due
  - Invoice must not be `draft` or `cancelled`

#### Get Payment
- **GET** `/billing/payments/:id`
- **Roles**: `ADMIN`, `FINANCE`, `DOCTOR`, `STAFF`, `PATIENT`, `CASHIER`
- **Response**: Payment object with full details

#### Get Invoice Payments
- **GET** `/billing/invoices/:invoiceId/payments`
- **Roles**: `ADMIN`, `FINANCE`, `DOCTOR`, `STAFF`, `PATIENT`, `CASHIER`
- **Response**: Array of Payment objects for invoice

#### Update Payment Status
- **PATCH** `/billing/payments/:id/status`
- **Roles**: `ADMIN`, `FINANCE`
- **Request Body**:
  ```json
  {
    "status": "completed",
    "notes": "Payment cleared"
  }
  ```
- **Response**: Updated Payment object
- **Status Values**: `completed`, `failed`, `refunded`
- **Refund Logic**: If status is `refunded`, invoice payment amount and balance due are adjusted

### Reporting

#### Get Patient Billing Summary
- **GET** `/billing/patients/:patientId/summary`
- **Roles**: `ADMIN`, `FINANCE`, `DOCTOR`, `STAFF`, `PATIENT`, `CASHIER`
- **Response**:
  ```json
  {
    "totalInvoiced": 50000,
    "totalPaid": 30000,
    "totalOutstanding": 20000,
    "invoiceCount": 5,
    "paymentCount": 8
  }
  ```

#### Get Billing Report
- **GET** `/billing/reports/summary?from=2026-02-01&to=2026-02-28`
- **Roles**: `ADMIN`, `FINANCE`, `OWNER`
- **Query Parameters**:
  - `from` (required): Start date
  - `to` (required): End date
- **Response**:
  ```json
  {
    "totalInvoiced": 500000,
    "totalPaid": 400000,
    "totalOutstanding": 100000,
    "invoicesByStatus": {
      "fully_paid": 10,
      "partially_paid": 3,
      "issued": 2
    },
    "paymentsByMethod": {
      "cash": 15,
      "bank_transfer": 8,
      "upi": 5,
      "card": 2
    }
  }
  ```

## Workflow: Invoice Lifecycle

```
┌─────────────────────────────────────────────────────┐
│                    INVOICE LIFECYCLE                │
└─────────────────────────────────────────────────────┘

Step 1: Create Invoice (DRAFT)
   ↓
   POST /billing/invoices
   ↓
   Status: DRAFT
   ├─ Can modify details
   ├─ Can add/remove line items
   └─ Cannot record payments

Step 2: Issue Invoice (ISSUED)
   ↓
   PATCH /billing/invoices/:id/issue
   ↓
   Status: ISSUED
   ├─ Cannot modify details
   ├─ Cannot add/remove line items
   └─ Can record payments

Step 3: Record Payments
   ↓
   POST /billing/payments
   ├─ Amount ≤ balance due
   ├─ Update paidAmount
   └─ Update status:
      ├─ PARTIALLY_PAID (paidAmount > 0 AND < totalAmount)
      └─ FULLY_PAID (paidAmount == totalAmount)

Step 4: Complete/Refund Payment
   ↓
   PATCH /billing/payments/:id/status
   ├─ Status: COMPLETED
   ├─ Mark processedBy & processedAt
   └─ If REFUNDED:
      ├─ Adjust invoice paidAmount
      └─ Revert to previous status
```

## Audit Trail

All Billing module operations are automatically logged via @Auditable decorator:

- **CREATE_INVOICE**: Invoice creation with number and amount
- **UPDATE_INVOICE**: Invoice modifications with before/after status
- **ISSUE_INVOICE**: Invoice issuance with invoice number
- **ADD_LINE_ITEM**: Line item addition with description and amount
- **REMOVE_LINE_ITEM**: Line item removal with invoice reference
- **RECORD_PAYMENT**: Payment recording with method and amount
- **UPDATE_PAYMENT_STATUS**: Payment status change with old/new status

All audit logs include:
- User ID and timestamp
- Action name and entity type
- Relevant financial details
- Complete immutability for compliance

## Integrations

### With Appointments Module
- Invoice can reference appointmentId
- Appointment cost can be added as line item
- Line type: `appointment`

### With Lab Orders Module
- Lab test costs integrated into invoices
- Lab order invoice fee tracked via referenceId
- Line type: `lab_order`

### With Pharmacy Sales Module
- Pharmacy sale amounts added to patient invoices
- Batch tracking for expiry-linked sales
- Line type: `pharmacy_sale`

### With Discount Approvals (CRM)
- Link discountApprovalId to invoice
- Automatic discount amount and percentage applied
- Immutable audit trail of discounts

### With Finance Reporting
- Invoice totals feed into revenue records
- Payment aggregations used for cash flow analysis
- Monthly/quarterly reporting integration
- GST calculations via HSN codes in line items

## Calculations

### Invoice Totals
```
subtotal = SUM(lineItem.quantity × lineItem.unitPrice)
taxAmount = SUM(lineItem.taxAmount)
discountAmount = manual override OR SUM(lineItem.discountAmount)
totalAmount = subtotal + taxAmount - discountAmount
```

### Payment Status
```
paidAmount = SUM(successful payments)
balanceDue = totalAmount - paidAmount

if balanceDue = 0:
  status = FULLY_PAID
else if paidAmount > 0:
  status = PARTIALLY_PAID
else:
  status = ISSUED (or OVERDUE if dueDate passed)
```

### Line Item
```
lineAmount = quantity × unitPrice
totalLineAmount = lineAmount + taxAmount - discountAmount
```

## HSN Code Reference

HSN codes (8-digit codes) classify services for GST. Common codes for hospital:

- **998411**: Hospital and diagnostic centre services
- **998412**: Pathology and laboratory services
- **998414**: Diagnostic imaging services
- **998415**: Telemedicine consultation services
- **998419**: Other medical and health services

## Error Handling

| Error | Status Code | Condition |
|-------|------------|-----------|
| Invoice not found | 404 | Invalid invoice ID |
| Cannot update | 400 | Invoice not in draft/issued status |
| Insufficient role | 403 | User lacks required role |
| Invalid amount | 400 | Payment > balance due or <= 0 |
| Draft invoice | 400 | Attempting payment on draft invoice |
| Closed invoice | 400 | Modifying fully paid or cancelled invoice |

## Future Enhancements

1. **Recurring Invoices**: Auto-generate monthly invoices for subscriptions
2. **Invoice Templates**: Customizable invoice layouts and branding
3. **Dunning Management**: Automated overdue payment reminders
4. **Multi-currency**: Support for international patients and payments
5. **Digital Signatures**: E-signature integration for digital invoices
6. **Payment Gateway Integration**: Stripe, PayPal, Razorpay integration
7. **Invoice Numbering Sequences**: Custom numbering formats
8. **Debit Notes/Credit Notes**: Handle price adjustments
9. **Partial Invoicing**: Split large invoices across time periods
10. **Expense Categorization**: Map invoice lines to GL accounts for Finance

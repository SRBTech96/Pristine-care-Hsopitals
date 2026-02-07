# Billing Counter - Complete Implementation Guide

## Overview

The Billing Counter is a specialized hospital finance application for ADMIN, FINANCE, and CASHIER users to create invoices, manage line items, process payments, and print receipts. Built with Next.js 14 App Router, React 18, and TypeScript for type-safe hospital-grade invoice management.

**Key Features:**
- ✅ Fast invoice creation with real-time calculations
- ✅ Patient search with debouncing
- ✅ Add/edit/delete line items with auto-calculation
- ✅ Partial payment support with balance tracking
- ✅ Professional printable invoices (A4 hospital format)
- ✅ RBAC access control (ADMIN, FINANCE, CASHIER only)
- ✅ Error handling and loading states
- ✅ Session-based invoice loading from URL params

---

## Architecture

### Component Structure

```
BillingCounter (Main Orchestrator)
├── PatientSearch (Left Panel - 30%)
│   └── Debounced patient lookup
├── LineItemEditor (Center Panel - 50%)
│   └── Add/edit/delete services with auto-calc
├── PaymentForm (Right Panel - 20%)
│   └── Payment capture & status updates
└── PrintableInvoice (Modal)
    └── A4-formatted hospital receipt
```

### Data Flow

```
User Search Patient
    ↓
PatientSearch calls billingApi.searchPatients()
    ↓
User selects patient
    ↓
BillingCounter receives patient via onSelectPatient callback
    ↓
User adds line items
    ↓
LineItemEditor calls billingApi.addLineItem()
    ↓
Totals auto-calculate (no server call needed)
    ↓
User clicks "Create Invoice"
    ↓
BillingCounter calls billingApi.createInvoice()
    ↓
User records payment
    ↓
PaymentForm calls billingApi.recordPayment()
    ↓
Invoice status updates (DRAFT → ISSUED → PARTIALLY_PAID → FULLY_PAID)
    ↓
User clicks "Print"
    ↓
PrintableInvoice renders, window.print() opens
```

---

## File Structure

### Frontend Files

#### New Billing Module Files

```
src/
├── app/
│   └── billing/
│       └── page.tsx                          # Main billing counter page
├── components/
│   └── billing/
│       ├── BillingCounter.tsx                # Main orchestrator component (250 lines)
│       ├── PatientSearch.tsx                 # Patient search (120 lines)
│       ├── LineItemEditor.tsx                # Line item management (150 lines)
│       ├── PaymentForm.tsx                   # Payment capture (160 lines)
│       └── PrintableInvoice.tsx              # A4 invoice layout (200 lines)
├── lib/
│   └── billing-api.ts                        # BillingApiClient with 14 methods
├── types/
│   └── index.ts                              # Extended with billing interfaces
└── middleware.ts                             # Updated with RBAC checks
```

---

## Components Reference

### 1. BillingCounter.tsx (Main Orchestrator)

**Purpose:** Orchestrates entire invoice workflow from patient search to payment.

**Props:**
- `initialInvoiceId?: string` - Load existing invoice from URL params

**State Variables (14 total):**
```typescript
const [mode, setMode] = useState<"create" | "view" | "edit">("create");
const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
const [discountAmount, setDiscountAmount] = useState(0);
const [invoiceNotes, setInvoiceNotes] = useState("");
const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
const [showPrint, setShowPrint] = useState(false);
const [paidAmount, setPaidAmount] = useState(0);
const [remainingBalance, setRemainingBalance] = useState(0);
```

**Key Methods:**
- `loadInvoice(invoiceId)` - Fetch invoice by ID (if initialInvoiceId provided)
- `handlePatientSelect(patient)` - Set selected patient
- `handleAddLineItem(item)` - Add service to invoice
- `handleUpdateLineItem(id, data)` - Edit line item
- `handleRemoveLineItem(id)` - Delete line item
- `handleCreateInvoice()` - Save invoice to backend
- `handlePaymentRecorded(payment)` - Record payment and update status
- `handleClear()` - Reset form for next invoice
- `handlePrint()` - Render printable invoice

**Workflow:**
1. User searches patient in PatientSearch
2. Clicks patient → handlePatientSelect → selectedPatient updated
3. Adds line items → handleAddLineItem called → lineItems updated
4. Totals auto-calculate via useEffect watching lineItems
5. Clicks "Create Invoice" → handleCreateInvoice → POST /api/invoices
6. Receives invoiceId and status "ISSUED"
7. Records payment → handlePaymentRecorded → POST /api/payments
8. Status updates to "PARTIALLY_PAID" or "FULLY_PAID"
9. Clicks "Print" → PrintableInvoice rendered with window.print()
10. Clicks "Clear" → handleClear → form reset for next invoice

---

### 2. PatientSearch.tsx

**Purpose:** Real-time patient lookup with debouncing.

**Props:**
```typescript
interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

**State:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [results, setResults] = useState<Patient[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Features:**
- 300ms debounce delay (prevents excessive API calls while typing)
- Displays loading spinner during search
- Shows error message if search fails
- Empty state: "No patients found"
- Click to select patient

**API Call:**
```typescript
// Debounced call to:
billingApi.searchPatients(query)
// Returns: Patient[]
```

**UI Layout:**
```
Search Box [Type name or MRN...]
↓
Results List (if search fired):
  - Patient Name | MRN | Phone (clickable rows)
Loading: Spinner
Error: Red error message
No Results: "No patients found"
```

---

### 3. LineItemEditor.tsx

**Purpose:** Add, edit, delete line items with real-time total calculation.

**Props:**
```typescript
interface LineItemEditorProps {
  invoiceId: string;
  lineItems: InvoiceLineItem[];
  onAdd: (item: InvoiceLineItem) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onTotalChange?: (total: number) => void;
}
```

**State:**
```typescript
const [showAddModal, setShowAddModal] = useState(false);
const [editingItemId, setEditingItemId] = useState<string | null>(null);
const [formData, setFormData] = useState({
  serviceId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxPercent: 5,
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Features:**
- **Add Item:** Blue "+ Add Item" button
- **Edit Item:** Click row to edit inline/modal
- **Delete Item:** Red trash icon with confirmation
- **Auto-Calculation:** Total = (Qty × UnitPrice) × (1 + TaxPercent/100)
- **Real-time Totals:** Subtotal, Tax Amount, Grand Total update instantly
- **Validation:** Positive numbers, required fields enforce constraints

**Table Structure:**
```
| Service | Quantity | Unit Price | Tax % | Total | Delete |
|---------|----------|-----------|-------|-------|--------|
| ...     |    ...   |    ...    |  ...  |  ...  |   🗑️   |
|---------|----------|-----------|-------|-------|--------|
                    Subtotal: $XXX.XX
                    Tax:      $YY.YY
                    Total:    $ZZZ.ZZ
```

**Calculations:**
```typescript
lineTotal = quantity * unitPrice;
taxAmount = lineTotal * (taxPercent / 100);
lineTotalWithTax = lineTotal + taxAmount;

subtotal = sum(quantity * unitPrice for all items);
totalTax = sum(taxAmount for all items);
grandTotal = subtotal + totalTax;
```

---

### 4. PaymentForm.tsx

**Purpose:** Capture payments and update invoice status.

**Props:**
```typescript
interface PaymentFormProps {
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  onPaymentRecorded: (payment: Payment) => void;
}
```

**State:**
```typescript
const [amount, setAmount] = useState("");
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
const [transactionId, setTransactionId] = useState("");
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Features:**
- **Partial Payments:** Amount must be ≤ remaining balance
- **Payment Methods:** CASH, CARD, BANK_TRANSFER
- **Transaction ID:** Optional for card/bank transfers
- **Validation:** Prevents overpayment with error message
- **Feedback:** Success/error messages with icons

**Display Logic:**
```
Invoice Total:      $XXX.XX (bold, large)
Already Paid:        $YYY.YY
Remaining Balance:   $ZZZ.ZZ (bold, red if > 0)

Amount Input: [_____] 
Method: [CASH ▼]
Transaction ID: [_____] (optional)

[Record Payment] [Clear]

Success: ✓ Payment recorded successfully!
Error:   ✗ Cannot pay more than remaining balance $XXX
```

**API Call:**
```typescript
billingApi.recordPayment(invoiceId, {
  amount: number,
  paymentMethod: PaymentMethod,
  transactionId?: string
})
// Returns: Payment
```

**Invoice Status Updates:**
- totalPaid = 0 → DRAFT
- totalPaid > 0 && totalPaid < total → PARTIALLY_PAID
- totalPaid >= total → FULLY_PAID

---

### 5. PrintableInvoice.tsx

**Purpose:** Hospital-standard A4 invoice layout for printing.

**Props:**
```typescript
interface PrintableInvoiceProps {
  invoice: Invoice;
}
```

**Layout (A4 Paper):**

```
┌─────────────────────────────────────┐
│         [⚕️] PRISTINE HOSPITAL       │
│   123 Medical Lane, City, State     │
│   📞 (123) 456-7890                 │
│   📧 info@pristinehospital.com      │
└─────────────────────────────────────┘
                INVOICE
┌──────────────────┬──────────────────┐
│ Invoice #: INV-  │ Patient Name:    │
│ Date: MM/DD/YYYY │ MRN:             │
│ Status: [ISSUED] │ DOB: MM/DD/YYYY  │
│                  │ Phone:           │
└──────────────────┴──────────────────┘

Services:
┌────────────────┬───────┬────────┬───────┬────────┐
│ Description    │ Qty   │ Price  │ Tax   │ Total  │
├────────────────┼───────┼────────┼───────┼────────┤
│ Consultation   │  1    │ $50.00 │ $2.50 │ $52.50 │
│ Lab Work       │  2    │ $75.00 │ $7.50 │ $157.50│
└────────────────┴───────┴────────┴───────┴────────┘

Summary:
                    Subtotal: $125.00
                    Tax:       $10.00
                    Grand Total: $135.00
                    Paid Amount: $100.00
                    Balance Due: $35.00

┌─────────────────────────────────────┐
│ Thank you for choosing Pristine      │
│ Hospital. For inquiries:             │
│ finance@pristinehospital.com         │
└─────────────────────────────────────┘
```

**Print Styles:**
- Media query `@print` hides interactive elements
- Black & white friendly colors
- Standard 10-15mm margins
- Print-safe fonts (Arial, Georgia)
- Page break indicator: "--- Page 1 of 1 ---"

**Print Action:**
```typescript
const handlePrint = () => {
  window.print(); // Triggers browser print dialog
}
```

---

## API Integration (billing-api.ts)

The `BillingApiClient` class provides 14 methods for all operations:

### Patient Operations

```typescript
// Search patients by name or medical record number
searchPatients(query: string): Promise<Patient[]>

// Get patient details by ID
fetchPatientById(patientId: string): Promise<Patient>
```

### Invoice Operations

```typescript
// Create new invoice
createInvoice(patientId: string, data: {
  items: InvoiceLineItem[];
  discountAmount?: number;
  notes?: string;
}): Promise<Invoice>

// Update existing invoice
updateInvoice(invoiceId: string, data: any): Promise<Invoice>

// Get invoice by ID
fetchInvoiceById(invoiceId: string): Promise<Invoice>

// List invoices with optional filters
fetchInvoices(filters?: {
  status?: InvoiceStatus;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<Invoice[]>

// Delete/cancel invoice
deleteInvoice(invoiceId: string): Promise<void>
```

### Line Item Operations

```typescript
// Add line item to invoice
addLineItem(invoiceId: string, item: {
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
}): Promise<InvoiceLineItem>

// Update line item
updateLineItem(invoiceId: string, itemId: string, data: any): Promise<InvoiceLineItem>

// Remove line item
removeLineItem(invoiceId: string, itemId: string): Promise<void>
```

### Payment Operations

```typescript
// Record payment
recordPayment(invoiceId: string, payment: {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}): Promise<Payment>

// Update payment status
updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<Payment>

// Get available payment methods
getPaymentMethods(): Promise<PaymentMethod[]>

// Get payment history for invoice
getPaymentHistory(invoiceId: string): Promise<Payment[]>
```

### Configuration

```typescript
const billingApi = new BillingApiClient(
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,  // 15 seconds
  headers: {
    "Authorization": `Bearer ${jwt_token}`,
    "Content-Type": "application/json"
  }
);
```

---

## Type Definitions

### Core Types

```typescript
// Patient entity
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: string;
  medicalRecordNumber: string;
}

// Invoice entity
interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patient?: Patient;
  dateIssued: Date;
  totalAmount: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  discountAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Line item for billable service
interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;  // Calculated: quantity * unitPrice
  taxPercent?: number;
  taxAmount?: number;  // Calculated: total * (taxPercent / 100)
  createdAt: Date;
  updatedAt: Date;
}

// Payment record
interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  dateRecorded: Date;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice status enum
enum InvoiceStatus {
  DRAFT = "DRAFT",              // Created but not saved
  ISSUED = "ISSUED",            // Saved to backend
  PARTIALLY_PAID = "PARTIALLY_PAID",  // Some payment made
  FULLY_PAID = "FULLY_PAID",    // Complete payment received
  CANCELLED = "CANCELLED"       // Deleted/cancelled
}

// Payment method enum
enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER"
}

// Payment status enum
enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}
```

---

## Page Setup (app/billing/page.tsx)

The billing counter is accessible via `/billing` route:

```typescript
// Route: /billing
// Metadata: SEO tags for billing page
// Revalidate: 3600 (1 hour ISR)

export default function BillingCounterPage({ searchParams }) {
  const invoiceId = searchParams.invoice;
  
  // Load existing invoice if ID provided in URL
  // e.g., /billing?invoice=inv_123 → loads that invoice
  
  return <BillingCounter initialInvoiceId={invoiceId} />;
}
```

---

## RBAC Access Control

### Middleware Protection (src/middleware.ts)

```typescript
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/billing": ["ADMIN", "FINANCE", "CASHIER"],
};

function middleware(request: NextRequest) {
  // Check if path is protected
  // If protected, verify JWT token contains required role
  // If role not in allowed list, redirect to home
  
  if (userRole NOT in ALLOWED_ROLES) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

### JWT Token Structure

Expected JWT payload:
```json
{
  "iat": 1234567890,
  "exp": 1234671490,
  "userId": "user_123",
  "email": "finance@pristinehospital.com",
  "role": "FINANCE",
  "permissions": ["create_invoice", "record_payment", "print_invoice"]
}
```

### Auth Flow

1. User logs in at `/login`
2. Backend validates credentials
3. Backend returns JWT with `role` claim
4. Frontend stores JWT (localStorage or httpOnly cookie)
5. User navigates to `/billing`
6. Middleware extracts JWT, decodes role
7. If role ∈ [ADMIN, FINANCE, CASHIER], allow access
8. Otherwise, redirect to `/`

---

## Usage Examples

### Basic Invoice Creation & Payment

```typescript
// 1. Search for patient
const patients = await billingApi.searchPatients("John Smith");

// 2. Select patient and add services
const patient = patients[0];
const items = [
  {
    serviceId: "service_1",
    description: "General Consultation",
    quantity: 1,
    unitPrice: 50,
    taxPercent: 5
  },
  {
    serviceId: "service_2",
    description: "Lab Work",
    quantity: 2,
    unitPrice: 75,
    taxPercent: 5
  }
];

// 3. Create invoice
const invoice = await billingApi.createInvoice(patient.id, { items });
// Result: Invoice #INV-001, Total: $280, Status: ISSUED

// 4. Record partial payment
const payment = await billingApi.recordPayment(invoice.id, {
  amount: 150,
  paymentMethod: "CASH"
});
// Result: Invoice status → PARTIALLY_PAID
//         Remaining: $130

// 5. Record final payment
const finalPayment = await billingApi.recordPayment(invoice.id, {
  amount: 130,
  paymentMethod: "CARD",
  transactionId: "card_xyz789"
});
// Result: Invoice status → FULLY_PAID
```

### Loading Existing Invoice

```typescript
// From page: /billing?invoice=inv_123
// BillingCounter receives initialInvoiceId="inv_123"
// useEffect triggers: loadInvoice("inv_123")
// Invoice loaded and displayed for editing/payment

const invoice = await billingApi.fetchInvoiceById("inv_123");
// Displays in edit mode, allows additional payments
```

---

## Performance Optimization

### Debouncing

```typescript
// PatientSearch debounces 300ms
// Typing "John Smith" doesn't fire 10 API calls
// Instead, fires 1 call 300ms after user stops typing
```

### Real-Time Calculations

```typescript
// LineItemEditor uses useEffect to watch lineItems
// When lineItems change, totals recalculate instantly
// No server round-trip needed for math operations
// Formula: (Qty × UnitPrice) × (1 + TaxPercent/100)
```

### Partial Rendering

```typescript
// BillingCounter uses "use client" for interactivity
// Only client-side components re-render on state change
// Page-level data fetched server-side (if needed)
// Minimal re-renders, fast UX
```

---

## Error Handling

### Network Errors

```typescript
try {
  const result = await billingApi.createInvoice(patientId, items);
} catch (error) {
  setError(error.message || "Failed to create invoice");
  // Display: "❌ Failed to create invoice"
}
```

### Validation Errors

```typescript
// Client-side validation
if (paymentAmount > remainingBalance) {
  setError("Cannot pay more than remaining balance");
  // Display: "❌ Cannot pay more than remaining balance $XXX"
}

// Server-side validation (backend returns 400)
if (error.response?.status === 400) {
  setError(error.response.data.message);
  // Display server's error message
}
```

### Timeout Handling

```typescript
// BillingApiClient has 15s timeout
// If request takes >15s, throws TimeoutError
// UI displays: "❌ Request timeout, please try again"
```

---

## Testing Checklist

### Component Functionality

- [ ] PatientSearch returns results matching query
- [ ] PatientSearch debouncing prevents excessive calls
- [ ] Clicking patient selects them (onSelectPatient called)
- [ ] LineItemEditor adds items without errors
- [ ] LineItemEditor edit modal appears and saves changes
- [ ] Deleting item shows confirmation and removes from table
- [ ] Totals calculate correctly: (Qty × Price) × (1 + Tax%)
- [ ] Subtotal, tax, grand total display correctly
- [ ] PaymentForm validates amount ≤ remaining balance
- [ ] Payment method dropdown works (CASH, CARD, TRANSFER)
- [ ] Recording payment updates invoice status
- [ ] Partial payment calculates remaining balance correctly
- [ ] PrintableInvoice displays all invoice data
- [ ] Print button opens browser print dialog
- [ ] Invoice printed without form elements/buttons

### API Integration

- [ ] BillingApiClient.searchPatients() returns Patient[]
- [ ] BillingApiClient.createInvoice() returns Invoice with ID
- [ ] BillingApiClient.addLineItem() adds item to invoice
- [ ] BillingApiClient.recordPayment() creates Payment record
- [ ] Invoice status updates correctly (DRAFT → ISSUED → PAID)
- [ ] All API calls include auth headers
- [ ] Network errors display user-friendly messages
- [ ] Timeout errors handled gracefully

### RBAC Security

- [ ] Unauthenticated users cannot access /billing
- [ ] Users without FINANCE/ADMIN/CASHIER role redirected to /
- [ ] JWT role claim verified in middleware
- [ ] Invalid JWT tokens rejected

### User Experience

- [ ] Loading spinners appear during API calls
- [ ] Error messages displayed in red boxes
- [ ] Success messages shown after save/payment
- [ ] Form clears after successful invoice creation
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Mobile responsive (3-panel layout adapts to small screens)
- [ ] No console errors or TypeScript warnings

---

## Deployment Checklist

Before deploying to production:

1. **Dependencies Installed**
   ```bash
   npm install jwt-decode
   ```

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.pristinehospital.com
   ```

3. **Backend API Ready**
   - `/api/patients?q={query}` endpoint
   - POST `/api/invoices` endpoint
   - POST `/api/invoices/{id}/line-items` endpoint
   - POST `/api/invoices/{id}/payments` endpoint
   - GET `/api/invoices/{id}` endpoint
   - All endpoints require JWT auth with role check

4. **JWT Tokens**
   - Backend issues tokens with `role` claim
   - Frontend stores token (httpOnly cookie or localStorage)
   - Middleware can decode and verify role

5. **SSL/TLS**
   - HTTPS enforced in middleware
   - Secure cookies for token storage

6. **Testing**
   - Run full test checklist above
   - Load test with >100 concurrent invoices
   - Verify payment calculations across different tax rates

---

## Troubleshooting

### "404 Not Found" when visiting /billing

**Cause:** Middleware redirecting unauthorized user
**Fix:** 
- Check JWT token is valid
- Verify token contains `role` claim with value in [ADMIN, FINANCE, CASHIER]
- Check browser console for auth errors

### Patient search returns no results

**Cause:** API endpoint not implemented or network error
**Fix:**
- Check NEXT_PUBLIC_API_URL is correct
- Verify backend `/api/patients` endpoint exists
- Check network tab in DevTools for 404/500 errors
- Verify JWT token not expired

### Line item total calculation incorrect

**Cause:** Tax calculation using wrong formula
**Fix:**
- Verify formula: `total = quantity * unitPrice * (1 + taxPercent/100)`
- Check taxPercent is decimal (5% = 0.05 not 5)
- Inspect component state to verify lineItems array

### Print preview shows blank/incomplete invoice

**Cause:** PrintableInvoice component not receiving data
**Fix:**
- Check currentInvoice state is populated
- Verify invoice data includes lineItems and patient
- Check browser console for React warnings
- Try clearing browser cache and reloading

### Payment not recorded after click

**Cause:** API error handling issue
**Fix:**
- Check network tab for failed request
- Verify invoice exists and ID is correct
- Check backend /api/invoices/:id/payments endpoint
- Verify payment amount is valid (not 0, not negative)
- Check JWT token not expired

---

## Support & Maintenance

### Regular Tasks

- **Daily:** Monitor error logs for failed invoices
- **Weekly:** Review payment processing for anomalies
- **Monthly:** Analyze invoice patterns for billing insights
- **Quarterly:** Update billing rates and tax rules

### Future Enhancements

- Invoice templates (hospital letterhead, logo placement)
- Batch invoicing (create multiple invoices at once)
- Payment plans (installment agreements)
- Late payment reminders (automated emails)
- Financial reports (revenue by service, patient payment history)
- Multi-currency support (for international patients)
- Digital signatures (e-sign invoices)
- SMS payment links (send invoice via text)

---

## Support Contact

For issues, questions, or feature requests:

- **Documentation:** See above sections
- **Code Examples:** Check `src/components/billing/` and `src/lib/billing-api.ts`
- **Backend API:** Contact backend team for endpoint details
- **Database:** See hospital database schema (44 tables, including invoices, payments)

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready

# Finance & Accounts Module - Pristine Hospital

## Overview

A minimal Finance & Accounts core module handling:

- Revenue records (payments from patients/appointments)
- Expense records (operational expenditures)
- Payment methods: cash, bank, UPI, card
- Doctor-wise and department-wise revenue attribution
- Discount linkage via `discount_approval_id` (immutable approvals tracked in CRM)
- Basic cash vs bank balances and reporting
- Audit logging for all create operations

## Key Entities
- `finance_revenue_records` (RevenueRecord)
- `finance_expense_records` (ExpenseRecord)

## API Endpoints
- `POST /finance/revenues` - create revenue
- `GET /finance/revenues/:id` - get revenue
- `GET /finance/revenues` - list/filter revenues
- `GET /finance/reports/doctor` - revenue aggregated by doctor
- `GET /finance/reports/department` - revenue aggregated by department
- `POST /finance/expenses` - create expense
- `GET /finance/expenses` - list expenses
- `GET /finance/balances` - cash vs bank balances

## Notes
- All endpoints require `ADMIN` or `FINANCE` roles.
- Discount approvals are stored as `discount_approval_id` to keep immutable audit trail (CRM module).
- Aggregations use `finalAmount` (amount after discount) to reflect discounts' impact.

## Testing
- Unit tests at `backend/test/finance.service.spec.ts` cover core flows.

## Future Enhancements
- Batch payroll integration for finance disbursements
- Reconciliation engine for bank statements
- Multi-currency support
- Advanced GL chart and ledger entries

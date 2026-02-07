# Pharmacy Module - Pristine Hospital

## Overview

Minimal pharmacy core module with:

- Inventory management (drugs/items)
- Batch & expiry tracking
- Purchase records (stocking batches)
- Sales/billing with prescription/appointment linkage
- Payment methods: cash, bank, UPI, card
- Audit logging on all create operations

## Entities
- `pharmacy_inventory`
- `pharmacy_batches`
- `pharmacy_purchases`
- `pharmacy_sales`

## Important Notes
- Sales record `prescription_id`, `appointment_id`, `patient_id`, `doctor_id` fields allow attribution to clinical flows.
- Batch expiry check prevents selling expired batches.
- Audit calls are invoked via `AuditService.logAccess` for create/purchase/sale actions.

## API Endpoints
- `POST /pharmacy/inventory` - add inventory item
- `POST /pharmacy/batches` - add batch
- `POST /pharmacy/purchases` - record purchase (stock)
- `POST /pharmacy/sales` - create sale (billing)
- `GET /pharmacy/batches/expiring?days=30` - list batches expiring soon
- `GET /pharmacy/inventory` - list inventory

## Testing
- Unit tests: `backend/test/pharmacy.service.spec.ts`

## Future Enhancements
- Automatic FIFO allocation across batches when selling without explicit batch
- Integrated taxation (GST) and invoice generation (PDF)
- Expiry returns/stock adjustments and disposal workflows
- Stock reconciliation and low-stock alerts

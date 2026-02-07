# Owner Dashboard - Pristine Hospital

This read-only module exposes high-level aggregated financial metrics for the hospital owner.

Endpoints (OWNER role only):

- `GET /owner/reports/daily-revenue?date=YYYY-MM-DD` — total collected revenue for day
- `GET /owner/reports/monthly-revenue?month=YYYY-MM` — total collected revenue for month
- `GET /owner/reports/revenue-by-doctor?from=&to=` — revenue per doctor
- `GET /owner/reports/revenue-by-department?from=&to=` — revenue per department
- `GET /owner/reports/expenses-summary?from=&to=` — expenses total and breakdown by category
- `GET /owner/reports/pharmacy-revenue?from=&to=` — pharmacy sales total
- `GET /owner/reports/discounts-summary?from=&to=` — discounts aggregated across revenue and pharmacy sales

Security & Audit:
- All endpoints are protected by `JwtAuthGuard` and `RolesGuard` and require the `OWNER` role.
- Each endpoint is decorated with `@Auditable` so access is logged to `audit_logs`.

Notes:
- Filters support `from` and `to` ISO date strings.
- Aggregations use `finalAmount` (post-discount) for revenue to reflect discounts' impact.


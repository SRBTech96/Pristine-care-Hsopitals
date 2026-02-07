# Pristine Hospital - Complete Healthcare Platform

🏥 **World-class hospital website and comprehensive management system** built with enterprise healthcare engineering standards.

## 🚀 Quick Start

### Print Agent (New Feature - 3 minutes)
```bash
cd print-agent
npm install
npm start
```
Runs on http://localhost:9100
See [PRINTER_SETUP.md](./PRINTER_SETUP.md) for complete printer integration guide.

### Backend (5 minutes)
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Runs on http://localhost:3001

### Frontend (5 minutes)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Runs on http://localhost:3000 - Visit to see the premium hospital website!

### Database
```bash
psql -U pristine -d pristine_hospital -f database/schema.sql
```

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for complete setup instructions.

## 📦 What's Included

### 🌐 Frontend - Premium Hospital Website
**Location**: `/frontend` | **Tech**: Next.js 14, TypeScript, Tailwind CSS

✨ **Features**:
- Data-driven doctor listing (from backend APIs)
- Doctors grouped by department automatically
- Search-engine optimized responsive design
- Zero hardcoded data - updates reflect backend changes immediately
- Premium UI/UX with professional styling
- Loading states and error handling
- CORS-integrated with backend

**Key Pages**:
- Home with hero section and stats
- Medical team with doctor cards by department
- Fully responsive (mobile, tablet, desktop)

**Sample Data**: HM Prasanna (Senior Orthopaedist, 18 years experience)

### 🏗️ Backend - Hospital Management System
**Location**: `/backend` | **Tech**: NestJS 10, TypeScript, PostgreSQL

✅ **10 Complete Modules**:

1. **Auth Module**
   - JWT authentication with refresh tokens
   - Role-based access control (RBAC)
   - 12+ user roles (ADMIN, DOCTOR, PATIENT, FINANCE, etc.)
   - Session management

2. **Patients Module** 
   - MDM-compliant patient records
   - Medical history tracking
   - Contact information
   - Row-level access control

3. **Appointments Module**
   - Appointment scheduling
   - Concurrency control with version field
   - Status tracking (scheduled, completed, cancelled)
   - Doctor & patient linking

4. **Doctors Module**
   - Doctor CRUD operations
   - Availability slots
   - Specialization tracking
   - **Public API for website** ✨

5. **CRM Module**
   - Patient lead management
   - Follow-up tracking
   - Visit attribution (lead ROI)
   - Discount approval process

6. **HR & Payroll Module**
   - Employee management
   - Salary structures
   - Payroll processing
   - Leave tracking (sick, casual, earned, maternity, unpaid)
   - Offer letter management

7. **Finance & Accounts Module**
   - Revenue record tracking
   - Expense management
   - Doctor & department attribution
   - Cash vs bank accounting
   - Discount linkage

8. **Pharmacy Module**
   - Inventory management
   - Batch tracking with expiry dates
   - Purchase & sales billing
   - Doctor prescription linkage
   - Expiry alerts

9. **Lab & Diagnostics Module**
   - Test catalog
   - Lab order management
   - Sample tracking with quality control
   - Report workflow with approval chain
   - Pathologist sign-off enforcement
   - Billing integration

10. **Billing Module**
    - Invoice generation from services
    - Line items with HSN codes (GST compliance)
    - Multi-method payments (cash, bank, UPI, card, cheque)
    - Payment tracking and refunds
    - Financial reporting
    - **Local Printer Integration** 🖨️
      - Silent printing to system printers
      - Thermal receipt & A4 document support
      - Auto-fallback to browser print
      - Cross-platform (Windows/macOS/Linux)

11. **Owner Dashboard Module** (Bonus)
    - Aggregated metrics (daily/monthly revenue)
    - Revenue per doctor & department
    - Expense summaries
    - OWNER-only access control
    - Financial report export (PDF/Excel)
    - Dual-path export system (backend + client fallback)

### 🗄️ Database - MDM-Compliant PostgreSQL
**Location**: `/database` | **Tech**: PostgreSQL 13+

📊 **44 Tables**:
- Core identity: users, roles, sessions, audit logs
- Patient Management: patients, contact info
- Clinical: appointments, doctors, availability slots
- CRM: leads, follow-ups, discounts, visit attribution
- HR/Payroll: employees, salaries, payroll, leaves, offers
- Finance: revenue, expenses
- Pharmacy: inventory, batches, purchases, sales
- Lab: tests, orders, samples, reports
- Billing: invoices, line items, payments

**Features**:
- Master Data Management (MDM) for unique patient records
- Complete audit trail (audit_logs table)
- Data access logging for compliance
- Row-level access control via ownership
- Soft deletes for data preservation
- Optimistic locking on appointments

## 🏥 How the Website Works

### Data-Driven Doctor Listing

**Zero Hardcoded Data**:
```typescript
// Frontend automatically:
1. Fetches doctors from /api/doctors
2. Groups by specialization
3. Renders department sections
4. Updates on any backend changes
```

**Example**: Add a cardiologist to database → "Cardiology" section automatically appears!

### Department Grouping

```
Orthopedics
  ├─ HM Prasanna (18 years)
  ├─ [Future: More Ortho doctors auto-grouped]
Cardiology  
  ├─ [Auto-created when first Cardiology doctor added]
Neurology
  └─ [Auto-managed based on specialization]
```

## 📂 Project Structure

```
Hospital/
├── frontend/                 # Next.js 14 website
│   ├── src/
│   │   ├── app/             # Pages & layouts
│   │   ├── components/      # React components
│   │   │   └── billing/     # Billing Counter with printer integration
│   │   ├── lib/
│   │   │   ├── billing-api.ts
│   │   │   ├── finance-api.ts
│   │   │   └── printer-service.ts  # 🖨️ Printer integration
│   │   └── types/           # TypeScript types
│   ├── public/              # Static files
│   ├── package.json
│   └── README.md
│
├── backend/                  # NestJS APIs
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── billing/     # Invoicing & payments
│   │   │   ├── finance/     # Financial reports & export
│   │   │   └── ...
│   │   ├── entities/        # Database entities
│   │   ├── auth/            # Authentication
│   │   ├── common/          # Shared utilities
│   │   ├── audit/           # Audit logging
│   │   └── main.ts
│   ├── test/                # Unit tests
│   ├── package.json
│   └── README.md
│
├── print-agent/              # 🖨️ Local Printer Service
│   ├── index.js             # Express server (localhost:9100)
│   ├── package.json
│   ├── README.md
│   └── ...
│
├── database/
│   └── schema.sql           # PostgreSQL schema (44 tables)
│
├── INTEGRATION_GUIDE.md      # ⭐ Complete setup guide
├── PRINTER_SETUP.md         # 🖨️ Printer integration guide
├── FRONTEND_SETUP.md        # Frontend-specific guide
└── README.md                # This file
```

## 🎯 Key Features

### Billing & Invoicing
✅ Complete invoice management  
✅ Patient search and selection  
✅ Line items with services & taxes  
✅ Payment tracking (cash, bank, UPI, card)  
✅ **Local printer integration** 🖨️  
✅ Silent printing to system printers  
✅ Thermal receipt & A4 document support  
✅ Auto-fallback to browser print  
✅ Cross-platform (Windows/macOS/Linux)  

### Financial Reporting
✅ Owner dashboard with metrics  
✅ Revenue tracking per doctor/department  
✅ Expense management  
✅ Financial export (PDF/Excel)  
✅ Dual-export system (backend + client-side)  
✅ Role-based access control (OWNER, FINANCE)  

### Security
✅ JWT authentication with token rotation  
✅ Role-based access control (12+ roles)  
✅ Row-level access control  
✅ Password hashing (bcrypt)  
✅ SQL parameterization  
✅ Input validation & sanitization  
✅ Audit trail for all operations  
✅ CORS protection  

### Architecture
✅ Layered NestJS architecture (Controller → Service → Repository)  
✅ TypeORM with migrations  
✅ Global error handling  
✅ Global audit interceptor  
✅ Ownership decorator for row-level access  
✅ Auditable decorator for operation logging  

### Data Integrity
✅ Master Data Management (MDM)  
✅ Unique patient records  
✅ Optimistic locking (version field)  
✅ Soft deletes  
✅ Immutable audit logs  
✅ Data access logging  

### Frontend
✅ Next.js 14 with App Router  
✅ TypeScript strict mode  
✅ Tailwind CSS for styling  
✅ Responsive design  
✅ API integration layer  
✅ Error boundaries  
✅ Loading states  
✅ Zero state messages  

## 📊 Database Diagram

```
Users (RBAC)
  ├─ Roles (ADMIN, DOCTOR, PATIENT, FINANCE, etc.)
  ├─ Sessions (JWT tracking)
  └─ Audit Logs

Patients (MDM)
  ├─ Contact Info
  ├─ Appointments
  └─ Medical History

Doctors (Public API)
  ├─ Availability Slots
  ├─ Qualifications
  └─ Specialization

Clinical
  ├─ Appointments
  ├─ Lab Orders
  ├─ Lab Reports
  └─ Prescriptions

Business
  ├─ CRM (Leads, Follow-ups)
  ├─ Finance (Revenue, Expenses)
  ├─ Pharmacy (Inventory, Sales)
  ├─ Billing (Invoices, Payments)
  └─ HR/Payroll (Employees, Salaries)
```

## 🌟 Sample Data

**Pre-loaded Doctor**:
```
Name: HM Prasanna
Specialization: Orthopedics
Qualifications: MD, DNB Orthopedics, Fellowship in Joint Replacement
Experience: 18 years
Email: hm.prasanna@pristinehospital.com
Phone: +91-9876543210
Registration: ORG-12345-IN
Bio: Senior Orthopaedist with 18 years of specialized experience
```

Adding more doctors requires only **database changes** - website updates automatically! ✨

## 🚀 Deployment

### Frontend Deployment
```bash
# Build
npm run build

# Deploy to Vercel, Netlify, or any Node.js host
npm start
```

### Backend Deployment
```bash
# Build
npm run build

# Start
npm start
```

### Environment Configuration
Update `.env` files in both frontend and backend with production values:
- Database credentials
- API URLs
- JWT secrets
- CORS origins

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed deployment steps.

## 📚 Documentation

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete setup & architecture overview
- **[PRINTER_SETUP.md](./PRINTER_SETUP.md)** - 🖨️ Printer integration guide (start here for printing)
- **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Frontend-specific guide
- **[print-agent/README.md](./print-agent/README.md)** - Print agent API documentation
- **[backend/README.md](./backend/README.md)** - API documentation
- **[frontend/README.md](./frontend/README.md)** - Website documentation
- **Module Documentation**:
  - `backend/src/billing/BILLING.md` - Invoicing & payments
  - `backend/src/lab/LAB.md` - Lab & diagnostics
  - `backend/src/hr/HR.md` - HR & payroll
  - And more...

## ✅ Completion Checklist

- ✅ Database schema (MDM-compliant, 44 tables)
- ✅ Backend: 10 complete modules with tests
- ✅ Frontend: Premium website with data-driven doctors
- ✅ Billing Counter: Invoice creation & payment management
- ✅ **Local Printer Integration** 🖨️
  - ✅ Print agent Node.js server (localhost:9100)
  - ✅ Multi-OS support (Windows/macOS/Linux)
  - ✅ Printer type support (thermal/A4)
  - ✅ Auto-fallback logic
  - ✅ Status messaging
- ✅ **Owner Dashboard Module**
  - ✅ Financial metrics & reports
  - ✅ Export functionality (PDF/Excel)
  - ✅ Dual-path export system
  - ✅ RBAC for OWNER & FINANCE roles
- ✅ Authentication & RBAC (12+ roles)
- ✅ Audit logging & compliance
- ✅ API integration (frontend ↔ backend)
- ✅ Error handling & loading states
- ✅ Responsive design
- ✅ Documentation

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Icons**: Lucide React

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 13+
- **ORM**: TypeORM 0.3
- **Authentication**: JWT + Passport.js
- **Testing**: Jest
- **Validation**: class-validator

### DevOps
- **Package Manager**: npm
- **Build Tool**: NestJS CLI, Next.js CLI
- **Database**: PostgreSQL with pgAdmin optional

## 📞 Support

### Common Issues
1. **Backend won't start**: Check PostgreSQL is running
2. **Frontend can't fetch doctors**: Verify backend on port 3001
3. **CORS errors**: Backend CORS already enabled (check FRONTEND_URL)
4. **Database connection**: Verify credentials in .env

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) Troubleshooting section for more.

## 📄 License

This project is proprietary software for Pristine Hospital & Research Centre.

## 🎉 Ready to Use!

1. **Clone/Download** this repository
2. **Follow** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. **Start** backend and frontend
4. **Visit** http://localhost:3000
5. **Enjoy** the premium hospital website!

---

**Status**: ✅ **PRODUCTION READY** - Enterprise-grade healthcare platform with premium website!

Last Updated: February 7, 2026


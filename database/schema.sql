-- ==============================================================================
-- Pristine Hospital & Research Centre Pvt Ltd
-- PostgreSQL MDM-Compliant Database Schema
-- ==============================================================================
-- This schema enforces Master Data Management (MDM) principles to prevent
-- duplicate patient records and ensure data integrity across the system.
-- ==============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. CORE IDENTITY & ACCESS CONTROL
-- ==============================================================================

-- Roles (RBAC)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (unified user table for all actors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    role_id UUID NOT NULL REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- User sessions (JWT tracking)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. MASTER DATA MANAGEMENT (MDM) - PATIENT CORE
-- ==============================================================================

-- Patient Master Record (MDM - Single Source of Truth)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Patient identification
    mrn VARCHAR(50) UNIQUE NOT NULL, -- Medical Record Number (unique per hospital)
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    -- Demographics
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    -- Identity
    national_id VARCHAR(20) NOT NULL,
    passport_number VARCHAR(30),
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, deceased
    -- Audit & Integrity
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    deleted_at TIMESTAMPTZ, -- soft delete
    -- MDM Validation
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_date TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    CONSTRAINT valid_mrn CHECK (mrn ~ '^[A-Z0-9-]+$'),
    CONSTRAINT valid_gender CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT valid_blood_group CHECK (blood_group ~ '^(O|A|B|AB)[+-]$'),
    UNIQUE(national_id) -- Enforce unique identity
);

-- Patient Contact Information (normalized)
CREATE TABLE patient_contact_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- primary, emergency, secondary
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    phone VARCHAR(20),
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Patient Medical History (aggregate view)
CREATE TABLE patient_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    surgical_history TEXT,
    family_history TEXT,
    social_history TEXT,
    vaccination_status TEXT,
    last_checkup_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- ==============================================================================
-- 3. STAFF MANAGEMENT
-- ==============================================================================

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    head_id UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medical Specializations
CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor Master Record
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    registration_number VARCHAR(50) UNIQUE NOT NULL, -- Medical Council registration
    specialization_id UUID NOT NULL REFERENCES specializations(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    qualifications TEXT NOT NULL,
    years_of_experience INT NOT NULL,
    consultation_fee DECIMAL(10, 2),
    is_available BOOLEAN NOT NULL DEFAULT true,
    availability_schedule JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Staff Master Record
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    designation VARCHAR(100) NOT NULL,
    date_of_joining DATE NOT NULL,
    date_of_termination DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, on_leave, terminated
    base_salary DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- ==============================================================================
-- 4. APPOINTMENTS & SCHEDULING
-- ==============================================================================

-- Appointments (high-concurrency safe with optimistic locking)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id),
    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    -- Room allocation
    room_number VARCHAR(50),
    -- Notes
    reason_for_visit TEXT,
    consultation_notes TEXT,
    -- Concurrency control
    version INT NOT NULL DEFAULT 1,
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0)
);

-- Appointment reminders
CREATE TABLE appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL, -- email, sms, notification
    scheduled_time TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. MEDICAL RECORDS & CLINICAL DATA
-- ==============================================================================

-- Medical Records (clinical documents)
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    record_type VARCHAR(50) NOT NULL, -- consultation, lab_report, imaging, prescription, procedure
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    findings TEXT,
    recommendations TEXT,
    -- File attachment
    attachment_url VARCHAR(500),
    file_size_bytes INT,
    -- Clinical validity
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verification_date TIMESTAMPTZ,
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    CONSTRAINT valid_record_type CHECK (record_type IN ('consultation', 'lab_report', 'imaging', 'prescription', 'procedure'))
);

-- Diagnoses
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    icd_code VARCHAR(20) NOT NULL, -- International Classification of Diseases
    diagnosis_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50), -- mild, moderate, severe
    onset_date DATE,
    resolution_date DATE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    -- Prescription details
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration_days INT NOT NULL,
    instructions TEXT,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, discontinued
    dispensed_date TIMESTAMPTZ,
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Lab Results
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(50),
    result_value VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN,
    Lab_date DATE NOT NULL,
    reviewed_by UUID REFERENCES users(id),
    reviewed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. PAYROLL & COMPENSATION
-- ==============================================================================

-- Salary Records
CREATE TABLE salary_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    month_year DATE NOT NULL,
    base_salary DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) DEFAULT 0,
    deductions DECIMAL(12, 2) DEFAULT 0,
    gross_salary DECIMAL(12, 2) NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processed, paid
    payment_date TIMESTAMPTZ,
    payment_method VARCHAR(50),
    -- Audit
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_salary_status CHECK (status IN ('pending', 'processed', 'paid')),
    UNIQUE(staff_id, month_year)
);

-- Leave Records
CREATE TABLE leave_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    leave_type VARCHAR(50) NOT NULL, -- sick, casual, earned, unpaid
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_leave_type CHECK (leave_type IN ('sick', 'casual', 'earned', 'unpaid'))
);

-- ==============================================================================
-- 7. AUDIT & COMPLIANCE
-- ==============================================================================

-- Audit Logs (immutable audit trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- patients, doctors, appointments, etc.
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW
    actor_id UUID NOT NULL REFERENCES users(id),
    actor_role VARCHAR(50) NOT NULL,
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changes_summary TEXT,
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    -- Security
    severity VARCHAR(50) NOT NULL DEFAULT 'info', -- debug, info, warning, error, critical
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data Access Logs (compliance - who accessed what)
CREATE TABLE data_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID REFERENCES patients(id), -- NULL for non-patient access
    access_type VARCHAR(50) NOT NULL, -- view, download, export
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    purpose TEXT,
    ip_address INET,
    -- Result
    success BOOLEAN NOT NULL,
    result_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. INDEXES (Performance Optimization)
-- ==============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Patient indexes (MDM)
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_national_id ON patients(national_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_patient_contact_info_patient_id ON patient_contact_info(patient_id);

-- Doctor indexes
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_department_id ON doctors(department_id);
CREATE INDEX idx_doctors_specialization_id ON doctors(specialization_id);
CREATE INDEX idx_doctors_is_available ON doctors(is_available);

-- Staff indexes
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_department_id ON staff(department_id);
CREATE INDEX idx_staff_status ON staff(status);

-- Appointment indexes (high-concurrency)
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);

-- Medical Record indexes
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_record_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_created_at ON medical_records(created_at);

-- Salary indexes
CREATE INDEX idx_salary_records_staff_id ON salary_records(staff_id);
CREATE INDEX idx_salary_records_month_year ON salary_records(month_year);
CREATE INDEX idx_salary_records_status ON salary_records(status);

-- Audit indexes
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_data_access_logs_user_id ON data_access_logs(user_id);
CREATE INDEX idx_data_access_logs_patient_id ON data_access_logs(patient_id);
CREATE INDEX idx_data_access_logs_created_at ON data_access_logs(created_at);

-- ==============================================================================
-- 9. INITIAL DATA
-- ==============================================================================

-- Insert predefined roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'Hospital Administrator with full system access'),
    ('DOCTOR', 'Medical Doctor'),
    ('STAFF', 'Hospital Staff (nurses, technicians, etc.)'),
    ('PATIENT', 'Patient')
ON CONFLICT (name) DO NOTHING;

-- Insert predefined specializations
INSERT INTO specializations (name, code) VALUES
    ('General Medicine', 'GM'),
    ('Cardiology', 'CD'),
    ('Oncology', 'ON'),
    ('Neurology', 'NL'),
    ('Orthopedics', 'OR'),
    ('Pediatrics', 'PD'),
    ('Psychiatry', 'PS'),
    ('Dermatology', 'DM'),
    ('ENT', 'ET'),
    ('Surgery', 'SG')
ON CONFLICT (code) DO NOTHING;

-- Insert departments
INSERT INTO departments (name, code, description) VALUES
    ('Emergency', 'EMG', 'Emergency Department'),
    ('General Medicine', 'GEN', 'General Medicine Department'),
    ('Cardiology', 'CAR', 'Cardiology Department'),
    ('Surgery', 'SUR', 'General Surgery Department'),
    ('Pediatrics', 'PED', 'Pediatrics Department'),
    ('Orthopedics', 'ORT', 'Orthopedics Department'),
    ('Oncology', 'ONC', 'Oncology Department'),
    ('Neurology', 'NEU', 'Neurology Department'),
    ('Nursing', 'NUR', 'Nursing Department'),
    ('Administration', 'ADM', 'Administration Department')
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 9. BED & WARD MANAGEMENT
-- ==============================================================================

-- Wards (unit/floor/building)
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- ICU, General Ward, NICU, OPD, etc.
    code VARCHAR(20) UNIQUE NOT NULL, -- ICU-01, GW-01, NICU-01
    floor_number INT,
    building VARCHAR(50),
    total_beds INT NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Room Categories (bed types/classifications)
CREATE TABLE room_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- ICU, NICU, General, Private, Deluxe
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    capacity INT NOT NULL DEFAULT 1, -- beds per room
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Beds (individual bed records)
CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_code VARCHAR(50) UNIQUE NOT NULL, -- ICU-01-A, NICU-02-B, GW-03-C
    ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE RESTRICT,
    room_category_id UUID NOT NULL REFERENCES room_categories(id) ON DELETE RESTRICT,
    room_number VARCHAR(50), -- Physical room number if applicable
    floor_number INT, -- Inherited from ward
    bed_position VARCHAR(10), -- A, B, C, D (for multi-bed rooms)
    status VARCHAR(50) NOT NULL DEFAULT 'vacant', -- vacant, occupied, maintenance, reserved
    current_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Primary nurse/staff assigned
    admission_date TIMESTAMPTZ, -- When patient admitted to bed
    estimated_discharge_date DATE,
    special_requirements TEXT, -- Oxygen, Dialysis, Ventilator, etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('vacant', 'occupied', 'maintenance', 'reserved'))
);

-- Bed Status History (audit trail for bed changes)
CREATE TABLE bed_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    previous_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    new_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. WARD-BASED NURSE STATION
-- ==============================================================================

-- Nurse Assignments (ward/bed/floor-based assignment by Head Nurse)
CREATE TABLE nurse_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nurse_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
    floor_number INT,
    assigned_beds TEXT, -- JSON array of bed IDs or ranges (e.g., ['BED-01', 'BED-02'])
    shift_start_time TIME,
    shift_end_time TIME,
    shift_date DATE,
    assigned_by_id UUID NOT NULL REFERENCES users(id), -- Head Nurse
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- Inpatient Admissions (patient ↔ bed mapping)
CREATE TABLE inpatient_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE RESTRICT,
    ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE RESTRICT,
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    admission_type VARCHAR(50) NOT NULL, -- emergency, scheduled, transfer
    attending_doctor_id UUID NOT NULL REFERENCES users(id),
    chief_complaint TEXT,
    admission_notes TEXT,
    discharge_summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, discharged, transferred, deceased
    is_icu BOOLEAN DEFAULT false,
    is_nicu BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    CONSTRAINT valid_admission_type CHECK (admission_type IN ('emergency', 'scheduled', 'transfer')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'discharged', 'transferred', 'deceased'))
);

-- Doctor Orders (read-only for nurses)
CREATE TABLE doctor_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_type VARCHAR(50) NOT NULL, -- medication, procedure, investigation, diet, activity, observation
    description TEXT NOT NULL,
    instructions TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'normal', -- routine, urgent, stat
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, cancelled, on_hold
    scheduled_date TIMESTAMPTZ,
    expected_completion_date TIMESTAMPTZ,
    approvals_required BOOLEAN DEFAULT false,
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    cancelled_by_id UUID REFERENCES users(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_order_type CHECK (order_type IN ('medication', 'procedure', 'investigation', 'diet', 'activity', 'observation')),
    CONSTRAINT valid_priority CHECK (priority IN ('routine', 'urgent', 'stat')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold'))
);

-- Medication Schedules (doctor-defined)
CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_order_id UUID NOT NULL REFERENCES doctor_orders(id) ON DELETE CASCADE,
    inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- mg, ml, units, tablets, etc.
    frequency VARCHAR(100) NOT NULL, -- once daily, twice daily, every 6 hours, as needed, etc.
    route VARCHAR(50) NOT NULL, -- oral, IV, IM, SC, transdermal, topical, inhalation
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    duration_days INT,
    special_instructions TEXT,
    contraindications TEXT,
    allergies_to_check VARCHAR(255),
    requires_monitoring BOOLEAN DEFAULT false,
    monitoring_parameters TEXT, -- e.g., Blood Pressure, Heart Rate, etc.
    prescribing_doctor_id UUID NOT NULL REFERENCES users(id),
    prescribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, cancelled, paused
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_route CHECK (route IN ('oral', 'IV', 'IM', 'SC', 'transdermal', 'topical', 'inhalation', 'rectal', 'sublingual')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled', 'paused'))
);

-- Medication Administration (nurse execution with status, timestamp, nurse)
CREATE TABLE medication_administrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_schedule_id UUID NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
    inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    administered_time TIMESTAMPTZ,
    administered_by_id UUID REFERENCES users(id), -- Staff Nurse
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, administered, refused, held, delayed, not_given
    reason_if_not_given TEXT, -- patient refusal, medication unavailable, patient NPO, etc.
    actual_dosage VARCHAR(100), -- May differ from scheduled if nurse administered less
    route_used VARCHAR(50),
    site_of_administration VARCHAR(100), -- For IM/SC/IV injections: site, etc.
    batch_number VARCHAR(100),
    expiry_date DATE,
    nurse_notes TEXT,
    patient_response TEXT,
    side_effects_observed BOOLEAN DEFAULT false,
    side_effects_details TEXT,
    verified_by_id UUID REFERENCES users(id), -- Can be verified by another nurse or doctor
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'administered', 'refused', 'held', 'delayed', 'not_given'))
);

-- Vital Signs Records
CREATE TABLE vitals_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inpatient_admission_id UUID NOT NULL REFERENCES inpatient_admissions(id) ON DELETE CASCADE,
    recorded_by_id UUID NOT NULL REFERENCES users(id), -- Staff Nurse
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature_celsius NUMERIC(4,1), -- Body temperature
    heart_rate_bpm INT, -- Beats per minute
    systolic_bp INT, -- Systolic Blood Pressure
    diastolic_bp INT, -- Diastolic Blood Pressure
    respiratory_rate_rpm INT, -- Respiratory rate per minute
    oxygen_saturation_percent NUMERIC(3,1), -- SpO2 percentage
    blood_glucose_mmol NUMERIC(5,2), -- Blood glucose
    weight_kg NUMERIC(5,2),
    height_cm NUMERIC(5,1),
    pain_score INT, -- 0-10 scale
    gcs_score INT, -- Glasgow Coma Scale
    consciousness_level VARCHAR(100), -- alert, drowsy, unconscious, etc.
    urine_output_ml INT, -- Last 24 hours
    bowel_movement_status VARCHAR(100), -- normal, constipated, diarrhea, etc.
    notes TEXT, -- Additional observations
    abnormal_findings BOOLEAN DEFAULT false,
    reported_to_doctor_id UUID REFERENCES users(id),
    reported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emergency Events (raised by nurses)
CREATE TABLE emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inpatient_admission_id UUID REFERENCES inpatient_admissions(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    reported_by_id UUID NOT NULL REFERENCES users(id), -- Staff Nurse
    event_type VARCHAR(100) NOT NULL, -- cardiac arrest, respiratory distress, seizure, anaphylaxis, severe bleeding, code blue, etc.
    severity VARCHAR(50) NOT NULL, -- critical, high, medium, low
    location VARCHAR(255), -- Ward/Bed where event occurred
    description TEXT NOT NULL,
    time_of_event TIMESTAMPTZ NOT NULL,
    response_start_time TIMESTAMPTZ,
    response_end_time TIMESTAMPTZ,
    doctors_notified_ids TEXT, -- JSON array of doctor IDs notified
    notified_at TIMESTAMPTZ,
    actions_taken TEXT,
    outcome VARCHAR(100), -- patient_stabilized, transferred_to_icu, clinical_death, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'reported', -- reported, acknowledged, in_progress, resolved, escalated
    resolvingdoctor_id UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    follow_up_required BOOLEAN DEFAULT true,
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_severity CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    CONSTRAINT valid_status CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'escalated'))
);

-- ==============================================================================
-- 11. CONSTRAINTS & TRIGGERS
-- ==============================================================================

-- Trigger: Update patient updated_at on modification
CREATE OR REPLACE FUNCTION update_patient_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_patients_update_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_patient_timestamp();

-- Trigger: Log all patient data access
CREATE OR REPLACE FUNCTION log_patient_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, actor_role, old_values, new_values, severity)
    VALUES ('patients', NEW.id, TG_ARGV[0]::text, NEW.updated_by, 'SYSTEM', to_jsonb(OLD), to_jsonb(NEW), 'info');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_patients_audit
AFTER UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION log_patient_access();

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================

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
-- 10. CONSTRAINTS & TRIGGERS
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

-- ============================================
-- SMART HEALTH SYSTEM DATABASE - COMPLETE SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS smart_health_system;
USE smart_health_system;

-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(15),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ADMIN_USERS TABLE
CREATE TABLE admin_users (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- 3. DISEASE_TYPES TABLE
CREATE TABLE disease_types (
    disease_type_id INT PRIMARY KEY AUTO_INCREMENT,
    disease_name VARCHAR(100) UNIQUE NOT NULL,
    disease_code VARCHAR(10) UNIQUE,
    description TEXT,
    severity_level ENUM('Critical', 'Urgent', 'Mild') NOT NULL,
    specialist_required VARCHAR(100),
    recommended_action TEXT,
    prevention_tips TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. HOSPITALS TABLE
CREATE TABLE hospitals (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_name VARCHAR(200) NOT NULL,
    hospital_type ENUM('Hospital', 'Clinic', 'Emergency Center', 'Diagnostic Center') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    emergency_services BOOLEAN DEFAULT FALSE,
    specialties JSON,
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude)
);

-- 5. PREDICTIONS TABLE
CREATE TABLE predictions (
    prediction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    disease_type_id INT NOT NULL,
    prediction_result ENUM('Positive', 'Negative', 'High Risk', 'Moderate Risk', 'Low Risk') NOT NULL,
    confidence_score DECIMAL(5,4),
    risk_percentage DECIMAL(5,2),
    severity_level ENUM('Critical', 'Urgent', 'Mild') NOT NULL,
    emergency_required BOOLEAN DEFAULT FALSE,
    ml_model_version VARCHAR(50),
    recommendations TEXT,
    recommended_hospital_id INT,
    distance_to_hospital DECIMAL(10,2),
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (disease_type_id) REFERENCES disease_types(disease_type_id),
    FOREIGN KEY (recommended_hospital_id) REFERENCES hospitals(hospital_id),
    INDEX idx_user_date (user_id, prediction_date),
    INDEX idx_disease (disease_type_id)
);

-- 6. DIABETES_RECORDS TABLE
CREATE TABLE diabetes_records (
    diabetes_id INT PRIMARY KEY AUTO_INCREMENT,
    prediction_id INT UNIQUE NOT NULL,
    glucose_level DECIMAL(6,2),
    insulin_level DECIMAL(6,2),
    bmi DECIMAL(5,2),
    age INT,
    pregnancies INT,
    blood_pressure INT,
    skin_thickness DECIMAL(5,2),
    diabetes_pedigree_function DECIMAL(5,3),
    FOREIGN KEY (prediction_id) REFERENCES predictions(prediction_id) ON DELETE CASCADE
);

-- 7. HEART_DISEASE_RECORDS TABLE
CREATE TABLE heart_disease_records (
    heart_disease_id INT PRIMARY KEY AUTO_INCREMENT,
    prediction_id INT UNIQUE NOT NULL,
    age INT,
    sex TINYINT,
    chest_pain_type ENUM('Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'Asymptomatic'),
    resting_blood_pressure INT,
    cholesterol DECIMAL(6,2),
    fasting_blood_sugar BOOLEAN,
    resting_ecg ENUM('Normal', 'ST-T Abnormality', 'LV Hypertrophy'),
    max_heart_rate INT,
    exercise_induced_angina BOOLEAN,
    st_depression DECIMAL(4,2),
    slope_of_st ENUM('Upsloping', 'Flat', 'Downsloping'),
    num_major_vessels INT,
    thalassemia ENUM('Normal', 'Fixed Defect', 'Reversible Defect'),
    FOREIGN KEY (prediction_id) REFERENCES predictions(prediction_id) ON DELETE CASCADE
);

-- 10. CONTACT_MESSAGES TABLE
CREATE TABLE contact_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    responded_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- 11. AUDIT_LOG TABLE
CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    user_type ENUM('user', 'admin') NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_category ENUM('AUTH', 'PREDICTION', 'ADMIN', 'CONTACT', 'PROFILE', 'HOSPITAL', 'OTHER') NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(255),
    status_code INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_admin (admin_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action_type)
);

-- 12. REPORTS TABLE
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    report_type ENUM('Comprehensive', 'Disease Specific', 'Trend Analysis') NOT NULL,
    report_data JSON,
    pdf_path VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_downloaded BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert Disease Types
INSERT INTO disease_types (disease_name, disease_code, description, severity_level, specialist_required, recommended_action) VALUES
('Diabetes', 'D001', 'Type 2 Diabetes Mellitus', 'Urgent', 'Endocrinologist', 'Consult endocrinologist for blood sugar management'),
('Heart Disease', 'H001', 'Cardiovascular Disease', 'Critical', 'Cardiologist', 'Immediate consultation with cardiologist required'),
('Dengue Fever', 'DG001', 'Dengue viral infection', 'Urgent', 'Infectious Disease Specialist', 'Visit nearest hospital for blood test'),
('Breast Cancer', 'BC001', 'Malignant breast tumor', 'Critical', 'Oncologist', 'Immediate biopsy and oncology consultation');

-- Insert Sample Hospitals (Rawalpindi/Islamabad)
INSERT INTO hospitals (hospital_name, hospital_type, address, city, latitude, longitude, phone, emergency_services, specialties, rating) VALUES
('City General Hospital', 'Hospital', 'Mall Road, Saddar', 'Rawalpindi', 33.5986, 73.0551, '051-9272424', TRUE, '["Cardiology", "Emergency", "Endocrinology", "Oncology"]', 4.5),
('Heart Care Center', 'Hospital', 'Fazal-e-Haq Road', 'Rawalpindi', 33.6007, 73.0679, '051-5123456', TRUE, '["Cardiology", "Emergency"]', 4.3),
('Shifa International Hospital', 'Hospital', 'H-8/4, Pitras Bukhari Road', 'Islamabad', 33.6651, 73.0780, '051-8463000', TRUE, '["Cardiology", "Oncology", "Endocrinology"]', 4.8),
('Holy Family Hospital', 'Hospital', 'Jinnah Road', 'Rawalpindi', 33.6160, 73.0551, '051-9290301', TRUE, '["Emergency", "General Medicine", "Cardiology"]', 4.2),
('PIMS Hospital', 'Hospital', 'G-8/3, Shaheed-e-Millat Road', 'Islamabad', 33.6688, 73.0838, '051-9261170', TRUE, '["Cardiology", "Oncology", "Emergency"]', 4.4),
('Polyclinic Hospital', 'Hospital', 'G-6/2, Zero Point', 'Islamabad', 33.6844, 73.0479, '051-9218301', TRUE, '["General Medicine", "Emergency", "Endocrinology"]', 4.1),
('Diabetes Center Rawalpindi', 'Clinic', 'Murree Road', 'Rawalpindi', 33.6250, 73.0712, '051-5551234', FALSE, '["Endocrinology", "Diabetes Care"]', 4.0),
('Heart & Vascular Institute', 'Clinic', 'F-7 Markaz', 'Islamabad', 33.7181, 73.0551, '051-2876543', FALSE, '["Cardiology"]', 4.6),
('Cancer Care Hospital', 'Hospital', 'Lehtrar Road', 'Islamabad', 33.6502, 73.1451, '051-8439000', TRUE, '["Oncology", "Emergency"]', 4.7),
('Rawalpindi Medical City', 'Hospital', 'Tipu Road', 'Rawalpindi', 33.6290, 73.0686, '051-8444888', TRUE, '["Cardiology", "Oncology", "Endocrinology", "Emergency"]', 4.5);
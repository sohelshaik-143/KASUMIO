-- Schema for H2 test environment
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    website VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    bio TEXT NULL,
    university VARCHAR(255) NULL,
    graduation_year INT NULL,
    leaderboard_public BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NULL,
    ecosystem VARCHAR(100) NULL,
    canonical_name VARCHAR(100) NULL,
    version_info VARCHAR(50) NULL,
    technology_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS career_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    target_role VARCHAR(255) NOT NULL,
    CONSTRAINT fk_career_goals_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    evidence_url VARCHAR(1024) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evidence_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_evidence_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS evidence_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    suggested_fields CLOB NULL
);

CREATE TABLE IF NOT EXISTS verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evidence_id BIGINT NOT NULL UNIQUE,
    organization_id BIGINT NOT NULL,
    verified_by_user_id BIGINT NOT NULL,
    verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verifications_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    CONSTRAINT fk_verifications_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_verifications_user FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS opportunities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NULL,
    work_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP NULL,
    source VARCHAR(255) NULL,
    source_url VARCHAR(1024) NULL,
    posted_at TIMESTAMP NULL,
    last_verified_at TIMESTAMP NULL,
    verification_status VARCHAR(50) NULL DEFAULT 'UNVERIFIED',
    compensation VARCHAR(255) NULL,
    duration VARCHAR(255) NULL,
    eligibility TEXT NULL,
    education_requirements TEXT NULL,
    experience_requirements TEXT NULL,
    tags CLOB NULL,
    CONSTRAINT fk_opportunities_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS opportunity_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    skill_type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_opp_skills_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_opp_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT,
    CONSTRAINT uq_opportunity_skill UNIQUE (opportunity_id, skill_id)
);

CREATE TABLE IF NOT EXISTS opportunity_interests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'INTERESTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_interests_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_opp_interests_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_opportunity_student_interest UNIQUE (opportunity_id, student_id)
);

CREATE TABLE IF NOT EXISTS candidate_aliases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    public_alias VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT fk_candidate_alias_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    evidence_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    recruiter_comment TEXT NULL,
    CONSTRAINT fk_verif_req_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_verif_req_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_opp_evidence_recruiter UNIQUE (opportunity_id, evidence_id, recruiter_id)
);

CREATE TABLE IF NOT EXISTS trusted_connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    recruiter_note TEXT NULL,
    share_full_name BOOLEAN NOT NULL DEFAULT FALSE,
    share_email BOOLEAN NOT NULL DEFAULT FALSE,
    share_bio BOOLEAN NOT NULL DEFAULT FALSE,
    share_university BOOLEAN NOT NULL DEFAULT FALSE,
    share_graduation_year BOOLEAN NOT NULL DEFAULT FALSE,
    custom_message TEXT NULL,
    CONSTRAINT fk_trusted_conn_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_trusted_conn_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_trusted_conn_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT uq_trusted_conn_opp_student UNIQUE (opportunity_id, student_id)
);

CREATE TABLE IF NOT EXISTS skill_aliases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alias_name VARCHAR(100) NOT NULL,
    skill_id BIGINT NOT NULL,
    CONSTRAINT fk_skill_alias_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_skill_alias UNIQUE (alias_name)
);

CREATE TABLE IF NOT EXISTS skill_relationships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_skill_id BIGINT NOT NULL,
    target_skill_id BIGINT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    strength DOUBLE NOT NULL DEFAULT 0.5,
    CONSTRAINT fk_skill_rel_source FOREIGN KEY (source_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT fk_skill_rel_target FOREIGN KEY (target_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_skill_relationship UNIQUE (source_skill_id, target_skill_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS opportunity_saved (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    opportunity_id BIGINT NOT NULL,
    save_status VARCHAR(50) NOT NULL DEFAULT 'SAVED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_saved_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_opp_saved_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT uq_opp_saved_student UNIQUE (opportunity_id, student_id)
);

CREATE TABLE IF NOT EXISTS technology_candidates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raw_name VARCHAR(100) NOT NULL UNIQUE,
    normalized_name VARCHAR(100) NOT NULL,
    suggested_category VARCHAR(100) NULL,
    suggested_subcategory VARCHAR(100) NULL,
    suggested_ecosystem VARCHAR(100) NULL,
    version_info VARCHAR(50) NULL,
    aliases CLOB NULL,
    source VARCHAR(255) NOT NULL,
    confidence DOUBLE NOT NULL DEFAULT 0.5,
    status VARCHAR(50) NOT NULL DEFAULT 'DISCOVERED',
    occurrence_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by_user_id BIGINT NULL,
    CONSTRAINT fk_tech_cand_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_student_skill ON evidence(student_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_verif_req_recruiter_status ON verification_requests(recruiter_id, status);
CREATE INDEX IF NOT EXISTS idx_verif_req_student ON verification_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_trusted_conn_student_status ON trusted_connections(student_id, status);
CREATE INDEX IF NOT EXISTS idx_trusted_conn_recruiter_status ON trusted_connections(recruiter_id, status);
CREATE INDEX IF NOT EXISTS idx_trusted_conn_opportunity ON trusted_connections(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_skill_alias_name ON skill_aliases(alias_name);
CREATE INDEX IF NOT EXISTS idx_opp_saved_student_status ON opportunity_saved(student_id, save_status);
CREATE INDEX IF NOT EXISTS idx_tech_cand_status ON technology_candidates(status);

-- Technical Screening and Assessment Tables
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 45,
    passing_score INT NOT NULL DEFAULT 70,
    blueprint_json TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assessment_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    skill_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    order_index INT NOT NULL DEFAULT 0,
    validation_status VARCHAR(50) NOT NULL DEFAULT 'VALIDATED',
    competency_area VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_question_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT NULL,
    order_index INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coding_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE,
    problem_statement TEXT NOT NULL,
    starter_code_json TEXT NOT NULL,
    constraints TEXT NULL,
    allowed_languages VARCHAR(255) NOT NULL DEFAULT 'java,python,javascript,typescript,cpp,go,rust,kotlin',
    time_limit_ms INT NOT NULL DEFAULT 4000,
    memory_limit_mb INT NOT NULL DEFAULT 256,
    CONSTRAINT fk_coding_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_problem_id BIGINT NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT NULL,
    order_index INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_testcase_problem FOREIGN KEY (coding_problem_id) REFERENCES coding_problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 0,
    adaptive_difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    feedback_summary TEXT NULL,
    self_assessment_level VARCHAR(50) NULL,
    demonstrated_level VARCHAR(50) NULL,
    integrity_status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    integrity_signals_json TEXT NULL,
    evidence_graph_json TEXT NULL,
    recruiter_decision VARCHAR(50) NULL,
    recruiter_notes TEXT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    language VARCHAR(50) NULL,
    submitted_code TEXT NULL,
    selected_option_id BIGINT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PASSED',
    execution_time_ms BIGINT NOT NULL DEFAULT 0,
    memory_used_kb BIGINT NOT NULL DEFAULT 0,
    test_cases_passed INT NOT NULL DEFAULT 0,
    total_test_cases INT NOT NULL DEFAULT 0,
    feedback_json TEXT NULL,
    telemetry_json TEXT NULL,
    code_analysis_json TEXT NULL,
    similarity_score DOUBLE DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS candidate_question_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cqh_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_cqh_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);


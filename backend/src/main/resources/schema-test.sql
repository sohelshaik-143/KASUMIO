-- Schema for H2 environment
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

CREATE TABLE IF NOT EXISTS skill_aliases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alias_name VARCHAR(100) NOT NULL UNIQUE,
    skill_id BIGINT NOT NULL,
    CONSTRAINT fk_skill_aliases_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skill_relationships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_skill_id BIGINT NOT NULL,
    target_skill_id BIGINT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    strength DOUBLE NULL DEFAULT 0.5,
    CONSTRAINT fk_rel_source FOREIGN KEY (source_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT fk_rel_target FOREIGN KEY (target_skill_id) REFERENCES skills(id) ON DELETE CASCADE
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
    why_recommended TEXT NULL,
    why_not_recommended TEXT NULL,
    match_score INT NULL,
    match_category VARCHAR(50) NULL,
    CONSTRAINT fk_opp_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opportunity_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    skill_type VARCHAR(50) NOT NULL DEFAULT 'REQUIRED',
    CONSTRAINT fk_opp_skills_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_opp_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opportunity_interests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    expressed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'INTERESTED',
    CONSTRAINT fk_opp_int_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_opp_int_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connection_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    request_note TEXT NULL,
    disclosed_email VARCHAR(255) NULL,
    disclosed_full_name VARCHAR(255) NULL,
    disclosed_phone VARCHAR(50) NULL,
    disclosed_location VARCHAR(255) NULL,
    disclosed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    CONSTRAINT fk_conn_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_conn_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conn_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    evidence_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    recruiter_comment TEXT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    CONSTRAINT fk_verif_req_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_intents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    raw_intent TEXT NOT NULL,
    extracted_role_title VARCHAR(255) NULL,
    extracted_opportunity_type VARCHAR(50) NOT NULL DEFAULT 'INTERNSHIP',
    extracted_work_type VARCHAR(50) NOT NULL DEFAULT 'REMOTE',
    extracted_location VARCHAR(255) NULL,
    structured_payload TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_intent_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_automation_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL UNIQUE,
    recruiter_id BIGINT NOT NULL,
    opportunity_id BIGINT NULL,
    intent_id BIGINT NULL,
    automation_level VARCHAR(50) NOT NULL DEFAULT 'DELEGATED',
    status VARCHAR(50) NOT NULL,
    total_candidates_scanned INT NOT NULL DEFAULT 0,
    candidates_matched_count INT NOT NULL DEFAULT 0,
    candidates_shortlisted_count INT NOT NULL DEFAULT 0,
    outreach_sent_count INT NOT NULL DEFAULT 0,
    error_message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_intent FOREIGN KEY (intent_id) REFERENCES recruiter_intents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recruiter_candidate_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    student_id BIGINT NOT NULL,
    candidate_alias VARCHAR(50) NOT NULL,
    overall_score INT NOT NULL,
    readiness_score INT NOT NULL,
    evidence_strength_score INT NOT NULL,
    evidence_breakdown TEXT NOT NULL,
    why_recommended TEXT NOT NULL,
    personalized_message TEXT NOT NULL,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    outreach_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_job FOREIGN KEY (job_id) REFERENCES recruiter_automation_jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_automation_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL UNIQUE,
    max_daily_connections INT NOT NULL DEFAULT 25,
    min_readiness_threshold INT NOT NULL DEFAULT 50,
    require_verified_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    auto_send_outreach BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_policy_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_action_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    job_id VARCHAR(64) NULL,
    action_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

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


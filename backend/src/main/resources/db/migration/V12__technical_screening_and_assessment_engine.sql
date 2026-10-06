-- =============================================================================
-- Flyway Migration V12: Technical Screening, Adaptive Assessment & Code Evaluation Engine
-- =============================================================================

-- Add leaderboard privacy preference to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS leaderboard_public BOOLEAN NOT NULL DEFAULT TRUE;

-- 1. Assessments Table (Linked to Opportunity)
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

CREATE INDEX idx_assessment_opportunity ON assessments(opportunity_id);

-- 2. Assessment Questions (Multi-format: CODING, DEBUGGING, MCQ, SQL, CONCEPTUAL)
CREATE TABLE IF NOT EXISTS assessment_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- CODING, DEBUGGING, MCQ, SQL, CONCEPTUAL
    difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
    skill_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_question_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

CREATE INDEX idx_question_assessment ON assessment_questions(assessment_id);
CREATE INDEX idx_question_skill ON assessment_questions(skill_id);

-- 3. Question Options (For MCQ, Code-Output, and Conceptual questions)
CREATE TABLE IF NOT EXISTS question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT NULL,
    order_index INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_option_question ON question_options(question_id);

-- 4. Coding Problems (Multi-language specifications, starter code, constraints)
CREATE TABLE IF NOT EXISTS coding_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE,
    problem_statement TEXT NOT NULL,
    starter_code_json TEXT NOT NULL, -- JSON mapping language -> starter code
    constraints TEXT NULL,
    allowed_languages VARCHAR(255) NOT NULL DEFAULT 'java,python,javascript,typescript,cpp,go,rust,kotlin',
    time_limit_ms INT NOT NULL DEFAULT 4000,
    memory_limit_mb INT NOT NULL DEFAULT 256,
    CONSTRAINT fk_coding_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_coding_question ON coding_problems(question_id);

-- 5. Test Cases for Coding Problems (Deterministic evaluation: public & hidden)
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

CREATE INDEX idx_testcase_problem ON test_cases(coding_problem_id);

-- 6. Assessment Attempts (Tracks candidate progress, adaptive level, and overall score)
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 0,
    adaptive_difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    feedback_summary TEXT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_attempt_assessment ON assessment_attempts(assessment_id);
CREATE INDEX idx_attempt_student ON assessment_attempts(student_id);
CREATE INDEX idx_attempt_status ON assessment_attempts(status);

-- 7. Question Submissions (Preserves evidence trail of code, output, test results, and feedback)
CREATE TABLE IF NOT EXISTS question_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    language VARCHAR(50) NULL,
    submitted_code TEXT NULL,
    selected_option_id BIGINT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PASSED', -- PASSED, FAILED, ERROR, TIMEOUT
    execution_time_ms BIGINT NOT NULL DEFAULT 0,
    memory_used_kb BIGINT NOT NULL DEFAULT 0,
    test_cases_passed INT NOT NULL DEFAULT 0,
    total_test_cases INT NOT NULL DEFAULT 0,
    feedback_json TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
);

CREATE INDEX idx_sub_attempt ON question_submissions(attempt_id);
CREATE INDEX idx_sub_question ON question_submissions(question_id);

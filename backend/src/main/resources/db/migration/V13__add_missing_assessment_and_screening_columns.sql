-- =============================================================================
-- Flyway Migration V13: Assessment and Screening Schema Synchronization
-- Adds missing tracking and analytics columns to assessment_questions,
-- assessment_attempts, question_submissions, and creates candidate_question_history.
-- =============================================================================

-- 1. Assessment Questions: Add validation status and competency area
ALTER TABLE assessment_questions ADD COLUMN validation_status VARCHAR(50) NOT NULL DEFAULT 'VALIDATED';
ALTER TABLE assessment_questions ADD COLUMN competency_area VARCHAR(100) NULL;

-- 2. Assessment Attempts: Add self/demonstrated level, integrity signals, evidence graph, and recruiter evaluation
ALTER TABLE assessment_attempts ADD COLUMN self_assessment_level VARCHAR(50) NULL;
ALTER TABLE assessment_attempts ADD COLUMN demonstrated_level VARCHAR(50) NULL;
ALTER TABLE assessment_attempts ADD COLUMN integrity_status VARCHAR(50) NOT NULL DEFAULT 'NORMAL';
ALTER TABLE assessment_attempts ADD COLUMN integrity_signals_json TEXT NULL;
ALTER TABLE assessment_attempts ADD COLUMN evidence_graph_json TEXT NULL;
ALTER TABLE assessment_attempts ADD COLUMN recruiter_decision VARCHAR(50) NULL;
ALTER TABLE assessment_attempts ADD COLUMN recruiter_notes TEXT NULL;

-- 3. Question Submissions: Add telemetry, code analysis, and similarity score
ALTER TABLE question_submissions ADD COLUMN telemetry_json TEXT NULL;
ALTER TABLE question_submissions ADD COLUMN code_analysis_json TEXT NULL;
ALTER TABLE question_submissions ADD COLUMN similarity_score DOUBLE NULL DEFAULT 0.0;

-- 4. Candidate Question History: Tracks historical question assignments per candidate
CREATE TABLE IF NOT EXISTS candidate_question_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cqh_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_cqh_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_cqh_student ON candidate_question_history(student_id);
CREATE INDEX idx_cqh_question ON candidate_question_history(question_id);

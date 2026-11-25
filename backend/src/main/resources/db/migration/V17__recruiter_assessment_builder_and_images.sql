-- =============================================================================
-- Flyway Migration V17: Recruiter Assessment Builder, Versioning & Question Images
-- =============================================================================

-- 1. Assessments: Add lifecycle status, versioning, total marks, and skill weightings
ALTER TABLE assessments ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE assessments ADD COLUMN version_number INT NOT NULL DEFAULT 1;
ALTER TABLE assessments ADD COLUMN total_marks INT NOT NULL DEFAULT 0;
ALTER TABLE assessments ADD COLUMN skill_weightings_json TEXT NULL;
ALTER TABLE assessments ADD COLUMN passing_criteria VARCHAR(255) NULL;

-- 2. Assessment Questions: Add rubric definition, question-level timer, expected skills, and image storage
ALTER TABLE assessment_questions ADD COLUMN rubric_json TEXT NULL;
ALTER TABLE assessment_questions ADD COLUMN time_limit_minutes INT NULL;
ALTER TABLE assessment_questions ADD COLUMN expected_skills_json TEXT NULL;
ALTER TABLE assessment_questions ADD COLUMN image_url VARCHAR(1024) NULL;
ALTER TABLE assessment_questions ADD COLUMN image_alt_text VARCHAR(500) NULL;
ALTER TABLE assessment_questions ADD COLUMN image_caption VARCHAR(500) NULL;
ALTER TABLE assessment_questions ADD COLUMN image_storage_key VARCHAR(255) NULL;

-- 3. Create indices for versioning and lifecycle lookups
CREATE INDEX idx_assessment_opportunity_version ON assessments(opportunity_id, version_number);
CREATE INDEX idx_assessment_status ON assessments(status);

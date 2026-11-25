ALTER TABLE assessment_attempts
    ADD COLUMN violation_count INT NOT NULL DEFAULT 0,
    ADD COLUMN integrity_events_json TEXT NULL,
    ADD COLUMN consent_given_at TIMESTAMP NULL,
    ADD COLUMN overturned_by_recruiter BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN overturn_reason TEXT NULL;

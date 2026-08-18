-- =============================================================================
-- KASUMIO V5__feature02_trusted_connection.sql
-- Feature 02: Trusted Connection & Data Minimization
-- =============================================================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_trusted_conn_student_status ON trusted_connections(student_id, status);
CREATE INDEX idx_trusted_conn_recruiter_status ON trusted_connections(recruiter_id, status);
CREATE INDEX idx_trusted_conn_opportunity ON trusted_connections(opportunity_id);

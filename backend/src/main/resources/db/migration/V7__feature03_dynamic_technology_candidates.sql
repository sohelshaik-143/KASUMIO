-- =============================================================================
-- Flyway Migration V7: Feature 03 — Dynamic Technology Candidates
-- Supports Unknown Technology Detection & 14-Step Verification Lifecycle
-- =============================================================================

CREATE TABLE IF NOT EXISTS technology_candidates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raw_name VARCHAR(100) NOT NULL UNIQUE,
    normalized_name VARCHAR(100) NOT NULL,
    suggested_category VARCHAR(100) NULL,
    suggested_subcategory VARCHAR(100) NULL,
    suggested_ecosystem VARCHAR(100) NULL,
    version_info VARCHAR(50) NULL,
    aliases JSON NULL,
    source VARCHAR(255) NOT NULL,
    confidence DOUBLE NOT NULL DEFAULT 0.5,
    status VARCHAR(50) NOT NULL DEFAULT 'DISCOVERED', -- DISCOVERED, UNVERIFIED, VERIFIED, REJECTED
    occurrence_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by_user_id BIGINT NULL,
    CONSTRAINT fk_tech_cand_verifier FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tech_cand_status ON technology_candidates(status);
CREATE INDEX IF NOT EXISTS idx_tech_cand_norm_name ON technology_candidates(normalized_name);

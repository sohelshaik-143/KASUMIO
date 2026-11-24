-- Migration V14: Recruiter approval status and organization verification trust
ALTER TABLE organizations ADD COLUMN approval_status VARCHAR(50) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';

-- =============================================================================
-- KASUMIO V2__seed_taxonomy_and_templates.sql
-- Exactly 10 Foundation Taxonomy Skills & 5 Evidence Templates
-- =============================================================================

-- EXACTLY 10 Foundation Skills (Development Taxonomy Only)
INSERT INTO skills (name, category) VALUES
('Java', 'Backend Development'),
('Spring Boot', 'Backend Development'),
('MySQL', 'Database Management'),
('React', 'Frontend Development'),
('JavaScript', 'Frontend Development'),
('REST API Design', 'Software Engineering'),
('Git & Version Control', 'Software Engineering'),
('Data Structures & Algorithms', 'Computer Science'),
('Object-Oriented Design', 'Software Engineering'),
('Web Security & Authentication', 'Security');

-- Evidence Templates to guide students in structuring real evidence
INSERT INTO evidence_templates (title, description, evidence_type, suggested_fields) VALUES
(
    'GitHub / Git Repository',
    'Demonstrate practical coding and version control through a public repository with clean commits and documentation.',
    'PROJECT',
    '{"url_label": "Repository URL", "suggested_title": "Project Repository", "guidance": "Include a link to your public repository containing README with setup instructions and architecture notes."}'
),
(
    'Live Deployed Application',
    'Demonstrate an accessible, working software product running in a production or cloud environment.',
    'PROJECT',
    '{"url_label": "Live Demo URL", "suggested_title": "Deployed Application Demo", "guidance": "Provide the active HTTPS URL where reviewers can test the application live."}'
),
(
    'Technical Certification',
    'Demonstrate standardized domain mastery validated by an accredited certification provider.',
    'CERTIFICATE',
    '{"url_label": "Credential Verification URL", "suggested_title": "Certified Credential", "guidance": "Provide the direct verification link or credential identifier from the issuing body."}'
),
(
    'Technical Publication / Whitepaper',
    'Demonstrate in-depth technical analysis, research findings, or architecture review.',
    'PUBLICATION',
    '{"url_label": "Publication or DOI URL", "suggested_title": "Technical Publication", "guidance": "Provide a link to the published article, conference paper, or peer-reviewed document."}'
),
(
    'Competition / Hackathon Outcome',
    'Demonstrate rapid problem-solving, teamwork, and execution under competition constraints.',
    'OTHER',
    '{"url_label": "Official Results / Project URL", "suggested_title": "Hackathon Submission & Result", "guidance": "Link to the submission showcase, leaderboards, or official certificate of recognition."}'
);

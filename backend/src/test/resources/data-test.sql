-- Seed taxonomy skills
INSERT INTO skills (name, category, subcategory, ecosystem, canonical_name, technology_status) VALUES
('Java', 'Backend Development', 'Language', 'JVM', 'Java', 'ACTIVE'),
('Spring Boot', 'Backend Development', 'Framework', 'JVM', 'Spring Boot', 'ACTIVE'),
('Spring Framework', 'Backend Development', 'Framework', 'JVM', 'Spring Framework', 'ACTIVE'),
('MySQL', 'Database Management', 'Relational Database', 'SQL', 'MySQL', 'ACTIVE'),
('React', 'Frontend Development', 'Library', 'JavaScript', 'React', 'ACTIVE'),
('JavaScript', 'Frontend Development', 'Language', 'JavaScript', 'JavaScript', 'ACTIVE'),
('REST API Design', 'Software Engineering', 'Architecture', 'Web', 'REST API Design', 'ACTIVE'),
('Git & Version Control', 'Software Engineering', 'Tool', 'DevOps', 'Git', 'ACTIVE'),
('Data Structures & Algorithms', 'Computer Science', 'Fundamentals', 'Computer Science', 'DSA', 'ACTIVE'),
('Object-Oriented Design', 'Software Engineering', 'Fundamentals', 'Software Engineering', 'OOD', 'ACTIVE'),
('Web Security & Authentication', 'Security', 'Security', 'Web', 'Web Security', 'ACTIVE'),
('Python', 'Programming Language', 'Language', 'Python', 'Python', 'ACTIVE'),
('TypeScript', 'Programming Language', 'Language', 'JavaScript', 'TypeScript', 'ACTIVE'),
('Go', 'Programming Language', 'Language', 'Go', 'Go', 'ACTIVE'),
('Rust', 'Programming Language', 'Language', 'Systems', 'Rust', 'ACTIVE'),
('FastAPI', 'Backend Development', 'Framework', 'Python', 'FastAPI', 'ACTIVE'),
('Django', 'Backend Development', 'Framework', 'Python', 'Django', 'ACTIVE'),
('Next.js', 'Frontend Development', 'Framework', 'JavaScript', 'Next.js', 'ACTIVE'),
('PostgreSQL', 'Database Management', 'Relational Database', 'SQL', 'PostgreSQL', 'ACTIVE'),
('Redis', 'Database Management', 'In-Memory Store', 'NoSQL', 'Redis', 'ACTIVE'),
('Pinecone', 'Database Management', 'Vector Database', 'AI', 'Pinecone', 'ACTIVE'),
('Docker', 'DevOps', 'Containerization', 'DevOps', 'Docker', 'ACTIVE'),
('Kubernetes', 'DevOps', 'Orchestration', 'DevOps', 'Kubernetes', 'ACTIVE'),
('Amazon Web Services', 'Cloud Platforms', 'Cloud Provider', 'AWS', 'AWS', 'ACTIVE'),
('Large Language Models', 'Generative AI', 'Model Type', 'AI', 'LLM', 'ACTIVE'),
('RAG', 'Generative AI', 'Architecture', 'AI', 'RAG', 'ACTIVE'),
('PyTorch', 'Artificial Intelligence', 'Deep Learning Framework', 'Python', 'PyTorch', 'ACTIVE'),
('LangChain', 'Artificial Intelligence', 'Agent Framework', 'Python', 'LangChain', 'ACTIVE');

-- Seed Aliases
INSERT INTO skill_aliases (alias_name, skill_id) VALUES
('JS', (SELECT id FROM skills WHERE name = 'JavaScript')),
('TS', (SELECT id FROM skills WHERE name = 'TypeScript')),
('Golang', (SELECT id FROM skills WHERE name = 'Go')),
('Postgres', (SELECT id FROM skills WHERE name = 'PostgreSQL')),
('K8s', (SELECT id FROM skills WHERE name = 'Kubernetes')),
('AWS', (SELECT id FROM skills WHERE name = 'Amazon Web Services')),
('LLM', (SELECT id FROM skills WHERE name = 'Large Language Models')),
('Git', (SELECT id FROM skills WHERE name = 'Git & Version Control'));

-- Seed Relationships
INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type, strength) VALUES
((SELECT id FROM skills WHERE name = 'Java'), (SELECT id FROM skills WHERE name = 'Spring Boot'), 'PARENT', 0.8),
((SELECT id FROM skills WHERE name = 'Docker'), (SELECT id FROM skills WHERE name = 'Kubernetes'), 'PREREQUISITE', 0.8),
((SELECT id FROM skills WHERE name = 'JavaScript'), (SELECT id FROM skills WHERE name = 'React'), 'PARENT', 0.8),
((SELECT id FROM skills WHERE name = 'Large Language Models'), (SELECT id FROM skills WHERE name = 'RAG'), 'RELATED', 0.85);

-- Seed 5 evidence templates
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

-- =============================================================================
-- Comprehensive Global Software Engineering Technology Taxonomy (Languages, Frameworks, DBs, Cloud, AI)
-- =============================================================================

INSERT INTO skills (name, category, subcategory, ecosystem, canonical_name, technology_status) VALUES
-- 1. Programming Languages
('Java', 'Programming Languages', 'Language', 'JVM', 'Java', 'ACTIVE'),
('JavaScript', 'Programming Languages', 'Language', 'JavaScript', 'JavaScript', 'ACTIVE'),
('TypeScript', 'Programming Languages', 'Language', 'JavaScript', 'TypeScript', 'ACTIVE'),
('Python', 'Programming Languages', 'Language', 'Python', 'Python', 'ACTIVE'),
('Go', 'Programming Languages', 'Language', 'Go', 'Go', 'ACTIVE'),
('Rust', 'Programming Languages', 'Language', 'Systems', 'Rust', 'ACTIVE'),
('C', 'Programming Languages', 'Language', 'Systems', 'C', 'ACTIVE'),
('C++', 'Programming Languages', 'Language', 'Systems', 'C++', 'ACTIVE'),
('C#', 'Programming Languages', 'Language', '.NET', 'C#', 'ACTIVE'),
('Kotlin', 'Programming Languages', 'Language', 'JVM', 'Kotlin', 'ACTIVE'),
('Swift', 'Programming Languages', 'Language', 'Apple', 'Swift', 'ACTIVE'),
('PHP', 'Programming Languages', 'Language', 'Web', 'PHP', 'ACTIVE'),
('Ruby', 'Programming Languages', 'Language', 'Web', 'Ruby', 'ACTIVE'),
('Scala', 'Programming Languages', 'Language', 'JVM', 'Scala', 'ACTIVE'),
('Elixir', 'Programming Languages', 'Language', 'Erlang', 'Elixir', 'ACTIVE'),
('Haskell', 'Programming Languages', 'Language', 'Functional', 'Haskell', 'ACTIVE'),
('Dart', 'Programming Languages', 'Language', 'Web/Mobile', 'Dart', 'ACTIVE'),
('R', 'Programming Languages', 'Language', 'Data Science', 'R', 'ACTIVE'),
('SQL', 'Programming Languages', 'Query Language', 'SQL', 'SQL', 'ACTIVE'),
('HTML5 & CSS3', 'Frontend Development', 'Web Standards', 'Web', 'HTML/CSS', 'ACTIVE'),
('Shell & Bash', 'DevOps', 'Scripting', 'Unix', 'Bash', 'ACTIVE'),

-- 2. Backend Web Frameworks & Runtimes
('Spring Boot', 'Backend Development', 'Framework', 'JVM', 'Spring Boot', 'ACTIVE'),
('Spring Framework', 'Backend Development', 'Framework', 'JVM', 'Spring Framework', 'ACTIVE'),
('Node.js', 'Backend Development', 'Runtime', 'JavaScript', 'Node.js', 'ACTIVE'),
('Express.js', 'Backend Development', 'Framework', 'JavaScript', 'Express.js', 'ACTIVE'),
('NestJS', 'Backend Development', 'Framework', 'JavaScript', 'NestJS', 'ACTIVE'),
('FastAPI', 'Backend Development', 'Framework', 'Python', 'FastAPI', 'ACTIVE'),
('Django', 'Backend Development', 'Framework', 'Python', 'Django', 'ACTIVE'),
('Flask', 'Backend Development', 'Framework', 'Python', 'Flask', 'ACTIVE'),
('Ruby on Rails', 'Backend Development', 'Framework', 'Ruby', 'Rails', 'ACTIVE'),
('ASP.NET Core', 'Backend Development', 'Framework', '.NET', 'ASP.NET Core', 'ACTIVE'),
('Laravel', 'Backend Development', 'Framework', 'PHP', 'Laravel', 'ACTIVE'),
('Phoenix', 'Backend Development', 'Framework', 'Elixir', 'Phoenix', 'ACTIVE'),
('Gin', 'Backend Development', 'Framework', 'Go', 'Gin', 'ACTIVE'),
('Actix Web', 'Backend Development', 'Framework', 'Rust', 'Actix Web', 'ACTIVE'),

-- 3. Frontend Web Frameworks & UI Libraries
('React', 'Frontend Development', 'Library', 'JavaScript', 'React', 'ACTIVE'),
('Next.js', 'Frontend Development', 'Framework', 'JavaScript', 'Next.js', 'ACTIVE'),
('Vue.js', 'Frontend Development', 'Framework', 'JavaScript', 'Vue.js', 'ACTIVE'),
('Nuxt.js', 'Frontend Development', 'Framework', 'JavaScript', 'Nuxt.js', 'ACTIVE'),
('Angular', 'Frontend Development', 'Framework', 'TypeScript', 'Angular', 'ACTIVE'),
('Svelte', 'Frontend Development', 'Compiler', 'JavaScript', 'Svelte', 'ACTIVE'),
('SvelteKit', 'Frontend Development', 'Framework', 'JavaScript', 'SvelteKit', 'ACTIVE'),
('SolidJS', 'Frontend Development', 'Library', 'JavaScript', 'SolidJS', 'ACTIVE'),
('Tailwind CSS', 'Frontend Development', 'CSS Framework', 'Web', 'Tailwind CSS', 'ACTIVE'),
('Redux Toolkit', 'Frontend Development', 'State Management', 'JavaScript', 'Redux', 'ACTIVE'),
('GraphQL', 'Backend Development', 'API Specification', 'Web', 'GraphQL', 'ACTIVE'),
('REST API Design', 'Software Engineering', 'Architecture', 'Web', 'REST API Design', 'ACTIVE'),

-- 4. Mobile & Desktop App Frameworks
('Flutter', 'Mobile Development', 'Framework', 'Dart', 'Flutter', 'ACTIVE'),
('React Native', 'Mobile Development', 'Framework', 'JavaScript', 'React Native', 'ACTIVE'),
('Android SDK', 'Mobile Development', 'Platform SDK', 'Android', 'Android SDK', 'ACTIVE'),
('SwiftUI & iOS SDK', 'Mobile Development', 'Platform SDK', 'iOS', 'iOS SDK', 'ACTIVE'),
('Electron', 'Desktop Development', 'Framework', 'JavaScript', 'Electron', 'ACTIVE'),

-- 5. Databases & Data Stores
('MySQL', 'Database Management', 'Relational Database', 'SQL', 'MySQL', 'ACTIVE'),
('PostgreSQL', 'Database Management', 'Relational Database', 'SQL', 'PostgreSQL', 'ACTIVE'),
('SQLite', 'Database Management', 'Embedded Database', 'SQL', 'SQLite', 'ACTIVE'),
('MongoDB', 'Database Management', 'Document Database', 'NoSQL', 'MongoDB', 'ACTIVE'),
('Redis', 'Database Management', 'In-Memory Store', 'NoSQL', 'Redis', 'ACTIVE'),
('Cassandra', 'Database Management', 'Wide-Column Store', 'NoSQL', 'Cassandra', 'ACTIVE'),
('Elasticsearch', 'Database Management', 'Search Engine', 'Distributed', 'Elasticsearch', 'ACTIVE'),
('Pinecone', 'Database Management', 'Vector Database', 'AI', 'Pinecone', 'ACTIVE'),
('ChromaDB', 'Database Management', 'Vector Database', 'AI', 'ChromaDB', 'ACTIVE'),
('Neo4j', 'Database Management', 'Graph Database', 'Graph', 'Neo4j', 'ACTIVE'),
('DynamoDB', 'Database Management', 'Managed NoSQL', 'AWS', 'DynamoDB', 'ACTIVE'),

-- 6. Cloud, Infrastructure & DevOps
('Amazon Web Services', 'Cloud Platforms', 'Cloud Provider', 'AWS', 'AWS', 'ACTIVE'),
('Microsoft Azure', 'Cloud Platforms', 'Cloud Provider', 'Azure', 'Azure', 'ACTIVE'),
('Google Cloud Platform', 'Cloud Platforms', 'Cloud Provider', 'GCP', 'GCP', 'ACTIVE'),
('Docker', 'DevOps', 'Containerization', 'DevOps', 'Docker', 'ACTIVE'),
('Kubernetes', 'DevOps', 'Orchestration', 'DevOps', 'Kubernetes', 'ACTIVE'),
('Terraform', 'DevOps', 'Infrastructure as Code', 'DevOps', 'Terraform', 'ACTIVE'),
('Ansible', 'DevOps', 'Automation', 'DevOps', 'Ansible', 'ACTIVE'),
('CI/CD Pipelines', 'DevOps', 'Automation', 'DevOps', 'CI/CD', 'ACTIVE'),
('Nginx', 'DevOps', 'Web Server & Proxy', 'Web', 'Nginx', 'ACTIVE'),
('Apache Kafka', 'Distributed Systems', 'Event Streaming', 'Distributed', 'Kafka', 'ACTIVE'),
('RabbitMQ', 'Distributed Systems', 'Message Broker', 'Distributed', 'RabbitMQ', 'ACTIVE'),
('Git & Version Control', 'Software Engineering', 'Tool', 'DevOps', 'Git', 'ACTIVE'),

-- 7. Artificial Intelligence, ML & Generative AI
('Large Language Models', 'Generative AI', 'Model Architecture', 'AI', 'LLM', 'ACTIVE'),
('RAG', 'Generative AI', 'System Architecture', 'AI', 'RAG', 'ACTIVE'),
('PyTorch', 'Artificial Intelligence', 'Deep Learning', 'Python', 'PyTorch', 'ACTIVE'),
('TensorFlow', 'Artificial Intelligence', 'Machine Learning', 'Python', 'TensorFlow', 'ACTIVE'),
('LangChain', 'Generative AI', 'Agent Framework', 'Python', 'LangChain', 'ACTIVE'),
('LlamaIndex', 'Generative AI', 'Data Framework', 'Python', 'LlamaIndex', 'ACTIVE'),
('Hugging Face Transformers', 'Generative AI', 'Model Library', 'Python', 'Hugging Face', 'ACTIVE'),
('scikit-learn', 'Artificial Intelligence', 'Machine Learning', 'Python', 'scikit-learn', 'ACTIVE'),
('Pandas & NumPy', 'Data Science', 'Data Processing', 'Python', 'Pandas', 'ACTIVE'),
('OpenAI API', 'Generative AI', 'Cloud API', 'AI', 'OpenAI', 'ACTIVE'),

-- 8. Core Computer Science & Security
('Web Security & Authentication', 'Security', 'Security', 'Web', 'Web Security', 'ACTIVE'),
('Data Structures & Algorithms', 'Computer Science', 'Fundamentals', 'Computer Science', 'DSA', 'ACTIVE'),
('Object-Oriented Design', 'Software Engineering', 'Fundamentals', 'Software Engineering', 'OOD', 'ACTIVE'),
('Microservices Architecture', 'Software Engineering', 'Architecture', 'Distributed', 'Microservices', 'ACTIVE'),
('System Design', 'Software Engineering', 'Architecture', 'Distributed', 'System Design', 'ACTIVE');

-- Global Skill Aliases & Normalization Mappings
INSERT INTO skill_aliases (alias_name, skill_id) VALUES
('JS', (SELECT id FROM skills WHERE name = 'JavaScript')),
('TS', (SELECT id FROM skills WHERE name = 'TypeScript')),
('Golang', (SELECT id FROM skills WHERE name = 'Go')),
('Py', (SELECT id FROM skills WHERE name = 'Python')),
('Cpp', (SELECT id FROM skills WHERE name = 'C++')),
('CS', (SELECT id FROM skills WHERE name = 'C#')),
('Postgres', (SELECT id FROM skills WHERE name = 'PostgreSQL')),
('Mongo', (SELECT id FROM skills WHERE name = 'MongoDB')),
('K8s', (SELECT id FROM skills WHERE name = 'Kubernetes')),
('AWS', (SELECT id FROM skills WHERE name = 'Amazon Web Services')),
('GCP', (SELECT id FROM skills WHERE name = 'Google Cloud Platform')),
('Azure', (SELECT id FROM skills WHERE name = 'Microsoft Azure')),
('LLM', (SELECT id FROM skills WHERE name = 'Large Language Models')),
('TF', (SELECT id FROM skills WHERE name = 'TensorFlow')),
('RN', (SELECT id FROM skills WHERE name = 'React Native')),
('SpringBoot', (SELECT id FROM skills WHERE name = 'Spring Boot')),
('NextJS', (SELECT id FROM skills WHERE name = 'Next.js')),
('Vue', (SELECT id FROM skills WHERE name = 'Vue.js')),
('Tailwind', (SELECT id FROM skills WHERE name = 'Tailwind CSS')),
('Kafka', (SELECT id FROM skills WHERE name = 'Apache Kafka')),
('Git', (SELECT id FROM skills WHERE name = 'Git & Version Control')),
('Bash', (SELECT id FROM skills WHERE name = 'Shell & Bash'));

-- Technology Relationships & Prerequisites
INSERT INTO skill_relationships (source_skill_id, target_skill_id, relationship_type, strength) VALUES
((SELECT id FROM skills WHERE name = 'Java'), (SELECT id FROM skills WHERE name = 'Spring Boot'), 'PARENT', 0.9),
((SELECT id FROM skills WHERE name = 'JavaScript'), (SELECT id FROM skills WHERE name = 'React'), 'PARENT', 0.9),
((SELECT id FROM skills WHERE name = 'React'), (SELECT id FROM skills WHERE name = 'Next.js'), 'PARENT', 0.85),
((SELECT id FROM skills WHERE name = 'TypeScript'), (SELECT id FROM skills WHERE name = 'Angular'), 'PARENT', 0.85),
((SELECT id FROM skills WHERE name = 'Python'), (SELECT id FROM skills WHERE name = 'FastAPI'), 'PARENT', 0.85),
((SELECT id FROM skills WHERE name = 'Python'), (SELECT id FROM skills WHERE name = 'PyTorch'), 'PARENT', 0.9),
((SELECT id FROM skills WHERE name = 'Docker'), (SELECT id FROM skills WHERE name = 'Kubernetes'), 'PREREQUISITE', 0.85),
((SELECT id FROM skills WHERE name = 'Large Language Models'), (SELECT id FROM skills WHERE name = 'RAG'), 'RELATED', 0.9),
((SELECT id FROM skills WHERE name = 'Large Language Models'), (SELECT id FROM skills WHERE name = 'LangChain'), 'RELATED', 0.9);

-- Structured Evidence Templates
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

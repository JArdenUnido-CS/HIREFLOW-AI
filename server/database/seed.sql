-- =============================================================================
-- HIREFLOW-AI Sample Data - Seeds for Development and Testing
-- =============================================================================

USE hireflow_ai;

-- =============================================================================
-- Insert Sample Users
-- =============================================================================

-- Phase 2 Users: ADMIN, EMPLOYER (Recruiters), and CLIENT (Job Seekers)
-- Password: password123 (bcrypt hash: $2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe)

-- ADMIN user
INSERT INTO users (id, email, name, password_hash, role, department, created_at) VALUES
('usr_01', 'JardenUnido@hireflow.ai', 'Jem Arden Unido', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'admin', 'Administration', '2024-01-15 08:00:00');

-- EMPLOYER users (Recruiters)
INSERT INTO users (id, email, name, password_hash, role, department, created_at) VALUES
('usr_02', 'recruiter@hireflow.ai', 'Rebecca Recruiter', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'employer', 'Talent Acquisition', '2024-02-01 09:30:00'),
('usr_03', 'alex.rivera@hireflow.ai', 'Alex Rivera', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'employer', 'Engineering', '2024-02-15 10:00:00'),
('usr_04', 'maya.patel@hireflow.ai', 'Dr. Maya Patel', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'employer', 'AI/ML', '2024-03-01 08:00:00'),
('usr_05', 'jordan.kim@hireflow.ai', 'Jordan Kim', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'employer', 'Design', '2024-03-15 08:00:00');

-- CLIENT users (Job Seekers)
INSERT INTO users (id, email, name, password_hash, role, department, created_at) VALUES
('usr_06', 'john@example.com', 'John Doe', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'client', NULL, '2024-04-01 10:00:00');

-- =============================================================================
-- Insert Sample Jobs
-- =============================================================================

INSERT INTO jobs (id, title, department, location, type, salary_min, salary_max, description, responsibilities, benefits, skills_required, skills_preferred, experience_years, education, status, deadline, created_by, hiring_manager_id, created_at) VALUES
(
  'job_01',
  'Senior Frontend Engineer',
  'Engineering',
  'San Francisco, CA',
  'full-time',
  160000,
  220000,
  'Join our product team to build the next generation of collaborative tools.',
  '["Lead frontend architecture decisions", "Mentor junior engineers", "Ship high-quality features"]',
  '["Equity package", "Unlimited PTO", "Health & dental", "Learning budget"]',
  '["React", "TypeScript", "System Design", "CSS-in-JS"]',
  '["GraphQL", "Next.js", "Figma", "Testing"]',
  5,
  'Bachelor\'s in Computer Science or equivalent',
  'open',
  '2026-09-15',
  'usr_01',
  'usr_03',
  '2026-06-01 10:00:00'
),
(
  'job_02',
  'Machine Learning Engineer',
  'AI/ML',
  'Remote',
  'full-time',
  180000,
  260000,
  'Build and deploy ML models that power intelligent recruitment features.',
  '["Design ML pipelines", "Train and evaluate models", "Collaborate with product"]',
  '["Stock options", "Remote-first", "401k match", "Conference budget"]',
  '["Python", "PyTorch", "NLP", "MLOps"]',
  '["Transformers", "Kubernetes", "AWS SageMaker"]',
  4,
  'Master\'s in ML, AI, or related field',
  'open',
  '2026-08-30',
  'usr_01',
  'usr_04',
  '2026-05-20 08:00:00'
),
(
  'job_03',
  'Product Designer',
  'Design',
  'New York, NY',
  'full-time',
  140000,
  190000,
  'Shape the user experience of our recruitment platform.',
  '["Own end-to-end design process", "Conduct user research", "Build design systems"]',
  '["Design tools budget", "Flexible hours", "Health insurance"]',
  '["Figma", "User Research", "Prototyping", "Design Systems"]',
  '["Motion Design", "Frontend Development", "Data Visualization"]',
  4,
  'Bachelor\'s in Design, HCI, or equivalent',
  'open',
  '2026-09-01',
  'usr_01',
  'usr_05',
  '2026-06-10 09:00:00'
),
(
  'job_04',
  'Backend Engineer',
  'Engineering',
  'Austin, TX',
  'full-time',
  150000,
  210000,
  'Build scalable APIs and services for our growing platform.',
  '["Design REST APIs", "Optimize database queries", "Implement security best practices"]',
  '["Equity", "Relocation support", "Gym membership"]',
  '["Node.js", "PostgreSQL", "TypeScript", "Docker"]',
  '["Redis", "Kafka", "AWS", "Terraform"]',
  4,
  'Bachelor\'s in Computer Science',
  'open',
  '2026-09-20',
  'usr_01',
  'usr_03',
  '2026-06-15 11:00:00'
);

-- =============================================================================
-- Insert Sample Candidates
-- =============================================================================

INSERT INTO candidates (
  id, name, email, phone, location, linkedin, github, portfolio, status, job_id, applied_at, parsed_data
) VALUES
(
  'cand_01',
  'Emily Zhang',
  'emily.zhang@gmail.com',
  '+1 (415) 555-0142',
  'San Francisco, CA',
  'linkedin.com/in/emilyzhang',
  'github.com/emilyzhang',
  NULL,
  'interview',
  'job_01',
  '2026-07-20 14:30:00',
  JSON_OBJECT(
    'name', 'Emily Zhang',
    'summary', 'Experienced Frontend Engineer with 6 years building scalable web applications. Expert in React, TypeScript, and modern tooling. Passionate about performance optimization and mentoring junior developers.',
    'phone', '+1 (415) 555-0142',
    'location', 'San Francisco, CA',
    'linkedin', 'linkedin.com/in/emilyzhang',
    'github', 'github.com/emilyzhang',
    'portfolio', NULL,
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Senior Frontend Engineer',
        'company', 'TechCorp',
        'location', 'San Francisco, CA',
        'startDate', '2023-03',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Led frontend architecture redesign improving performance by 40%', 'Mentored 3 junior engineers', 'Implemented design system serving 50+ components')
      ),
      JSON_OBJECT(
        'title', 'Frontend Engineer',
        'company', 'StartupXYZ',
        'location', 'San Francisco, CA',
        'startDate', '2020-06',
        'endDate', '2023-02',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Built responsive web applications using React', 'Reduced bundle size by 35%', 'Implemented CI/CD pipeline')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Bachelor of Science',
        'field', 'Computer Science',
        'institution', 'University of California, Berkeley',
        'year', 2020,
        'gpa', 3.8
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'Frontend', 'skills', JSON_ARRAY('React', 'TypeScript', 'CSS-in-JS', 'Webpack')),
      JSON_OBJECT('category', 'Testing', 'skills', JSON_ARRAY('Jest', 'React Testing Library', 'Cypress')),
      JSON_OBJECT('category', 'Tools', 'skills', JSON_ARRAY('Git', 'Docker', 'GitHub Actions'))
    ),
    'certifications', JSON_ARRAY(),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'Mandarin', 'proficiency', 'Advanced')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Performance Dashboard',
        'description', 'Real-time monitoring dashboard for performance metrics',
        'technologies', JSON_ARRAY('React', 'D3.js', 'WebSocket'),
        'url', 'github.com/emilyzhang/perf-dashboard'
      )
    ),
    'achievements', JSON_ARRAY('Promoted to Senior Engineer in record time', 'Won company hackathon 2024'),
    'totalYearsExperience', 6
  )
),
(
  'cand_02',
  'Marcus Johnson',
  'marcus.j@outlook.com',
  '+1 (512) 555-0198',
  'Austin, TX',
  'linkedin.com/in/marcusjohnson',
  'github.com/marcusj',
  NULL,
  'shortlisted',
  'job_04',
  '2026-07-18 09:15:00',
  JSON_OBJECT(
    'name', 'Marcus Johnson',
    'summary', 'Full-stack Backend Engineer with 5 years experience building scalable distributed systems. Proficient in Node.js, PostgreSQL, and cloud infrastructure. Strong understanding of microservices architecture.',
    'phone', '+1 (512) 555-0198',
    'location', 'Austin, TX',
    'linkedin', 'linkedin.com/in/marcusjohnson',
    'github', 'github.com/marcusj',
    'portfolio', NULL,
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Backend Engineer',
        'company', 'CloudServices Inc',
        'location', 'Austin, TX',
        'startDate', '2022-01',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Designed and implemented REST APIs serving 10M+ requests/day', 'Optimized database queries reducing latency by 50%', 'Led migration of monolith to microservices')
      ),
      JSON_OBJECT(
        'title', 'Junior Backend Engineer',
        'company', 'TechStartup',
        'location', 'Austin, TX',
        'startDate', '2020-06',
        'endDate', '2021-12',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Built RESTful APIs using Express', 'Worked with PostgreSQL and Redis', 'Implemented authentication and authorization')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Bachelor of Science',
        'field', 'Software Engineering',
        'institution', 'University of Texas at Austin',
        'year', 2020,
        'gpa', 3.7
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'Backend', 'skills', JSON_ARRAY('Node.js', 'Express', 'PostgreSQL', 'MongoDB')),
      JSON_OBJECT('category', 'DevOps', 'skills', JSON_ARRAY('Docker', 'Kubernetes', 'AWS', 'GitLab CI/CD')),
      JSON_OBJECT('category', 'Databases', 'skills', JSON_ARRAY('PostgreSQL', 'Redis', 'Elasticsearch'))
    ),
    'certifications', JSON_ARRAY('AWS Certified Solutions Architect'),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'Spanish', 'proficiency', 'Intermediate')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Microservices API Gateway',
        'description', 'Built scalable API gateway for routing requests to microservices',
        'technologies', JSON_ARRAY('Node.js', 'Kong', 'Docker'),
        'url', 'github.com/marcusj/api-gateway'
      )
    ),
    'achievements', JSON_ARRAY('Led successful infrastructure migration', 'Received Performance Excellence Award 2024'),
    'totalYearsExperience', 5
  )
),
(
  'cand_03',
  'Priya Sharma',
  'priya.sharma@proton.me',
  '+1 (646) 555-0173',
  'New York, NY',
  'linkedin.com/in/priyasharma',
  NULL,
  'priyasharma.design',
  'screening',
  'job_03',
  '2026-07-25 11:00:00',
  JSON_OBJECT(
    'name', 'Priya Sharma',
    'summary', 'Product Designer with 4 years experience creating intuitive user experiences. Expert in design systems, user research, and design thinking. Passionate about accessibility and inclusive design.',
    'phone', '+1 (646) 555-0173',
    'location', 'New York, NY',
    'linkedin', 'linkedin.com/in/priyasharma',
    'github', NULL,
    'portfolio', 'priyasharma.design',
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Senior Product Designer',
        'company', 'DesignStudio',
        'location', 'New York, NY',
        'startDate', '2023-02',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Led design system overhaul serving 100+ components', 'Conducted user research with 50+ participants', 'Improved conversion rates by 25% through A/B testing')
      ),
      JSON_OBJECT(
        'title', 'UX/UI Designer',
        'company', 'WebAgency',
        'location', 'New York, NY',
        'startDate', '2021-01',
        'endDate', '2023-01',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Designed interfaces for multiple client projects', 'Created wireframes and prototypes in Figma', 'Collaborated with developers on implementation')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Bachelor of Arts',
        'field', 'Graphic Design',
        'institution', 'Parsons School of Design',
        'year', 2021
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'Design', 'skills', JSON_ARRAY('Figma', 'Prototyping', 'User Research', 'Design Systems')),
      JSON_OBJECT('category', 'Frontend', 'skills', JSON_ARRAY('HTML', 'CSS', 'JavaScript')),
      JSON_OBJECT('category', 'Tools', 'skills', JSON_ARRAY('Adobe XD', 'Sketch', 'Miro'))
    ),
    'certifications', JSON_ARRAY('Nielsen Norman UX Certification'),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'Hindi', 'proficiency', 'Fluent')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'E-commerce Design System',
        'description', 'Comprehensive design system for e-commerce platform',
        'technologies', JSON_ARRAY('Figma', 'React', 'Storybook'),
        'url', 'priyasharma.design/ecommerce'
      )
    ),
    'achievements', JSON_ARRAY('Featured in Design Observer magazine', 'Led accessibility initiative improving WCAG score to AAA'),
    'totalYearsExperience', 4
  )
),
(
  'cand_04',
  'David Park',
  'david.park@gmail.com',
  '+1 (206) 555-0156',
  'Seattle, WA',
  NULL,
  'github.com/davidpark',
  NULL,
  'applied',
  'job_02',
  '2026-07-28 16:45:00',
  JSON_OBJECT(
    'name', 'David Park',
    'summary', 'ML Engineer with 4 years experience building production ML systems. Strong background in NLP and computer vision. Proficient in PyTorch, TensorFlow, and MLOps tools.',
    'phone', '+1 (206) 555-0156',
    'location', 'Seattle, WA',
    'linkedin', NULL,
    'github', 'github.com/davidpark',
    'portfolio', NULL,
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Machine Learning Engineer',
        'company', 'AI Solutions Corp',
        'location', 'Seattle, WA',
        'startDate', '2022-06',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Developed NLP models for text classification achieving 94% accuracy', 'Implemented ML pipeline processing 1M+ documents daily', 'Mentored junior ML engineers on best practices')
      ),
      JSON_OBJECT(
        'title', 'Data Scientist',
        'company', 'TechLabs',
        'location', 'Seattle, WA',
        'startDate', '2021-01',
        'endDate', '2022-05',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Built recommendation systems using collaborative filtering', 'Analyzed large datasets to identify trends', 'Presented findings to stakeholders')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Master of Science',
        'field', 'Computer Science - Machine Learning',
        'institution', 'University of Washington',
        'year', 2021,
        'gpa', 3.85
      ),
      JSON_OBJECT(
        'degree', 'Bachelor of Science',
        'field', 'Mathematics',
        'institution', 'University of Washington',
        'year', 2019,
        'gpa', 3.9
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'ML', 'skills', JSON_ARRAY('PyTorch', 'TensorFlow', 'NLP', 'Computer Vision')),
      JSON_OBJECT('category', 'Programming', 'skills', JSON_ARRAY('Python', 'SQL', 'Scala', 'R')),
      JSON_OBJECT('category', 'MLOps', 'skills', JSON_ARRAY('Kubernetes', 'MLflow', 'Airflow'))
    ),
    'certifications', JSON_ARRAY('TensorFlow Developer Certificate', 'AWS ML Specialty'),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'Korean', 'proficiency', 'Fluent')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Sentiment Analysis Engine',
        'description', 'Real-time sentiment analysis for social media data',
        'technologies', JSON_ARRAY('Python', 'PyTorch', 'FastAPI'),
        'url', 'github.com/davidpark/sentiment-engine'
      )
    ),
    'achievements', JSON_ARRAY('Published paper on NLP optimization in top-tier journal', 'Won internal hackathon for ML pipeline design'),
    'totalYearsExperience', 4
  )
),
(
  'cand_05',
  'Sofia Rodriguez',
  'sofia.r@yahoo.com',
  '+1 (305) 555-0187',
  'Miami, FL',
  'linkedin.com/in/sofiarodriguez',
  NULL,
  NULL,
  'technical_test',
  'job_01',
  '2026-07-15 08:30:00',
  JSON_OBJECT(
    'name', 'Sofia Rodriguez',
    'summary', 'Full-stack Developer with 3 years experience building responsive web applications. Skilled in React, Node.js, and modern web technologies. Focused on creating performant and user-friendly applications.',
    'phone', '+1 (305) 555-0187',
    'location', 'Miami, FL',
    'linkedin', 'linkedin.com/in/sofiarodriguez',
    'github', NULL,
    'portfolio', NULL,
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Full-stack Developer',
        'company', 'WebDevelopment Pro',
        'location', 'Miami, FL',
        'startDate', '2022-02',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Developed full-stack web applications using React and Node.js', 'Implemented responsive designs with CSS and Tailwind', 'Deployed applications to AWS')
      ),
      JSON_OBJECT(
        'title', 'Junior Developer',
        'company', 'LocalTech',
        'location', 'Miami, FL',
        'startDate', '2021-06',
        'endDate', '2022-01',
        'isCurrent', false,
        'employmentType', 'part-time',
        'description', JSON_ARRAY('Built web pages using HTML, CSS, and JavaScript', 'Maintained legacy applications', 'Fixed bugs and implemented features')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Bachelor of Science',
        'field', 'Computer Science',
        'institution', 'Florida International University',
        'year', 2021,
        'gpa', 3.6
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'Frontend', 'skills', JSON_ARRAY('React', 'JavaScript', 'CSS', 'Tailwind')),
      JSON_OBJECT('category', 'Backend', 'skills', JSON_ARRAY('Node.js', 'Express', 'MongoDB')),
      JSON_OBJECT('category', 'Tools', 'skills', JSON_ARRAY('Git', 'VS Code', 'Postman'))
    ),
    'certifications', JSON_ARRAY(),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'Spanish', 'proficiency', 'Fluent')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Task Management App',
        'description', 'Full-stack task management application with real-time updates',
        'technologies', JSON_ARRAY('React', 'Node.js', 'MongoDB'),
        'url', 'github.com/sofiarodriguez/task-app'
      )
    ),
    'achievements', JSON_ARRAY('Completed 20+ successful projects'),
    'totalYearsExperience', 3
  )
),
(
  'cand_06',
  'James Wilson',
  'james.w@gmail.com',
  '+1 (773) 555-0134',
  'Chicago, IL',
  NULL,
  'github.com/jameswilson',
  NULL,
  'offer',
  'job_04',
  '2026-07-01 10:00:00',
  JSON_OBJECT(
    'name', 'James Wilson',
    'summary', 'Backend Engineer with 6 years experience building robust and scalable systems. Expert in microservices, API design, and database optimization. Track record of delivering high-quality code.',
    'phone', '+1 (773) 555-0134',
    'location', 'Chicago, IL',
    'linkedin', NULL,
    'github', 'github.com/jameswilson',
    'portfolio', NULL,
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Senior Backend Engineer',
        'company', 'Enterprise Solutions',
        'location', 'Chicago, IL',
        'startDate', '2021-03',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Led backend team of 5 engineers', 'Designed microservices architecture handling 50M+ requests/month', 'Implemented comprehensive API documentation')
      ),
      JSON_OBJECT(
        'title', 'Backend Engineer',
        'company', 'SoftwareCo',
        'location', 'Chicago, IL',
        'startDate', '2018-07',
        'endDate', '2021-02',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Built REST APIs using Java and Spring Boot', 'Optimized database performance', 'Implemented security best practices')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Bachelor of Science',
        'field', 'Computer Engineering',
        'institution', 'University of Illinois',
        'year', 2018,
        'gpa', 3.8
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'Backend', 'skills', JSON_ARRAY('Java', 'Spring Boot', 'Node.js', 'Go')),
      JSON_OBJECT('category', 'Databases', 'skills', JSON_ARRAY('PostgreSQL', 'MySQL', 'MongoDB', 'Redis')),
      JSON_OBJECT('category', 'DevOps', 'skills', JSON_ARRAY('Docker', 'Kubernetes', 'AWS', 'Terraform'))
    ),
    'certifications', JSON_ARRAY('AWS Certified Solutions Architect Professional'),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Distributed Payment System',
        'description', 'High-availability payment processing system',
        'technologies', JSON_ARRAY('Java', 'PostgreSQL', 'Kafka'),
        'url', 'github.com/jameswilson/payment-system'
      )
    ),
    'achievements', JSON_ARRAY('Promoted to Senior Engineer in 2 years', 'Led successful system migration with zero downtime'),
    'totalYearsExperience', 6
  )
),
(
  'cand_07',
  'Aisha Patel',
  'aisha.patel@icloud.com',
  '+1 (408) 555-0199',
  'San Jose, CA',
  'linkedin.com/in/aishapatel',
  NULL,
  NULL,
  'hired',
  'job_02',
  '2026-06-15 09:30:00',
  JSON_OBJECT(
    'name', 'Aisha Patel',
    'summary', 'Machine Learning Engineer with 5 years experience in AI/ML research and production systems. PhD in Computer Science with focus on deep learning. Published researcher with strong analytical skills.',
    'phone', '+1 (408) 555-0199',
    'location', 'San Jose, CA',
    'linkedin', 'linkedin.com/in/aishapatel',
    'github', NULL,
    'portfolio', NULL,
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'ML Research Engineer',
        'company', 'AI Research Lab',
        'location', 'San Jose, CA',
        'startDate', '2021-09',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Conducted research on transformer models and attention mechanisms', 'Published 8 papers in top-tier ML conferences', 'Led ML team of 4 researchers')
      ),
      JSON_OBJECT(
        'title', 'Data Scientist',
        'company', 'Tech Giants Inc',
        'location', 'San Jose, CA',
        'startDate', '2019-06',
        'endDate', '2021-08',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Built recommendation systems for e-commerce platform', 'Implemented A/B testing framework', 'Analyzed large-scale datasets')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Doctor of Philosophy',
        'field', 'Computer Science - Deep Learning',
        'institution', 'Stanford University',
        'year', 2019,
        'gpa', 3.95
      ),
      JSON_OBJECT(
        'degree', 'Bachelor of Science',
        'field', 'Computer Science',
        'institution', 'Indian Institute of Technology (IIT)',
        'year', 2017,
        'gpa', 4.0
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'ML', 'skills', JSON_ARRAY('PyTorch', 'TensorFlow', 'Transformers', 'Deep Learning')),
      JSON_OBJECT('category', 'Programming', 'skills', JSON_ARRAY('Python', 'C++', 'SQL', 'R')),
      JSON_OBJECT('category', 'Research', 'skills', JSON_ARRAY('Mathematical Modeling', 'Statistical Analysis', 'Paper Writing'))
    ),
    'certifications', JSON_ARRAY('Google Cloud Professional ML Engineer'),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'Hindi', 'proficiency', 'Fluent'),
      JSON_OBJECT('language', 'German', 'proficiency', 'Intermediate')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Attention-Based NLP Model',
        'description', 'Novel transformer architecture for multilingual NLP',
        'technologies', JSON_ARRAY('PyTorch', 'CUDA', 'Hugging Face'),
        'url', 'github.com/aishapatel/transformer-nlp'
      )
    ),
    'achievements', JSON_ARRAY('Published in Nature Machine Intelligence', 'Received AI Research Excellence Award 2024', '1000+ citations on research papers'),
    'totalYearsExperience', 5
  )
),
(
  'cand_08',
  'Chen Wei',
  'chen.wei@outlook.com',
  '+1 (212) 555-0167',
  'New York, NY',
  NULL,
  NULL,
  'chenwei.design',
  'rejected',
  'job_03',
  '2026-07-10 14:00:00',
  JSON_OBJECT(
    'name', 'Chen Wei',
    'summary', 'Visual Designer with 3 years experience in digital product design. Strong eye for aesthetics and user experience. Proficient in design tools and front-end implementation.',
    'phone', '+1 (212) 555-0167',
    'location', 'New York, NY',
    'linkedin', NULL,
    'github', NULL,
    'portfolio', 'chenwei.design',
    'experience', JSON_ARRAY(
      JSON_OBJECT(
        'title', 'Visual Designer',
        'company', 'Creative Agency',
        'location', 'New York, NY',
        'startDate', '2022-08',
        'endDate', NULL,
        'isCurrent', true,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Designed visual assets for digital products', 'Created brand guidelines and style systems', 'Collaborated with product and engineering teams')
      ),
      JSON_OBJECT(
        'title', 'UI Designer',
        'company', 'Digital Studio',
        'location', 'New York, NY',
        'startDate', '2021-01',
        'endDate', '2022-07',
        'isCurrent', false,
        'employmentType', 'full-time',
        'description', JSON_ARRAY('Designed user interfaces for web applications', 'Created wireframes and interactive prototypes', 'Conducted design reviews and feedback sessions')
      )
    ),
    'education', JSON_ARRAY(
      JSON_OBJECT(
        'degree', 'Bachelor of Fine Arts',
        'field', 'Graphic Design',
        'institution', 'School of Visual Arts',
        'year', 2021
      )
    ),
    'skills', JSON_ARRAY(
      JSON_OBJECT('category', 'Design', 'skills', JSON_ARRAY('Figma', 'Adobe Creative Suite', 'Prototyping')),
      JSON_OBJECT('category', 'Frontend', 'skills', JSON_ARRAY('HTML', 'CSS', 'JavaScript')),
      JSON_OBJECT('category', 'Tools', 'skills', JSON_ARRAY('Sketch', 'Illustrator', 'After Effects'))
    ),
    'certifications', JSON_ARRAY(),
    'languages', JSON_ARRAY(
      JSON_OBJECT('language', 'English', 'proficiency', 'Advanced'),
      JSON_OBJECT('language', 'Mandarin', 'proficiency', 'Fluent')
    ),
    'projects', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Brand Identity System',
        'description', 'Comprehensive visual identity and brand guidelines',
        'technologies', JSON_ARRAY('Figma', 'Adobe XD'),
        'url', 'chenwei.design/branding'
      )
    ),
    'achievements', JSON_ARRAY('Designed assets for 5+ published apps'),
    'totalYearsExperience', 3
  )
);

-- =============================================================================
-- Insert Sample Interviews
-- =============================================================================

INSERT INTO interviews (id, candidate_id, job_id, scheduled_at, type, status, created_at) VALUES
(
  'int_01',
  'cand_01',
  'job_01',
  '2026-08-02 10:00:00',
  'technical',
  'scheduled',
  '2026-07-28 10:00:00'
),
(
  'int_02',
  'cand_02',
  'job_04',
  '2026-08-03 14:00:00',
  'behavioral',
  'scheduled',
  '2026-07-28 11:00:00'
),
(
  'int_03',
  'cand_05',
  'job_01',
  '2026-08-01 11:30:00',
  'coding',
  'scheduled',
  '2026-07-28 12:00:00'
);

-- =============================================================================
-- Insert Sample Activities
-- =============================================================================

INSERT INTO activities (id, type, description, user_id, created_at) VALUES
(
  'act_01',
  'candidate_added',
  'David Park applied for Machine Learning Engineer',
  'usr_01',
  '2026-07-28 16:45:00'
),
(
  'act_02',
  'stage_changed',
  'Emily Zhang moved to Interview stage',
  'usr_01',
  '2026-07-27 14:00:00'
),
(
  'act_03',
  'interview_scheduled',
  'Technical interview scheduled with Emily Zhang',
  'usr_01',
  '2026-07-26 10:30:00'
),
(
  'act_04',
  'stage_changed',
  'Marcus Johnson moved to Shortlisted',
  'usr_01',
  '2026-07-25 16:20:00'
),
(
  'act_05',
  'job_created',
  'New job posted: Backend Engineer',
  'usr_01',
  '2026-07-24 09:00:00'
),
(
  'act_06',
  'offer_sent',
  'Offer letter sent to James Wilson',
  'usr_01',
  '2026-07-23 15:45:00'
),
(
  'act_07',
  'note_added',
  'Recruiter note added to Sofia Rodriguez profile',
  'usr_01',
  '2026-07-22 11:15:00'
);

-- =============================================================================
-- Insert Sample Notifications
-- =============================================================================

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(
  'notif_01',
  'usr_01',
  'New Application',
  'David Park applied for Machine Learning Engineer',
  'info',
  0,
  '2026-07-28 16:45:00'
),
(
  'notif_02',
  'usr_01',
  'Interview Tomorrow',
  'Technical interview with Emily Zhang at 10:00 AM',
  'warning',
  0,
  '2026-07-28 09:00:00'
),
(
  'notif_03',
  'usr_01',
  'Offer Accepted',
  'James Wilson accepted the Senior Engineer offer',
  'success',
  1,
  '2026-07-27 15:00:00'
),
(
  'notif_04',
  'usr_01',
  'Assessment Complete',
  'Sofia Rodriguez completed the technical assessment',
  'info',
  1,
  '2026-07-26 18:00:00'
);

-- =============================================================================
-- End of Seed Data
-- =============================================================================

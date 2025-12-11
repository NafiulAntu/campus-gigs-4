-- Demo Jobs Data - Based on bdjobs.com listings
-- Insert demo jobs

-- 1. Accounting/Finance Jobs
INSERT INTO jobs (title, company, location, location_district, job_type, category, industry, description, requirements, responsibilities, benefits, salary_min, salary_max, salary_type, experience_min, experience_max, education_level, vacancy_count, deadline, status, is_featured, is_urgent) VALUES
('Assistant Manager - Finance', 'Marie Stopes Bangladesh', 'Dhaka', 'Dhaka', 'full-time', 'Accounting/Finance', 'Healthcare/Medical', 'We are looking for an experienced Assistant Manager for our Finance department who will be responsible for financial planning, reporting, and analysis.', 'Master''s degree in Finance/Accounting, 5+ years experience in finance, Strong analytical skills, Proficiency in accounting software', 'Financial reporting and analysis, Budget preparation and monitoring, Ensure compliance with financial regulations, Supervise finance team, Coordinate with auditors', 'Competitive salary, Health insurance, Performance bonus, Professional development', 45000, 65000, 'monthly', 5, 8, 'Masters', 1, '2025-01-15', 'active', true, false),

('Accounts Officer', 'Bangladesh Army International University', 'Cumilla', 'Cumilla', 'full-time', 'Accounting/Finance', 'Education/Training', 'Looking for an Accounts Officer to manage day-to-day accounting operations.', 'Bachelor''s degree in Accounting, 2-3 years experience, Knowledge of accounting principles, Computer literacy', 'Maintain financial records, Process payments and receipts, Prepare financial statements, Assist in audit process', 'Provident fund, Festival bonus, Medical allowance', 25000, 35000, 'monthly', 2, 4, 'Bachelors', 2, '2025-01-10', 'active', false, false),

('Manager - Data Scientist', 'DBH Finance PLC', 'Dhaka', 'Dhaka', 'full-time', 'IT/Telecommunication', 'Bank/ Non-Bank Fin. Institution', 'We are seeking a talented Data Scientist to join our analytics team and drive data-driven decision making.', 'Master''s degree in Data Science/Statistics/Computer Science, 6+ years experience, Proficiency in Python/R, Experience with ML algorithms, Strong statistical knowledge', 'Develop predictive models, Analyze large datasets, Create data visualizations, Collaborate with business teams, Present insights to stakeholders', 'Excellent salary package, Health & life insurance, Annual bonus, Flexible work hours', 80000, 120000, 'monthly', 6, 10, 'Masters', 1, '2025-01-20', 'active', true, true),

-- 2. IT/Software Development
('Software Developer', 'Hana System Limited', 'Dhaka', 'Dhaka', 'full-time', 'IT/Telecommunication', 'IT/Technology', 'Join our development team to build innovative software solutions. We work with latest technologies and agile methodologies.', 'Bachelor''s in CSE/IT, 2-4 years experience, Proficiency in JavaScript/React/Node.js, Knowledge of database management, Git experience', 'Design and develop software applications, Write clean and maintainable code, Participate in code reviews, Collaborate with cross-functional teams, Troubleshoot and debug applications', 'Competitive salary, Performance bonus, Training opportunities, Modern work environment', 40000, 60000, 'monthly', 2, 4, 'Bachelors', 3, '2025-01-18', 'active', false, false),

('Junior Software Engineer (Full Stack)', 'Tanvir Construction Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'IT/Telecommunication', 'Engineer/Architects', 'Looking for fresh graduates or junior developers passionate about full-stack development.', 'Bachelor''s in CSE, 0-2 years experience, Knowledge of React/Node.js, Basic understanding of databases, Willingness to learn', 'Develop and maintain web applications, Learn new technologies, Assist senior developers, Write documentation, Participate in team meetings', 'Training provided, Career growth, Health insurance, Lunch facility', 25000, 35000, 'monthly', 0, 2, 'Bachelors', 2, '2025-01-25', 'active', false, false),

('Flutter Application Developer', 'Tanvir Construction Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'IT/Telecommunication', 'Engineer/Architects', 'Seeking an experienced Flutter developer to build cross-platform mobile applications.', 'Bachelor''s in CSE/IT, 3+ years Flutter experience, Knowledge of Dart, REST API integration, Published apps on Play Store/App Store', 'Develop mobile applications using Flutter, Write clean and efficient code, Integrate APIs, Test and debug applications, Maintain existing apps', 'Competitive package, Flexible timing, Remote work option, Performance bonus', 50000, 70000, 'monthly', 3, 5, 'Bachelors', 1, '2025-01-20', 'active', false, false),

('Jr. Product Analyst', 'Bdjobs.com Limited', 'Dhaka', 'Dhaka', 'full-time', 'IT/Telecommunication', 'IT/Technology', 'Join our product team to analyze user behavior and drive product improvements.', 'Bachelor''s degree, 1-3 years experience, Strong analytical skills, Knowledge of SQL, Familiarity with analytics tools', 'Analyze product metrics, Conduct user research, Create reports and dashboards, Work with product managers, Identify improvement opportunities', 'Reputed company, Good salary, Health insurance, Career growth', 35000, 50000, 'monthly', 1, 3, 'Bachelors', 1, '2025-01-22', 'active', false, false),

-- 3. Marketing & Sales
('Marketing Officer', 'ACI PLC', 'Dhaka', 'Dhaka', 'full-time', 'Marketing/Sales', 'Commercial/Supply Chain', 'Looking for a dynamic Marketing Officer to execute marketing strategies and campaigns.', 'Bachelor''s/Master''s in Marketing, 2-4 years experience, Strong communication skills, Digital marketing knowledge, Creative thinking', 'Develop marketing campaigns, Conduct market research, Manage social media, Coordinate with agencies, Analyze campaign performance', 'Excellent work culture, Performance bonus, Insurance, Training', 38000, 55000, 'monthly', 2, 4, 'Bachelors', 2, '2025-01-17', 'active', false, false),

('Territory Sales Officer', 'SMC Enterprise Limited', 'Dhaka', 'Dhaka', 'full-time', 'Marketing/Sales', 'Commercial/Supply Chain', 'Seeking ambitious sales professionals to expand our market presence.', 'Bachelor''s degree, 1-3 years sales experience, Good communication skills, Ability to work in field, Two-wheeler driving license', 'Meet sales targets, Manage territory, Build customer relationships, Conduct product demonstrations, Report to sales manager', 'Sales incentive, Mobile allowance, Travel allowance, Festival bonus', 30000, 45000, 'monthly', 1, 3, 'Bachelors', 5, '2025-01-15', 'active', false, true),

-- 4. HR/Admin
('Sr. Manager/Manager - HR', 'Besthome Properties Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'HR/Org. Development', 'Real Estate/Development', 'We are looking for an experienced HR professional to lead our HR department.', 'Master''s in HRM, 8+ years experience, Strong leadership skills, Knowledge of labor laws, HRIS experience', 'Lead HR team, Develop HR policies, Manage recruitment, Handle employee relations, Ensure compliance, Conduct training programs', 'Attractive salary, Car facility, Health insurance, Performance bonus', 70000, 100000, 'monthly', 8, 12, 'Masters', 1, '2025-01-12', 'active', true, false),

('Officer, HR Analytics', 'IFIC Bank PLC', 'Dhaka', 'Dhaka', 'full-time', 'HR/Org. Development', 'Bank/ Non-Bank Fin. Institution', 'Join our HR team to leverage data analytics for strategic HR decisions.', 'Bachelor''s in HR/Statistics/Business, 2-4 years experience, Strong analytical skills, Excel/HRIS proficiency, Report writing skills', 'Analyze HR data, Create dashboards, Generate reports, Support HR decision-making, Conduct surveys', 'Banking benefits, Insurance, Provident fund, Loan facility', 45000, 60000, 'monthly', 2, 4, 'Bachelors', 1, '2025-01-14', 'active', false, false),

-- 5. Engineering
('Civil Engineer', 'HM Expo Private Ltd', 'Dhaka', 'Dhaka', 'full-time', 'Engineer/Architects', 'Construction/Civil Engineering', 'Looking for experienced Civil Engineers for our construction projects.', 'Bachelor''s in Civil Engineering, 3-5 years experience, AutoCAD proficiency, Knowledge of construction materials, Site management experience', 'Prepare project plans, Supervise construction work, Ensure quality control, Coordinate with contractors, Prepare reports', 'Good salary, Site allowance, Insurance, Career growth', 50000, 70000, 'monthly', 3, 5, 'Bachelors', 2, '2025-01-16', 'active', false, false),

('Manager (Design & Engineering)', 'INNOVA & MEP Engineers Limited', 'Dhaka', 'Dhaka', 'full-time', 'Engineer/Architects', 'Engineer/Architects', 'Seeking an experienced Manager for our Design & Engineering department.', 'Bachelor''s in Mechanical/Electrical Engineering, 6+ years experience, MEP design experience, AutoCAD/Revit proficiency, Project management skills', 'Lead design team, Prepare MEP designs, Review drawings, Coordinate with clients, Ensure project deadlines', 'Competitive salary, Performance bonus, Health insurance, Professional development', 65000, 90000, 'monthly', 6, 10, 'Bachelors', 1, '2025-01-19', 'active', false, false),

-- 6. Education/Training
('Teacher (Physics) - Senior Section', 'Guidance International School', 'Dhaka', 'Dhaka', 'full-time', 'Education/Training', 'Education/Training', 'We are looking for passionate Physics teachers for our senior section.', 'Bachelor''s/Master''s in Physics, 2-4 years teaching experience, Strong communication skills, Classroom management skills', 'Teach Physics to senior students, Prepare lesson plans, Conduct assessments, Maintain student records, Participate in school activities', 'Good work environment, Festival bonus, Training opportunities, Summer vacation', 35000, 50000, 'monthly', 2, 4, 'Bachelors', 1, '2025-01-11', 'active', false, false),

('Faculty', 'European Standard School (ESS)', 'Dhaka', 'Dhaka', 'full-time', 'Education/Training', 'Education/Training', 'Join our prestigious institution as a faculty member.', 'Master''s degree in relevant subject, 3+ years teaching experience, Excellent communication skills, Passion for teaching', 'Conduct lectures, Prepare course materials, Evaluate students, Conduct research, Participate in curriculum development', 'Excellent work environment, Competitive salary, Professional development, Festival bonus', 40000, 60000, 'monthly', 3, 6, 'Masters', 3, '2025-01-13', 'active', false, false),

-- 7. Garments/Textile
('Merchandiser (Denim)', 'Madry Jeans Limited', 'Dhaka', 'Dhaka', 'full-time', 'Apparel/Fashion', 'Garments/Textile', 'Looking for experienced Merchandiser specializing in denim products.', 'Bachelor''s degree, 3-5 years merchandising experience in denim, Good communication skills, Knowledge of export procedures', 'Coordinate with buyers, Manage orders, Follow up production, Ensure timely shipment, Maintain buyer relationships', 'Good salary, Transport facility, Lunch, Performance bonus', 40000, 55000, 'monthly', 3, 5, 'Bachelors', 1, '2025-01-17', 'active', false, false),

('Sample Technician (Outerwear)', 'ZXY International', 'Dhaka', 'Dhaka', 'full-time', 'Apparel/Fashion', 'Garments/Textile', 'Seeking Sample Technician for our outerwear department.', 'Diploma/Bachelor''s in Textile, 2-4 years experience, Knowledge of outerwear construction, Good technical skills', 'Prepare sample garments, Follow buyer specifications, Conduct quality checks, Maintain sample records, Coordinate with production', 'Regular salary, Overtime, Transport, Medical', 28000, 40000, 'monthly', 2, 4, 'Diploma', 2, '2025-01-15', 'active', false, false),

-- 8. Medical/Healthcare
('Medical Promotion Officer', 'Orion Pharma Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'Healthcare/Medical', 'Pharmaceuticals', 'Join our field force to promote pharmaceutical products to healthcare professionals.', 'Bachelor''s in Science/Pharmacy, 0-2 years experience, Good communication skills, Ability to work in field, Two-wheeler driving license', 'Promote products to doctors, Meet sales targets, Conduct product presentations, Maintain customer database, Submit reports', 'Attractive salary, Sales incentive, Mobile & travel allowance, Medical insurance', 30000, 45000, 'monthly', 0, 2, 'Bachelors', 10, '2025-01-20', 'active', false, false),

('Medical Information Officer', 'NIPRO JMI Pharma Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'Healthcare/Medical', 'Pharmaceuticals', 'We are looking for Medical Information Officers to support our medical affairs team.', 'Bachelor''s in Pharmacy/Medicine, 2-3 years experience, Strong communication skills, Medical knowledge, Computer literacy', 'Provide medical information, Respond to inquiries, Prepare medical literature, Conduct training, Maintain databases', 'Good salary, Medical insurance, Festival bonus, Career growth', 35000, 50000, 'monthly', 2, 3, 'Bachelors', 2, '2025-01-18', 'active', false, false),

-- 9. NGO/Development
('Programme Officer', 'Bangladesh NGOs Network for Radio and Communication', 'Dhaka', 'Dhaka', 'full-time', 'NGO/Development', 'NGO/Social Services', 'Looking for a Programme Officer to manage development programs.', 'Master''s in Social Science/Development Studies, 3-5 years NGO experience, Good communication skills, Report writing skills', 'Manage programs, Conduct field visits, Prepare reports, Coordinate with stakeholders, Monitor & evaluate', 'NGO benefits, Insurance, Festival bonus, Training opportunities', 38000, 55000, 'monthly', 3, 5, 'Masters', 1, '2025-01-16', 'active', false, false),

('Project Officer - Distribution Management', 'ACTED Bangladesh', 'Cox''s Bazar', 'Cox''s Bazar', 'contract', 'NGO/Development', 'NGO/Social Services', 'Seeking Project Officer for humanitarian distribution programs in Cox''s Bazar.', 'Bachelor''s degree, 2-3 years experience in distribution/logistics, Good communication skills, Willingness to work in field', 'Manage distribution activities, Maintain records, Coordinate with beneficiaries, Ensure quality standards, Prepare reports', 'Competitive package, Field allowance, Insurance, Training', 40000, 55000, 'monthly', 2, 3, 'Bachelors', 2, '2025-01-14', 'active', false, false),

-- 10. Graphic Design/Creative
('Graphic Designer', 'Nymphea', 'Dhaka', 'Dhaka', 'full-time', 'Design/Creative', 'Design/Creative', 'Join our creative team to design stunning visuals for various campaigns.', 'Bachelor''s in Design/Arts, 2-4 years experience, Proficiency in Adobe Creative Suite, Strong portfolio, Creative thinking', 'Create visual designs, Design marketing materials, Work with brand guidelines, Collaborate with team, Meet deadlines', 'Creative environment, Competitive salary, Flexible hours, Performance bonus', 30000, 45000, 'monthly', 2, 4, 'Bachelors', 2, '2025-01-21', 'active', false, false),

('Graphics Designer and Video Editor', 'Designage', 'Dhaka', 'Dhaka', 'full-time', 'Design/Creative', 'Design/Creative', 'Looking for a multi-talented designer who can handle both graphics and video editing.', 'Bachelor''s in Design/Multimedia, 2-3 years experience, Proficiency in Adobe Suite, Premiere Pro, After Effects, Portfolio required', 'Design graphics, Edit videos, Create animations, Manage social media content, Coordinate with clients', 'Good work environment, Equipment provided, Learning opportunities, Performance bonus', 32000, 48000, 'monthly', 2, 3, 'Bachelors', 1, '2025-01-19', 'active', false, false),

-- 11. Internship Opportunities
('Internship', 'Nymphea', 'Dhaka', 'Dhaka', 'internship', 'Internship', 'Design/Creative', 'Great internship opportunity for students/fresh graduates to learn and grow in design field.', 'Currently studying or recently graduated, Basic knowledge of design tools, Willingness to learn, Good attitude', 'Assist in design projects, Learn software tools, Support team members, Prepare presentations, Gain practical experience', 'Internship certificate, Learning opportunity, Possible job offer, Stipend', 10000, 15000, 'monthly', 0, 0, 'Bachelors', 2, '2025-01-30', 'active', false, false),

('Intern', 'GIZ', 'Dhaka', 'Dhaka', 'internship', 'Internship', 'NGO/Social Services', 'Internship opportunity at a leading international development organization.', 'Currently pursuing Bachelor''s/Master''s, Good academic record, English proficiency, Research skills, Computer literacy', 'Support project activities, Conduct research, Prepare reports, Attend meetings, Learn about development work', 'International exposure, Learning opportunity, Certificate, Networking', 15000, 20000, 'monthly', 0, 0, 'Bachelors', 1, '2025-01-25', 'active', false, false),

-- 12. Part-time Jobs
('Tele-Marketing cum Business Development Executive', 'Swosti Limited', 'Dhaka', 'Dhaka', 'part-time', 'Marketing/Sales', 'Commercial/Supply Chain', 'Looking for part-time tele-marketing professionals for evening shifts.', 'HSC/Bachelor''s, 0-1 year experience, Good communication skills, Computer literacy, Ability to work evening shift', 'Make outbound calls, Generate leads, Explain services, Maintain call records, Achieve targets', 'Flexible timing, Commission, Performance bonus', 15000, 25000, 'monthly', 0, 1, 'HSC', 3, '2025-01-28', 'active', false, false),

-- 13. Remote/Work from Home
('Content Writer (Remote)', 'Tech Startup BD', 'Remote', 'Any', 'remote', 'Content/Writing', 'IT/Technology', 'Looking for talented content writers who can work remotely. Write engaging content for our tech blog and website.', 'Bachelor''s degree, 1-3 years writing experience, Excellent English skills, SEO knowledge, Portfolio required', 'Write blog posts and articles, Research topics, Optimize for SEO, Edit and proofread, Meet deadlines', 'Work from home, Flexible hours, Competitive pay, Growth opportunity', 20000, 35000, 'monthly', 1, 3, 'Bachelors', 2, '2025-02-05', 'active', false, false),

-- 14. Fresh Graduate Jobs
('Management Trainee Officer', 'Servopro IT Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'Management', 'IT/Technology', 'Excellent opportunity for fresh graduates to start their career in IT industry.', 'Bachelor''s/Master''s degree, Fresh graduate (0-1 year exp), Good CGPA, Strong analytical skills, Leadership potential', 'Participate in training program, Learn business operations, Rotate through departments, Work on projects, Develop management skills', 'Structured training, Career path, Competitive salary, Medical insurance', 25000, 35000, 'monthly', 0, 1, 'Bachelors', 5, '2025-01-31', 'active', false, false),

-- 15. Bank Jobs
('Senior Manager - Taxation', 'Huawei Technologies (Bangladesh) Ltd.', 'Dhaka', 'Dhaka', 'full-time', 'Accounting/Finance', 'Telecommunication', 'Join a leading multinational company as Senior Manager for taxation.', 'Master''s in Accounting/Taxation, CA/ACCA, 10+ years experience, Expert in taxation laws, Leadership skills', 'Manage tax planning, Ensure compliance, Handle tax audits, Coordinate with authorities, Lead tax team', 'Multinational exposure, Excellent package, Insurance, International training', 90000, 130000, 'monthly', 10, 15, 'Masters', 1, '2025-01-15', 'active', true, false);

-- Insert skills for jobs
INSERT INTO job_skills (job_id, skill_name) VALUES
(1, 'Financial Analysis'), (1, 'Budgeting'), (1, 'Microsoft Excel'), (1, 'Accounting'),
(2, 'Accounting'), (2, 'Tally'), (2, 'Microsoft Excel'),
(3, 'Python'), (3, 'Machine Learning'), (3, 'SQL'), (3, 'Data Analysis'), (3, 'Statistics'),
(4, 'JavaScript'), (4, 'React'), (4, 'Node.js'), (4, 'MongoDB'), (4, 'Git'),
(5, 'React'), (5, 'Node.js'), (5, 'JavaScript'), (5, 'HTML/CSS'),
(6, 'Flutter'), (6, 'Dart'), (6, 'Mobile Development'), (6, 'REST API'), (6, 'Firebase'),
(7, 'SQL'), (7, 'Data Analysis'), (7, 'Google Analytics'), (7, 'Excel'),
(8, 'Marketing Strategy'), (8, 'Digital Marketing'), (8, 'Social Media'), (8, 'Communication'),
(9, 'Sales'), (9, 'Negotiation'), (9, 'Communication'), (9, 'Customer Relationship'),
(10, 'HR Management'), (10, 'Recruitment'), (10, 'Labor Law'), (10, 'Leadership'),
(11, 'HR Analytics'), (11, 'Excel'), (11, 'HRIS'), (11, 'Data Analysis'),
(12, 'Civil Engineering'), (12, 'AutoCAD'), (12, 'Construction Management'), (12, 'Site Supervision'),
(13, 'MEP Design'), (13, 'AutoCAD'), (13, 'Revit'), (13, 'Project Management'),
(14, 'Teaching'), (14, 'Physics'), (14, 'Communication'), (14, 'Classroom Management'),
(15, 'Teaching'), (15, 'Curriculum Development'), (15, 'Communication'),
(16, 'Merchandising'), (16, 'Garments'), (16, 'Communication'), (16, 'Order Management'),
(17, 'Garments'), (17, 'Sample Making'), (17, 'Quality Control'),
(18, 'Medical Knowledge'), (18, 'Communication'), (18, 'Sales'), (18, 'Presentation'),
(19, 'Medical Knowledge'), (19, 'Communication'), (19, 'Research'), (19, 'Writing'),
(20, 'Program Management'), (20, 'Report Writing'), (20, 'Communication'), (20, 'M&E'),
(21, 'Logistics'), (21, 'Distribution'), (21, 'Communication'), (21, 'Report Writing'),
(22, 'Adobe Photoshop'), (22, 'Adobe Illustrator'), (22, 'Graphic Design'), (22, 'Creativity'),
(23, 'Adobe Photoshop'), (23, 'Adobe Premiere Pro'), (23, 'After Effects'), (23, 'Video Editing'),
(24, 'Design'), (24, 'Adobe Creative Suite'), (24, 'Learning Attitude'),
(25, 'Research'), (25, 'Report Writing'), (25, 'English'), (25, 'Computer Skills'),
(26, 'Communication'), (26, 'Tele-marketing'), (26, 'Sales'),
(27, 'Content Writing'), (27, 'SEO'), (27, 'English'), (27, 'Research'),
(28, 'Leadership'), (28, 'Analytical Skills'), (28, 'Communication'), (28, 'Teamwork'),
(29, 'Taxation'), (29, 'Accounting'), (29, 'Tax Planning'), (29, 'Leadership'), (29, 'Compliance');

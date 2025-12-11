import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Typography,
  Button,
  CircularProgress,
  Pagination,
  Stack,
  Paper,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Work as WorkIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import JobCard from './JobCard';
import { getJobs, getJobCategories, getJobLocations } from '../../services/api';

// Demo jobs data - shows when API is unavailable
const DEMO_JOBS = [
  {
    id: 1,
    title: 'Senior Laravel Developer',
    company: 'Tech Solutions BD',
    company_logo: 'https://via.placeholder.com/150/0066cc/ffffff?text=Tech+Solutions',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 50000,
    salary_max: 80000,
    salary_type: 'monthly',
    experience_min: 3,
    experience_max: 5,
    education_level: 'Bachelor in Computer Science',
    description: 'We are looking for an experienced Laravel developer to join our growing team. You will be responsible for developing and maintaining web applications using Laravel framework.',
    requirements: 'Strong knowledge of PHP and Laravel framework (v8+), MySQL database design and optimization, RESTful API development, Git version control, Problem-solving and debugging skills',
    responsibilities: 'Develop and maintain Laravel-based applications, Write clean and efficient code, Collaborate with frontend developers, Participate in code reviews, Troubleshoot and debug applications',
    benefits: 'Competitive salary, Health insurance, Annual bonus, Flexible working hours, Learning opportunities',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    vacancy_count: 2,
    views: 245,
    applications: 15,
    is_featured: true,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Laravel' },
      { skill_name: 'PHP' },
      { skill_name: 'MySQL' },
      { skill_name: 'REST API' },
      { skill_name: 'Git' }
    ]
  },
  {
    id: 2,
    title: 'React.js Frontend Developer',
    company: 'Digital Agency',
    company_logo: 'https://via.placeholder.com/150/00aa55/ffffff?text=Digital+Agency',
    location: 'Chittagong, Bangladesh',
    location_district: 'Chittagong',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 40000,
    salary_max: 60000,
    salary_type: 'monthly',
    experience_min: 2,
    experience_max: 4,
    education_level: 'Bachelor in CSE or related field',
    description: 'Seeking a talented React developer to build modern, responsive web applications. You will work with a creative team to deliver high-quality user interfaces.',
    requirements: 'Proficiency in React.js and JavaScript (ES6+), Experience with React Hooks and Context API, Knowledge of Redux or similar state management, HTML5, CSS3, and responsive design, Familiarity with RESTful APIs',
    responsibilities: 'Build reusable React components, Implement responsive UI designs, Integrate with backend APIs, Optimize application performance, Participate in agile development process',
    benefits: 'Attractive salary package, Annual leave, Performance bonus, Modern workspace, Career growth opportunities',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 3,
    views: 312,
    applications: 22,
    is_featured: false,
    is_urgent: true,
    status: 'active',
    skills: [
      { skill_name: 'React' },
      { skill_name: 'JavaScript' },
      { skill_name: 'CSS3' },
      { skill_name: 'Redux' },
      { skill_name: 'REST API' }
    ]
  },
  {
    id: 3,
    title: 'Full Stack Developer (MERN)',
    company: 'StartUp Hub BD',
    company_logo: 'https://via.placeholder.com/150/ff6600/ffffff?text=StartUp+Hub',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 60000,
    salary_max: 100000,
    salary_type: 'monthly',
    experience_min: 3,
    experience_max: 6,
    education_level: 'Bachelor in Computer Science or Engineering',
    description: 'Join our innovative startup! We need a Full Stack Developer proficient in the MERN stack to build scalable web applications from scratch.',
    requirements: 'Expert knowledge of MongoDB, Express.js, React, and Node.js, Experience with TypeScript, Understanding of microservices architecture, Knowledge of AWS or similar cloud platforms, Strong problem-solving skills',
    responsibilities: 'Design and develop full-stack applications, Create and maintain databases, Build RESTful APIs, Implement security best practices, Mentor junior developers',
    benefits: 'Competitive salary with equity options, Health & life insurance, Remote work flexibility, Latest tech stack, Startup culture',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 2,
    views: 428,
    applications: 31,
    is_featured: true,
    is_urgent: true,
    status: 'active',
    skills: [
      { skill_name: 'MongoDB' },
      { skill_name: 'Express' },
      { skill_name: 'React' },
      { skill_name: 'Node.js' },
      { skill_name: 'TypeScript' }
    ]
  },
  {
    id: 4,
    title: 'Mobile App Developer (Flutter)',
    company: 'AppCraft Studio',
    company_logo: 'https://via.placeholder.com/150/9933ff/ffffff?text=AppCraft',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 45000,
    salary_max: 70000,
    salary_type: 'monthly',
    experience_min: 2,
    experience_max: 4,
    education_level: 'Bachelor in CSE or related field',
    description: 'Looking for a Flutter developer to create beautiful, high-performance cross-platform mobile applications. Must have experience publishing apps on both platforms.',
    requirements: 'Proficiency in Flutter and Dart, Experience with Firebase integration, Knowledge of RESTful APIs and JSON, Published apps on Play Store/App Store, Understanding of mobile UI/UX principles',
    responsibilities: 'Develop cross-platform mobile applications, Integrate third-party APIs and services, Optimize app performance, Fix bugs and improve app stability, Collaborate with designers',
    benefits: 'Attractive salary, Flexible hours, Health insurance, Training opportunities, Modern office',
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 2,
    views: 189,
    applications: 18,
    is_featured: false,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Flutter' },
      { skill_name: 'Dart' },
      { skill_name: 'Firebase' },
      { skill_name: 'REST API' }
    ]
  },
  {
    id: 5,
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    company_logo: 'https://via.placeholder.com/150/ff0099/ffffff?text=Creative+Studio',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Design/Creative',
    salary_min: 35000,
    salary_max: 55000,
    salary_type: 'monthly',
    experience_min: 2,
    experience_max: 4,
    education_level: 'Bachelor in Design or related field',
    description: 'We are seeking a creative UI/UX Designer to craft beautiful and intuitive user experiences for web and mobile applications.',
    requirements: 'Proficiency in Figma and Adobe XD, Strong portfolio showcasing UI/UX work, Understanding of user-centered design principles, Knowledge of responsive design, Good communication skills',
    responsibilities: 'Create wireframes and prototypes, Design user interfaces for web/mobile, Conduct user research and testing, Collaborate with developers, Maintain design systems',
    benefits: 'Competitive salary, Creative work environment, Annual bonus, Learning budget, Flexible schedule',
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 1,
    views: 267,
    applications: 27,
    is_featured: false,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Figma' },
      { skill_name: 'Adobe XD' },
      { skill_name: 'Photoshop' },
      { skill_name: 'UI Design' },
      { skill_name: 'UX Research' }
    ]
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'Cloud Tech BD',
    company_logo: 'https://via.placeholder.com/150/0099cc/ffffff?text=Cloud+Tech',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 70000,
    salary_max: 120000,
    salary_type: 'monthly',
    experience_min: 3,
    experience_max: 6,
    education_level: 'Bachelor in Computer Science or Engineering',
    description: 'Seeking an experienced DevOps Engineer to manage our cloud infrastructure and automate deployment processes using modern DevOps tools.',
    requirements: 'Strong experience with AWS services, Proficiency in Docker and Kubernetes, Experience with CI/CD pipelines (Jenkins/GitLab), Knowledge of Infrastructure as Code (Terraform), Linux system administration',
    responsibilities: 'Manage cloud infrastructure on AWS, Set up CI/CD pipelines, Monitor system performance, Automate deployment processes, Ensure security best practices',
    benefits: 'Excellent salary package, Health insurance, Remote work options, Conference attendance, Latest tools',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 1,
    views: 156,
    applications: 12,
    is_featured: true,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'AWS' },
      { skill_name: 'Docker' },
      { skill_name: 'Kubernetes' },
      { skill_name: 'Jenkins' },
      { skill_name: 'Terraform' }
    ]
  },
  {
    id: 7,
    title: 'Digital Marketing Manager',
    company: 'Marketing Pro',
    company_logo: 'https://via.placeholder.com/150/ff3300/ffffff?text=Marketing+Pro',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Sales/Marketing',
    salary_min: 40000,
    salary_max: 65000,
    salary_type: 'monthly',
    experience_min: 3,
    experience_max: 5,
    education_level: 'Bachelor in Marketing or Business',
    description: 'Looking for a Digital Marketing Manager to lead our online marketing campaigns across multiple channels and drive business growth.',
    requirements: 'Proven experience in digital marketing, Expertise in SEO, SEM, and social media marketing, Google Analytics and Ads certification, Content marketing experience, Data-driven decision making',
    responsibilities: 'Develop digital marketing strategies, Manage SEO/SEM campaigns, Run social media advertising, Analyze campaign performance, Manage marketing budget',
    benefits: 'Competitive salary, Performance bonuses, Health insurance, Professional development, Team outings',
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 1,
    views: 198,
    applications: 24,
    is_featured: false,
    is_urgent: true,
    status: 'active',
    skills: [
      { skill_name: 'SEO' },
      { skill_name: 'Google Ads' },
      { skill_name: 'Facebook Ads' },
      { skill_name: 'Analytics' },
      { skill_name: 'Content Marketing' }
    ]
  },
  {
    id: 8,
    title: 'Data Scientist',
    company: 'Analytics Hub',
    company_logo: 'https://via.placeholder.com/150/6600cc/ffffff?text=Analytics+Hub',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 80000,
    salary_max: 150000,
    salary_type: 'monthly',
    experience_min: 4,
    experience_max: 7,
    education_level: 'Masters in Data Science or related field',
    description: 'Join our data science team to work on cutting-edge machine learning projects. You will analyze large datasets and build predictive models.',
    requirements: 'Strong programming skills in Python, Experience with ML frameworks (TensorFlow, PyTorch, Scikit-learn), Proficiency in SQL and data manipulation, Knowledge of statistics and mathematics, Experience with big data tools',
    responsibilities: 'Develop machine learning models, Analyze large datasets, Create data visualizations, Deploy ML models to production, Collaborate with stakeholders',
    benefits: 'Premium salary, Stock options, Health insurance, Research opportunities, Conference sponsorship',
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    vacancy_count: 1,
    views: 134,
    applications: 9,
    is_featured: true,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Python' },
      { skill_name: 'Machine Learning' },
      { skill_name: 'SQL' },
      { skill_name: 'TensorFlow' },
      { skill_name: 'Statistics' }
    ]
  },
  {
    id: 9,
    title: 'Business Development Executive',
    company: 'Growth Partners',
    company_logo: 'https://via.placeholder.com/150/009933/ffffff?text=Growth+Partners',
    location: 'Chittagong, Bangladesh',
    location_district: 'Chittagong',
    job_type: 'full-time',
    category: 'Business Development',
    salary_min: 30000,
    salary_max: 50000,
    salary_type: 'monthly',
    experience_min: 1,
    experience_max: 3,
    education_level: 'Bachelor in Business Administration',
    description: 'Looking for an ambitious Business Development Executive to identify new business opportunities, build client relationships, and drive revenue growth.',
    requirements: 'Strong communication and negotiation skills, Sales experience is a plus, Understanding of B2B sales, Self-motivated and target-oriented, Good networking abilities',
    responsibilities: 'Identify new business opportunities, Build and maintain client relationships, Prepare sales presentations, Negotiate contracts, Achieve sales targets',
    benefits: 'Base salary plus commission, Performance bonuses, Health insurance, Career advancement, Travel allowance',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 3,
    views: 223,
    applications: 33,
    is_featured: false,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Sales' },
      { skill_name: 'Negotiation' },
      { skill_name: 'Communication' },
      { skill_name: 'B2B Sales' }
    ]
  },
  {
    id: 10,
    title: 'Content Writer',
    company: 'Content Agency',
    company_logo: 'https://via.placeholder.com/150/cc6600/ffffff?text=Content+Agency',
    location: 'Remote',
    location_district: 'Remote',
    job_type: 'remote',
    category: 'Writing/Content',
    salary_min: 25000,
    salary_max: 40000,
    salary_type: 'monthly',
    experience_min: 1,
    experience_max: 3,
    education_level: 'Bachelor in English or Journalism',
    description: 'We are hiring a creative Content Writer to produce engaging articles, blogs, and web content. Strong English writing skills and creativity required.',
    requirements: 'Excellent English writing skills, Experience writing blogs and articles, Basic SEO knowledge, Research and analytical skills, Ability to meet deadlines',
    responsibilities: 'Write engaging blog posts and articles, Research industry topics, Optimize content for SEO, Proofread and edit content, Collaborate with marketing team',
    benefits: 'Work from anywhere, Flexible hours, Competitive pay, Performance bonuses, Growth opportunities',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 2,
    views: 341,
    applications: 41,
    is_featured: false,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Writing' },
      { skill_name: 'SEO' },
      { skill_name: 'Research' },
      { skill_name: 'Content Strategy' }
    ]
  },
  {
    id: 11,
    title: 'Python Backend Developer',
    company: 'Backend Solutions',
    company_logo: 'https://via.placeholder.com/150/3399ff/ffffff?text=Backend+Solutions',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'full-time',
    category: 'Software/Web',
    salary_min: 50000,
    salary_max: 85000,
    salary_type: 'monthly',
    experience_min: 2,
    experience_max: 5,
    education_level: 'Bachelor in Computer Science',
    description: 'Seeking a Python Backend Developer experienced with Django or Flask. Must have strong API development skills and database knowledge.',
    requirements: 'Strong Python programming skills, Experience with Django or Flask, PostgreSQL/MySQL database knowledge, RESTful API design, Understanding of authentication and security',
    responsibilities: 'Develop backend services and APIs, Design database schemas, Write unit and integration tests, Optimize application performance, Document API endpoints',
    benefits: 'Competitive salary, Health insurance, Learning budget, Remote work options, Annual trips',
    deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 2,
    views: 176,
    applications: 19,
    is_featured: false,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Python' },
      { skill_name: 'Django' },
      { skill_name: 'PostgreSQL' },
      { skill_name: 'REST API' },
      { skill_name: 'Git' }
    ]
  },
  {
    id: 12,
    title: 'Graphic Designer',
    company: 'Design Studio BD',
    company_logo: 'https://via.placeholder.com/150/ff6699/ffffff?text=Design+Studio',
    location: 'Dhaka, Bangladesh',
    location_district: 'Dhaka',
    job_type: 'part-time',
    category: 'Design/Creative',
    salary_min: 20000,
    salary_max: 35000,
    salary_type: 'monthly',
    experience_min: 1,
    experience_max: 3,
    education_level: 'Diploma in Graphic Design',
    description: 'Part-time Graphic Designer needed for creating social media graphics, posters, and marketing materials. Adobe Creative Suite proficiency required.',
    requirements: 'Proficiency in Adobe Photoshop, Illustrator, and InDesign, Creative thinking and design skills, Portfolio showcasing previous work, Understanding of print and digital design, Time management skills',
    responsibilities: 'Design social media graphics, Create marketing materials, Design posters and brochures, Prepare files for print, Maintain brand consistency',
    benefits: 'Flexible part-time hours, Work-life balance, Creative freedom, Portfolio building, Friendly team',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    vacancy_count: 1,
    views: 289,
    applications: 36,
    is_featured: false,
    is_urgent: false,
    status: 'active',
    skills: [
      { skill_name: 'Photoshop' },
      { skill_name: 'Illustrator' },
      { skill_name: 'InDesign' },
      { skill_name: 'Brand Design' }
    ]
  }
];

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Latest' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'salary_max', label: 'Salary (High to Low)' },
    { value: 'salary_min', label: 'Salary (Low to High)' },
    { value: 'title', label: 'Job Title' },
  ];

  // Fetch categories and locations on mount
  useEffect(() => {
    fetchCategoriesAndLocations();
  }, []);

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedJobType,
    minExperience,
    maxExperience,
    minSalary,
    maxSalary,
    sortBy,
    sortOrder,
    page,
  ]);

  const fetchCategoriesAndLocations = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        getJobCategories(),
        getJobLocations(),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setLocations(locationsRes.data.locations || []);
    } catch (error) {
      console.error('Error fetching categories/locations:', error);
      // Use demo categories and locations as fallback
      setCategories([
        'Software/Web',
        'Design/Creative',
        'Sales/Marketing',
        'Business Development',
        'Writing/Content',
      ]);
      setLocations(['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Remote']);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLocation) params.location = selectedLocation;
      if (selectedJobType) params.job_type = selectedJobType;
      if (minExperience) params.experience_min = minExperience;
      if (maxExperience) params.experience_max = maxExperience;
      if (minSalary) params.salary_min = minSalary;
      if (maxSalary) params.salary_max = maxSalary;

      const response = await getJobs(params);
      
      if (response.data.jobs && response.data.jobs.length > 0) {
        setJobs(response.data.jobs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalJobs(response.data.pagination.totalJobs);
        setUsingDemoData(false);
      } else {
        // Use demo data if API returns empty
        console.log('API returned empty, using demo data');
        applyFiltersToDemo();
        setUsingDemoData(true);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Use demo data as fallback
      console.log('API failed, using demo data');
      applyFiltersToDemo();
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToDemo = () => {
    let filtered = [...DEMO_JOBS];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Apply job type filter
    if (selectedJobType) {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    // Apply experience filter
    if (minExperience) {
      filtered = filtered.filter(job => job.experience_min >= parseInt(minExperience));
    }
    if (maxExperience) {
      filtered = filtered.filter(job => job.experience_max <= parseInt(maxExperience));
    }

    // Apply salary filter
    if (minSalary) {
      filtered = filtered.filter(job => job.salary_min >= parseInt(minSalary));
    }
    if (maxSalary) {
      filtered = filtered.filter(job => job.salary_max <= parseInt(maxSalary));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'salary_max') {
        return sortOrder === 'DESC' ? b.salary_max - a.salary_max : a.salary_max - b.salary_max;
      } else if (sortBy === 'salary_min') {
        return sortOrder === 'DESC' ? b.salary_min - a.salary_min : a.salary_min - b.salary_min;
      } else if (sortBy === 'title') {
        return sortOrder === 'DESC' 
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      } else if (sortBy === 'deadline') {
        return sortOrder === 'DESC'
          ? new Date(b.deadline) - new Date(a.deadline)
          : new Date(a.deadline) - new Date(b.deadline);
      } else {
        // Default: created_at
        return sortOrder === 'DESC'
          ? new Date(b.created_at) - new Date(a.created_at)
          : new Date(a.created_at) - new Date(b.created_at);
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * 12;
    const paginatedJobs = filtered.slice(startIndex, startIndex + 12);

    setJobs(paginatedJobs);
    setTotalJobs(filtered.length);
    setTotalPages(Math.ceil(filtered.length / 12));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedJobType('');
    setMinExperience('');
    setMaxExperience('');
    setMinSalary('');
    setMaxSalary('');
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedJobType,
    minExperience,
    maxExperience,
    minSalary,
    maxSalary,
  ].filter((f) => f).length;

  return (
    <Box sx={{ py: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            <WorkIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
            Find Your Dream Job
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover {totalJobs} job opportunities across Bangladesh
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by job title, company, or keywords..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SearchIcon />}
                  onClick={() => fetchJobs()}
                  sx={{ height: 56 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ height: 56 }}
                  endIcon={
                    <Chip
                      label={activeFiltersCount}
                      size="small"
                      color="primary"
                      sx={{ display: activeFiltersCount > 0 ? 'flex' : 'none' }}
                    />
                  }
                >
                  Filters
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showFilters}>
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.category} value={cat.category}>
                          {cat.category} ({cat.count})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Location</InputLabel>
                    <Select
                      value={selectedLocation}
                      label="Location"
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">All Locations</MenuItem>
                      {locations.map((loc) => (
                        <MenuItem key={loc.location_district} value={loc.location_district}>
                          {loc.location_district} ({loc.count})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={selectedJobType}
                      label="Job Type"
                      onChange={(e) => {
                        setSelectedJobType(e.target.value);
                        setPage(1);
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {jobTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Experience (years)"
                    value={minExperience}
                    onChange={(e) => {
                      setMinExperience(e.target.value);
                      setPage(1);
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Experience (years)"
                    value={maxExperience}
                    onChange={(e) => {
                      setMaxExperience(e.target.value);
                      setPage(1);
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Salary (৳)"
                    value={minSalary}
                    onChange={(e) => {
                      setMinSalary(e.target.value);
                      setPage(1);
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Salary (৳)"
                    value={maxSalary}
                    onChange={(e) => {
                      setMaxSalary(e.target.value);
                      setPage(1);
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    Clear All Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {searchQuery && (
                <Chip
                  label={`Search: ${searchQuery}`}
                  onDelete={() => setSearchQuery('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedCategory && (
                <Chip
                  label={`Category: ${selectedCategory}`}
                  onDelete={() => setSelectedCategory('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedLocation && (
                <Chip
                  label={`Location: ${selectedLocation}`}
                  onDelete={() => setSelectedLocation('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedJobType && (
                <Chip
                  label={`Type: ${selectedJobType}`}
                  onDelete={() => setSelectedJobType('')}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Results Count */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {jobs.length} of {totalJobs} jobs
          </Typography>
        </Box>

        {/* Demo Data Banner */}
        {usingDemoData && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: '#e3f2fd', 
              border: '1px solid #2196f3',
              borderRadius: 2 
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <WorkIcon sx={{ color: '#2196f3' }} />
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Showing Demo Jobs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  These are sample job listings. The backend server may not be running. All search and filter features are working with this demo data.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Job Listings */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Paper elevation={1} sx={{ p: 8, textAlign: 'center' }}>
            <WorkIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No jobs found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Try adjusting your search criteria or filters
            </Typography>
            <Button variant="contained" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={job.id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default JobSearch;

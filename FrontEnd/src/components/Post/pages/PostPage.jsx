import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../sidebar/Sidebar";
import PostComposer from "../components/PostComposer";
import Profile from "../sidebar/profile";
import Messages from "../sidebar/messages";
import Notifications from "../sidebar/notifications";
import Communities from "../sidebar/communities";
import Premium from "../components/Premium";
import Payments from "../sidebar/payments";
import UserProfile from "./UserProfile";
import JobSearch from "../../jobs/JobSearch";
import api, { getAllPosts, createPost, updatePost, deletePost as deletePostAPI, toggleLike as toggleLikeAPI, toggleShare as toggleShareAPI, acceptPost as acceptPostAPI, rejectPost as rejectPostAPI } from "../../../services/api";
import { useSocket } from "../../../hooks/useSocket";
import { auth } from "../../../config/firebase";

const Switcher8 = ({ isChecked, onChange }) => {
  return (
    <label className='flex cursor-pointer select-none items-center'>
      <div className='relative'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={onChange}
          className='sr-only'
        />
        <div
          className={`box h-6 w-14 rounded-full shadow-inner transition-all duration-300 ${
            isChecked ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        ></div>
        <div 
          className={`dot shadow-lg absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
            isChecked ? 'left-[34px] bg-white' : 'left-1 bg-white'
          }`}
        >
          <span
            className={`active h-3 w-3 rounded-full transition-all duration-300 ${
              isChecked ? 'bg-blue-600' : 'bg-gray-400'
            }`}
          ></span>
        </div>
      </div>
    </label>
  );
};

// Generate demo job posts for hashtag searches
function generateDemoJobPosts(currentUser) {
  const now = new Date();
  const userId = currentUser?.id || 'demo-user-jobs';
  const userName = currentUser?.full_name || 'Campus Gigs';
  const userAvatar = currentUser?.profile_picture || 'https://via.placeholder.com/100/0066cc/ffffff?text=CG';
  
  return [
    // #Jobs posts (15 posts)
    {
      id: 'job-post-1',
      content: `🚀 Senior Software Engineer - Laravel & Vue.js

📍 Dhaka, Bangladesh | 💼 Full-time | 💰 BDT 60,000 - 100,000/month

We're looking for an experienced Software Engineer to join our innovative team!

✅ Requirements:
• 3+ years experience with Laravel & Vue.js
• Strong knowledge of MySQL & RESTful APIs
• Experience with Git, Docker
• Problem-solving mindset

🎯 Responsibilities:
• Develop scalable web applications
• Write clean, maintainable code
• Collaborate with cross-functional teams
• Participate in code reviews

🎁 Benefits:
• Competitive salary
• Health insurance
• Performance bonuses
• Flexible work hours

📧 Apply: careers@techsolutions.com

#Jobs #Laravel #VueJS #SoftwareEngineer #TechCareers #WebDevelopment #DhakaJobs`,
      media_urls: ['https://via.placeholder.com/800x400/0066cc/ffffff?text=We+Are+Hiring'],
      full_name: userName,
      username: 'tech_solutions_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      likes: 234,
      shares: 45,
      comments_count: 28,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-2',
      content: `💼 React.js Frontend Developer Needed!

🏢 Digital Agency | 📍 Chittagong | 💵 BDT 40,000 - 65,000

Join our creative team and build amazing user interfaces!

🔥 Requirements:
• 2+ years React.js experience
• Proficiency in JavaScript ES6+
• Experience with Redux/Context API
• Understanding of responsive design
• Knowledge of RESTful APIs

🎯 What You'll Do:
• Build reusable React components
• Implement pixel-perfect designs
• Optimize app performance
• Collaborate with backend team
• Write clean, documented code

💎 Perks:
• Modern tech stack
• Learning opportunities
• Team activities
• Annual bonuses
• Career advancement

📩 Send CV to: hr@digitalagency.com

#Jobs #React #Frontend #JavaScript #WebDev #ChittagongJobs #ReactDeveloper`,
      media_urls: [],
      full_name: userName,
      username: 'digital_agency_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 189,
      shares: 32,
      comments_count: 19,
      repost_of: null,
      is_premium: false
    },
    {
      id: 'job-post-3',
      content: `🎯 Full Stack Developer - MERN Stack

🚀 StartUp Hub BD | 📍 Dhaka (Remote Available) | 💰 BDT 70,000 - 120,000

Be part of our innovative startup journey!

✨ Must Have:
• Expert in MongoDB, Express, React, Node.js
• TypeScript experience preferred
• Understanding of microservices
• AWS/Cloud knowledge
• Strong problem-solving skills

💼 Role:
• Design full-stack applications
• Create RESTful APIs
• Implement security best practices
• Mentor junior developers
• Contribute to architecture decisions

🌟 Why Join Us:
• Equity options available
• Flexible remote work
• Latest tech stack
• Startup culture
• Fast career growth
• Health & life insurance

📧 careers@startuphub.com | Apply by: ${new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString()}

#Jobs #FullStack #MERN #NodeJS #MongoDB #StartUp #RemoteJob #TechJobs`,
      media_urls: ['https://via.placeholder.com/800x500/ff6600/ffffff?text=Join+Our+Team'],
      full_name: userName,
      username: 'startup_hub',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      likes: 412,
      shares: 89,
      comments_count: 56,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-4',
      content: `💼 Python Backend Developer

📍 Chittagong, Bangladesh | 💼 Full-time | 💰 BDT 45,000 - 75,000/month

Join our fast-growing tech startup!

✅ Requirements:
• 2+ years Python & Django/Flask
• PostgreSQL, Redis experience
• REST API development
• Docker knowledge

🎁 Benefits:
• Flexible hours
• Learning budget
• Remote options

📧 Apply: hr@pythontech.com

#Jobs #Python #Django #Backend #ChittagongJobs #TechCareers`,
      media_urls: [],
      full_name: userName,
      username: 'python_tech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      likes: 156,
      shares: 23,
      comments_count: 19,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-5',
      content: `🎨 UI/UX Designer Wanted

📍 Remote (Bangladesh) | 💼 Full-time | 💰 BDT 40,000 - 70,000/month

Design the future with us!

✅ Requirements:
• 2+ years UI/UX design
• Figma, Adobe XD expert
• Portfolio required
• User research skills

📧 Apply: design@creativestudio.com

#Jobs #UIUXDesign #Designer #RemoteWork #Figma #CreativeJobs #Bangladesh`,
      media_urls: ['https://via.placeholder.com/800x400/9333ea/ffffff?text=Design+With+Us'],
      full_name: userName,
      username: 'creative_studio',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      likes: 198,
      shares: 34,
      comments_count: 25,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-6',
      content: `🔐 Cybersecurity Analyst

📍 Dhaka, Bangladesh | 💼 Full-time | 💰 BDT 70,000 - 120,000/month

Protect our digital infrastructure!

✅ Requirements:
• 3+ years security experience
• CISSP/CEH certified
• Network security expert

📧 Apply: security@cyberguard.com

#Jobs #Cybersecurity #InfoSec #TechJobs #DhakaJobs #Security`,
      media_urls: [],
      full_name: userName,
      username: 'cyberguard_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      likes: 287,
      shares: 56,
      comments_count: 42,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-7',
      content: `📱 Mobile App Developer (iOS/Android)

📍 Sylhet, Bangladesh | 💼 Full-time | 💰 BDT 50,000 - 85,000/month

Build amazing mobile experiences!

✅ Requirements:
• Flutter/React Native expert
• 2+ years mobile development
• App Store/Play Store published apps

📧 Apply: jobs@mobileapps.com

#Jobs #MobileDevelopment #Flutter #ReactNative #iOS #Android #SylhetJobs`,
      media_urls: ['https://via.placeholder.com/800x400/10b981/ffffff?text=Mobile+App+Jobs'],
      full_name: userName,
      username: 'mobile_apps_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 312,
      shares: 67,
      comments_count: 51,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-8',
      content: `💰 Financial Analyst

📍 Dhaka, Bangladesh | 💼 Full-time | 💰 BDT 55,000 - 90,000/month

Join our finance team!

✅ Requirements:
• MBA/CFA preferred
• 2+ years finance experience
• Excel, SQL skills

📧 Apply: careers@financebd.com

#Jobs #Finance #Analyst #Accounting #FinancialServices #DhakaJobs`,
      media_urls: [],
      full_name: userName,
      username: 'finance_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      likes: 178,
      shares: 29,
      comments_count: 33,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-9',
      content: `🎬 Video Content Creator

📍 Remote (Bangladesh) | 💼 Full/Part-time | 💰 BDT 35,000 - 60,000/month

Create viral content!

✅ Requirements:
• Adobe Premiere, After Effects
• Social media savvy
• Creative storytelling

📧 Apply: create@contentcrew.com

#Jobs #ContentCreator #VideoEditing #SocialMedia #RemoteWork #Creative`,
      media_urls: ['https://via.placeholder.com/800x400/ef4444/ffffff?text=Content+Creator+Needed'],
      full_name: userName,
      username: 'content_crew',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      likes: 445,
      shares: 89,
      comments_count: 78,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-10',
      content: `🤖 Machine Learning Engineer

📍 Dhaka, Bangladesh | 💼 Full-time | 💰 BDT 80,000 - 130,000/month

Shape the future with AI!

✅ Requirements:
• 3+ years ML/AI experience
• Python, TensorFlow, PyTorch
• Deep learning expertise

📧 Apply: ai@mltech.com

#Jobs #MachineLearning #AI #DeepLearning #DataScience #TechJobs`,
      media_urls: [],
      full_name: userName,
      username: 'ml_tech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
      likes: 523,
      shares: 112,
      comments_count: 94,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-11',
      content: `📊 Data Analyst

📍 Chittagong, Bangladesh | 💼 Full-time | 💰 BDT 45,000 - 75,000/month

Turn data into insights!

✅ Requirements:
• SQL, Python, Excel mastery
• Tableau/Power BI
• Statistical analysis

📧 Apply: data@analytics.com

#Jobs #DataAnalyst #DataScience #Analytics #SQL #BusinessIntelligence`,
      media_urls: ['https://via.placeholder.com/800x400/3b82f6/ffffff?text=Data+Analytics+Jobs'],
      full_name: userName,
      username: 'analytics_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      likes: 267,
      shares: 45,
      comments_count: 38,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-12',
      content: `☁️ Cloud DevOps Engineer

📍 Remote (Bangladesh) | 💼 Full-time | 💰 BDT 70,000 - 110,000/month

Build scalable cloud infrastructure!

✅ Requirements:
• AWS/Azure/GCP certified
• 3+ years DevOps experience
• Docker, Kubernetes

📧 Apply: devops@cloudtech.com

#Jobs #DevOps #CloudComputing #AWS #Kubernetes #Docker #RemoteWork`,
      media_urls: [],
      full_name: userName,
      username: 'cloud_tech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 84 * 60 * 60 * 1000).toISOString(),
      likes: 389,
      shares: 78,
      comments_count: 62,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-13',
      content: `✍️ Technical Writer

📍 Dhaka, Bangladesh | 💼 Full/Part-time | 💰 BDT 35,000 - 60,000/month

Document technical excellence!

✅ Requirements:
• Technical background
• Excellent English writing
• API documentation experience

📧 Apply: docs@techwriters.com

#Jobs #TechnicalWriting #Documentation #ContentWriting #TechJobs #DhakaJobs`,
      media_urls: [],
      full_name: userName,
      username: 'tech_writers',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      likes: 134,
      shares: 21,
      comments_count: 17,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-14',
      content: `🎮 Game Developer (Unity)

📍 Dhaka, Bangladesh | 💼 Full-time | 💰 BDT 50,000 - 85,000/month

Create immersive gaming experiences!

✅ Requirements:
• 2+ years Unity development
• C# programming expert
• Published game portfolio

📧 Apply: games@gamestudio.com

#Jobs #GameDevelopment #Unity #Gaming #GameDesign #TechJobs #DhakaJobs`,
      media_urls: ['https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Game+Developer+Wanted'],
      full_name: userName,
      username: 'game_studio_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 108 * 60 * 60 * 1000).toISOString(),
      likes: 567,
      shares: 123,
      comments_count: 89,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'job-post-15',
      content: `🔧 QA Engineer / Software Tester

📍 Sylhet, Bangladesh | 💼 Full-time | 💰 BDT 40,000 - 70,000/month

Ensure software quality!

✅ Requirements:
• 2+ years QA experience
• Automated testing (Selenium, Cypress)
• API testing (Postman)

📧 Apply: qa@qualitysoft.com

#Jobs #QA #SoftwareTesting #Automation #QualityAssurance #TechJobs`,
      media_urls: [],
      full_name: userName,
      username: 'quality_soft',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      likes: 211,
      shares: 38,
      comments_count: 29,
      repost_of: null,
      is_premium: true
    },
    
    // #Internships posts (12 posts)
    {
      id: 'intern-post-1',
      content: `🎓 Software Development Internship

🏢 Tech Solutions BD | 📍 Dhaka | ⏰ 3-6 months | 💵 BDT 15,000 - 20,000

Perfect opportunity for fresh graduates!

📚 What You'll Learn:
• Web development (Laravel/React)
• Database design & management
• API development
• Agile methodologies
• Professional coding practices

✅ Requirements:
• Recent CSE/IT graduate or final year student
• Basic knowledge of PHP or JavaScript
• Passion for learning
• Good communication skills
• Team player attitude

🎁 Benefits:
• Hands-on experience
• Mentorship from senior devs
• Potential full-time offer
• Certificate upon completion
• Real project exposure

📩 internship@techsolutions.com

#Internships #SoftwareDevelopment #FreshGraduate #WebDevelopment #LearningOpportunity #DhakaInternship`,
      media_urls: [],
      full_name: userName,
      username: 'tech_solutions_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      likes: 567,
      shares: 123,
      comments_count: 94,
      repost_of: null,
      is_premium: false
    },
    {
      id: 'intern-post-2',
      content: `🌟 UI/UX Design Internship

🎨 Creative Studio | 📍 Dhaka | 🕐 4 months | 💰 Stipend: BDT 12,000

Launch your design career with us!

🎯 What We Offer:
• Work on real client projects
• Learn Figma, Adobe XD professionally
• User research & testing experience
• Portfolio building opportunity
• Certificate & recommendation letter

📋 Who Can Apply:
• Design students or fresh graduates
• Basic Figma/Adobe XD knowledge
• Creative mindset
• Attention to detail
• Portfolio (academic projects acceptable)

💼 You'll Work On:
• Mobile & web app designs
• Wireframes & prototypes
• User flow diagrams
• Design systems
• Client presentations

🚀 Apply now: design.intern@creativestudio.com
Deadline: ${new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}

#Internships #UIUXDesign #DesignInternship #Figma #CreativeCareer #FreshGraduate`,
      media_urls: ['https://via.placeholder.com/800x400/9933ff/ffffff?text=Design+Internship'],
      full_name: userName,
      username: 'creative_studio_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      likes: 345,
      shares: 78,
      comments_count: 67,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-3',
      content: `📱 Mobile App Development Internship

🏢 AppTech BD | 📍 Remote | ⏰ 6 months | 💵 BDT 18,000/month

Learn Flutter & React Native!

📚 What You'll Learn:
• Cross-platform mobile development
• Firebase integration
• State management
• App deployment

✅ Requirements:
• Basic programming knowledge
• Passion for mobile apps
• Good communication skills

📧 Apply: intern@apptech.com

#Internships #MobileDevelopment #Flutter #ReactNative #TechInternship #Remote`,
      media_urls: [],
      full_name: userName,
      username: 'apptech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 289,
      shares: 54,
      comments_count: 45,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-4',
      content: `📊 Data Science Internship

🏢 DataTech Solutions | 📍 Dhaka | ⏰ 4 months | 💵 BDT 20,000/month

Start your Data Science career!

📚 Learning Areas:
• Python for Data Science
• Machine Learning basics
• Data visualization
• Statistical analysis

✅ Requirements:
• Statistics background
• Python knowledge
• Analytical mindset

📧 Apply: dataintern@datatech.com

#Internships #DataScience #MachineLearning #Python #Analytics #DhakaInternship`,
      media_urls: ['https://via.placeholder.com/800x400/06b6d4/ffffff?text=Data+Science+Internship'],
      full_name: userName,
      username: 'datatech_solutions',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      likes: 412,
      shares: 89,
      comments_count: 71,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-5',
      content: `🎬 Digital Marketing Internship

🏢 Brand Masters | 📍 Chittagong | ⏰ 3 months | 💵 BDT 12,000/month

Master digital marketing!

📚 You'll Work On:
• Social media campaigns
• Content creation
• SEO & SEM
• Analytics & reporting

✅ Requirements:
• Marketing student
• Creative mindset
• Social media knowledge

📧 Apply: marketing@brandmasters.com

#Internships #DigitalMarketing #SocialMedia #Marketing #ContentCreation #ChittagongInternship`,
      media_urls: [],
      full_name: userName,
      username: 'brand_masters',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      likes: 234,
      shares: 42,
      comments_count: 38,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-6',
      content: `💼 Business Analyst Internship

🏢 Tech Consultancy BD | 📍 Dhaka | ⏰ 5 months | 💵 BDT 22,000/month

Bridge tech and business!

📚 Skills You'll Gain:
• Requirements gathering
• Business process modeling
• Stakeholder management
• Project documentation

✅ Requirements:
• Business/CS student
• Problem-solving skills
• Excel proficiency

📧 Apply: careers@techconsult.com

#Internships #BusinessAnalyst #TechConsulting #ProjectManagement #DhakaInternship`,
      media_urls: [],
      full_name: userName,
      username: 'tech_consultancy',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
      likes: 198,
      shares: 31,
      comments_count: 24,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-7',
      content: `🎨 Graphic Design Internship

🏢 Creative Hub | 📍 Remote | ⏰ 3-6 months | 💵 BDT 15,000/month

Unleash your creativity!

📚 Design Projects:
• Brand identity
• Social media graphics
• Print materials
• Web graphics

✅ Requirements:
• Adobe Creative Suite
• Portfolio required
• Creative mindset

📧 Apply: design@creativehub.com

#Internships #GraphicDesign #CreativeDesign #AdobeIllustrator #Photoshop #RemoteInternship`,
      media_urls: ['https://via.placeholder.com/800x400/ec4899/ffffff?text=Graphic+Design+Internship'],
      full_name: userName,
      username: 'creative_hub',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      likes: 456,
      shares: 92,
      comments_count: 67,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-8',
      content: `🔐 Cybersecurity Internship

🏢 SecureNet BD | 📍 Sylhet | ⏰ 6 months | 💵 BDT 25,000/month

Learn ethical hacking!

📚 Training Includes:
• Network security
• Penetration testing
• Security tools (Kali Linux)
• Incident response

✅ Requirements:
• CS/IT background
• Linux knowledge
• Security interest

📧 Apply: security@securenet.com

#Internships #Cybersecurity #EthicalHacking #InfoSec #NetworkSecurity #SylhetInternship`,
      media_urls: [],
      full_name: userName,
      username: 'securenet_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 84 * 60 * 60 * 1000).toISOString(),
      likes: 523,
      shares: 114,
      comments_count: 89,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-9',
      content: `📝 Content Writing Internship

🏢 WritePro BD | 📍 Remote | ⏰ 4 months | 💵 BDT 10,000 - 15,000/month

Write compelling content!

📚 Content Types:
• Blog posts & articles
• Social media content
• Email newsletters
• Website copy

✅ Requirements:
• Excellent English
• Research skills
• SEO knowledge (bonus)

📧 Apply: write@writepro.com

#Internships #ContentWriting #Copywriting #Blogging #SEO #RemoteInternship #Writing`,
      media_urls: [],
      full_name: userName,
      username: 'writepro_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      likes: 267,
      shares: 48,
      comments_count: 42,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-10',
      content: `🤖 AI/ML Research Internship

🏢 AI Lab Bangladesh | 📍 Dhaka | ⏰ 6 months | 💵 BDT 30,000/month

Research cutting-edge AI!

📚 Research Areas:
• Natural Language Processing
• Computer Vision
• Deep Learning
• Research paper writing

✅ Requirements:
• Strong Python skills
• Math background
• Research interest
• TensorFlow/PyTorch knowledge

📧 Apply: research@ailab.bd

#Internships #ArtificialIntelligence #MachineLearning #Research #DeepLearning #DhakaInternship`,
      media_urls: ['https://via.placeholder.com/800x400/8b5cf6/ffffff?text=AI+Research+Internship'],
      full_name: userName,
      username: 'ailab_bangladesh',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 108 * 60 * 60 * 1000).toISOString(),
      likes: 678,
      shares: 145,
      comments_count: 112,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-11',
      content: `☁️ Cloud Computing Internship

🏢 CloudTech BD | 📍 Remote | ⏰ 5 months | 💵 BDT 20,000/month

Master cloud platforms!

📚 You'll Learn:
• AWS/Azure basics
• Cloud architecture
• DevOps practices
• Infrastructure as Code

✅ Requirements:
• Basic Linux knowledge
• Programming basics
• Eager to learn cloud

📧 Apply: cloud@cloudtech.bd

#Internships #CloudComputing #AWS #Azure #DevOps #RemoteInternship #TechInternship`,
      media_urls: [],
      full_name: userName,
      username: 'cloudtech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      likes: 389,
      shares: 72,
      comments_count: 58,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'intern-post-12',
      content: `🎮 Game Development Internship

🏢 GameForge Studios | 📍 Dhaka | ⏰ 6 months | 💵 BDT 18,000/month

Create amazing games!

📚 Learning Path:
• Unity/Unreal Engine
• C# or C++ programming
• Game design principles
• 3D modeling basics

✅ Requirements:
• Gaming passion
• Basic programming
• Creative problem-solving

📧 Apply: games@gameforge.bd

#Internships #GameDevelopment #Unity #GameDesign #Gaming #DhakaInternship #TechInternship`,
      media_urls: ['https://via.placeholder.com/800x400/f59e0b/ffffff?text=Game+Dev+Internship'],
      full_name: userName,
      username: 'gameforge_studios',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 132 * 60 * 60 * 1000).toISOString(),
      likes: 612,
      shares: 128,
      comments_count: 95,
      repost_of: null,
      is_premium: true
    },
    
    // #React posts (12 posts)
    {
      id: 'react-post-1',
      content: `⚛️ React Developer - Mid Level Position

🏢 AppCraft Studio | 📍 Dhaka | 💼 Full-time | 💰 50K - 75K BDT

Build next-generation web applications!

🔧 Tech Stack:
• React 18+ with Hooks
• TypeScript
• Redux Toolkit / Zustand
• React Query
• Material-UI / Tailwind CSS
• Jest & React Testing Library

✅ Requirements:
• 2-4 years React experience
• Strong JavaScript/TypeScript skills
• Experience with state management
• Understanding of React performance optimization
• Git & CI/CD knowledge

💼 Responsibilities:
• Develop complex React applications
• Write unit & integration tests
• Code reviews & mentoring juniors
• Optimize bundle sizes
• Collaborate with designers & backend team

🎁 Benefits:
• Competitive salary
• Latest MacBook Pro
• Health insurance
• Learning budget (courses, books)
• Hybrid work model

📧 Apply: react.jobs@appcraft.com

#React #ReactJS #JavaScript #TypeScript #Frontend #WebDevelopment #DhakaJobs #ReactDeveloper`,
      media_urls: [],
      full_name: userName,
      username: 'appcraft_studio',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 298,
      shares: 54,
      comments_count: 41,
      repost_of: null,
      is_premium: false
    },
    {
      id: 'react-post-2',
      content: `🚀 Senior React Native Developer

📱 Mobile First | 📍 Remote (Bangladesh) | 💵 BDT 80,000 - 140,000

Build amazing mobile experiences!

🎯 Must Have:
• 3+ years React Native experience
• Published apps on Play Store & App Store
• Expo & bare React Native knowledge
• Native modules integration experience
• Push notifications, deep linking expertise
• Performance optimization skills

💼 What You'll Do:
• Lead mobile app development
• Architect app structure
• Integrate native features
• Optimize app performance
• Mentor junior developers
• Code reviews & best practices

🌟 Tech Stack:
• React Native 0.72+
• TypeScript
• Redux / MobX
• Firebase / AWS
• Jest & Detox
• CI/CD (Fastlane, CodePush)

💎 Perks:
• Fully remote
• Flexible hours
• Top-tier salary
• Latest devices for testing
• Conference sponsorship
• Stock options

📩 careers@mobilefirst.com

#React #ReactNative #MobileApp #JavaScript #TypeScript #RemoteJob #SeniorDeveloper`,
      media_urls: ['https://via.placeholder.com/800x450/00aaff/ffffff?text=React+Native+Position'],
      full_name: userName,
      username: 'mobile_first',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 523,
      shares: 112,
      comments_count: 78,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-3',
      content: `⚛️ React.js Frontend Developer

📍 Sylhet, Bangladesh | 💼 Full-time | 💰 BDT 55,000 - 90,000/month

Build beautiful UIs!

🔧 Tech Stack:
• React 18
• Next.js
• Tailwind CSS
• TypeScript

✅ Requirements:
• 3+ years React
• Strong CSS skills
• Performance optimization

📧 Apply: frontend@webtech.com

#React #Frontend #NextJS #JavaScript #TypeScript #TailwindCSS #SylhetJobs`,
      media_urls: [],
      full_name: userName,
      username: 'webtech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      likes: 387,
      shares: 76,
      comments_count: 54,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-4',
      content: `⚛️ React & Node.js Full Stack Developer

📍 Remote (Bangladesh) | 💼 Contract | 💰 BDT 80,000 - 120,000/month

Full stack opportunity!

🔧 Stack:
• React + Redux
• Node.js + Express
• MongoDB
• AWS

📧 Apply: fullstack@devteam.com

#React #FullStack #NodeJS #JavaScript #MongoDB #RemoteWork #Developer`,
      media_urls: ['https://via.placeholder.com/800x400/14b8a6/ffffff?text=Full+Stack+React+Job'],
      full_name: userName,
      username: 'dev_team_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      likes: 612,
      shares: 134,
      comments_count: 89,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-5',
      content: `⚛️ Junior React Developer

📍 Dhaka, Bangladesh | 💼 Full-time | 💰 BDT 35,000 - 55,000/month

Start your React career!

✅ Requirements:
• 1+ year React
• JavaScript fundamentals
• Git knowledge
• Team player

📧 Apply: junior@reactdevs.com

#React #JuniorDeveloper #JavaScript #WebDevelopment #DhakaJobs #EntryLevel`,
      media_urls: [],
      full_name: userName,
      username: 'react_devs_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
      likes: 445,
      shares: 98,
      comments_count: 71,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-6',
      content: `⚛️ React UI Component Library Developer

📍 Chittagong | 💼 Full-time | 💰 BDT 60,000 - 95,000/month

Build reusable components!

🔧 Skills:
• React + TypeScript
• Storybook
• Component design
• Testing (Jest, RTL)

📧 Apply: ui@componentlib.com

#React #UIComponents #TypeScript #ComponentLibrary #Frontend #ChittagongJobs`,
      media_urls: [],
      full_name: userName,
      username: 'component_lib',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      likes: 298,
      shares: 54,
      comments_count: 42,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-7',
      content: `⚛️ React + GraphQL Developer

📍 Remote | 💼 Full-time | 💰 BDT 70,000 - 110,000/month

Modern stack opportunity!

🔧 Tech:
• React 18
• Apollo Client
• GraphQL
• TypeScript

📧 Apply: graphql@modernstack.com

#React #GraphQL #Apollo #TypeScript #RemoteWork #WebDevelopment #Developer`,
      media_urls: ['https://via.placeholder.com/800x400/a855f7/ffffff?text=React+GraphQL+Developer'],
      full_name: userName,
      username: 'modern_stack',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 84 * 60 * 60 * 1000).toISOString(),
      likes: 534,
      shares: 117,
      comments_count: 82,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-8',
      content: `⚛️ React Performance Specialist

📍 Dhaka | 💼 Full-time | 💰 BDT 75,000 - 120,000/month

Optimize React apps!

✅ Skills:
• Performance profiling
• Code splitting
• Lazy loading
• Webpack optimization

📧 Apply: perf@reactpro.com

#React #Performance #Optimization #JavaScript #WebPerformance #DhakaJobs`,
      media_urls: [],
      full_name: userName,
      username: 'react_pro_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      likes: 412,
      shares: 89,
      comments_count: 67,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-9',
      content: `⚛️ React + Three.js Developer

📍 Remote | 💼 Contract | 💰 BDT 85,000 - 130,000/month

3D web experiences!

🔧 Stack:
• React
• Three.js
• WebGL
• 3D graphics

📧 Apply: 3d@webgl.com

#React #ThreeJS #WebGL #3D #JavaScript #RemoteWork #Creative`,
      media_urls: ['https://via.placeholder.com/800x400/f97316/ffffff?text=React+3D+Developer'],
      full_name: userName,
      username: 'webgl_studio',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 108 * 60 * 60 * 1000).toISOString(),
      likes: 678,
      shares: 145,
      comments_count: 103,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-10',
      content: `⚛️ React E-commerce Developer

📍 Sylhet | 💼 Full-time | 💰 BDT 60,000 - 95,000/month

Build shopping platforms!

✅ Experience:
• E-commerce systems
• Payment integration
• State management
• Cart systems

📧 Apply: ecommerce@shoptech.com

#React #Ecommerce #JavaScript #WebDevelopment #PaymentIntegration #SylhetJobs`,
      media_urls: [],
      full_name: userName,
      username: 'shop_tech_bd',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      likes: 356,
      shares: 71,
      comments_count: 58,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-11',
      content: `⚛️ React Testing Engineer

📍 Dhaka | 💼 Full-time | 💰 BDT 55,000 - 85,000/month

Test React applications!

🧪 Tools:
• Jest
• React Testing Library
• Cypress
• Playwright

📧 Apply: testing@qualityreact.com

#React #Testing #QA #Jest #Cypress #Automation #DhakaJobs`,
      media_urls: [],
      full_name: userName,
      username: 'quality_react',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 132 * 60 * 60 * 1000).toISOString(),
      likes: 289,
      shares: 52,
      comments_count: 41,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'react-post-12',
      content: `⚛️ React Micro-Frontend Architect

📍 Remote | 💼 Full-time | 💰 BDT 95,000 - 150,000/month

Lead micro-frontend architecture!

🏗️ Skills:
• Module Federation
• Micro-frontend patterns
• System architecture
• Team leadership

📧 Apply: architect@microfrontend.com

#React #Architecture #MicroFrontend #JavaScript #SystemDesign #RemoteWork #Senior`,
      media_urls: ['https://via.placeholder.com/800x400/0ea5e9/ffffff?text=React+Architect+Position'],
      full_name: userName,
      username: 'microfrontend_team',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 144 * 60 * 60 * 1000).toISOString(),
      likes: 789,
      shares: 167,
      comments_count: 124,
      repost_of: null,
      is_premium: true
    },
    
    // #Freelance posts (12 posts)
    {
      id: 'freelance-post-1',
      content: `💼 Freelance Web Developer Needed

🌐 Project-Based | 📍 Remote | 💰 BDT 30,000 - 50,000 per project

Multiple projects available!

📋 Project Details:
• Build responsive WordPress websites
• Custom theme development
• E-commerce integration (WooCommerce)
• Payment gateway setup
• SEO optimization
• Ongoing maintenance contracts available

✅ Requirements:
• Strong HTML, CSS, JavaScript skills
• WordPress expertise (themes & plugins)
• Elementor/WPBakery experience
• Responsive design knowledge
• Meeting deadlines
• Good communication

🎯 Ideal For:
• Freelancers building portfolio
• Students earning while studying
• Developers seeking side income
• Anyone wanting flexible work

📧 Contact: projects@webagency.com
💬 WhatsApp: +880-1XXX-XXXXXX

#Freelance #WordPress #WebDevelopment #RemoteWork #SideIncome #FlexibleWork`,
      media_urls: [],
      full_name: userName,
      username: 'web_agency',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      likes: 234,
      shares: 67,
      comments_count: 52,
      repost_of: null,
      is_premium: false
    },
    {
      id: 'freelance-post-2',
      content: `🎨 Freelance Graphic Designer Wanted

🖌️ Long-term Collaboration | 📍 Remote | 💵 BDT 500 - 2,000 per design

Perfect for creative minds!

🎯 What We Need:
• Social media graphics (Instagram, Facebook, LinkedIn)
• Marketing materials (posters, flyers, brochures)
• Logo design & branding
• Infographics
• Presentation designs
• YouTube thumbnails

✨ Requirements:
• Proficiency in Photoshop & Illustrator
• Creative & modern design sense
• Fast turnaround time
• Understanding of brand guidelines
• Portfolio required

💼 Project Volume:
• 10-20 designs per week
• Regular ongoing work
• Potential monthly retainer

🎁 Benefits:
• Work from anywhere
• Flexible hours
• Build diverse portfolio
• Stable income stream
• Creative freedom

📩 Send portfolio: creative@marketingpro.com

#Freelance #GraphicDesign #Photoshop #Illustrator #RemoteWork #CreativeJobs #DesignWork`,
      media_urls: ['https://via.placeholder.com/800x500/ff0099/ffffff?text=Freelance+Designer+Needed'],
      full_name: userName,
      username: 'marketing_pro',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      likes: 412,
      shares: 98,
      comments_count: 71,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-3',
      content: `💼 Freelance Mobile App Developer

📱 Project-Based | 📍 Remote | 💰 BDT 40,000 - 80,000 per app

Build mobile apps!

✅ Requirements:
• Flutter/React Native
• Firebase experience
• App deployment
• UI/UX sense

📧 Contact: mobile@freelanceapp.com

#Freelance #MobileDevelopment #Flutter #ReactNative #RemoteWork #AppDevelopment`,
      media_urls: [],
      full_name: userName,
      username: 'freelance_apps',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
      likes: 523,
      shares: 112,
      comments_count: 87,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-4',
      content: `💼 Freelance Video Editor

🎬 Project-Based | 📍 Remote | 💰 BDT 15,000 - 30,000 per project

Edit professional videos!

✅ Skills:
• Adobe Premiere Pro
• After Effects
• Color grading
• Fast turnaround

📧 Contact: video@editpro.com

#Freelance #VideoEditing #AdobePremiere #ContentCreation #RemoteWork #VideoProduction`,
      media_urls: ['https://via.placeholder.com/800x400/dc2626/ffffff?text=Freelance+Video+Editor'],
      full_name: userName,
      username: 'edit_pro',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      likes: 367,
      shares: 74,
      comments_count: 59,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-5',
      content: `💼 Freelance SEO Specialist

🔍 Monthly Retainer | 📍 Remote | 💰 BDT 25,000 - 50,000/month

Boost website rankings!

✅ Services:
• Keyword research
• On-page optimization
• Link building
• Performance reports

📧 Contact: seo@rankboost.com

#Freelance #SEO #DigitalMarketing #SearchEngine #RemoteWork #SEOExpert`,
      media_urls: [],
      full_name: userName,
      username: 'rank_boost',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 84 * 60 * 60 * 1000).toISOString(),
      likes: 445,
      shares: 89,
      comments_count: 72,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-6',
      content: `💼 Freelance Python Developer

🐍 Project-Based | 📍 Remote | 💰 BDT 35,000 - 70,000 per project

Backend solutions!

✅ Requirements:
• Django/Flask
• REST API development
• Database design
• Clean code

📧 Contact: python@devfreelance.com

#Freelance #Python #Django #Backend #RemoteWork #PythonDeveloper #WebDevelopment`,
      media_urls: [],
      full_name: userName,
      username: 'dev_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      likes: 512,
      shares: 103,
      comments_count: 81,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-7',
      content: `💼 Freelance UI/UX Designer

🎨 Project-Based | 📍 Remote | 💰 BDT 20,000 - 45,000 per project

Design beautiful interfaces!

✅ Deliverables:
• Wireframes
• Mockups
• Prototypes
• Design systems

📧 Contact: design@uxfreelance.com

#Freelance #UIUXDesign #Figma #AdobeXD #RemoteWork #DesignFreelance #UserExperience`,
      media_urls: ['https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Freelance+UI+UX+Designer'],
      full_name: userName,
      username: 'ux_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 108 * 60 * 60 * 1000).toISOString(),
      likes: 623,
      shares: 134,
      comments_count: 96,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-8',
      content: `💼 Freelance DevOps Engineer

☁️ Contract-Based | 📍 Remote | 💰 BDT 60,000 - 100,000/month

Cloud infrastructure!

✅ Skills:
• AWS/Azure
• Docker/Kubernetes
• CI/CD pipelines
• Infrastructure as Code

📧 Contact: devops@cloudfreelance.com

#Freelance #DevOps #CloudComputing #AWS #Kubernetes #RemoteWork #ContractWork`,
      media_urls: [],
      full_name: userName,
      username: 'cloud_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      likes: 478,
      shares: 97,
      comments_count: 74,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-9',
      content: `💼 Freelance Data Analyst

📊 Project-Based | 📍 Remote | 💰 BDT 30,000 - 60,000 per project

Data insights!

✅ Services:
• Data cleaning
• Analysis & visualization
• Dashboard creation
• Reports & presentations

📧 Contact: data@analyticsfreelance.com

#Freelance #DataAnalysis #Python #SQL #Tableau #RemoteWork #DataScience #Analytics`,
      media_urls: [],
      full_name: userName,
      username: 'analytics_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 132 * 60 * 60 * 1000).toISOString(),
      likes: 389,
      shares: 76,
      comments_count: 62,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-10',
      content: `💼 Freelance WordPress Developer

🌐 Project-Based | 📍 Remote | 💰 BDT 20,000 - 40,000 per site

Custom WordPress sites!

✅ Services:
• Theme customization
• Plugin development
• E-commerce setup
• Speed optimization

📧 Contact: wordpress@webfreelance.com

#Freelance #WordPress #WebDevelopment #PHP #RemoteWork #WebDesign #WooCommerce`,
      media_urls: ['https://via.placeholder.com/800x400/0ea5e9/ffffff?text=WordPress+Developer'],
      full_name: userName,
      username: 'web_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 144 * 60 * 60 * 1000).toISOString(),
      likes: 456,
      shares: 92,
      comments_count: 78,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-11',
      content: `💼 Freelance Copywriter

✍️ Per-Word Basis | 📍 Remote | 💰 BDT 2-5 per word

Compelling copy!

✅ Content Types:
• Website copy
• Ad copy
• Email campaigns
• Product descriptions

📧 Contact: copy@writefreelance.com

#Freelance #Copywriting #ContentWriting #Marketing #RemoteWork #Writing #ContentCreation`,
      media_urls: [],
      full_name: userName,
      username: 'write_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 156 * 60 * 60 * 1000).toISOString(),
      likes: 334,
      shares: 67,
      comments_count: 54,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'freelance-post-12',
      content: `💼 Freelance Social Media Manager

📱 Monthly Retainer | 📍 Remote | 💰 BDT 30,000 - 60,000/month

Manage social presence!

✅ Services:
• Content planning
• Post scheduling
• Community management
• Analytics reporting

📧 Contact: social@smfreelance.com

#Freelance #SocialMediaMarketing #DigitalMarketing #ContentStrategy #RemoteWork #SMM`,
      media_urls: ['https://via.placeholder.com/800x400/ec4899/ffffff?text=Social+Media+Manager'],
      full_name: userName,
      username: 'sm_freelance',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 168 * 60 * 60 * 1000).toISOString(),
      likes: 567,
      shares: 121,
      comments_count: 94,
      repost_of: null,
      is_premium: true
    },
    
    // #OpenSource posts (12 posts)
    {
      id: 'opensource-post-1',
      content: `🌟 Join Our Open Source Project!

🚀 Laravel Package Development | 📍 Remote Collaboration | 🆓 Contribute & Learn

We're building an amazing Laravel authentication package!

💻 Project: Laravel Advanced Auth
🔗 GitHub: github.com/opensource/laravel-auth
⭐ 2.3k stars | 🍴 456 forks

🎯 What We're Building:
• Multi-factor authentication
• Social login integration
• Role-based permissions
• API authentication
• Session management
• Security features

👥 How to Contribute:
• Code contributions (PHP, Laravel)
• Documentation improvements
• Bug fixes & testing
• Feature suggestions
• Code reviews

✨ Perfect For:
• Learning Laravel best practices
• Building your portfolio
• Networking with developers
• Resume enhancement
• Giving back to community

📚 Tech Stack:
• Laravel 10+
• PHP 8.2+
• MySQL/PostgreSQL
• Redis
• GitHub Actions (CI/CD)

🤝 All skill levels welcome! Beginners get mentorship.

📧 Join: opensource@devteam.com
💬 Discord: discord.gg/laravel-auth

#OpenSource #Laravel #PHP #GitHub #Collaboration #LearningOpportunity #DeveloperCommunity`,
      media_urls: [],
      full_name: userName,
      username: 'opensource_dev',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      likes: 678,
      shares: 234,
      comments_count: 123,
      repost_of: null,
      is_premium: false
    },
    {
      id: 'opensource-post-2',
      content: `🔥 Hacktoberfest 2025 - Contribute to React Projects!

🎃 Open Source Month | 📍 Global | 🎁 Win T-shirts & Prizes

Join thousands of developers contributing to React!

🚀 Featured Projects:
1. React Dashboard Library
   • 5.2k ⭐ | Good First Issues: 15+
   • Components, hooks, utilities
   
2. React Testing Utilities
   • 3.8k ⭐ | Help Wanted: 22+
   • Testing helpers & mocks
   
3. React Native Components
   • 7.1k ⭐ | Beginner Friendly: 18+
   • UI components library

🎯 How to Participate:
✅ Register at hacktoberfest.com
✅ Make 4 quality PRs in October
✅ Get reviewed & merged
✅ Win swag & recognition

💡 Contribution Ideas:
• Fix bugs
• Add new features
• Improve documentation
• Write tests
• Update dependencies
• Enhance accessibility

🎁 Rewards:
• Official Hacktoberfest T-shirt
• Digital badges
• Recognition in README
• Portfolio enhancement
• Network with maintainers

📚 Resources:
• Contribution guidelines on each repo
• Discord support channel
• Beginner-friendly issue labels

🔗 Start here: github.com/hacktoberfest/react-projects

#OpenSource #Hacktoberfest #React #GitHub #Coding #Community #FreeTshirt #Programming`,
      media_urls: ['https://via.placeholder.com/800x450/ff6600/ffffff?text=Hacktoberfest+2025'],
      full_name: userName,
      username: 'hacktoberfest',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      likes: 1234,
      shares: 445,
      comments_count: 267,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-3',
      content: `🌟 Contribute to React UI Library

⚛️ Open Source | 📍 Remote | 🆓 Learn & Contribute

Build reusable React components!

🎯 Project: React Component Suite
⭐ 5.2k stars | 🍴 890 forks

📚 Good First Issues:
• Button variants
• Form components
• Accessibility improvements

📧 Join: opensource@reactui.com

#OpenSource #React #JavaScript #UIComponents #GitHub #Contribute #WebDevelopment`,
      media_urls: [],
      full_name: userName,
      username: 'react_ui_team',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      likes: 789,
      shares: 234,
      comments_count: 145,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-4',
      content: `🌟 Open Source Python Project

🐍 Data Science Tools | 📍 Remote Collaboration

Build ML utilities!

💻 Project: PyDataTools
⭐ 3.8k stars

🎯 Contribute:
• Data preprocessing
• Visualization tools
• Documentation

📧 Discuss: github.com/pydatatools

#OpenSource #Python #DataScience #MachineLearning #GitHub #Contribute`,
      media_urls: ['https://via.placeholder.com/800x400/3b82f6/ffffff?text=Python+Open+Source'],
      full_name: userName,
      username: 'pydata_tools',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
      likes: 923,
      shares: 278,
      comments_count: 189,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-5',
      content: `🌟 Mobile App Open Source

📱 Flutter Community Project

Educational mobile app!

💻 Project: LearnHub Flutter
⭐ 2.1k stars

🎯 Help Needed:
• UI screens
• State management
• Testing

📧 Join: flutter@learnhub.org

#OpenSource #Flutter #MobileDevelopment #Dart #GitHub #Contribute #Community`,
      media_urls: [],
      full_name: userName,
      username: 'learnhub_flutter',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      likes: 656,
      shares: 189,
      comments_count: 123,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-6',
      content: `🌟 Contribute to Node.js Tools

🚀 Developer Utilities | 📍 Remote

Build CLI tools!

💻 Project: NodeDevTools
⭐ 4.5k stars

🎯 Areas:
• CLI commands
• Testing frameworks
• Documentation

📧 Contribute: github.com/nodedevtools

#OpenSource #NodeJS #JavaScript #CLI #Developer #GitHub #Contribute`,
      media_urls: ['https://via.placeholder.com/800x400/10b981/ffffff?text=Node.js+Open+Source'],
      full_name: userName,
      username: 'node_devtools',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 84 * 60 * 60 * 1000).toISOString(),
      likes: 834,
      shares: 245,
      comments_count: 167,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-7',
      content: `🌟 Open Source Documentation Project

📚 Tech Writing Community

Improve developer docs!

💻 Project: DevDocs Plus
⭐ 1.8k stars

🎯 Contribute:
• Write tutorials
• Fix typos
• Add examples

📧 Join: docs@devdocsplus.com

#OpenSource #Documentation #TechnicalWriting #GitHub #Contribute #Community`,
      media_urls: [],
      full_name: userName,
      username: 'devdocs_plus',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      likes: 567,
      shares: 167,
      comments_count: 112,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-8',
      content: `🌟 Game Development Open Source

🎮 Unity Community Project

Build indie game!

💻 Project: UnityRPG
⭐ 6.2k stars

🎯 Help Wanted:
• Character systems
• Inventory mechanics
• Level design

📧 Join: game@unityrpg.com

#OpenSource #GameDevelopment #Unity #Gaming #GitHub #Contribute #IndieGame`,
      media_urls: ['https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Unity+Open+Source'],
      full_name: userName,
      username: 'unity_rpg',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 108 * 60 * 60 * 1000).toISOString(),
      likes: 1456,
      shares: 423,
      comments_count: 298,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-9',
      content: `🌟 DevOps Open Source Tools

☁️ Infrastructure as Code

Build deployment tools!

💻 Project: CloudDeploy
⭐ 3.3k stars

🎯 Contribute:
• Terraform modules
• Ansible playbooks
• CI/CD templates

📧 Discuss: github.com/clouddeploy

#OpenSource #DevOps #CloudComputing #Terraform #Ansible #GitHub #Contribute`,
      media_urls: [],
      full_name: userName,
      username: 'cloud_deploy',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      likes: 712,
      shares: 201,
      comments_count: 156,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-10',
      content: `🌟 Open Source Design System

🎨 UI/UX Community Project

Build design tokens!

💻 Project: DesignKit
⭐ 2.7k stars

🎯 Help Needed:
• Component designs
• Icon library
• Color palettes

📧 Join: design@designkit.org

#OpenSource #DesignSystem #UIUX #Figma #GitHub #Contribute #Design`,
      media_urls: ['https://via.placeholder.com/800x400/ec4899/ffffff?text=Design+System+Open+Source'],
      full_name: userName,
      username: 'design_kit',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 132 * 60 * 60 * 1000).toISOString(),
      likes: 891,
      shares: 267,
      comments_count: 178,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-11',
      content: `🌟 AI/ML Open Source Project

🤖 Machine Learning Community

Build AI models!

💻 Project: MLToolkit
⭐ 7.8k stars

🎯 Contribute:
• Model implementations
• Training scripts
• Dataset utilities

📧 Collaborate: github.com/mltoolkit

#OpenSource #MachineLearning #AI #Python #DeepLearning #GitHub #Contribute`,
      media_urls: [],
      full_name: userName,
      username: 'ml_toolkit',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 144 * 60 * 60 * 1000).toISOString(),
      likes: 1678,
      shares: 489,
      comments_count: 345,
      repost_of: null,
      is_premium: true
    },
    {
      id: 'opensource-post-12',
      content: `🌟 Web Security Open Source

🔐 Security Tools Community

Build security scanners!

💻 Project: SecureWeb
⭐ 4.9k stars

🎯 Areas:
• Vulnerability scanners
• Encryption tools
• Security audits

📧 Join: security@secureweb.org

#OpenSource #Cybersecurity #WebSecurity #Security #GitHub #Contribute #InfoSec`,
      media_urls: ['https://via.placeholder.com/800x400/ef4444/ffffff?text=Security+Open+Source'],
      full_name: userName,
      username: 'secure_web',
      profile_picture: userAvatar,
      posted_by: userId,
      created_at: new Date(now.getTime() - 156 * 60 * 60 * 1000).toISOString(),
      likes: 1234,
      shares: 378,
      comments_count: 256,
      repost_of: null,
      is_premium: true
    }
  ];
}

export default function PostPage({ onNavigate = () => {} }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [peopleTab, setPeopleTab] = useState("active");
  const [brightOn, setBrightOn] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(false);
  const { socket, isConnected } = useSocket();
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1536);
  const [editingPost, setEditingPost] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [repostingPost, setRepostingPost] = useState(null);
  const [postIdToScroll, setPostIdToScroll] = useState(null);
  const menuRef = useRef(null);

  // Load current user and refresh premium status from backend
  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        
        // Refresh user data from backend to get latest premium status
        try {
          const response = await api.get('/users/me');
          if (response.data) {
            const updatedUser = {
              ...parsedUser,
              ...response.data,
              is_premium: response.data.is_premium
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            console.log('✅ User premium status refreshed:', updatedUser.is_premium);
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
      
      // Fetch posts after user data is loaded
      await fetchPosts();
    };
    
    loadUserData();
  }, []);

  const fetchPosts = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching posts... (attempt', retryCount + 1, ')');
      
      // Try to load cached posts first
      const cachedPosts = localStorage.getItem('cached_posts');
      const cachedTimestamp = localStorage.getItem('cached_posts_timestamp');
      const cacheAge = cachedTimestamp ? Date.now() - parseInt(cachedTimestamp) : Infinity;
      const cacheMaxAge = 60 * 60 * 1000; // 1 hour
      
      if (cachedPosts && retryCount === 0 && cacheAge < cacheMaxAge) {
        try {
          const parsed = JSON.parse(cachedPosts);
          console.log('📦 Loading cached posts:', parsed.length, '(age:', Math.round(cacheAge / 1000 / 60), 'min)');
          setPosts(parsed);
        } catch (e) {
          console.warn('Failed to parse cached posts');
          localStorage.removeItem('cached_posts');
          localStorage.removeItem('cached_posts_timestamp');
        }
      } else if (cacheAge >= cacheMaxAge) {
        console.log('🗑️ Cache expired, clearing...');
        localStorage.removeItem('cached_posts');
        localStorage.removeItem('cached_posts_timestamp');
      }
      
      // Wait for auth token to be ready
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.warn('⚠️ No auth token found, waiting...');
        if (retryCount < 3) {
          setTimeout(() => fetchPosts(retryCount + 1), 1000);
          return;
        }
      }
      
      const response = await getAllPosts();
      const serverPosts = response.data.posts || [];
      console.log('✅ Posts fetched from server:', serverPosts.length, 'posts');
      
      // Always add demo job posts for hashtag searches
      console.log('🎯 Generating demo job posts with currentUser:', currentUser);
      const demoJobPosts = generateDemoJobPosts(currentUser);
      console.log('✅ Demo job posts generated:', demoJobPosts.length, 'posts');
      const allPosts = [...serverPosts, ...demoJobPosts];
      
      if (serverPosts.length > 0) {
        const breakdown = serverPosts.reduce((acc, p) => {
          acc[p.posted_by] = (acc[p.posted_by] || 0) + 1;
          return acc;
        }, {});
        console.log('Posts by user:', breakdown);
      }
      
      console.log('📝 Total posts (server + demo jobs):', allPosts.length, '(', serverPosts.length, 'server +', demoJobPosts.length, 'demo)');
      console.log('📋 All posts IDs:', allPosts.map(p => p.id || p.post_id));
      
      // Cache posts in browser localStorage (fast access on reload)
      localStorage.setItem('cached_posts', JSON.stringify(allPosts));
      localStorage.setItem('cached_posts_timestamp', Date.now().toString());
      console.log('💾 Posts cached in browser for fast reload');
      
      setPosts(allPosts);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      console.error('Error details:', error.response?.data);
      
      // Retry logic for network errors
      if (error.code === 'ERR_NETWORK' && retryCount < 3) {
        console.log('🔄 Retrying in 2 seconds...');
        setTimeout(() => fetchPosts(retryCount + 1), 2000);
      } else {
        setLoading(false);
        // Keep cached posts on error
        console.log('Keeping cached posts due to error');
      }
    }
  };

  // Initialize CSS vars on mount (light teal accent, default text colors) and set dim mode
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-main", "#70B2B2");
    document.documentElement.style.setProperty("--text-base-color", "#ffffff");
    document.documentElement.style.setProperty("--text-muted-color", "#94a3b8");
    
    // Set initial dim mode
    document.documentElement.style.setProperty("--ui-brightness", "0.85");
    document.documentElement.classList.remove("theme-light");
    document.documentElement.classList.add("force-black");

    // Handle window resize for sidebar width
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1536);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch active users
  const fetchActiveUsers = async () => {
    try {
      setLoadingActiveUsers(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await api.get('/active-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setActiveUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoadingActiveUsers(false);
    }
  };

  // Fetch active users on mount and when tab changes to "active"
  useEffect(() => {
    if (peopleTab === 'active') {
      fetchActiveUsers();
    }
  }, [peopleTab]);

  // Socket.io listeners for real-time presence updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // When a user comes online
    socket.on('user:online', ({ userId, online }) => {
      console.log('🟢 User came online:', userId);
      fetchActiveUsers(); // Refresh the list
    });

    // When a user goes offline
    socket.on('user:offline', ({ userId, online }) => {
      console.log('🔴 User went offline:', userId);
      fetchActiveUsers(); // Refresh the list
    });

    return () => {
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket, isConnected]);

  // Scroll to specific post when postIdToScroll is set
  useEffect(() => {
    if (postIdToScroll && posts.length > 0) {
      // Wait a bit longer for view to fully render
      const timer = setTimeout(() => {
        const postElement = document.getElementById(`post-${postIdToScroll}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the post briefly
          postElement.style.backgroundColor = 'rgba(4, 95, 95, 0.2)';
          postElement.style.transition = 'background-color 0.3s ease';
          setTimeout(() => {
            postElement.style.backgroundColor = '';
          }, 2000);
        } else {
          console.log('Post element not found:', `post-${postIdToScroll}`);
        }
        setPostIdToScroll(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [postIdToScroll, posts]);

  async function handleNewPost(postData) {
    try {
      const response = await createPost({
        content: postData.text || '',
        media_urls: postData.media_urls || []
      });
      
      // Add new post to the top of the list
      if (response.data && response.data.post) {
        const newPosts = [response.data.post, ...posts];
        setPosts(newPosts);
        // Update cache
        localStorage.setItem('cached_posts', JSON.stringify(newPosts));
        localStorage.setItem('cached_posts_timestamp', Date.now().toString());
        console.log('✅ Post created and saved to PostgreSQL + cached locally');
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('Error response:', error.response?.data);
      
      // Check if verification is required
      if (error.response?.data?.requiresVerification) {
        alert('⚠️ Account Verification Required\n\nYou must verify your account before creating posts.\n\nPlease go to your Profile and complete ID verification in the Edit Profile section.');
      } else {
        alert(`Failed to create post. ${error.response?.data?.error || error.message || 'Please try again.'}`);
      }
    }
  }

  async function handleUpdatePost(updatedPost) {
    try {
      const response = await updatePost(updatedPost.id, {
        content: updatedPost.text || '',
        media_urls: updatedPost.media_urls || []
      });
      
      // Update the post in the list
      if (response.data && response.data.post) {
        const updatedPosts = posts.map(p => p.id === updatedPost.id ? response.data.post : p);
        setPosts(updatedPosts);
        // Update cache
        localStorage.setItem('cached_posts', JSON.stringify(updatedPosts));
        localStorage.setItem('cached_posts_timestamp', Date.now().toString());
      }
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  }

  // Explore-like search behavior
  const normalizedQuery = (typeof query === "string" ? query : "")
    .trim()
    .toLowerCase();
  const showResults = isSearching && normalizedQuery.length > 0;
  
  console.log('🔍 Search state:', { isSearching, query, normalizedQuery, showResults, totalPosts: posts.length });
  
  // Filter posts based on search query
  let filteredPosts = showResults
    ? posts.filter((p) => {
        const txt = (p.text || "").toLowerCase();
        const content = (p.content || "").toLowerCase(); // Check content field too
        const author = (p.author?.name || "").toLowerCase();
        const fullName = (p.full_name || "").toLowerCase();
        const q = normalizedQuery.startsWith("#")
          ? normalizedQuery.slice(1)
          : normalizedQuery;
        const matches = (
          txt.includes(normalizedQuery) ||
          txt.includes(`#${q}`) ||
          content.includes(normalizedQuery) ||
          content.includes(`#${q}`) ||
          author.includes(normalizedQuery) ||
          fullName.includes(normalizedQuery)
        );
        return matches;
      })
    : posts;
  
  console.log('📊 Filtered posts:', filteredPosts.length, 'of', posts.length);
  
  // Sort job posts to appear at top when searching for job-related hashtags
  if (showResults && (normalizedQuery.includes('job') || normalizedQuery.includes('internship') || normalizedQuery.includes('freelance'))) {
    filteredPosts = [...filteredPosts].sort((a, b) => {
      const aIsJob = (a.id || '').startsWith('job-post-');
      const bIsJob = (b.id || '').startsWith('job-post-');
      if (aIsJob && !bIsJob) return -1;
      if (!aIsJob && bIsJob) return 1;
      return 0;
    });
    console.log('📌 Job posts sorted to top');
  }

  // Relative time like X.com (e.g., 5s, 2m, 1h, 3d)
  function formatRelativeTime(iso) {
    if (!iso) return 'just now';
    const now = Date.now();
    const t = new Date(iso).getTime();
    if (isNaN(t)) return 'just now'; // Handle invalid dates
    const diff = Math.max(0, now - t);
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  }

  function formatCount(n = 0) {
    if (n < 1000) return `${n}`;
    if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
    return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`;
  }

  async function toggleLike(id) {
    try {
      const response = await toggleLikeAPI(id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            user_liked: response.data.liked,
            likes_count: response.data.likesCount,
          };
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  async function toggleRepost(post) {
    setRepostingPost(post);
    setEditingPost(null);
    // Scroll to post composer smoothly
    setTimeout(() => {
      const composer = document.getElementById('post-composer');
      if (composer) {
        composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus on textarea after scroll
        setTimeout(() => {
          const textarea = composer.querySelector('textarea');
          if (textarea) textarea.focus();
        }, 500);
      } else {
        // Fallback to top if composer not found
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  const handleRepost = async (postId, responseData) => {
    // Update the share count on the original post
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          user_shared: responseData.shared,
          shares_count: responseData.sharesCount,
        };
      })
    );
    
    // If this was a share (not unshare), add the new repost to the top of the list
    if (responseData.shared && responseData.repost) {
      const newPosts = [responseData.repost, ...posts];
      setPosts(newPosts);
      // Update cache
      localStorage.setItem('cached_posts', JSON.stringify(newPosts));
      localStorage.setItem('cached_posts_timestamp', Date.now().toString());
    }
    
    // Clear the reposting state
    setRepostingPost(null);
  };

  const scrollToPost = (postId) => {
    // Find the post element and scroll to it
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the post briefly
      postElement.classList.add('ring-2', 'ring-[#045F5F]', 'ring-opacity-50');
      setTimeout(() => {
        postElement.classList.remove('ring-2', 'ring-[#045F5F]', 'ring-opacity-50');
      }, 2000);
    }
  };

  async function toggleAccept(id) {
    try {
      console.log('🔄 Attempting to accept post:', id);
      const response = await acceptPostAPI(id);
      
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            accepted: true,
            rejected: false,
          };
        })
      );
      
      console.log('✅ Post accepted successfully:', response.data);
    } catch (error) {
      console.error('❌ Error accepting post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Show more detailed error
      const errorMsg = error.response?.data?.error || error.message || 'Failed to accept post. Please try again.';
      alert(errorMsg);
    }
  }

  async function toggleReject(id) {
    try {
      console.log('🔄 Attempting to reject post:', id);
      const response = await rejectPostAPI(id);
      
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            rejected: true,
            accepted: false,
          };
        })
      );
      
      console.log('✅ Post rejected successfully:', response.data);
    } catch (error) {
      console.error('❌ Error rejecting post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Show more detailed error
      const errorMsg = error.response?.data?.error || error.message || 'Failed to reject post. Please try again.';
      alert(errorMsg);
    }
  }

  function toggleReactPost(id) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reacted: !p.reacted } : p))
    );
  }

  function openDeleteModal(id) {
    setPostToDelete(id);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  }

  async function confirmDelete() {
    if (!postToDelete) return;
    
    try {
      await deletePostAPI(postToDelete);
      const filteredPosts = posts.filter((p) => p.id !== postToDelete);
      setPosts(filteredPosts);
      // Update cache
      localStorage.setItem('cached_posts', JSON.stringify(filteredPosts));
      localStorage.setItem('cached_posts_timestamp', Date.now().toString());
      setDeleteModalOpen(false);
      setPostToDelete(null);
      
      // Show success feedback
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      message.innerHTML = '✓ Post deleted successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Show error feedback
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      message.innerHTML = '✗ Failed to delete post. Please try again.';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  }

  function openImageViewer(images, startIndex) {
    const imageUrls = images.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    if (imageUrls.length === 0) return;
    
    // Find the correct index in the filtered image array
    const clickedImage = images[startIndex];
    const actualIndex = imageUrls.findIndex(url => url === clickedImage);
    
    setCurrentImages(imageUrls);
    setCurrentImageIndex(actualIndex >= 0 ? actualIndex : 0);
    setImageViewerOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeImageViewer() {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset'; // Restore scrolling
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  }

  function previousImage() {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  }

  function downloadCurrentImage() {
    const url = currentImages[currentImageIndex];
    const fileName = url.split('/').pop();
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch(err => {
        console.error('Download error:', err);
        window.open(url, '_blank');
      });
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!imageViewerOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setImageViewerOpen(false);
        setCurrentImages([]);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'unset';
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageViewerOpen, currentImages.length]);

  function handleNav(key) {
    if (key === "jobs") {
      setIsSearching(true);
      setCurrentView("home");
      return;
    }
    // Update current view based on sidebar navigation
    setCurrentView(key);
  }

  return (
    <div className={`w-full h-screen overflow-hidden transition-colors duration-300 ${brightOn ? 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50' : 'bg-black'}`}>
      <div className="max-w-[1400px] h-full mx-auto flex relative">
        {/* Fixed Left Sidebar - hidden on mobile, compact on xl-2xl, full on 2xl+ */}
        <aside className="hidden xl:block xl:w-[88px] 2xl:w-[275px] fixed left-[max(0px,calc((100vw-1400px)/2))] top-0 h-screen z-30 transition-all duration-300 xl:ml-[-10px] 2xl:ml-[-17px]">
          <div className="h-full flex justify-end xl:pr-2 2xl:pr-3">
            <div className="w-full xl:max-w-[70px] 2xl:max-w-[255px]">
              <Sidebar
                onNavigate={(k) => {
                  handleNav(k);
                  onNavigate(k);
                }}
                brightOn={brightOn}
              />
            </div>
          </div>
        </aside>

        {/* Main content area - Full width when not on home, normal width on home */}
        <div className={`w-full mx-auto px-0 h-screen overflow-y-auto transition-all duration-300 scrollbar-hide ${
          brightOn ? '' : 'bg-black'
        } ${
          currentView === "home" 
            ? "xl:w-[750px] xl:ml-[108px] 2xl:ml-[295px]" 
            : "xl:w-[calc(100%-88px)] xl:ml-[88px] 2xl:w-[calc(100%-275px)] 2xl:ml-[275px]"
        }`}>
        
        {/* Conditional rendering based on currentView */}
        {currentView === "profile" && (
          <Profile onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "messages" && (
          <Messages 
            onBack={() => {
              setCurrentView("home");
              setSelectedConversation(null);
            }}
            initialConversation={selectedConversation}
            onViewProfile={(userId) => {
              setViewingUserId(userId);
              setCurrentView("userProfile");
            }}
          />
        )}
        
        {currentView === "notifications" && (
          <Notifications 
            onBack={(postId) => {
              setCurrentView("home");
              if (postId) {
                setPostIdToScroll(postId);
              }
            }} 
            onViewProfile={(userId) => {
              setViewingUserId(userId);
              setCurrentView("userProfile");
            }}
          />
        )}
        
        {currentView === "communities" && (
          <Communities onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "jobs" && (
          <JobSearch />
        )}
        
        {currentView === "premium" && (
          <Premium onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "payments" && (
          <Payments onBack={() => setCurrentView("home")} />
        )}
        
        {currentView === "userProfile" && viewingUserId && (
          <UserProfile 
            userId={viewingUserId} 
            onBack={(postId) => {
              setCurrentView("home");
              setViewingUserId(null);
              if (postId) {
                setPostIdToScroll(postId);
              }
            }}
            onMessageClick={(conversationId, receiverInfo) => {
              console.log('Message clicked, conversation:', conversationId, 'receiver:', receiverInfo);
              setSelectedConversation(receiverInfo);
              setCurrentView("messages");
              setViewingUserId(null);
            }}
          />
        )}
        
        {/* Home view - Default post feed */}
        {currentView === "home" && (
          <>
  <div className="border-b border-white/10"></div>

        <section className="pt-0">
          {/* Sticky search bar with transparent background - Properly aligned */}
          <div className={`sticky top-0 z-20 backdrop-blur-sm transition-all duration-300 ${
            isSearching ? (brightOn ? 'bg-[#033E3E]/95' : 'bg-[#040720]/95') : 'bg-transparent'
          }`}>
            <div 
              className={`flex items-center gap-3 px-3 py-3.5 transition-all duration-300 border-b ${
                brightOn ? 'border-gray-300 bg-white shadow-md' : 'border-[#045F5F] bg-black'
              }`}
            >
              <i className={`fi fi-br-search text-xl transition-colors duration-300 ${
                brightOn ? 'text-teal-600' : 'text-blue-400'
              }`}></i>
              <input
                value={query}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setQuery(e.target.value)}
                className={`search-input flex-1 bg-transparent outline-none text-lg font-semibold transition-colors duration-300 ${
                  brightOn ? 'text-gray-900 placeholder:text-gray-500' : 'text-white placeholder:text-blue-400/60'
                }`}
                placeholder="Search #Jobs, Communities, People..."
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
              {isSearching && (
                <button
                  className="px-4 py-1.5 rounded-full bg-primary-teal hover:bg-primary-blue text-white text-sm font-semibold transition-colors"
                  onClick={() => { setIsSearching(false); setQuery(""); }}
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.currentTarget.style.outline = 'none'}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Status composer is hidden while searching */}
          {!isSearching && <PostComposer onPost={handleNewPost} onEdit={handleUpdatePost} editingPost={editingPost} repostingPost={repostingPost} onCancelRepost={() => setRepostingPost(null)} onRepost={handleRepost} brightOn={brightOn} />}

          {/* Divider after composer or under sticky search */}
          <div className={`transition-colors duration-300 ${
            brightOn ? 'border-b border-gray-200' : 'border-b border-white/10'
          }`}></div>

          {/* Explore mode: show recommendations when searching */}
          {isSearching && !showResults && (
            <div className="mt-0">
              <div className="pl-6 pr-4 py-4">
                <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
                  brightOn ? 'text-gray-900' : 'text-white'
                }`}>
                  Recommended Communities
                </h3>
                <div className="rounded-2xl overflow-hidden">
                  {[
                    { area: "Campus", title: "#Jobs", posts: "12.4k" },
                    { area: "Campus", title: "#Internships", posts: "8,103" },
                    { area: "Technology", title: "#React", posts: "28.1k" },
                    { area: "Remote", title: "#Freelance", posts: "6,980" },
                    { area: "Learning", title: "#OpenSource", posts: "14.7k" },
                  ].map((t, i, arr) => (
                    <button
                      key={t.title}
                      onClick={() => { 
                        setQuery(t.title); 
                        setIsSearching(true);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        brightOn ? 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 active:from-teal-100 active:to-blue-100' : 'hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        brightOn ? 'text-gray-600' : 'text-text-muted'
                      }`}>
                        Trending in {t.area}
                      </div>
                      <div className={`font-bold text-base transition-colors duration-300 mt-0.5 ${
                        brightOn ? 'text-gray-900' : 'text-white'
                      }`}>{t.title}</div>
                      <div className={`text-xs font-medium transition-colors duration-300 mt-0.5 ${
                        brightOn ? 'text-gray-600' : 'text-text-muted'
                      }`}>
                        {t.posts} posts
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results list when a query is present */}
          <div className="mt-0">
            {showResults && filteredPosts.length === 0 && (
              <div className="p-10 text-center">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed mb-3 transition-colors duration-300 ${
                  brightOn ? 'border-gray-300' : 'border-text-muted'
                }`}>
                  <i className="fa-regular fa-face-frown" />
                </div>
                <div className={`font-semibold transition-colors duration-300 ${
                  brightOn ? 'text-gray-900' : 'text-white'
                }`}>No results</div>
                <div className={`text-sm transition-colors duration-300 ${
                  brightOn ? 'text-gray-400' : 'text-text-muted'
                }`}>
                  Try a different keyword or hashtag.
                </div>
              </div>
            )}
            {loading ? (
              <div className="p-10 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-teal border-t-transparent mb-4"></div>
                <div className="text-white text-lg font-semibold">Loading posts...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-white text-lg">No posts available</div>
                <div className="text-gray-400 text-sm mt-2">Be the first to create a post!</div>
              </div>
            ) : filteredPosts.map((p, index) => {
              const avatarLetter = p.full_name ? p.full_name[0].toUpperCase() : "U";
              const isCurrentUserPost = currentUser && p.posted_by === currentUser.id;
              
              return (
                <div
                  key={p.id}
                  id={`post-${p.id}`}
                  className={`mb-2 transition-all duration-300 border overflow-hidden rounded-2xl ${
                    brightOn ? 'border-gray-200/50 bg-white shadow-md hover:shadow-xl' : 'border-[#045F5F] bg-black'
                  }`}
                >
                  <article className={`px-6 sm:px-8 py-5 sm:py-6 transition-all duration-200 ${
                    brightOn ? 'bg-white hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50' : 'bg-black hover:bg-gray-900/40'
                  }`}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <button
                        onClick={() => {
                          // If it's the current user's post, go to profile page
                          if (p.posted_by === currentUser?.id) {
                            setCurrentView("profile");
                          } else {
                            setViewingUserId(p.posted_by);
                            setCurrentView("userProfile");
                          }
                        }}
                        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {p.profile_picture ? (
                          <img
                            src={p.profile_picture}
                            alt={p.full_name}
                            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-md ring-2 ${
                              (p.id || '').startsWith('job-post-') 
                                ? 'ring-blue-500/50' 
                                : 'ring-primary-teal/20'
                            }`}
                          />
                        ) : (
                          <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-md ring-2 ${
                            (p.id || '').startsWith('job-post-') 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-blue-500/50' 
                              : 'bg-gradient-to-br from-primary-teal to-blue-500 ring-primary-teal/20'
                          }`}>
                            {avatarLetter}
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 leading-tight flex-wrap">
                              {/* Job post badge */}
                              {(p.id || '').startsWith('job-post-') && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                                  <i className="fa-solid fa-briefcase text-[10px]"></i>
                                  Job
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  // If it's the current user's post, go to profile page
                                  if (p.posted_by === currentUser?.id) {
                                    setCurrentView("profile");
                                  } else {
                                    setViewingUserId(p.posted_by);
                                    setCurrentView("userProfile");
                                  }
                                }}
                                className={`font-bold text-[15px] sm:text-[17px] transition-colors duration-300 hover:underline cursor-pointer ${
                                  brightOn ? 'text-gray-900 hover:text-primary-teal' : 'text-white hover:text-primary-teal'
                                }`}
                              >
                                {p.full_name || "Unknown"}
                              </button>
                              <span className={`text-xs sm:text-sm truncate transition-colors duration-300 ${
                                brightOn ? 'text-slate-500' : 'text-gray-400'
                              }`}>
                                @{p.username || "unknown"}
                              </span>
                              <span className={`hidden sm:inline transition-colors duration-300 ${
                                brightOn ? 'text-gray-400' : 'text-gray-400'
                              }`}>•</span>
                              <button
                                onClick={() => {
                                  const fullDate = p.created_at || p.createdAt;
                                  const formattedDate = new Date(fullDate).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                  alert(`Posted: ${formattedDate}`);
                                }}
                                className={`text-xs sm:text-sm hover:underline hidden sm:inline transition-colors duration-300 cursor-pointer ${
                                  brightOn ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                                }`}
                                title="Click to see full date"
                              >
                                {formatRelativeTime(p.created_at || p.createdAt)}
                              </button>
                            </div>
                          </div>
                          <div className="relative" ref={openMenuId === p.id ? menuRef : null}>
                            {/* Delete button for own posts - X.com style */}
                            {isCurrentUserPost ? (
                              <button
                                onClick={() => openDeleteModal(p.id)}
                                className={`group shrink-0 rounded-full p-2 transition-all duration-200 ${
                                  brightOn 
                                    ? 'hover:bg-red-500/10' 
                                    : 'hover:bg-red-500/10'
                                }`}
                                aria-label="Delete post"
                                title="Delete post"
                              >
                                <i className="fa-solid fa-trash text-sm text-gray-500 group-hover:text-red-500 transition-colors duration-200" />
                              </button>
                            ) : (
                              /* Three dot menu for other users' posts */
                              <>
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                                  className={`shrink-0 rounded-full p-2 transition-all duration-300 ${
                                    openMenuId === p.id 
                                      ? 'bg-primary-teal/20 text-primary-teal' 
                                      : brightOn ? 'text-gray-500 hover:text-teal-600 hover:bg-gray-100' : 'text-text-muted hover:text-white hover:bg-white/5'
                                  }`}
                                  aria-label="More options"
                                >
                                  <i className="fa-solid fa-ellipsis" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openMenuId === p.id && (
                                  <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl overflow-hidden z-50 border transition-colors duration-300 ${
                                    brightOn ? 'bg-white border-gray-200 shadow-teal-100' : 'bg-gray-900 border-white/10'
                                  }`}>
                                    <button
                                      onClick={() => {
                                        // Save post to local storage
                                        const savedPosts = JSON.parse(localStorage.getItem('saved_posts') || '[]');
                                        const isAlreadySaved = savedPosts.some(sp => sp.id === p.id);
                                        
                                        if (isAlreadySaved) {
                                          // Remove from saved
                                          const filtered = savedPosts.filter(sp => sp.id !== p.id);
                                          localStorage.setItem('saved_posts', JSON.stringify(filtered));
                                          alert('Post removed from saved posts');
                                        } else {
                                          // Add to saved
                                          savedPosts.push(p);
                                          localStorage.setItem('saved_posts', JSON.stringify(savedPosts));
                                          alert('Post saved successfully! ✅');
                                        }
                                        setOpenMenuId(null);
                                      }}
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 ${
                                        brightOn ? 'text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50' : 'text-white hover:bg-white/10'
                                      }`}
                                    >
                                      <i className="fi fi-br-bookmark text-lg"></i>
                                      <span className="font-semibold">
                                        {JSON.parse(localStorage.getItem('saved_posts') || '[]').some(sp => sp.id === p.id) ? 'Unsave Post' : 'Save Post'}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reasons = [
                                          'Spam',
                                          'Harassment or Bullying',
                                          'Inappropriate Content',
                                          'False Information',
                                          'Violence or Dangerous Content',
                                          'Hate Speech',
                                          'Other'
                                        ];
                                        
                                        const reason = prompt('Why are you reporting this post?\n\n' + reasons.map((r, i) => `${i + 1}. ${r}`).join('\n') + '\n\nEnter the number (1-7):');
                                        
                                        if (reason && parseInt(reason) >= 1 && parseInt(reason) <= 7) {
                                          const selectedReason = reasons[parseInt(reason) - 1];
                                          // Store report locally (in production, send to backend)
                                          const reports = JSON.parse(localStorage.getItem('post_reports') || '[]');
                                          reports.push({
                                            postId: p.id,
                                            postAuthor: p.full_name,
                                            reason: selectedReason,
                                            reportedBy: user?.id,
                                            reportedAt: new Date().toISOString()
                                          });
                                          localStorage.setItem('post_reports', JSON.stringify(reports));
                                          alert(`Thank you for reporting. We'll review this post for: ${selectedReason}`);
                                        } else if (reason !== null) {
                                          alert('Invalid selection. Please try again.');
                                        }
                                        setOpenMenuId(null);
                                      }}
                                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-300 border-t ${
                                        brightOn 
                                          ? 'text-rose-400 hover:bg-rose-500/10 border-white/10' 
                                          : 'text-rose-400 hover:bg-rose-500/10 border-white/10'
                                      }`}
                                    >
                                      <i className="fi fi-br-flag text-lg"></i>
                                      <span className="font-semibold">Report Post</span>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Repost indicator */}
                        {p.repost_of && (
                          <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                            brightOn ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            <i className="fi fi-br-refresh text-[#00ba7c]"></i>
                            <span className={brightOn ? 'text-gray-700' : 'text-gray-400'}>
                              {p.full_name} reposted
                            </span>
                          </div>
                        )}

                        {/* User's repost comment */}
                        {p.repost_of && p.content && (
                          <div className={`mt-2 leading-[1.6] whitespace-pre-wrap font-medium text-[15px] sm:text-[17px] break-words transition-colors duration-300 ${
                            brightOn ? 'text-black' : 'text-white'
                          }`}>
                            {p.content}
                          </div>
                        )}

                        {/* Original post preview for reposts - Click to view full post */}
                        {p.original_post && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToPost(p.original_post.id);
                            }}
                            className={`mt-3 border-l-2 pl-4 transition-all duration-300 cursor-pointer hover:border-[#89CFF0] hover:pl-5 group ${
                              brightOn ? 'border-gray-300' : 'border-[#045F5F]'
                            }`}
                          >
                            <div className={`rounded-xl p-4 border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                              brightOn ? 'bg-[#1E293B] border-white/20 hover:bg-[#1E293B]/90 hover:border-[#89CFF0]' : 'bg-gray-800/30 border-[#045F5F]/30 hover:bg-gray-800/60 hover:border-[#045F5F]'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {p.original_post.profile_picture ? (
                                    <img
                                      src={p.original_post.profile_picture}
                                      alt={p.original_post.full_name}
                                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#045F5F]/20"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#045F5F] to-[#89CFF0] flex items-center justify-center text-white font-bold text-xs">
                                      {p.original_post.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <p className={`font-semibold text-sm ${brightOn ? 'text-white' : 'text-white'}`}>
                                      {p.original_post.full_name}
                                    </p>
                                    <p className="text-gray-500 text-xs">@{p.original_post.username}</p>
                                  </div>
                                </div>
                                {/* Click indicator */}
                                <div className="text-gray-500 group-hover:text-[#89CFF0] transition-colors duration-200">
                                  <i className="fi fi-rr-arrow-up-right text-sm"></i>
                                </div>
                              </div>
                              {p.original_post.content && (
                                <p className={`text-sm ${brightOn ? 'text-gray-300' : 'text-gray-300'}`}>
                                  {p.original_post.content}
                                </p>
                              )}
                              {p.original_post.media_urls && p.original_post.media_urls.length > 0 && (
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  {p.original_post.media_urls.slice(0, 2).map((url, i) => {
                                    const isImage = url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                    if (isImage) {
                                      return (
                                        <img
                                          key={i}
                                          src={url}
                                          alt=""
                                          className="w-20 h-20 object-cover rounded-lg"
                                        />
                                      );
                                    }
                                    return null;
                                  })}
                                  {p.original_post.media_urls.length > 2 && (
                                    <div className="w-20 h-20 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                      +{p.original_post.media_urls.length - 2}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Regular post content (only for non-reposts) */}
                        {!p.repost_of && (
                          <div className={`mt-2 leading-[1.6] whitespace-pre-wrap font-medium text-[15px] sm:text-[17px] break-words transition-colors duration-300 ${
                            brightOn ? 'text-black' : 'text-white'
                          }`}>
                            {p.content}
                          </div>
                        )}

                        {/* Regular post media (only for non-reposts) */}
                        {!p.repost_of && p.media_urls && p.media_urls.length > 0 && (
                          <div
                            className={`mt-3 grid ${
                              p.media_urls.length === 1
                                ? "grid-cols-1"
                                : p.media_urls.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2"
                            } gap-2`}
                          >
                            {p.media_urls.map((url, i) => {
                              if (!url) return null;
                              
                              const count = p.media_urls.length;
                              const isFirstLarge = count === 3 && i === 0;
                              const itemClass = isFirstLarge ? "col-span-2" : "";
                              
                              // Check if it's an image
                              const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                              
                              if (isImage) {
                                const imgHeight =
                                  count === 1 ? "h-96" : count === 2 ? "h-64" : isFirstLarge ? "h-80" : "h-48";
                                
                                return (
                                  <div
                                    key={i}
                                    className={`rounded-xl overflow-hidden border relative group cursor-pointer ${
                                      brightOn ? 'border-white/20 bg-[#1E293B]' : 'border-primary-teal/20 bg-gray-800/30'
                                    } ${itemClass}`}
                                    onClick={() => openImageViewer(p.media_urls, i)}
                                  >
                                    <img
                                      src={url}
                                      alt=""
                                      className={`object-cover w-full ${imgHeight} hover:scale-105 transition-transform duration-300`}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
                                      }}
                                    />
                                  </div>
                                );
                              } else {
                                // File attachment
                                const fileName = url.split('/').pop();
                                const fileExt = fileName.split('.').pop().toLowerCase();
                                
                                // Get appropriate icon based on file type
                                let fileIcon = '📎';
                                let fileColor = brightOn ? 'bg-white/10' : 'bg-primary-teal/10';
                                
                                if (['pdf'].includes(fileExt)) {
                                  fileIcon = '📄';
                                  fileColor = 'bg-red-500/20 text-red-400';
                                } else if (['doc', 'docx', 'odt', 'rtf'].includes(fileExt)) {
                                  fileIcon = '📝';
                                  fileColor = 'bg-blue-500/20 text-blue-400';
                                } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
                                  fileIcon = '📊';
                                  fileColor = 'bg-green-500/20 text-green-400';
                                } else if (['ppt', 'pptx'].includes(fileExt)) {
                                  fileIcon = '📽️';
                                  fileColor = 'bg-orange-500/20 text-orange-400';
                                } else if (['zip', 'rar', '7z'].includes(fileExt)) {
                                  fileIcon = '📦';
                                  fileColor = 'bg-yellow-500/20 text-yellow-400';
                                } else if (['txt'].includes(fileExt)) {
                                  fileIcon = '📃';
                                  fileColor = 'bg-gray-500/20 text-gray-400';
                                }
                                
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                      brightOn 
                                        ? 'border-white/20 bg-[#1E293B]' 
                                        : 'border-primary-teal/20 bg-gray-800/30'
                                    } ${itemClass}`}
                                  >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                                      fileColor
                                    }`}>
                                      {fileIcon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-semibold truncate transition-colors duration-300 text-sm ${
                                        brightOn ? 'text-white' : 'text-white'
                                      }`}>
                                        {fileName}
                                      </div>
                                      <div className={`text-xs mt-0.5 transition-colors duration-300 ${
                                        brightOn ? 'text-[#008B8B]' : 'text-primary-teal'
                                      }`}>
                                        {fileExt.toUpperCase()} File
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Download Button */}
                                      <a
                                        href={url}
                                        download={fileName}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Force download for all file types
                                          fetch(url)
                                            .then(response => response.blob())
                                            .then(blob => {
                                              const downloadUrl = window.URL.createObjectURL(blob);
                                              const link = document.createElement('a');
                                              link.href = downloadUrl;
                                              link.download = fileName;
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                              window.URL.revokeObjectURL(downloadUrl);
                                            })
                                            .catch(err => {
                                              console.error('Download error:', err);
                                              // Fallback to direct download
                                              window.open(url, '_blank');
                                            });
                                        }}
                                        className={`p-2.5 rounded-lg transition-all hover:scale-110 cursor-pointer ${
                                          brightOn 
                                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                                            : 'bg-primary-teal/20 hover:bg-primary-teal/30 text-primary-teal'
                                        }`}
                                        title={`Download ${fileName}`}
                                      >
                                        <i className="fas fa-download text-sm" />
                                      </a>
                                      {/* Open in New Tab Button */}
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`p-2.5 rounded-lg transition-all hover:scale-110 ${
                                          brightOn 
                                            ? 'bg-white/10 hover:bg-white/20 text-white' 
                                            : 'bg-primary-teal/20 hover:bg-primary-teal/30 text-primary-teal'
                                        }`}
                                        title="Open in new tab"
                                      >
                                        <i className="fas fa-external-link-alt text-sm" />
                                      </a>
                                    </div>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                        {/* Action buttons row with full-width divider */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                          <div className="flex items-center gap-2">
                            {/* Sup button (hang loose hand) */}
                            <button
                              onClick={() => {
                                toggleLike(p.id);
                                // Add animation feedback
                                const button = event.currentTarget;
                                button.classList.add('scale-110');
                                setTimeout(() => button.classList.remove('scale-110'), 200);
                              }}
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                                p.user_liked
                                  ? "text-[#89CFF0] bg-[#89CFF0]/10"
                                  : `transition-colors duration-300 ${
                                      brightOn ? 'text-gray-500 hover:text-[#89CFF0] hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50' : 'text-text-muted hover:text-[#89CFF0]'
                                    } hover:bg-[#89CFF0]/10`
                              }`}
                              title="Sup"
                            >
                              <span className="text-[18px] transition-transform" style={{ filter: p.user_liked ? 'sepia(1) saturate(5) hue-rotate(160deg) brightness(1.1)' : 'grayscale(1)' }}>🤙</span>
                              <span className="text-sm font-semibold">{parseInt(p.likes_count) || 0}</span>
                            </button>

                            {/* Repost button */}
                            <button
                              onClick={() => {
                                // Allow reposting any post, including reposts
                                toggleRepost(p);
                              }}
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                                p.user_shared
                                  ? "text-[#00ba7c] bg-[#00ba7c]/10"
                                  : `transition-colors duration-300 ${
                                      brightOn ? 'text-gray-500 hover:text-[#00ba7c] hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50' : 'text-text-muted hover:text-[#00ba7c]'
                                    } hover:bg-[#00ba7c]/10`
                              }`}
                              title="Repost"
                            >
                              <i className="fi fi-br-refresh text-[18px]" />
                              <span className="text-sm font-semibold">{parseInt(p.shares_count) || 0}</span>
                            </button>

                            {/* Send button */}
                            <button
                              onClick={() => {
                                setCurrentView('messages');
                                // If not own post, set the conversation with the post author
                                if (!isCurrentUserPost) {
                                  setSelectedConversation({
                                    id: p.posted_by,
                                    firebase_uid: p.firebase_uid,
                                    full_name: p.full_name,
                                    username: p.username,
                                    profile_picture: p.profile_picture
                                  });
                                }
                              }}
                              className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all transition-colors duration-300 ${
                                brightOn ? 'text-gray-500 hover:text-[#89CFF0] hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50' : 'text-text-muted hover:text-[#89CFF0]'
                              } hover:bg-[#89CFF0]/10`}
                              title="Send message"
                            >
                              <i className="fi fi-br-paper-plane text-[18px]" />
                              <span className="text-sm font-semibold">Send</span>
                            </button>

                            {/* Edit button - only for user's own posts */}
                            {isCurrentUserPost && (
                              <button
                                onClick={() => {
                                  setEditingPost(p);
                                  setRepostingPost(null); // Clear reposting state when editing
                                  // Scroll to post composer
                                  const composer = document.getElementById('post-composer');
                                  if (composer) {
                                    composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Focus on textarea after a short delay
                                    setTimeout(() => {
                                      const textarea = composer.querySelector('textarea');
                                      if (textarea) textarea.focus();
                                    }, 300);
                                  }
                                }}
                                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all transition-colors duration-300 ${
                                  brightOn ? 'text-gray-400 hover:text-[#89CFF0]' : 'text-text-muted hover:text-[#89CFF0]'
                                } hover:bg-[#89CFF0]/10`}
                                title="Edit"
                              >
                                <i className="fa-solid fa-edit text-[18px]" />
                                <span className="text-sm font-semibold">Edit</span>
                              </button>
                            )}
                          </div>

                          {/* Accept/Reject buttons on the right - only for other users' posts */}
                          {!isCurrentUserPost && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  toggleAccept(p.id);
                                  // Add bounce animation
                                  e.currentTarget.classList.add('animate-bounce');
                                  setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
                                }}
                                className={`flex items-center gap-1.5 px-2 py-1 transition-all font-semibold text-sm transition-colors duration-300 rounded-full ${
                                  p.accepted
                                    ? "text-green-400 bg-green-400/10"
                                    : `${
                                        brightOn ? 'text-gray-400 hover:text-green-400 hover:bg-green-400/10' : 'text-text-muted hover:text-green-400 hover:bg-green-400/10'
                                      }`
                                }`}
                                title="Accept"
                              >
                                <i className={`fa-solid fa-check text-[14px] ${p.accepted ? 'animate-pulse' : ''}`} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to reject this post?')) {
                                    toggleReject(p.id);
                                  }
                                }}
                                className={`flex items-center gap-1.5 px-2 py-1 transition-all font-semibold text-sm transition-colors duration-300 rounded-full ${
                                  p.rejected
                                    ? "text-rose-400 bg-rose-400/10"
                                    : `${
                                        brightOn ? 'text-gray-400 hover:text-rose-400 hover:bg-rose-400/10' : 'text-text-muted hover:text-rose-400 hover:bg-rose-400/10'
                                      }`
                                }`}
                                title="Reject"
                              >
                                <i className="fa-solid fa-xmark text-[14px]" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </section>
        </>
        )}
      </div>
      {/* Right-side rail (xl+): Active Users - Properly aligned with post section */}
      {currentView === "home" && (
      <aside 
        className={`hidden xl:block w-[375px] fixed top-0 h-screen z-30 transition-all duration-300 ${
          brightOn ? 'bg-transparent' : 'brightness-root'
        }`}
        style={{ 
          left: isWideScreen 
            ? 'calc(max(0px, (100vw - 1400px) / 2) + 287.8px + 750px)' 
            : 'calc(max(0px, (100vw - 1400px) / 2) + 100px + 750px)' 
        }}
      >
        <div className="relative h-full pl-12 pr-4 overflow-y-auto scrollbar-hide">
          <div className="sticky top-0 pt-4 space-y-4 max-w-[320px]">
            {/* Theme Toggle: Bright / Dim controls */}
            <div className="bg-transparent p-3 rounded-2xl">
              <div className="flex items-center justify-center">
                <div className={`flex items-center gap-4 rounded-full px-4 py-2.5 border-2 transition-all duration-500 cursor-pointer group ${
                  brightOn
                    ? 'bg-transparent border-gray-300 hover:shadow-lg hover:shadow-teal-200/50 hover:scale-105'
                    : 'bg-transparent border-white/20 hover:shadow-[0_0_30px_rgba(112,178,178,0.3)] hover:scale-105'
                }`}>
                  <i className={`fa-regular fa-moon text-2xl transition-all duration-300 ${
                    !brightOn 
                      ? 'text-primary-teal scale-125 drop-shadow-[0_0_8px_rgba(112,178,178,0.8)]' 
                      : 'text-slate-400 scale-100 group-hover:text-slate-500'
                  }`} />
                  <Switcher8
                    isChecked={brightOn}
                    onChange={() => {
                      const newValue = !brightOn;
                      setBrightOn(newValue);
                      if (newValue) {
                        document.documentElement.style.setProperty(
                          "--ui-brightness",
                          "1"
                        );
                        document.documentElement.classList.add("theme-light");
                        document.documentElement.classList.remove("force-black");
                      } else {
                        document.documentElement.style.setProperty(
                          "--ui-brightness",
                          "0.85"
                        );
                        document.documentElement.classList.remove("theme-light");
                        document.documentElement.classList.add("force-black");
                      }
                    }}
                  />
                  <i className={`fa-regular fa-sun text-2xl transition-all duration-300 ${
                    brightOn 
                      ? 'text-amber-500 scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                      : 'text-slate-500 scale-100 group-hover:text-slate-400'
                  }`} />
                </div>
              </div>
            </div>
            {/* People: Active / Following / Followers */}
            <div className={`p-4 people-tabs rounded-2xl transition-all duration-300 ${
              brightOn 
                ? 'bg-transparent' 
                : 'bg-transparent'
            }`}>
              <div className="flex items-center mb-3">
                <h3 className={`text-lg font-extrabold flex items-center gap-2 transition-colors duration-300 ${
                  brightOn ? 'text-gray-900' : 'text-white'
                }`}>
                  <i className="fa-solid fa-users" />
                  <span>People</span>
                </h3>
              </div>
              <div className={`grid grid-cols-3 gap-1 rounded-full p-0.5 mb-3 w-full transition-colors duration-300 ${
                brightOn ? 'bg-transparent' : 'bg-transparent'
              }`}>
                {[
                  { key: "active", label: "Active" },
                  { key: "following", label: "Following" },
                  { key: "followers", label: "Followers" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setPeopleTab(t.key)}
                    className={`text-xs px-2.5 rounded-full transition-all duration-300 w-full text-center h-8 font-bold ${
                      peopleTab === t.key
                        ? brightOn
                          ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md"
                          : "chip-active"
                        : brightOn
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                          : 'text-text-muted hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {loadingActiveUsers ? (
                  <div className={`flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl transition-colors duration-300 ${
                    brightOn ? 'bg-gradient-to-br from-gray-50 to-blue-50/30 text-gray-600' : 'text-gray-500'
                  }`}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                    <p className="text-xs mt-2">Loading...</p>
                  </div>
                ) : activeUsers.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl transition-colors duration-300 ${
                    brightOn ? 'bg-gradient-to-br from-gray-50 to-blue-50/30 text-gray-600' : 'text-gray-500'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                      brightOn ? 'bg-gradient-to-br from-teal-100 to-blue-100' : 'bg-white/5'
                    }`}>
                      <i className="fa-solid fa-user-group text-2xl text-teal-500" />
                    </div>
                    <p className="text-sm font-semibold">No active users</p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      brightOn ? 'text-gray-500' : 'text-gray-600'
                    }`}>Check back later</p>
                  </div>
                ) : (
                  activeUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setViewingUserId(user.id);
                        setCurrentView("userProfile");
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        brightOn
                          ? 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className={`font-semibold text-sm truncate transition-colors duration-300 ${
                          brightOn ? 'text-gray-900' : 'text-white'
                        }`}>
                          {user.full_name || 'Unknown User'}
                        </p>
                        <p className={`text-xs truncate transition-colors duration-300 ${
                          brightOn ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          @{user.username || 'unknown'}
                        </p>
                        {user.profession && (
                          <p className="text-xs text-teal-500 truncate">
                            {user.profession}
                          </p>
                        )}
                      </div>
                      <i className={`fa-solid fa-circle text-xs ${
                        brightOn ? 'text-green-500' : 'text-green-400'
                      }`} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Sponsor section removed per request */}
          </div>
        </div>
      </aside>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={cancelDelete}
        >
          <div 
            className={`relative w-[90%] max-w-sm rounded-2xl shadow-2xl transition-all duration-200 ${
              brightOn ? 'bg-slate-800' : 'bg-[#1a1a1a]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-trash text-red-500 text-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Delete post?
                  </h3>
                  <p className={`text-sm ${brightOn ? 'text-gray-400' : 'text-gray-500'}`}>
                    This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-3 px-4 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className={`w-full py-3 px-4 rounded-full font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  brightOn 
                    ? 'text-white bg-slate-700 hover:bg-slate-600 focus:ring-slate-500 focus:ring-offset-slate-800' 
                    : 'text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] focus:ring-gray-600 focus:ring-offset-[#1a1a1a]'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewerOpen && currentImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          onClick={closeImageViewer}
        >
          {/* Control buttons in top-right corner */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadCurrentImage();
              }}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center group shadow-lg border border-white/10"
              aria-label="Download"
              title="Download image"
            >
              <i className="fas fa-download text-white text-base group-hover:scale-110 transition-transform" />
            </button>

            {/* Close button */}
            <button
              onClick={closeImageViewer}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-red-500/80 backdrop-blur-md transition-all flex items-center justify-center group shadow-lg border border-white/10"
              aria-label="Close"
              title="Close viewer"
            >
              <i className="fas fa-times text-white text-xl group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Image counter */}
          {currentImages.length > 1 && (
            <div className="absolute top-6 left-6 z-20 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-semibold shadow-lg border border-white/10">
              {currentImageIndex + 1} / {currentImages.length}
            </div>
          )}

          {/* Main image container - takes full viewport */}
          <div 
            className="relative w-full h-full flex items-center justify-center px-4 py-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{ maxWidth: '95vw', maxHeight: '85vh' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23333"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="20">Image not found</text></svg>';
              }}
            />

            {/* Previous button - positioned on left side */}
            {currentImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-all flex items-center justify-center group shadow-2xl border border-white/10"
                aria-label="Previous image"
                title="Previous (←)"
              >
                <i className="fas fa-chevron-left text-white text-2xl group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Next button - positioned on right side */}
            {currentImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-all flex items-center justify-center group shadow-2xl border border-white/10"
                aria-label="Next image"
                title="Next (→)"
              >
                <i className="fas fa-chevron-right text-white text-2xl group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          {/* Keyboard navigation hint at bottom */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white/70 text-xs font-medium border border-white/10">
              ← → Arrow keys to navigate
            </div>
          )}
        </div>
      )}

    </div>
  );
}

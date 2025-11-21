import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Auto-add JWT token to headers for protected routes
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth Endpoints
export const signup = (data) => API.post('/auth/signup', data);
export const signin = (data) => API.post('/auth/signin', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Protected Endpoints (require JWT token)
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// OAuth Redirects - These will redirect to backend OAuth routes
export const oauthGoogle = () => (window.location.href = '/api/auth/google');
export const oauthGithub = () => (window.location.href = '/api/auth/github');
export const oauthLinkedIn = () => (window.location.href = '/api/auth/linkedin');

// Gigs Endpoints
export const getGigs = () => API.get('/gigs');
export const createGig = (data) => API.post('/gigs', data);

// OAuth Callback Handler
export const handleAuthCallback = (searchParams) => {
  const token = searchParams.get('token');
  const userStr = searchParams.get('user');
  if (token && userStr) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(JSON.parse(userStr)));
    window.location.href = '/dashboard';
  } else {
    alert('Auth failed—try again.');
  }
};

// Teacher Profile API
export const createOrUpdateTeacherProfile = (data) => API.post('/teachers/profile', data);
export const getTeacherProfile = (username) => API.get(`/teachers/${username}`);
export const getMyTeacherProfile = () => API.get('/teachers/profile/me');
export const deleteTeacherProfile = () => API.delete('/teachers/profile');
export const getAllTeachers = (params) => API.get('/teachers', { params });

// Student Profile API
export const createOrUpdateStudentProfile = (data) => API.post('/students/profile', data);
export const getStudentProfile = (username) => API.get(`/students/${username}`);
export const getMyStudentProfile = () => API.get('/students/profile/me');
export const deleteStudentProfile = () => API.delete('/students/profile');
export const getAllStudents = (params) => API.get('/students', { params });

// Employee Profile API
export const createOrUpdateEmployeeProfile = (data) => API.post('/employees/profile', data);
export const getEmployeeProfile = (username) => API.get(`/employees/${username}`);
export const getMyEmployeeProfile = () => API.get('/employees/profile/me');
export const deleteEmployeeProfile = () => API.delete('/employees/profile');
export const getAllEmployees = (params) => API.get('/employees', { params });
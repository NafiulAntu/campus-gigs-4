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

// OAuth Redirects
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
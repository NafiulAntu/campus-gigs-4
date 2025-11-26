import axios from 'axios';
import { auth } from '../config/firebase';

const API = axios.create({
  baseURL: '/api',
});

// Auto-add Firebase token to headers for protected routes (with auto-refresh)
API.interceptors.request.use(async (req) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Get fresh token (Firebase automatically refreshes if expired)
      const freshToken = await currentUser.getIdToken(true);
      req.headers.Authorization = `Bearer ${freshToken}`;
      // Update localStorage with fresh token
      localStorage.setItem('token', freshToken);
    } else {
      // Fallback to stored token if no current user
      const token = localStorage.getItem('token');
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    // Fallback to stored token
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

// Auth Endpoints
export const signup = (data) => API.post('/auth/signup', data);
export const signin = (data) => API.post('/auth/signin', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const deleteAccount = (data) => API.delete('/auth/delete-account', { data });

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

// Upload API
export const uploadFiles = (formData) => API.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Post API
export const createPost = (data) => API.post('/posts', data);
export const getAllPosts = (params) => API.get('/posts', { params });
export const getUserPosts = (userId, params) => API.get(`/posts/user/${userId}`, { params });
export const getPostById = (postId) => API.get(`/posts/${postId}`);
export const updatePost = (postId, data) => API.put(`/posts/${postId}`, data);
export const deletePost = (postId) => API.delete(`/posts/${postId}`);
export const toggleLike = (postId) => API.post(`/posts/${postId}/like`);
export const toggleShare = (postId) => API.post(`/posts/${postId}/share`);
export const addComment = (postId, data) => API.post(`/posts/${postId}/comment`, data);
export const getComments = (postId) => API.get(`/posts/${postId}/comments`);

// User API
export const getUserById = (userId) => API.get(`/users/${userId}`);
export const searchUsers = (searchQuery) => API.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);

// Firebase Auth Sync
export const syncUserWithBackend = async (firebaseToken, userData) => {
  try {
    const response = await API.post('/auth/firebase-sync', userData, {
      headers: { Authorization: `Bearer ${firebaseToken}` }
    });
    return response.data.user;
  } catch (error) {
    console.error('Backend sync error:', error);
    throw error;
  }
};
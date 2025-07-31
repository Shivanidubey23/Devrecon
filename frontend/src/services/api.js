import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/me', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData)
};

// User endpoints (for future use)
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`)
};

// Project endpoints
export const projectAPI = {
  getAllProjects: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/projects${queryString ? `?${queryString}` : ''}`);
  },
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getUserProjects: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/projects/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },
  addComment: (projectId, content) => api.post(`/projects/${projectId}/comments`, { content }),
  deleteComment: (projectId, commentId) => api.delete(`/projects/${projectId}/comments/${commentId}`),
  toggleLike: (projectId) => api.post(`/projects/${projectId}/like`)
};

export default api;
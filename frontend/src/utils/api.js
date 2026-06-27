import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auro_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      localStorage.removeItem('auro_token');
      localStorage.removeItem('auro_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


export default api;


// AUTH
export const authAPI = {

  login: (username, password) => {

    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);


    return api.post(
      "/api/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
  },


  me: () => api.get("/api/auth/me"),

};


// USERS
export const usersAPI = {
  list: () => api.get('/api/users'),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};


// BRANCHES
export const branchesAPI = {
  list: () => api.get('/api/branches'),
  create: (data) => api.post('/api/branches', data),
  update: (id, data) => api.put(`/api/branches/${id}`, data),
  delete: (id) => api.delete(`/api/branches/${id}`),
};


// DEALERS
export const dealersAPI = {
  list: (branchId) =>
    api.get('/api/dealers', {
      params: branchId ? { branch_id: branchId } : {}
    }),

  create: (data) => api.post('/api/dealers', data),

  update: (id, data) =>
    api.put(`/api/dealers/${id}`, data),

  delete: (id) =>
    api.delete(`/api/dealers/${id}`),
};


// CLIENTS
export const clientsAPI = {
  list: () => api.get('/api/clients'),
  create: (data) => api.post('/api/clients', data),
  update: (id, data) => api.put(`/api/clients/${id}`, data),
  delete: (id) => api.delete(`/api/clients/${id}`),
};


// SIP
export const sipAPI = {
  list: () => api.get('/api/sip-lines'),
  create: (data) => api.post('/api/sip-lines', data),
  update: (id, data) => api.put(`/api/sip-lines/${id}`, data),
  delete: (id) => api.delete(`/api/sip-lines/${id}`),
};


// CALLS
export const callsAPI = {
  list: (params) =>
    api.get('/api/calls', { params }),

  create: (data) =>
    api.post('/api/calls', data),
};


// DASHBOARD
export const dashboardAPI = {
  stats: () => api.get('/api/dashboard/stats'),
  live: () => api.get('/api/dashboard/live'),
};

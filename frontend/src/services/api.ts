import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// User API
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
}

// Enrollment API
export const enrollmentApi = {
  enroll: (formData: FormData) => api.post('/enrollment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteTemplate: (templateId: number) => api.delete(`/enrollment/${templateId}`),
}

// Verification API
export const verificationApi = {
  verify: (formData: FormData) => api.post('/verification', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Identification API
export const identificationApi = {
  identify: (formData: FormData) => api.post('/identification', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Stats API
export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getRecentActivity: (limit?: number) => api.get('/stats/recent-activity', {
    params: { limit },
  }),
}

export default api

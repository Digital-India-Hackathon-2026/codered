import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './client';
import { env } from '../config/env';

// Auth
export const authAPI = {
  register: (data: { email?: string; phone?: string; password: string; name: string }) =>
    api.post('/session/request-otp', { phone: data.phone?.replace('+', '') }),
  login: (data: { email?: string; phone?: string; password?: string }) =>
    api.post('/session/request-otp', { phone: data.phone?.replace('+', '') }),
  verifyOtp: (data: { phone: string; otp: string }) =>
    api.post('/session/verify-otp', { phone: data.phone.replace('+', ''), otp: data.otp }),
  refreshToken: (refreshToken: string) =>
    api.post('/session/request-otp', { refreshToken }),
  logout: () => api.post('/session/logout'),
  getMe: () => api.get('/session/verify-session'),
  updateMe: (data: any) => api.put('/users/me', data),
  deleteAccount: () => api.delete('/users/me'),
};

// Health Profile
export const healthProfileAPI = {
  get: () => api.get('/api/health-profile'),
  updateBasic: (data: any) => api.put('/api/health-profile/basic', data),
  updateAllergies: (data: any) => api.put('/api/health-profile/allergies', data),
  updateConditions: (data: any) => api.put('/api/health-profile/conditions', data),
  updateFamilyHistory: (data: any) => api.put('/api/health-profile/family-history', data),
  updateLifestyle: (data: any) => api.put('/api/health-profile/lifestyle', data),
};

// Timeline
export const timelineAPI = {
  getAll: (params?: { type?: string; from?: string; to?: string; page?: number }) =>
    api.get('/api/timeline', { params }),
  getEvent: (id: string) => api.get(`/api/timeline/${id}`),
  addEvent: (data: any) => api.post('/api/timeline/event', data),
  deleteEvent: (id: string) => api.delete(`/api/timeline/${id}`),
};

// Reports
export const reportsAPI = {
  upload: (formData: FormData) =>
    api.post('/api/reports/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/api/reports'),
  get: (id: string) => api.get(`/api/reports/${id}`),
  getSummary: (id: string) => api.get(`/api/reports/${id}/summary`),
  analyze: (id: string) => api.post(`/api/reports/${id}/analyze`),
  delete: (id: string) => api.delete(`/api/reports/${id}`),
  download: (id: string) => api.get(`/api/reports/${id}/download`, { responseType: 'blob' }),
};

// Medications
export const medicationsAPI = {
  getActive: () => api.get('/api/medications'),
  add: (data: any) => api.post('/api/medications', data),
  update: (id: string, data: any) => api.put(`/api/medications/${id}`, data),
  delete: (id: string) => api.delete(`/api/medications/${id}`),
  getReminders: () => api.get('/api/medications/reminders'),
  setReminder: (id: string, data: any) => api.put(`/api/medications/${id}/reminder`, data),
  markTaken: (id: string) => api.post(`/api/medications/${id}/taken`),
  getHistory: () => api.get('/api/medications/history'),
  uploadPrescription: (formData: FormData) =>
    api.post('/api/prescriptions/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  extractFromPrescription: (id: string) => api.get(`/api/prescriptions/${id}/extract`),
};

// Chat (AI Service)
const AI_BASE = env.AI_BASE_URL;

const getAIHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Cookie: `session_token=${token}` } : {}),
  };
};

export const chatAPI = {
  createThread: async (userId: number) => {
    const headers = await getAIHeaders();
    return axios.post(`${AI_BASE}/threads`, { user_id: userId }, { headers });
  },
  sendMessage: async (threadId: string, message: string, userId: number = 5918) => {
    const headers = await getAIHeaders();
    return axios.post(`${AI_BASE}/base-chat/chats/stream`, {
      user_id: userId,
      thread_id: parseInt(threadId),
      user_message: message,
      images: [],
      documents: [],
      platform: 'mobile',
    }, { headers });
  },
};

// Symptoms
export const symptomsAPI = {
  startAssessment: (data: { symptoms: string[] }) => api.post('/api/symptoms/assess', data),
  answerFollowUp: (id: string, answer: any) => api.post(`/api/symptoms/assess/${id}/answer`, answer),
  getResult: (id: string) => api.get(`/api/symptoms/assess/${id}/result`),
  getHistory: () => api.get('/api/symptoms/history'),
};

// Insights
export const insightsAPI = {
  getAll: () => api.get('/api/insights'),
  getRisks: () => api.get('/api/insights/risks'),
  getTrends: () => api.get('/api/insights/trends'),
  getRecommendations: () => api.get('/api/insights/recommendations'),
  getCheckupDue: () => api.get('/api/insights/checkup-due'),
};

// Vitals
export const vitalsAPI = {
  log: (data: { type: string; value: number; unit: string; timestamp?: string }) =>
    api.post('/api/vitals', data),
  getHistory: (params?: { type?: string; period?: string }) =>
    api.get('/api/vitals', { params }),
  getLatest: () => api.get('/api/vitals/latest'),
  getTrends: () => api.get('/api/vitals/trends'),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/api/notifications'),
  markRead: (id: string) => api.post(`/api/notifications/read/${id}`),
  updateSettings: (data: any) => api.put('/api/notifications/settings', data),
};

// Health Summary
export const summaryAPI = {
  generate: () => api.post('/api/summary/generate'),
  get: (id: string) => api.get(`/api/summary/${id}`),
  getPdf: (id: string) => api.get(`/api/summary/${id}/pdf`, { responseType: 'blob' }),
  share: (id: string) => api.post(`/api/summary/${id}/share`),
};

// Data & Privacy
export const dataAPI = {
  export: () => api.get('/api/data/export'),
  deleteAll: () => api.delete('/api/data/delete-all'),
  getAuditLog: () => api.get('/api/data/audit-log'),
  updateConsent: (data: any) => api.put('/api/data/consent', data),
};

// Community & Posts (Real endpoints)
export const communityAPI = {
  getTopPosts: (params?: { limit?: number; category?: string }) =>
    api.get('/posts/top', { params }),
  getPosts: (params?: { limit?: number }) =>
    api.get('/posts/', { params }),
  getTopCommunities: () =>
    api.post('/community_pages/top-communities', {}),
  getTopics: () =>
    api.get('/community_pages/topics'),
  getThreads: async (userId: number) => {
    const headers = await getAIHeaders();
    return axios.get(`${AI_BASE}/threads?user_id=${userId}`, { headers });
  },
  getSessions: async (userId: number) => {
    const headers = await getAIHeaders();
    return axios.get(`${AI_BASE}/sessions?user_id=${userId}`, { headers });
  },
};


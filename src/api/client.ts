// LifeLens - CodeRed Hackathon 2026`nimport axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://askfirst.co/api/main';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Cookie = `session_token=${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  },
);

export default api;
export { BASE_URL };


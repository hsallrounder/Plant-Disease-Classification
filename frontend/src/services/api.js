import axios from 'axios';

// Universal environment variable lookup (works across Node, Vite, Webpack, CRA, and Browser)
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
    if (process.env.API_URL) return process.env.API_URL;
  }
  return '/api';
};

const rawApiUrl = getApiBaseUrl();
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 65000 // 65 seconds for Render free tier cold starts
});

export const predictPlantImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 8000 });
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      mlServiceStatus: 'unreachable',
      error: error.message
    };
  }
};

export const fetchDiseasesCatalog = async () => {
  const response = await api.get('/diseases');
  return response.data;
};

export default api;

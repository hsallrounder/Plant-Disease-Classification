import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

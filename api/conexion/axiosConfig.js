import axios from "axios";

// URL de la API - usar variable de entorno o fallback a URL local
const API_URL = "http://192.168.1.95:8080/api";

// Creando una instancia de axios`
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {

    delete config.headers['Content-Type'];
  } else {

    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
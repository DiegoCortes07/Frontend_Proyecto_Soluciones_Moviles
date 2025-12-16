import axios from "axios";

// api url desde el .env
const API_URL ="http://192.168.1.102:8080/api";

const api = axios.create({
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

export default api;

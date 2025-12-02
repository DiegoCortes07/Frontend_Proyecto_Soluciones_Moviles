import axios from "axios";

// api url desde el .env
const API_URL ="http://192.168.1.102:8080/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

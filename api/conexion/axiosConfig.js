import axios from "axios";

// api url desde el .env
const API_URL ="http://192.168.1.102:8080/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});



export default api;

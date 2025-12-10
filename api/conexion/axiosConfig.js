import axios from "axios";

// api url desde el .env
const API_URL ="http://192.168.1.96:8080/api";

export const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzY0OTA0NDk2LCJleHAiOjE3NjU1MDkyOTZ9.UiYO1ep2OPeR-gkjfyBWUZq2UZ5By-wmiGw8ZcImsCY",
  },
});

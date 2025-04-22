import axios from 'axios';

const api = axios.create({
  // Use process.env in tests; Vite replace import.meta.env at build time
  baseURL: process.env.VITE_API_URL || 'http://localhost:4000/api',
});

export default api;

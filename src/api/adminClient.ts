import axios from 'axios';

const baseURL = import.meta.env.VITE_ADMIN_API_URL;

export const adminClient = axios.create({
  baseURL,
  withCredentials: false
});

export default adminClient;

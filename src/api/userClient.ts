import axios from 'axios';

const baseURL = import.meta.env.VITE_USER_API_URL;

export const userClient = axios.create({
  baseURL,
  withCredentials: false
});

export default userClient;

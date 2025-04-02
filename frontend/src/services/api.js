import axios from "axios";

const api = axios.create({
  baseURL: "https://campus-connect-1-b62l.onrender.com/api/v1", // Updated backend URL
  withCredentials: true, // Ensures cookies (tokens) are sent with requests
});

export default api;
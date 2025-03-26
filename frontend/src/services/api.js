import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true, // Ensures cookies (tokens) are sent with requests
});

export default api;
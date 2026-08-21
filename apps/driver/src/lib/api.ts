import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("driver_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("driver_token");
      localStorage.removeItem("driver_user");
      localStorage.removeItem("driver_vehicle");
      window.location.href = "https://sundo-go.vercel.app/login";
    }
    return Promise.reject(err);
  }
);

export default api;

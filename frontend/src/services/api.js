import axios from "axios";
import { getStoredToken } from "../utils/auth";

let backendStatus = "unknown";

const emitBackendStatus = (nextStatus) => {
  if (backendStatus === nextStatus || typeof window === "undefined") {
    return;
  }

  backendStatus = nextStatus;
  window.dispatchEvent(new CustomEvent(`api:${nextStatus}`));
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    emitBackendStatus("online");
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || "";

    if (!error.response) {
      emitBackendStatus("offline");
      return Promise.reject(error);
    }

    emitBackendStatus("online");

    if (
      error.response?.status === 401 &&
      !requestUrl.includes("/auth/login") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default API;

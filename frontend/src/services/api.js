import axios from "axios";
import {
  clearStoredAuth,
  getStoredToken,
  setStoredAuth,
} from "../utils/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

let backendStatus = "unknown";
let refreshPromise = null;

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

const sessionClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

const emitBackendStatus = (nextStatus) => {
  if (backendStatus === nextStatus || typeof window === "undefined") {
    return;
  }

  backendStatus = nextStatus;
  window.dispatchEvent(new CustomEvent(`api:${nextStatus}`));
};

const dispatchUnauthorized = () => {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredAuth();
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
};

const normalizeAuthResponse = (data) => {
  if (!data?.token || !data?.user) {
    return null;
  }

  return {
    token: data.token,
    user: data.user,
  };
};

const shouldSkipRefresh = (requestUrl = "") =>
  AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));

const requestSessionRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = sessionClient
      .post("/auth/refresh")
      .then((response) => {
        emitBackendStatus("online");

        const nextAuthState = normalizeAuthResponse(response.data);

        if (!nextAuthState) {
          throw new Error("Pergjigjja e rifreskimit te sesionit nuk eshte valide.");
        }

        setStoredAuth(nextAuthState);
        return nextAuthState;
      })
      .catch((error) => {
        if (!error.response) {
          emitBackendStatus("offline");
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const restoreSession = async () => {
  try {
    return await requestSessionRefresh();
  } catch {
    clearStoredAuth({ silent: true });
    return null;
  }
};

export const logoutSession = async () => {
  try {
    await sessionClient.post("/auth/logout");
    emitBackendStatus("online");
  } catch (error) {
    if (!error.response) {
      emitBackendStatus("offline");
    }

    throw error;
  }
};

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
  async (error) => {
    const requestUrl = error.config?.url || "";

    if (!error.response) {
      emitBackendStatus("offline");
      return Promise.reject(error);
    }

    emitBackendStatus("online");

    if (error.response.status !== 401 || shouldSkipRefresh(requestUrl)) {
      if (requestUrl.includes("/auth/refresh") || requestUrl.includes("/auth/logout")) {
        dispatchUnauthorized();
      }

      return Promise.reject(error);
    }

    if (error.config?._retry) {
      dispatchUnauthorized();
      return Promise.reject(error);
    }

    try {
      const nextAuthState = await requestSessionRefresh();
      const nextConfig = {
        ...error.config,
        _retry: true,
        headers: {
          ...(error.config?.headers || {}),
          Authorization: `Bearer ${nextAuthState.token}`,
        },
      };

      return API(nextConfig);
    } catch (refreshError) {
      dispatchUnauthorized();
      return Promise.reject(refreshError);
    }
  }
);

export default API;

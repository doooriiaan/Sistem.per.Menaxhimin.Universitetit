import axios from "axios";
import {
  clearStoredAuth,
  getStoredToken,
  setStoredAuth,
} from "../utils/auth";
import { notifyApp } from "../utils/toastEvents";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

let backendStatus = "unknown";
let refreshPromise = null;

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];
const MUTATION_METHODS = ["post", "put", "patch", "delete"];
const SILENT_TOAST_ENDPOINTS = ["/auth/refresh"];

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
  notifyApp({
    tone: "info",
    title: "Sesioni u mbyll",
    message: "Identifikohu perseri per te vazhduar.",
  });
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

const isMutationRequest = (config = {}) => {
  if (config.showToast === false) {
    return false;
  }

  const requestUrl = config.url || "";

  if (SILENT_TOAST_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint))) {
    return false;
  }

  return MUTATION_METHODS.includes(String(config.method || "").toLowerCase());
};

const getResponseMessage = (
  response,
  fallbackMessage = "Veprimi u krye me sukses."
) => response?.api?.message || response?.data?.message || fallbackMessage;

const getErrorMessage = (error, fallbackMessage = "Veprimi deshtoi.") => {
  const data = error?.response?.data;
  const detail = data?.details?.[0];

  return (
    data?.message ||
    data?.error ||
    detail?.message ||
    (typeof detail === "string" ? detail : "") ||
    fallbackMessage
  );
};

const getSuccessToastCopy = (response) => {
  const method = String(response.config?.method || "").toLowerCase();
  const requestUrl = response.config?.url || "";

  if (requestUrl.includes("/auth/login")) {
    return {
      title: "Hyrja u krye",
      message: getResponseMessage(response, "Mire se erdhe ne sistem."),
    };
  }

  if (requestUrl.includes("/auth/register")) {
    return {
      title: "Regjistrimi u krye",
      message: getResponseMessage(response, "Llogaria u aktivizua me sukses."),
    };
  }

  if (requestUrl.includes("/auth/password")) {
    return {
      title: "Fjalekalimi u ndryshua",
      message: getResponseMessage(response, "Fjalekalimi u ndryshua me sukses."),
    };
  }

  if (method === "delete") {
    return {
      title: "U fshi me sukses",
      message: getResponseMessage(response, "Te dhenat u fshine me sukses."),
    };
  }

  if (method === "put" || method === "patch") {
    return {
      title: "Ndryshimet u ruajten",
      message: getResponseMessage(response, "Ndryshimet u ruajten me sukses."),
    };
  }

  return {
    title: "U ruajt me sukses",
    message: getResponseMessage(response, "Veprimi u krye me sukses."),
  };
};

const notifyMutationSuccess = (response) => {
  if (!isMutationRequest(response.config)) {
    return;
  }

  notifyApp({
    ...getSuccessToastCopy(response),
    tone: "success",
  });
};

const notifyMutationError = (error) => {
  if (!isMutationRequest(error.config)) {
    return;
  }

  if (!error.response) {
    notifyApp({
      tone: "error",
      title: "Lidhja deshtoi",
      message: "Serveri nuk u arrit. Kontrollo lidhjen dhe provo perseri.",
    });
    return;
  }

  notifyApp({
    tone: "error",
    title: "Veprimi deshtoi",
    message: getErrorMessage(error),
  });
};

const normalizeSuccessPayload = (response) => {
  const payload = response?.data;

  if (
    payload &&
    typeof payload === "object" &&
    payload.success === true &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    response.api = payload;
    response.data = payload.data;
  }

  return response;
};

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

export const logoutSession = async () => {
  try {
    await sessionClient.post("/auth/logout");
    emitBackendStatus("online");
    notifyApp({
      tone: "info",
      title: "Dole nga sistemi",
      message: "Sesioni u mbyll me sukses.",
    });
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
    const normalizedResponse = normalizeSuccessPayload(response);
    notifyMutationSuccess(normalizedResponse);
    return normalizedResponse;
  },
  async (error) => {
    const requestUrl = error.config?.url || "";

    if (!error.response) {
      emitBackendStatus("offline");
      notifyMutationError(error);
      return Promise.reject(error);
    }

    emitBackendStatus("online");

    if (error.response.status !== 401 || shouldSkipRefresh(requestUrl)) {
      if (requestUrl.includes("/auth/refresh") || requestUrl.includes("/auth/logout")) {
        dispatchUnauthorized();
      }

      notifyMutationError(error);
      return Promise.reject(error);
    }

    if (error.config?._retry) {
      notifyMutationError(error);
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

export { getResponseMessage };

export default API;

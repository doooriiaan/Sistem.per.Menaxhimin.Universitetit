export const AUTH_STORAGE_KEY = "ums_auth";
export const AUTH_UPDATED_EVENT = "auth:updated";
export const AUTH_CLEARED_EVENT = "auth:cleared";

const validRoles = ["admin", "profesor", "student"];

const getStorage = () =>
  typeof window === "undefined" ? null : window.sessionStorage;

const normalizeAuthState = (parsedAuth) => {
  const normalizedRole = String(parsedAuth?.user?.roli || "").toLowerCase();

  if (
    !parsedAuth?.token ||
    !parsedAuth?.user ||
    !parsedAuth.user.user_id ||
    !validRoles.includes(normalizedRole)
  ) {
    return null;
  }

  return {
    ...parsedAuth,
    user: {
      ...parsedAuth.user,
      roli: normalizedRole,
    },
  };
};

export const getStoredAuth = () => {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawAuth = storage.getItem(AUTH_STORAGE_KEY);

    if (!rawAuth) {
      return null;
    }

    const normalizedAuthState = normalizeAuthState(JSON.parse(rawAuth));

    if (!normalizedAuthState) {
      storage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return normalizedAuthState;
  } catch {
    return null;
  }
};

export const getStoredToken = () => getStoredAuth()?.token || "";

export const setStoredAuth = (authData) => {
  const storage = getStorage();
  const normalizedAuthState = normalizeAuthState(authData);

  if (!storage || !normalizedAuthState) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedAuthState));
  window.dispatchEvent(
    new CustomEvent(AUTH_UPDATED_EVENT, {
      detail: normalizedAuthState,
    })
  );
};

export const clearStoredAuth = ({ silent = false } = {}) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);

  if (!silent) {
    window.dispatchEvent(new CustomEvent(AUTH_CLEARED_EVENT));
  }
};

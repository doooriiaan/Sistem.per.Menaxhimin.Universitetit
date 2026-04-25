export const AUTH_STORAGE_KEY = "ums_auth";

const validRoles = ["admin", "profesor", "student"];

export const getStoredAuth = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawAuth) {
      return null;
    }

    const parsedAuth = JSON.parse(rawAuth);
    const normalizedRole = String(parsedAuth?.user?.roli || "").toLowerCase();

    if (
      !parsedAuth?.token ||
      !parsedAuth?.user ||
      !parsedAuth.user.user_id ||
      !validRoles.includes(normalizedRole)
    ) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      ...parsedAuth,
      user: {
        ...parsedAuth.user,
        roli: normalizedRole,
      },
    };
  } catch {
    return null;
  }
};

export const getStoredToken = () => getStoredAuth()?.token || "";

export const setStoredAuth = (authData) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

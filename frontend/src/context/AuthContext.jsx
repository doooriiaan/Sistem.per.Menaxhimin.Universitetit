import { useEffect, useState } from "react";
import {
  AUTH_CLEARED_EVENT,
  AUTH_UPDATED_EVENT,
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "../utils/auth";
import { logoutSession, restoreSession } from "../services/api";
import AuthContext from "./auth-context";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => getStoredAuth());
  const [isInitializing, setIsInitializing] = useState(true);

  const login = ({ token, user }) => {
    const nextAuthState = { token, user };
    setStoredAuth(nextAuthState);
    setAuthState(nextAuthState);
  };

  const logout = async () => {
    try {
      await logoutSession();
    } catch {
      // Even if backend logout fails, the local session should still close.
    } finally {
      clearStoredAuth({ silent: true });
      setAuthState(null);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      const storedAuth = getStoredAuth();

      if (storedAuth?.token) {
        if (active) {
          setAuthState(storedAuth);
          setIsInitializing(false);
        }

        return;
      }

      const restoredSession = await restoreSession();

      if (active) {
        setAuthState(restoredSession);
        setIsInitializing(false);
      }
    };

    const handleAuthUpdated = (event) => {
      if (!active) {
        return;
      }

      setAuthState(event.detail || getStoredAuth());
    };

    const handleAuthCleared = () => {
      if (!active) {
        return;
      }

      setAuthState(null);
    };

    const handleUnauthorized = () => {
      clearStoredAuth({ silent: true });
      handleAuthCleared();
    };

    bootstrapSession();

    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      active = false;
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(authState?.token),
        isInitializing,
        login,
        logout,
        token: authState?.token || "",
        user: authState?.user || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

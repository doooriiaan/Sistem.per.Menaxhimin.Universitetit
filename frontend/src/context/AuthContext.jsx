import { useEffect, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "../utils/auth";
import AuthContext from "./auth-context";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => getStoredAuth());

  const login = ({ token, user }) => {
    const nextAuthState = { token, user };
    setStoredAuth(nextAuthState);
    setAuthState(nextAuthState);
  };

  const logout = () => {
    clearStoredAuth();
    setAuthState(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredAuth();
      setAuthState(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(authState?.token),
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

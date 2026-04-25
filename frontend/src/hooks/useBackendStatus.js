import { useEffect, useState } from "react";

export function useBackendStatus() {
  const [backendStatus, setBackendStatus] = useState("unknown");

  useEffect(() => {
    const handleOffline = () => {
      setBackendStatus("offline");
    };

    const handleOnline = () => {
      setBackendStatus("online");
    };

    window.addEventListener("api:offline", handleOffline);
    window.addEventListener("api:online", handleOnline);

    return () => {
      window.removeEventListener("api:offline", handleOffline);
      window.removeEventListener("api:online", handleOnline);
    };
  }, []);

  return backendStatus;
}

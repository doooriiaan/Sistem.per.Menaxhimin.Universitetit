import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(
    () => () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    },
    []
  );

  const removeToast = (id) => {
    const timerId = timersRef.current.get(id);

    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ message, title, tone = "info" }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextToast = {
      id,
      message,
      title,
      tone,
    };

    setToasts((current) => [...current, nextToast]);

    const timerId = window.setTimeout(() => removeToast(id), 4200);
    timersRef.current.set(id, timerId);
  };

  const value = useMemo(
    () => ({
      dismissToast: removeToast,
      notifyError: (message, title = "Gabim") =>
        pushToast({ message, title, tone: "error" }),
      notifyInfo: (message, title = "Informacion") =>
        pushToast({ message, title, tone: "info" }),
      notifySuccess: (message, title = "U ruajt me sukses") =>
        pushToast({ message, title, tone: "success" }),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const toneClass =
            toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-sky-200 bg-sky-50 text-sky-900";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-[24px] border p-4 shadow-[0_24px_60px_rgba(15,23,42,0.15)] backdrop-blur-xl ${toneClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{toast.title}</p>
                  <p className="mt-1 text-sm leading-6 opacity-85">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full border border-current/15 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                >
                  Mbyll
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast duhet te perdoret brenda ToastProvider.");
  }

  return context;
}

export { ToastProvider, useToast };

export const APP_TOAST_EVENT = "app:toast";

export const notifyApp = ({ message, title, tone = "info" }) => {
  if (typeof window === "undefined" || !message) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(APP_TOAST_EVENT, {
      detail: {
        message,
        title,
        tone,
      },
    })
  );
};

export const formatDateLabel = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatTimeLabel = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 5);
};

export const formatAverageLabel = (value) =>
  value === null || value === undefined || value === ""
    ? "-"
    : Number(value).toFixed(2);

export const formatCurrency = (value, currency = "EUR") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatFileSize = (bytes) => {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "0 KB";
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

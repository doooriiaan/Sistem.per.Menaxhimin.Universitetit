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

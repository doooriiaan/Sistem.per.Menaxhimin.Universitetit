const toneMap = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  dark: "border-slate-800 bg-slate-950 text-white",
};

const inferTone = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (
    ["aktiv", "aktive", "perfunduar", "miratuar", "pranuar", "paguajtur"].includes(
      normalized
    )
  ) {
    return "success";
  }

  if (
    ["ne pritje", "ne shqyrtim", "shkurt", "qershor", "shtator", "tetor", "janar"].includes(
      normalized
    )
  ) {
    return "warning";
  }

  if (["jo aktiv", "anuluar", "refuzuar", "mbyllur"].includes(normalized)) {
    return "danger";
  }

  if (["obligative", "praktike", "laboratorike", "zgjedhore"].includes(normalized)) {
    return "info";
  }

  return "neutral";
};

function StatusBadge({ children, className = "", tone }) {
  const resolvedTone = tone || inferTone(children);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[resolvedTone] || toneMap.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export default StatusBadge;

function InlineAlert({ children, tone = "error", className = "" }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "info"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClass} ${className}`}>
      {children}
    </div>
  );
}

function EmptyState({
  action,
  description,
  title = "Nuk ka te dhena",
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`ui-skeleton rounded-2xl ${className}`} />;
}

function SkeletonRows({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="mt-3 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export { EmptyState, InlineAlert, SkeletonBlock, SkeletonRows };

import { Link } from "react-router-dom";
import NavigationIcon from "../NavigationIcon";

function SurfaceCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-[30px] border border-slate-200 bg-white/96 p-6 shadow-[0_22px_52px_rgba(15,23,42,0.07)] ${className}`}
    >
      {children}
    </section>
  );
}

function PageHeader({
  actions,
  badge,
  description,
  eyebrow,
  title,
}) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(244,247,251,0.88))] p-7 shadow-[0_26px_70px_rgba(15,23,42,0.09)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-teal-700">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-950 sm:text-[2.15rem]">
              {title}
            </h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

function StatCard({
  description,
  icon = "chart",
  label,
  tone = "default",
  value,
}) {
  const toneClass =
    tone === "dark"
      ? "bg-slate-950 text-white"
      : tone === "accent"
        ? "bg-[linear-gradient(145deg,#0f766e,#115e59)] text-white"
        : "bg-white text-slate-950";

  const subtleClass =
    tone === "dark" || tone === "accent" ? "text-white/72" : "text-slate-500";

  return (
    <div
      className={`rounded-[28px] border border-slate-200/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${subtleClass}`}>{label}</p>
          <p className="mt-3 text-3xl font-extrabold">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <NavigationIcon icon={icon} className="h-5 w-5" />
        </div>
      </div>
      {description ? <p className={`mt-4 text-sm ${subtleClass}`}>{description}</p> : null}
    </div>
  );
}

function SectionNav({ items = [] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const content = (
          <>
            <NavigationIcon icon={item.icon || "grid"} className="h-4 w-4" />
            <span>{item.label}</span>
          </>
        );

        const className =
          "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950";

        if (item.href) {
          return (
            <a key={item.label} href={item.href} className={className}>
              {content}
            </a>
          );
        }

        return (
          <Link key={item.label} to={item.to} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export { PageHeader, SectionNav, StatCard, SurfaceCard };

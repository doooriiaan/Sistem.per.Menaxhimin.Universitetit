import { SurfaceCard } from "./Layout";

const formatChartValue = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("sq-AL") : value;
};

function ChartCard({ children, description, title }) {
  return (
    <SurfaceCard className="h-full">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </SurfaceCard>
  );
}

function BarChartCard({
  color = "#0f766e",
  data = [],
  description,
  labelKey = "label",
  title,
  valueKey = "value",
}) {
  const max = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <ChartCard title={title} description={description}>
      <div className="space-y-4">
        {data.map((item) => {
          const value = Number(item[valueKey]) || 0;
          const width = `${Math.max((value / max) * 100, value > 0 ? 10 : 0)}%`;

          return (
            <div key={`${item[labelKey]}-${value}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-800">{item[labelKey]}</span>
                <span className="text-slate-500">{formatChartValue(value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width,
                    background: `linear-gradient(90deg, ${color}, rgba(15, 118, 110, 0.58))`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

function DonutChartCard({
  data = [],
  description,
  title,
  valueKey = "value",
  labelKey = "label",
}) {
  const palette = ["#0f766e", "#0ea5e9", "#f97316", "#22c55e", "#0f172a", "#94a3b8"];
  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <ChartCard title={title} description={description}>
      <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
        <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
            {data.map((item, index) => {
              const value = Number(item[valueKey]) || 0;
              const length = total > 0 ? (value / total) * circumference : 0;
              const segment = (
                <circle
                  key={`${item[labelKey]}-${value}`}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={palette[index % palette.length]}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  strokeWidth="16"
                />
              );
              offset += length;
              return segment;
            })}
          </svg>
          <div className="absolute text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Totali
            </p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {formatChartValue(total)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={`${item[labelKey]}-${item[valueKey]}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: palette[index % palette.length] }}
                />
                <span className="font-semibold text-slate-800">{item[labelKey]}</span>
              </div>
              <span className="text-sm text-slate-500">
                {formatChartValue(item[valueKey])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

function WorkloadChartCard({ data = [], description, title }) {
  const max = Math.max(...data.map((item) => Number(item.students) || 0), 1);

  return (
    <ChartCard title={title} description={description}>
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item.profesor_id || item.professor}
            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{item.professor}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatChartValue(item.courses)} lende | {formatChartValue(item.exams)} provime |{" "}
                  {formatChartValue(item.schedule_slots)} slot-e ne orar
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {formatChartValue(item.students)} studente
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a,#0ea5e9)]"
                style={{
                  width: `${Math.max(((Number(item.students) || 0) / max) * 100, 12)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export { BarChartCard, DonutChartCard, WorkloadChartCard };

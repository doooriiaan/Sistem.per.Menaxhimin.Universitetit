import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/validation";

const emptyDashboard = {};

function MetricCard({ label, value, tone = "slate" }) {
  const toneClass =
    tone === "teal"
      ? "bg-teal-50 text-teal-800"
      : tone === "amber"
        ? "bg-amber-50 text-amber-800"
        : "bg-slate-100 text-slate-800";

  return (
    <div className="surface-card rounded-[24px] p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <div className={`mt-4 inline-flex rounded-2xl px-4 py-3 ${toneClass}`}>
        <span className="text-2xl font-extrabold">{value}</span>
      </div>
    </div>
  );
}

function ReportsPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await API.get("/auth/dashboard");

        if (active) {
          setDashboard(response.data || emptyDashboard);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, "Gabim gjate marrjes se raporteve."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const metrics =
    user?.roli === "admin"
      ? [
          { label: "Studente", value: dashboard.counts?.students ?? 0, tone: "teal" },
          { label: "Profesore", value: dashboard.counts?.profesoret ?? 0 },
          { label: "Lende", value: dashboard.counts?.lendet ?? 0 },
          { label: "Provime", value: dashboard.counts?.provimet ?? 0, tone: "amber" },
        ]
      : user?.roli === "profesor"
        ? [
            { label: "Lendet e mia", value: dashboard.courses?.length ?? 0, tone: "teal" },
            { label: "Provimet", value: dashboard.exams?.length ?? 0 },
            { label: "Orari javor", value: dashboard.schedule?.length ?? 0, tone: "amber" },
          ]
        : [
            { label: "Notat", value: dashboard.grades?.length ?? 0, tone: "teal" },
            { label: "Regjistrimet", value: dashboard.enrollments?.length ?? 0 },
            { label: "Provimet", value: dashboard.exams?.length ?? 0, tone: "amber" },
            { label: "Mesatarja", value: dashboard.summary?.mesatarja ?? "-", tone: "teal" },
          ];

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] p-8">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-amber-700">
          Raporte
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Pamje e shpejte mbi performancen dhe aktivitetin
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Kjo faqe permbledh treguesit kryesore te rolit tend qe t'i kesh
          statistikat me te rendesishme ne nje vend.
        </p>
      </section>

      {loading ? (
        <div className="surface-card rounded-[24px] p-10 text-center text-slate-500">
          Duke ngarkuar raportet...
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                tone={metric.tone}
              />
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="surface-card rounded-[24px] p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Permbledhje operative
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Paneli i raporteve eshte ndertuar qe te jape nje pamje te qarte
                per vendimmarrje te shpejte. Mund te zgjerohet me tej me grafe,
                eksport PDF ose krahasime mujore.
              </p>
            </div>

            <div className="surface-card rounded-[24px] bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Status
              </p>
              <h2 className="mt-4 text-2xl font-bold">
                Sistemi eshte gati per raportim
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Kjo faqe mund te sherbeje si baze per analytics me te avancuara
                sipas kerkesave te fakultetit ose administrates.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ReportsPage;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import API from "../services/api";
import { formatAverageLabel, formatDateLabel } from "../utils/display";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

function StudentGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchGrades = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/notat");

        if (active) {
          setGrades(response.data || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, "Gabim gjate marrjes se notave."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchGrades();

    return () => {
      active = false;
    };
  }, []);

  const average = useMemo(() => {
    if (!grades.length) {
      return null;
    }

    return grades.reduce((sum, grade) => sum + Number(grade.nota || 0), 0) / grades.length;
  }, [grades]);

  const bestGrade = useMemo(() => {
    if (!grades.length) {
      return "-";
    }

    return Math.max(...grades.map((grade) => Number(grade.nota || 0)));
  }, [grades]);

  const latestGrade = grades[0];

  if (loading) {
    return <SkeletonRows count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Grades"
        title="Notat e mia"
        description="Pamje e plote e rezultateve te publikuara, me lidhje direkte drejt profilit dhe regjistrimeve."
        actions={
          <>
            <Link
              to="/student/profili"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Kthehu te profili
            </Link>
            <Link
              to="/student/regjistrimet"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Shko te regjistrimet
            </Link>
          </>
        }
      />

      <SectionNav items={getRoleConnections("student")} />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon="graduation"
          label="Mesatarja aktuale"
          value={formatAverageLabel(average)}
          tone="accent"
        />
        <StatCard icon="chart" label="Nota me e larte" value={bestGrade} />
        <StatCard
          icon="calendar"
          label="Publikimi i fundit"
          value={latestGrade ? formatDateLabel(latestGrade.data_vendosjes) : "-"}
          tone="dark"
        />
      </section>

      <SurfaceCard>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Tabela e rezultateve</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cdo note eshte e lidhur me lenden, profesorin dhe afatin perkates.
            </p>
          </div>
          <StatusBadge tone="info">{grades.length} rezultate</StatusBadge>
        </div>

        {grades.length ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Lenda</th>
                  <th>Profesori</th>
                  <th>Provimi</th>
                  <th>Nota</th>
                  <th>Vendosur me</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.nota_id}>
                    <td>
                      <div>
                        <p className="font-semibold text-slate-900">{grade.lenda}</p>
                        <p className="mt-1 text-xs text-slate-500">{grade.kodi}</p>
                      </div>
                    </td>
                    <td>{grade.profesori || "-"}</td>
                    <td>
                      {formatDateLabel(grade.data_provimit)} | {grade.afati}
                    </td>
                    <td>
                      <StatusBadge tone="dark">{grade.nota}</StatusBadge>
                    </td>
                    <td>{formatDateLabel(grade.data_vendosjes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Nuk ka nota te regjistruara"
            description="Kur te publikohen rezultatet e para, tabela do te shfaqe te gjitha vleresimet e lidhura me lendet e tua."
          />
        )}
      </SurfaceCard>
    </div>
  );
}

export default StudentGradesPage;

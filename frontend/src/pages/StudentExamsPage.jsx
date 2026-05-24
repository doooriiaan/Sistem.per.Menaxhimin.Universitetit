import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/ToastProvider";
import API, { getResponseMessage } from "../services/api";
import { formatDateLabel, formatTimeLabel } from "../utils/display";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

const today = () => new Date().toISOString().slice(0, 10);

const isPastExam = (exam) => String(exam?.data_provimit || "").slice(0, 10) < today();

function StudentExamsPage() {
  const { notifyError, notifySuccess } = useToast();
  const [exams, setExams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, applicationsRes] = await Promise.all([
        API.get("/student/provimet"),
        API.get("/student/provimet/paraqitura"),
      ]);

      setExams(examsRes.data || []);
      setApplications(applicationsRes.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se provimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableExams = useMemo(
    () => exams.filter((exam) => !exam.paraqitje_id && !exam.nota_id),
    [exams]
  );

  const gradedApplications = useMemo(
    () => applications.filter((application) => application.nota_id),
    [applications]
  );

  const handleApply = async (exam) => {
    try {
      setActionId(exam.provimi_id);
      const response = await API.post(
        `/student/provimet/${exam.provimi_id}/paraqit`,
        {},
        { showToast: false }
      );
      await fetchData();
      notifySuccess(getResponseMessage(response, "Provimi u paraqit me sukses."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Gabim gjate paraqitjes se provimit.");
      setError(message);
      notifyError(message);
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (application) => {
    try {
      setActionId(application.provimi_id);
      const response = await API.delete(
        `/student/provimet/${application.provimi_id}/paraqit`,
        { showToast: false }
      );
      await fetchData();
      notifySuccess(getResponseMessage(response, "Paraqitja u anulua me sukses."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Gabim gjate anulimit te paraqitjes.");
      setError(message);
      notifyError(message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <SkeletonRows count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Exams"
        title="Paraqitja e provimeve"
        description="Zgjidh provimet aktive per lendet ku je i regjistruar dhe ndiq statusin e paraqitjeve."
        actions={
          <>
            <Link
              to="/student/notat"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Shiko notat
            </Link>
            <Link
              to="/student/regjistrimet"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Regjistrimet
            </Link>
          </>
        }
      />

      <SectionNav items={getRoleConnections("student")} />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon="calendar"
          label="Per paraqitje"
          value={availableExams.length}
          tone="accent"
        />
        <StatCard icon="file" label="Te paraqitura" value={applications.length} />
        <StatCard
          icon="graduation"
          label="Me note"
          value={gradedApplications.length}
          tone="dark"
        />
      </section>

      <SurfaceCard>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Provime per paraqitje</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Shfaqen provimet e lendeve ku je i regjistruar dhe qe ende nuk i ke paraqitur.
            </p>
          </div>
          <StatusBadge tone="info">{availableExams.length} provime</StatusBadge>
        </div>

        {availableExams.length ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Lenda</th>
                  <th>Profesori</th>
                  <th>Data</th>
                  <th>Salla</th>
                  <th>Afati</th>
                  <th>Veprimi</th>
                </tr>
              </thead>
              <tbody>
                {availableExams.map((exam) => {
                  const disabled = isPastExam(exam);

                  return (
                    <tr key={exam.provimi_id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-900">{exam.lenda}</p>
                          <p className="mt-1 text-xs text-slate-500">{exam.kodi}</p>
                        </div>
                      </td>
                      <td>{exam.profesori || "-"}</td>
                      <td>
                        {formatDateLabel(exam.data_provimit)} | {formatTimeLabel(exam.ora)}
                      </td>
                      <td>{exam.salla || "-"}</td>
                      <td>{exam.afati}</td>
                      <td>
                        <Button
                          size="sm"
                          loading={actionId === exam.provimi_id}
                          disabled={disabled}
                          onClick={() => handleApply(exam)}
                        >
                          {disabled ? "Ka kaluar" : "Paraqit"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Nuk ka provime per paraqitje"
            description="Provimet e reja do te shfaqen ketu sapo profesori t'i publikoje per lendet ku je i regjistruar."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Provimet e paraqitura</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ketu i sheh paraqitjet aktive dhe rezultatet sapo profesori t'i vendose notat.
            </p>
          </div>
          <StatusBadge tone="dark">{applications.length} paraqitje</StatusBadge>
        </div>

        {applications.length ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Lenda</th>
                  <th>Provimi</th>
                  <th>Paraqitur me</th>
                  <th>Statusi</th>
                  <th>Nota</th>
                  <th>Veprimi</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const canCancel = !application.nota_id && !isPastExam(application);

                  return (
                    <tr key={application.paraqitje_id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-900">{application.lenda}</p>
                          <p className="mt-1 text-xs text-slate-500">{application.kodi}</p>
                        </div>
                      </td>
                      <td>
                        {formatDateLabel(application.data_provimit)} |{" "}
                        {formatTimeLabel(application.ora)} | {application.afati}
                      </td>
                      <td>{formatDateLabel(application.paraqitur_at)}</td>
                      <td>
                        <StatusBadge tone={application.nota_id ? "success" : "info"}>
                          {application.nota_id ? "Notuar" : application.statusi_paraqitjes}
                        </StatusBadge>
                      </td>
                      <td>
                        {application.nota_id ? (
                          <StatusBadge tone="dark">{application.nota}</StatusBadge>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={actionId === application.provimi_id}
                          disabled={!canCancel}
                          onClick={() => handleCancel(application)}
                        >
                          Anulo
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Ende nuk ke paraqitur provime"
            description="Pasi te klikosh Paraqit, provimi do te shfaqet ne kete liste dhe profesori do ta shohe per notim."
          />
        )}
      </SurfaceCard>
    </div>
  );
}

export default StudentExamsPage;

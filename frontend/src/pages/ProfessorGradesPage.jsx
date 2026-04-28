import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/ToastProvider";
import API, { getResponseMessage } from "../services/api";
import { formatDateLabel } from "../utils/display";
import { getRoleConnections } from "../utils/navigation";
import {
  getApiErrorMessage,
  validateProfessorGradeForm,
} from "../utils/validation";

const today = () => new Date().toISOString().slice(0, 10);

function ProfessorGradesPage() {
  const { notifyError, notifySuccess } = useToast();
  const [searchParams] = useSearchParams();
  const courseFilter = searchParams.get("course");
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examData, setExamData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const filteredExams = useMemo(() => {
    if (!courseFilter) {
      return exams;
    }

    return exams.filter((exam) => String(exam.lende_id) === String(courseFilter));
  }, [courseFilter, exams]);

  const selectedExam = useMemo(
    () =>
      filteredExams.find(
        (exam) => String(exam.provimi_id) === String(selectedExamId)
      ) || null,
    [filteredExams, selectedExamId]
  );

  const gradedStudentsCount = useMemo(
    () =>
      Object.values(drafts).filter((draft) => draft?.nota !== "" && draft?.nota !== null)
        .length,
    [drafts]
  );

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profesor/provimet");
      setExams(response.data || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se provimeve."));
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStudents = async (examId) => {
    try {
      setStudentsLoading(true);
      const response = await API.get(`/profesor/provimet/${examId}/studentet`);
      setExamData(response.data);

      const nextDrafts = {};
      (response.data.students || []).forEach((student) => {
        nextDrafts[student.student_id] = {
          nota: student.nota ?? "",
          data_vendosjes: student.data_vendosjes
            ? String(student.data_vendosjes).slice(0, 10)
            : today(),
          nota_id: student.nota_id || null,
          provimi_id: response.data.exam.provimi_id,
        };
      });

      setDrafts(nextDrafts);
      setError("");
    } catch (err) {
      setExamData(null);
      setDrafts({});
      setError(
        getApiErrorMessage(err, "Gabim gjate marrjes se studenteve per notim.")
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (!filteredExams.length) {
      setSelectedExamId("");
      return;
    }

    const hasSelectedExam = filteredExams.some(
      (exam) => String(exam.provimi_id) === String(selectedExamId)
    );

    if (!hasSelectedExam) {
      setSelectedExamId(String(filteredExams[0].provimi_id));
    }
  }, [filteredExams, selectedExamId]);

  useEffect(() => {
    if (selectedExamId) {
      fetchExamStudents(selectedExamId);
    }
  }, [selectedExamId]);

  const handleDraftChange = (studentId, name, value) => {
    setError("");
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [name]: value,
      },
    }));
  };

  const handleSave = async (student) => {
    const draft = drafts[student.student_id];
    const createPayload = {
      student_id: student.student_id,
      provimi_id: Number(selectedExamId),
      nota: draft?.nota,
      data_vendosjes: draft?.data_vendosjes,
    };

    const validationError = validateProfessorGradeForm(createPayload);

    if (validationError) {
      setError(validationError);
      notifyError(validationError);
      return;
    }

    try {
      setSavingId(student.student_id);

      let response;

      if (draft?.nota_id) {
        response = await API.put(`/profesor/notat/${draft.nota_id}`, {
          nota: draft.nota,
          data_vendosjes: draft.data_vendosjes,
        });
      } else {
        response = await API.post("/profesor/notat", createPayload);
      }

      await fetchExamStudents(selectedExamId);
      notifySuccess(
        getResponseMessage(response, "Nota u ruajt me sukses."),
        draft?.nota_id ? "Nota u perditesua" : "Nota u vendos"
      );
    } catch (err) {
      const message = getApiErrorMessage(err, "Gabim gjate ruajtjes se notes.");
      setError(message);
      notifyError(message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <SkeletonRows count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Professor Grading"
        title="Vendos dhe perditeso nota"
        description="Fluksi i notimit fillon nga provimet dhe vazhdon direkt te studentet e lendes se zgjedhur."
        actions={
          <>
            <Link
              to="/profesor/lendet"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Kthehu te lendet
            </Link>
            <Link
              to={`/profesor/provimet${courseFilter ? `?course=${courseFilter}` : ""}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Menaxho provimet
            </Link>
          </>
        }
      />

      <SectionNav items={getRoleConnections("profesor")} />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon="calendar"
          label="Provimet ne fokus"
          value={filteredExams.length}
          tone="accent"
        />
        <StatCard
          icon="users"
          label="Studentet ne kete provim"
          value={examData?.students?.length || 0}
        />
        <StatCard
          icon="graduation"
          label="Nota te ruajtura"
          value={gradedStudentsCount}
          tone="dark"
        />
      </section>

      <SurfaceCard>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Puna me provimet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {courseFilter
                ? "Po shikon vetem provimet e lendes se zgjedhur nga faqja e lendeve."
                : "Zgjidh nje provim dhe puno direkt me notat e studenteve te regjistruar."}
            </p>
          </div>

          <div className="w-full max-w-md">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Provimi
            </label>
            <select
              value={selectedExamId}
              onChange={(event) => setSelectedExamId(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
            >
              <option value="">Zgjidh provimin</option>
              {filteredExams.map((exam) => (
                <option key={exam.provimi_id} value={exam.provimi_id}>
                  {exam.lenda} | {formatDateLabel(exam.data_provimit)} | {exam.afati}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedExam ? (
          <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">
                  {selectedExam.lenda} ({selectedExam.kodi})
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDateLabel(selectedExam.data_provimit)} | {selectedExam.afati}
                </p>
              </div>
              <StatusBadge tone="info">{selectedExam.total_notash} nota ekzistuese</StatusBadge>
            </div>
          </div>
        ) : null}

        {studentsLoading ? (
          <div className="mt-6">
            <SkeletonRows count={3} />
          </div>
        ) : examData?.students?.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>Studenti</th>
                  <th>Email</th>
                  <th>Statusi</th>
                  <th>Nota</th>
                  <th>Data</th>
                  <th>Veprimi</th>
                </tr>
              </thead>
              <tbody>
                {examData.students.map((student) => {
                  const draft = drafts[student.student_id] || {
                    nota: "",
                    data_vendosjes: today(),
                  };

                  return (
                    <tr key={student.student_id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.emri} {student.mbiemri}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Student ID: {student.student_id}
                          </p>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        <StatusBadge>{student.statusi_regjistrimit}</StatusBadge>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="5"
                          max="10"
                          step="0.5"
                          value={draft.nota}
                          onChange={(event) =>
                            handleDraftChange(
                              student.student_id,
                              "nota",
                              event.target.value
                            )
                          }
                          className="w-24 rounded-2xl border border-slate-300 px-3 py-2"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={draft.data_vendosjes}
                          onChange={(event) =>
                            handleDraftChange(
                              student.student_id,
                              "data_vendosjes",
                              event.target.value
                            )
                          }
                          className="rounded-2xl border border-slate-300 px-3 py-2"
                        />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          loading={savingId === student.student_id}
                          onClick={() => handleSave(student)}
                        >
                          {student.nota_id ? "Perditeso" : "Vendos"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Nuk ka studente per notim"
              description={
                filteredExams.length
                  ? "Provimi ekziston, por ende nuk ka studente te regjistruar ne kete lende."
                  : "Nuk ka provime te lidhura me filtrin aktual. Krijo ose filtro nje provim tjeter."
              }
            />
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

export default ProfessorGradesPage;

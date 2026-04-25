import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { formatDateLabel } from "../utils/display";
import {
  getApiErrorMessage,
  validateProfessorGradeForm,
} from "../utils/validation";

const today = () => new Date().toISOString().slice(0, 10);

function ProfessorGradesPage() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examData, setExamData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const selectedExam = useMemo(
    () =>
      exams.find((exam) => String(exam.provimi_id) === String(selectedExamId)) ||
      null,
    [exams, selectedExamId]
  );

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profesor/provimet");
      setExams(response.data);
      setError("");

      if (response.data.length > 0) {
        setSelectedExamId((prev) => prev || String(response.data[0].provimi_id));
      }
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
      response.data.students.forEach((student) => {
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
      return;
    }

    try {
      setSavingId(student.student_id);

      if (draft?.nota_id) {
        await API.put(`/profesor/notat/${draft.nota_id}`, {
          nota: draft.nota,
          data_vendosjes: draft.data_vendosjes,
        });
      } else {
        await API.post("/profesor/notat", createPayload);
      }

      await fetchExamStudents(selectedExamId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate ruajtjes se notes."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notimi i studenteve</h2>
          <p className="mt-2 text-sm text-slate-500">
            Zgjidh nje provim dhe vendos ose perditeso notat e studenteve te
            regjistruar.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Provimi
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
          >
            <option value="">Zgjidh provimin</option>
            {exams.map((exam) => (
              <option key={exam.provimi_id} value={exam.provimi_id}>
                {exam.lenda} | {formatDateLabel(exam.data_provimit)} | {exam.afati}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Duke i ngarkuar provimet...</p>
      ) : selectedExam ? (
        <>
          <div className="mt-6 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {selectedExam.lenda} ({selectedExam.kodi})
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {formatDateLabel(selectedExam.data_provimit)} | {selectedExam.afati}
            </p>
          </div>

          {studentsLoading ? (
            <p className="mt-6 text-sm text-slate-500">
              Duke i ngarkuar studentet...
            </p>
          ) : examData?.students?.length ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 font-medium">Studenti</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Statusi</th>
                    <th className="pb-3 font-medium">Nota</th>
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">Veprimi</th>
                  </tr>
                </thead>
                <tbody>
                  {examData.students.map((student) => {
                    const draft = drafts[student.student_id] || {
                      nota: "",
                      data_vendosjes: today(),
                    };

                    return (
                      <tr
                        key={student.student_id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 text-slate-900">
                          {student.emri} {student.mbiemri}
                        </td>
                        <td className="py-3 text-slate-600">{student.email}</td>
                        <td className="py-3 text-slate-600">
                          {student.statusi_regjistrimit}
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            min="5"
                            max="10"
                            step="0.5"
                            value={draft.nota}
                            onChange={(e) =>
                              handleDraftChange(
                                student.student_id,
                                "nota",
                                e.target.value
                              )
                            }
                            className="w-24 rounded-xl border border-slate-300 px-3 py-2"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="date"
                            value={draft.data_vendosjes}
                            onChange={(e) =>
                              handleDraftChange(
                                student.student_id,
                                "data_vendosjes",
                                e.target.value
                              )
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2"
                          />
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleSave(student)}
                            disabled={savingId === student.student_id}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
                          >
                            {savingId === student.student_id
                              ? "Duke ruajtur..."
                              : student.nota_id
                                ? "Perditeso"
                                : "Vendos"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Nuk ka studente te regjistruar per kete provim.
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nuk ka provime te disponueshme per notim.
        </div>
      )}
    </div>
  );
}

export default ProfessorGradesPage;

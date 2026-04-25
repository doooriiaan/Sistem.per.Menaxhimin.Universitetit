import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDateLabel, formatTimeLabel } from "../utils/display";
import { getApiErrorMessage } from "../utils/validation";

function StudentExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/provimet");
        setExams(response.data);
        setError("");
      } catch (err) {
        setError(getApiErrorMessage(err, "Gabim gjate marrjes se provimeve."));
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Provimet e mia</h2>
      <p className="mt-2 text-sm text-slate-500">
        Te gjitha provimet e lendeve ku je i regjistruar.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Duke i ngarkuar provimet...</p>
      ) : exams.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <div
              key={exam.provimi_id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <p className="font-semibold text-slate-900">
                {exam.lenda} ({exam.kodi})
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p>Profesori: {exam.profesori || "-"}</p>
                <p>Data: {formatDateLabel(exam.data_provimit)}</p>
                <p>Ora: {formatTimeLabel(exam.ora)}</p>
                <p>Salla: {exam.salla}</p>
                <p>Afati: {exam.afati}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nuk ka provime te lidhura me llogarine tende.
        </div>
      )}
    </div>
  );
}

export default StudentExamsPage;

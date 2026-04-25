import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { formatAverageLabel, formatDateLabel } from "../utils/display";
import { getApiErrorMessage } from "../utils/validation";

function StudentGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/notat");
        setGrades(response.data);
        setError("");
      } catch (err) {
        setError(getApiErrorMessage(err, "Gabim gjate marrjes se notave."));
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const average = useMemo(() => {
    if (grades.length === 0) {
      return null;
    }

    const total = grades.reduce((sum, grade) => sum + Number(grade.nota), 0);
    return total / grades.length;
  }, [grades]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notat e mia</h2>
          <p className="mt-2 text-sm text-slate-500">
            Te gjitha rezultatet e regjistruara per ty.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
          <p className="text-sm text-slate-400">Mesatarja aktuale</p>
          <p className="mt-2 text-2xl font-bold">{formatAverageLabel(average)}</p>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Duke i ngarkuar notat...</p>
      ) : grades.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-3 font-medium">Lenda</th>
                <th className="pb-3 font-medium">Profesori</th>
                <th className="pb-3 font-medium">Provimi</th>
                <th className="pb-3 font-medium">Nota</th>
                <th className="pb-3 font-medium">Vendosur me</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.nota_id} className="border-b border-slate-100">
                  <td className="py-3 text-slate-900">
                    {grade.lenda} ({grade.kodi})
                  </td>
                  <td className="py-3 text-slate-600">{grade.profesori || "-"}</td>
                  <td className="py-3 text-slate-600">
                    {formatDateLabel(grade.data_provimit)} | {grade.afati}
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
                      {grade.nota}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">
                    {formatDateLabel(grade.data_vendosjes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nuk ka nota te regjistruara aktualisht.
        </div>
      )}
    </div>
  );
}

export default StudentGradesPage;

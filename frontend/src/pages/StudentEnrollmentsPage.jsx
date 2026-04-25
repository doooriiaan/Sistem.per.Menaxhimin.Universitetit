import { useEffect, useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/validation";

function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/regjistrimet");
        setEnrollments(response.data);
        setError("");
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Gabim gjate marrjes se regjistrimeve.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Regjistrimet e mia</h2>
      <p className="mt-2 text-sm text-slate-500">
        Lendet ku je regjistruar, profesori perkates dhe statusi i seciles.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">
          Duke i ngarkuar regjistrimet...
        </p>
      ) : enrollments.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {enrollments.map((item) => (
            <div
              key={item.regjistrimi_id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.lenda} ({item.kodi})
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.profesor || "-"} | Semestri {item.semestri}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.statusi}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <p>Viti akademik: {item.viti_akademik}</p>
                <p>Kredite: {item.kreditet}</p>
                <p>Lloji: {item.lloji}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nuk ka regjistrime te lidhura me llogarine tende.
        </div>
      )}
    </div>
  );
}

export default StudentEnrollmentsPage;

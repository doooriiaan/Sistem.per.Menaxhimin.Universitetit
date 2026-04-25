import { useEffect, useState } from "react";
import API from "../services/api";
import { formatTimeLabel } from "../utils/display";
import { getApiErrorMessage } from "../utils/validation";

function StudentSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/orari");
        setSchedule(response.data);
        setError("");
      } catch (err) {
        setError(getApiErrorMessage(err, "Gabim gjate marrjes se orarit."));
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Orari im</h2>
      <p className="mt-2 text-sm text-slate-500">
        Oraret e lendeve ku je i regjistruar aktualisht.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Duke e ngarkuar orarin...</p>
      ) : schedule.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-3 font-medium">Lenda</th>
                <th className="pb-3 font-medium">Profesori</th>
                <th className="pb-3 font-medium">Dita</th>
                <th className="pb-3 font-medium">Ora</th>
                <th className="pb-3 font-medium">Salla</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.orari_id} className="border-b border-slate-100">
                  <td className="py-3 text-slate-900">
                    {item.lenda} ({item.kodi})
                  </td>
                  <td className="py-3 text-slate-600">{item.profesori || "-"}</td>
                  <td className="py-3 text-slate-600">{item.dita}</td>
                  <td className="py-3 text-slate-600">
                    {formatTimeLabel(item.ora_fillimit)} -{" "}
                    {formatTimeLabel(item.ora_mbarimit)}
                  </td>
                  <td className="py-3 text-slate-600">{item.salla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nuk ka orar te lidhur me llogarine tende.
        </div>
      )}
    </div>
  );
}

export default StudentSchedulePage;

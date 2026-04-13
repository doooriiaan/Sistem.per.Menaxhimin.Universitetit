import { useEffect, useState } from "react";
import API from "../services/api";

function LendetPage() {
  const [lendet, setLendet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLendet = async () => {
      try {
        const res = await API.get("/lendet");
        setLendet(res.data);
      } catch (err) {
        console.error(err);
        setError("Gabim gjatë marrjes së lëndëve.");
      } finally {
        setLoading(false);
      }
    };

    fetchLendet();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Lëndët</h2>

      {loading && (
        <div className="bg-white rounded-2xl shadow p-6 text-slate-600">
          Duke i ngarkuar lëndët...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 rounded-2xl p-4 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Emri</th>
                <th className="p-4">Kodi</th>
                <th className="p-4">Kreditet</th>
                <th className="p-4">Semestri</th>
                <th className="p-4">Lloji</th>
              </tr>
            </thead>
            <tbody>
              {lendet.length > 0 ? (
                lendet.map((lenda) => (
                  <tr
                    key={lenda.lende_id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4">{lenda.lende_id}</td>
                    <td className="p-4">{lenda.emri}</td>
                    <td className="p-4">{lenda.kodi}</td>
                    <td className="p-4">{lenda.kreditet}</td>
                    <td className="p-4">{lenda.semestri}</td>
                    <td className="p-4">{lenda.lloji}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    Nuk ka lëndë për momentin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LendetPage;
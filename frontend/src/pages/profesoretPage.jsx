import { useEffect, useState } from "react";
import API from "../services/api";

function ProfesoretPage() {
  const [profesoret, setProfesoret] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfesoret = async () => {
      try {
        const res = await API.get("/profesoret");
        setProfesoret(res.data);
      } catch (err) {
        console.error(err);
        setError("Gabim gjatë marrjes së profesorëve.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfesoret();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Profesorët</h2>

      {loading && (
        <div className="bg-white rounded-2xl shadow p-6 text-slate-600">
          Duke i ngarkuar profesorët...
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
                <th className="p-4">Mbiemri</th>
                <th className="p-4">Titulli Akademik</th>
                <th className="p-4">Email</th>
                <th className="p-4">Telefoni</th>
              </tr>
            </thead>
            <tbody>
              {profesoret.length > 0 ? (
                profesoret.map((profesor) => (
                  <tr
                    key={profesor.profesor_id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4">{profesor.profesor_id}</td>
                    <td className="p-4">{profesor.emri}</td>
                    <td className="p-4">{profesor.mbiemri}</td>
                    <td className="p-4">{profesor.titulli_akademik}</td>
                    <td className="p-4">{profesor.email}</td>
                    <td className="p-4">{profesor.telefoni}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    Nuk ka profesorë për momentin.
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

export default ProfesoretPage;
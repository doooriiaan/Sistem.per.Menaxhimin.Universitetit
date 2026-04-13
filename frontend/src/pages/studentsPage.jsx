import { useEffect, useState } from "react";
import API from "../services/api";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/studentet");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        setError("Gabim gjatë marrjes së studentëve.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Studentët</h2>

      {loading && (
        <div className="bg-white rounded-2xl shadow p-6 text-slate-600">
          Duke i ngarkuar studentët...
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
                <th className="p-4">Email</th>
                <th className="p-4">Telefoni</th>
                <th className="p-4">Statusi</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.student_id} className="border-t hover:bg-slate-50">
                    <td className="p-4">{student.student_id}</td>
                    <td className="p-4">{student.emri}</td>
                    <td className="p-4">{student.mbiemri}</td>
                    <td className="p-4">{student.email}</td>
                    <td className="p-4">{student.telefoni}</td>
                    <td className="p-4">{student.statusi}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    Nuk ka studentë për momentin.
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

export default StudentsPage;
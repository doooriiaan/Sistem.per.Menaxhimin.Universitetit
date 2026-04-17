import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  emri: "",
  mbiemri: "",
  numri_personal: "",
  data_lindjes: "",
  gjinia: "M",
  email: "",
  telefoni: "",
  adresa: "",
  drejtimi_id: 1,
  viti_studimit: 1,
  statusi: "Aktiv",
};

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/studentet");
      setStudents(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së studentëve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      emri: student.emri || "",
      mbiemri: student.mbiemri || "",
      numri_personal: student.numri_personal || "",
      data_lindjes: student.data_lindjes
        ? String(student.data_lindjes).split("T")[0]
        : "",
      gjinia: student.gjinia || "M",
      email: student.email || "",
      telefoni: student.telefoni || "",
      adresa: student.adresa || "",
      drejtimi_id: student.drejtimi_id || 1,
      viti_studimit: student.viti_studimit || 1,
      statusi: student.statusi || "Aktiv",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await API.put(`/studentet/${editingStudent.student_id}`, form);
      } else {
        await API.post("/studentet", form);
      }

      closeModal();
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError(
        editingStudent
          ? "Gabim gjatë përditësimit të studentit."
          : "Gabim gjatë shtimit të studentit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/studentet/${id}`);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së studentit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Studentët</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho studentët e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white  px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Student
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë studentët...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Emri</th>
                  <th className="p-4 text-left">Mbiemri</th>
                  <th className="p-4 text-left">Nr. Personal</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Telefoni</th>
                  <th className="p-4 text-left">Drejtimi ID</th>
                  <th className="p-4 text-left">Viti</th>
                  <th className="p-4 text-left">Statusi</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{student.student_id}</td>
                      <td className="p-4">{student.emri}</td>
                      <td className="p-4">{student.mbiemri}</td>
                      <td className="p-4">{student.numri_personal}</td>
                      <td className="p-4">{student.email}</td>
                      <td className="p-4">{student.telefoni}</td>
                      <td className="p-4">{student.drejtimi_id}</td>
                      <td className="p-4">{student.viti_studimit}</td>
                      <td className="p-4">{student.statusi}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(student)}
                            className="bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                          >
                           Update
                          </button>

                          <button
                            onClick={() => handleDelete(student.student_id)}
                            className="bg-red-500 text-white font-medium hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="p-6 text-center text-slate-500"
                    >
                      Nuk ka studentë për momentin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingStudent ? "Edit Student" : "Shto Student"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Emri</p>
              <input
                name="emri"
                placeholder="Emri"
                value={form.emri}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Mbiemri</p>
              <input
                name="mbiemri"
                placeholder="Mbiemri"
                value={form.mbiemri}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Numri Personal</p>
              <input
                name="numri_personal"
                placeholder="Numri Personal"
                value={form.numri_personal}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Data e Lindjes</p>
              
              <input
                type="date"
                name="data_lindjes"
                value={form.data_lindjes}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Gjinia</p>
               
              <select
                name="gjinia"
                value={form.gjinia}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              >
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Email</p>
                
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Telefoni</p>
              

              <input
                name="telefoni"
                placeholder="Telefoni"
                value={form.telefoni}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Adresa</p>
           

              <input
                name="adresa"
                placeholder="Adresa"
                value={form.adresa}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Drejtimi ID</p>
             

              <input
                name="drejtimi_id"
                type="number"
                placeholder="Drejtimi ID"
                value={form.drejtimi_id}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
               </div>

               <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Viti Studimit</p>
              
              <input
                name="viti_studimit"
                type="number"
                placeholder="Viti Studimit"
                value={form.viti_studimit}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                required
              />
               </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Statusi</p>

              <select
                name="statusi"
                value={form.statusi}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 md:col-span-2"
                required
              >
                <option value="Aktiv">Aktiv</option>
                <option value="Jo aktiv">Jo aktiv</option>
              </select>
                </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white"
                >
                  {editingStudent ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default StudentsPage;
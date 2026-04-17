import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  emri: "",
  mbiemri: "",
  titulli_akademik: "",
  departamenti_id: 1,
  email: "",
  telefoni: "",
  specializimi: "",
  data_punesimit: "",
};

function ProfesoretPage() {
  const [profesoret, setProfesoret] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProfesoret = async () => {
    try {
      setLoading(true);
      const res = await API.get("/profesoret");
      setProfesoret(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së profesorëve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesoret();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingProfesor(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (profesor) => {
    setEditingProfesor(profesor);
    setForm({
      emri: profesor.emri || "",
      mbiemri: profesor.mbiemri || "",
      titulli_akademik: profesor.titulli_akademik || "",
      departamenti_id: profesor.departamenti_id || 1,
      email: profesor.email || "",
      telefoni: profesor.telefoni || "",
      specializimi: profesor.specializimi || "",
      data_punesimit: profesor.data_punesimit
        ? String(profesor.data_punesimit).split("T")[0]
        : "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProfesor(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProfesor) {
        await API.put(`/profesoret/${editingProfesor.profesor_id}`, form);
      } else {
        await API.post("/profesoret", form);
      }

      closeModal();
      fetchProfesoret();
    } catch (err) {
      console.error(err);
      setError(
        editingProfesor
          ? "Gabim gjatë përditësimit të profesorit."
          : "Gabim gjatë shtimit të profesorit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/profesoret/${id}`);
      fetchProfesoret();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së profesorit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Profesorët</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho stafin akademik
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Profesor
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë profesorët...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Emri</th>
                  <th className="p-4 text-left">Mbiemri</th>
                  <th className="p-4 text-left">Titulli</th>
                  <th className="p-4 text-left">Departamenti ID</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Telefoni</th>
                  <th className="p-4 text-left">Specializimi</th>
                  <th className="p-4 text-left">Data Punësimit</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {profesoret.length > 0 ? (
                  profesoret.map((profesor) => (
                    <tr
                      key={profesor.profesor_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{profesor.profesor_id}</td>
                      <td className="p-4">{profesor.emri}</td>
                      <td className="p-4">{profesor.mbiemri}</td>
                      <td className="p-4">{profesor.titulli_akademik}</td>
                      <td className="p-4">{profesor.departamenti_id}</td>
                      <td className="p-4">{profesor.email}</td>
                      <td className="p-4">{profesor.telefoni}</td>
                      <td className="p-4">{profesor.specializimi}</td>
                      <td className="p-4">
                        {profesor.data_punesimit
                          ? String(profesor.data_punesimit).split("T")[0]
                          : ""}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(profesor)}
                            className="bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleDelete(profesor.profesor_id)}
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
                    <td colSpan="10" className="p-6 text-center text-slate-500">
                      Nuk ka profesorë për momentin.
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
              {editingProfesor ? "Edit Profesor" : "Shto Profesor"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Emri</p>
                  <input
                    name="emri"
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
                    value={form.mbiemri}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Titulli Akademik</p>
                  <input
                    name="titulli_akademik"
                    value={form.titulli_akademik}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Departamenti ID</p>
                  <input
                    name="departamenti_id"
                    type="number"
                    value={form.departamenti_id}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Email</p>
                  <input
                    name="email"
                    type="email"
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
                    value={form.telefoni}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Specializimi</p>
                  <input
                    name="specializimi"
                    value={form.specializimi}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Data e Punësimit</p>
                  <input
                    type="date"
                    name="data_punesimit"
                    value={form.data_punesimit}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
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
                    {editingProfesor ? "Update" : "Save"}
                  </button>
                </div>

              </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfesoretPage;
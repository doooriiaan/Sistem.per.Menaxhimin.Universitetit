import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  student_id: 1,
  lende_id: 1,
  semestri: "",
  viti_akademik: "",
  statusi: "",
};

function RegjistrimetPage() {
  const [regjistrimet, setRegjistrimet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRegjistrimi, setEditingRegjistrimi] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRegjistrimet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/regjistrimet");
      setRegjistrimet(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së regjistrimeve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegjistrimet();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingRegjistrimi(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (regjistrimi) => {
    setEditingRegjistrimi(regjistrimi);
    setForm({
      student_id: regjistrimi.student_id || 1,
      lende_id: regjistrimi.lende_id || 1,
      semestri: regjistrimi.semestri || "",
      viti_akademik: regjistrimi.viti_akademik || "",
      statusi: regjistrimi.statusi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegjistrimi(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRegjistrimi) {
        await API.put(
          `/regjistrimet/${editingRegjistrimi.regjistrim_id}`,
          form
        );
      } else {
        await API.post("/regjistrimet", form);
      }

      closeModal();
      fetchRegjistrimet();
    } catch (err) {
      console.error(err);
      setError(
        editingRegjistrimi
          ? "Gabim gjatë përditësimit të regjistrimit."
          : "Gabim gjatë shtimit të regjistrimit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/regjistrimet/${id}`);
      fetchRegjistrimet();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së regjistrimit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Regjistrimet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho regjistrimet e studentëve
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Regjistrim
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë regjistrimet...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Student ID</th>
                  <th className="p-4 text-left">Lende ID</th>
                  <th className="p-4 text-left">Semestri</th>
                  <th className="p-4 text-left">Viti Akademik</th>
                  <th className="p-4 text-left">Statusi</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regjistrimet.length > 0 ? (
                  regjistrimet.map((item) => (
                    <tr
                      key={item.regjistrim_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{item.regjistrim_id}</td>
                      <td className="p-4">{item.student_id}</td>
                      <td className="p-4">{item.lende_id}</td>
                      <td className="p-4">{item.semestri}</td>
                      <td className="p-4">{item.viti_akademik}</td>
                      <td className="p-4">{item.statusi}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-blue-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(item.regjistrim_id)}
                            className="bg-red-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-500">
                      Nuk ka regjistrime për momentin.
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingRegjistrimi ? "Edit Regjistrim" : "Shto Regjistrim"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Student ID</p>
                <input
                  name="student_id"
                  type="number"
                  value={form.student_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Lende ID</p>
                <input
                  name="lende_id"
                  type="number"
                  value={form.lende_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Semestri</p>
                <input
                  name="semestri"
                  value={form.semestri}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Viti Akademik</p>
                <input
                  name="viti_akademik"
                  value={form.viti_akademik}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-700 mb-1">Statusi</p>
                <input
                  name="statusi"
                  value={form.statusi}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
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
                  {editingRegjistrimi ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegjistrimetPage;
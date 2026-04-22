import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  emri: "",
  fakulteti_id: 1,
  niveli: "",
  kohezgjatja_vite: 3,
  pershkrimi: "",
};

function DrejtimetPage() {
  const [drejtimet, setDrejtimet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDrejtimi, setEditingDrejtimi] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchDrejtimet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/drejtimet");
      setDrejtimet(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së drejtimeve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrejtimet();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingDrejtimi(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (drejtimi) => {
    setEditingDrejtimi(drejtimi);
    setForm({
      emri: drejtimi.emri || "",
      fakulteti_id: drejtimi.fakulteti_id || 1,
      niveli: drejtimi.niveli || "",
      kohezgjatja_vite: drejtimi.kohezgjatja_vite || 3,
      pershkrimi: drejtimi.pershkrimi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDrejtimi(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDrejtimi) {
        await API.put(`/drejtimet/${editingDrejtimi.drejtim_id}`, form);
      } else {
        await API.post("/drejtimet", form);
      }

      closeModal();
      fetchDrejtimet();
    } catch (err) {
      console.error(err);
      setError(
        editingDrejtimi
          ? "Gabim gjatë përditësimit të drejtimit."
          : "Gabim gjatë shtimit të drejtimit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/drejtimet/${id}`);
      fetchDrejtimet();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së drejtimit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Drejtimet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho drejtimet e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Drejtim
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë drejtimet...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Emri</th>
                  <th className="p-4 text-left">Fakulteti ID</th>
                  <th className="p-4 text-left">Niveli</th>
                  <th className="p-4 text-left">Kohezgjatja</th>
                  <th className="p-4 text-left">Pershkrimi</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {drejtimet.length > 0 ? (
                  drejtimet.map((drejtimi) => (
                    <tr
                      key={drejtimi.drejtim_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{drejtimi.drejtim_id}</td>
                      <td className="p-4">{drejtimi.emri}</td>
                      <td className="p-4">{drejtimi.fakulteti_id}</td>
                      <td className="p-4">{drejtimi.niveli}</td>
                      <td className="p-4">{drejtimi.kohezgjatja_vite}</td>
                      <td className="p-4">{drejtimi.pershkrimi}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(drejtimi)}
                            className="bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleDelete(drejtimi.drejtim_id)}
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
                    <td colSpan="7" className="p-6 text-center text-slate-500">
                      Nuk ka drejtime për momentin.
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
              {editingDrejtimi ? "Edit Drejtim" : "Shto Drejtim"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
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
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Fakulteti ID
                </p>
                <input
                  name="fakulteti_id"
                  type="number"
                  placeholder="Fakulteti ID"
                  value={form.fakulteti_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Niveli
                </p>
                <input
                  name="niveli"
                  placeholder="Niveli"
                  value={form.niveli}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Kohezgjatja Vite
                </p>
                <input
                  name="kohezgjatja_vite"
                  type="number"
                  placeholder="Kohezgjatja Vite"
                  value={form.kohezgjatja_vite}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Pershkrimi
                </p>
                <textarea
                  name="pershkrimi"
                  placeholder="Pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  rows="4"
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
                  {editingDrejtimi ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrejtimetPage;
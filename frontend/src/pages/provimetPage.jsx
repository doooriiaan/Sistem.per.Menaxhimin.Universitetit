import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  lende_id: 1,
  profesor_id: 1,
  data_provimit: "",
  ora: "",
  salla: "",
  afati: "",
};

function ProvimetPage() {
  const [provimet, setProvimet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProvimi, setEditingProvimi] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProvimet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/provimet");
      setProvimet(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së provimeve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvimet();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingProvimi(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (provimi) => {
    setEditingProvimi(provimi);
    setForm({
      lende_id: provimi.lende_id || 1,
      profesor_id: provimi.profesor_id || 1,
      data_provimit: provimi.data_provimit ? provimi.data_provimit.split("T")[0] : "",
      ora: provimi.ora || "",
      salla: provimi.salla || "",
      afati: provimi.afati || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProvimi(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProvimi) {
        await API.put(`/provimet/${editingProvimi.provimi_id}`, form);
      } else {
        await API.post("/provimet", form);
      }

      closeModal();
      fetchProvimet();
    } catch (err) {
      console.error(err);
      setError(
        editingProvimi
          ? "Gabim gjatë përditësimit të provimit."
          : "Gabim gjatë shtimit të provimit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/provimet/${id}`);
      fetchProvimet();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së provimit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Provimet</h2>
            <p className="text-sm text-slate-500 mt-1">Menaxho provimet</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Provim
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë provimet...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Lende ID</th>
                  <th className="p-4 text-left">Profesor ID</th>
                  <th className="p-4 text-left">Data</th>
                  <th className="p-4 text-left">Ora</th>
                  <th className="p-4 text-left">Salla</th>
                  <th className="p-4 text-left">Afati</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {provimet.length > 0 ? (
                  provimet.map((item) => (
                    <tr
                      key={item.provimi_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{item.provimi_id}</td>
                      <td className="p-4">{item.lende_id}</td>
                      <td className="p-4">{item.profesor_id}</td>
                      <td className="p-4">
                        {item.data_provimit ? item.data_provimit.split("T")[0] : ""}
                      </td>
                      <td className="p-4">{item.ora}</td>
                      <td className="p-4">{item.salla}</td>
                      <td className="p-4">{item.afati}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-blue-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(item.provimi_id)}
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
                    <td colSpan="8" className="p-6 text-center text-slate-500">
                      Nuk ka provime për momentin.
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
              {editingProvimi ? "Edit Provim" : "Shto Provim"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm font-medium text-slate-700 mb-1">Profesor ID</p>
                <input
                  name="profesor_id"
                  type="number"
                  value={form.profesor_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Data Provimit</p>
                <input
                  name="data_provimit"
                  type="date"
                  value={form.data_provimit}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Ora</p>
                <input
                  name="ora"
                  type="time"
                  value={form.ora}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Salla</p>
                <input
                  name="salla"
                  value={form.salla}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Afati</p>
                <input
                  name="afati"
                  value={form.afati}
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
                  {editingProvimi ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProvimetPage;
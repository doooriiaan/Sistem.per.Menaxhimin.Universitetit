import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  lende_id: 1,
  profesori_id: 1,
  dita: "",
  ora_fillimit: "",
  ora_mbarimit: "",
  salla: "",
};

function OraretPage() {
  const [oraret, setOraret] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrari, setEditingOrari] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchOraret = async () => {
    try {
      setLoading(true);
      const res = await API.get("/oraret");
      setOraret(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së orareve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOraret();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingOrari(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (orari) => {
    setEditingOrari(orari);
    setForm({
      lende_id: orari.lende_id || 1,
      profesori_id: orari.profesori_id || 1,
      dita: orari.dita || "",
      ora_fillimit: orari.ora_fillimit || "",
      ora_mbarimit: orari.ora_mbarimit || "",
      salla: orari.salla || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrari(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingOrari) {
        await API.put(`/oraret/${editingOrari.orari_id}`, form);
      } else {
        await API.post("/oraret", form);
      }

      closeModal();
      fetchOraret();
    } catch (err) {
      console.error(err);
      setError(
        editingOrari
          ? "Gabim gjatë përditësimit të orarit."
          : "Gabim gjatë shtimit të orarit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/oraret/${id}`);
      fetchOraret();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së orarit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Oraret</h2>
            <p className="text-sm text-slate-500 mt-1">Menaxho oraret</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Orar
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë oraret...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Lende ID</th>
                  <th className="p-4 text-left">Profesori ID</th>
                  <th className="p-4 text-left">Dita</th>
                  <th className="p-4 text-left">Ora Fillimit</th>
                  <th className="p-4 text-left">Ora Mbarimit</th>
                  <th className="p-4 text-left">Salla</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {oraret.length > 0 ? (
                  oraret.map((item) => (
                    <tr
                      key={item.orari_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{item.orari_id}</td>
                      <td className="p-4">{item.lende_id}</td>
                      <td className="p-4">{item.profesori_id}</td>
                      <td className="p-4">{item.dita}</td>
                      <td className="p-4">{item.ora_fillimit}</td>
                      <td className="p-4">{item.ora_mbarimit}</td>
                      <td className="p-4">{item.salla}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-blue-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(item.orari_id)}
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
                      Nuk ka orare për momentin.
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
              {editingOrari ? "Edit Orar" : "Shto Orar"}
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
                <p className="text-sm font-medium text-slate-700 mb-1">Profesori ID</p>
                <input
                  name="profesori_id"
                  type="number"
                  value={form.profesori_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Dita</p>
                <input
                  name="dita"
                  value={form.dita}
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
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Ora Fillimit</p>
                <input
                  name="ora_fillimit"
                  type="time"
                  value={form.ora_fillimit}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Ora Mbarimit</p>
                <input
                  name="ora_mbarimit"
                  type="time"
                  value={form.ora_mbarimit}
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
                  {editingOrari ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OraretPage;
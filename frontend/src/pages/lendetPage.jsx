import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  emri: "",
  kodi: "",
  kreditet: 0,
  semestri: 1,
  drejtimi_id: 1,
  profesori_id: 1,
  lloji: "",
  pershkrimi: "",
};

function LendetPage() {
  const [lendet, setLendet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingLenda, setEditingLenda] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchLendet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/lendet");
      setLendet(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së lëndëve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLendet();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingLenda(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (lenda) => {
    setEditingLenda(lenda);
    setForm({
      emri: lenda.emri || "",
      kodi: lenda.kodi || "",
      kreditet: lenda.kreditet || 0,
      semestri: lenda.semestri || 1,
      drejtimi_id: lenda.drejtimi_id || 1,
      profesori_id: lenda.profesori_id || 1,
      lloji: lenda.lloji || "",
      pershkrimi: lenda.pershkrimi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLenda(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingLenda) {
        await API.put(`/lendet/${editingLenda.lende_id}`, form);
      } else {
        await API.post("/lendet", form);
      }

      closeModal();
      fetchLendet();
    } catch (err) {
      console.error(err);
      setError(
        editingLenda
          ? "Gabim gjatë përditësimit të lëndës."
          : "Gabim gjatë shtimit të lëndës."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/lendet/${id}`);
      fetchLendet();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së lëndës.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lëndët</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho lëndët e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Lëndë
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë lëndët...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Emri</th>
                  <th className="p-4 text-left">Kodi</th>
                  <th className="p-4 text-left">Kreditet</th>
                  <th className="p-4 text-left">Semestri</th>
                  <th className="p-4 text-left">Drejtimi ID</th>
                  <th className="p-4 text-left">Profesori ID</th>
                  <th className="p-4 text-left">Lloji</th>
                  <th className="p-4 text-left">Përshkrimi</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {lendet.length > 0 ? (
                  lendet.map((lenda) => (
                    <tr
                      key={lenda.lende_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{lenda.lende_id}</td>
                      <td className="p-4">{lenda.emri}</td>
                      <td className="p-4">{lenda.kodi}</td>
                      <td className="p-4">{lenda.kreditet}</td>
                      <td className="p-4">{lenda.semestri}</td>
                      <td className="p-4">{lenda.drejtimi_id}</td>
                      <td className="p-4">{lenda.profesori_id}</td>
                      <td className="p-4">{lenda.lloji}</td>
                      <td className="p-4 max-w-[220px] truncate">
                        {lenda.pershkrimi}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(lenda)}
                            className="bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleDelete(lenda.lende_id)}
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
                      Nuk ka lëndë për momentin.
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
              {editingLenda ? "Edit Lëndë" : "Shto Lëndë"}
            </h3>

           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Emri</p>
    <input
      name="emri"
      value={form.emri}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
      required
    />
  </div>

  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Kodi</p>
    <input
      name="kodi"
      value={form.kodi}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
      required
    />
  </div>

  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Kreditet</p>
    <input
      name="kreditet"
      type="number"
      value={form.kreditet}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
      required
    />
  </div>

  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Semestri</p>
    <input
      name="semestri"
      type="number"
      value={form.semestri}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
      required
    />
  </div>

  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Drejtimi ID</p>
    <input
      name="drejtimi_id"
      type="number"
      value={form.drejtimi_id}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
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
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
      required
    />
  </div>

  <div>
    <p className="text-sm font-medium text-slate-700 mb-1">Lloji</p>
    <input
      name="lloji"
      value={form.lloji}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
      required
    />
  </div>

  <div className="md:col-span-2">
    <p className="text-sm font-medium text-slate-700 mb-1">Përshkrimi</p>
    <textarea
      name="pershkrimi"
      value={form.pershkrimi}
      onChange={handleChange}
      className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400 min-h-[120px]"
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
      {editingLenda ? "Update" : "Save"}
    </button>
  </div>

</form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LendetPage;
import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  student_id: 1,
  provimi_id: 1,
  nota: "",
  data_vendosjes: "",
};

function NotatPage() {
  const [notat, setNotat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchNotat = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notat");
      setNotat(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së notave.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotat();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingNota(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (notaItem) => {
    setEditingNota(notaItem);
    setForm({
      student_id: notaItem.student_id || 1,
      provimi_id: notaItem.provimi_id || 1,
      nota: notaItem.nota || "",
      data_vendosjes: notaItem.data_vendosjes
        ? notaItem.data_vendosjes.split("T")[0]
        : "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNota(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingNota) {
        await API.put(`/notat/${editingNota.nota_id}`, form);
      } else {
        await API.post("/notat", form);
      }

      closeModal();
      fetchNotat();
    } catch (err) {
      console.error(err);
      setError(
        editingNota
          ? "Gabim gjatë përditësimit të notës."
          : "Gabim gjatë shtimit të notës."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notat/${id}`);
      fetchNotat();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së notës.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Notat</h2>
            <p className="text-sm text-slate-500 mt-1">Menaxho notat</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Note
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë notat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Student ID</th>
                  <th className="p-4 text-left">Provimi ID</th>
                  <th className="p-4 text-left">Nota</th>
                  <th className="p-4 text-left">Data Vendosjes</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notat.length > 0 ? (
                  notat.map((item) => (
                    <tr
                      key={item.nota_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{item.nota_id}</td>
                      <td className="p-4">{item.student_id}</td>
                      <td className="p-4">{item.provimi_id}</td>
                      <td className="p-4">{item.nota}</td>
                      <td className="p-4">
                        {item.data_vendosjes ? item.data_vendosjes.split("T")[0] : ""}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-blue-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(item.nota_id)}
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
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      Nuk ka nota për momentin.
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
              {editingNota ? "Edit Note" : "Shto Note"}
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
                <p className="text-sm font-medium text-slate-700 mb-1">Provimi ID</p>
                <input
                  name="provimi_id"
                  type="number"
                  value={form.provimi_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Nota</p>
                <input
                  name="nota"
                  type="number"
                  value={form.nota}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Data Vendosjes</p>
                <input
                  name="data_vendosjes"
                  type="date"
                  value={form.data_vendosjes}
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
                  {editingNota ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotatPage;
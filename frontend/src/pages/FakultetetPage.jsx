import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  emri: "",
  dekani_id: "",
  adresa: "",
  telefoni: "",
  email: "",
};

function FakultetetPage() {
  const [fakultetet, setFakultetet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingFakulteti, setEditingFakulteti] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchFakultetet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/fakultetet");
      setFakultetet(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së fakulteteve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFakultetet();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingFakulteti(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (fakulteti) => {
    setEditingFakulteti(fakulteti);
    setForm({
      emri: fakulteti.emri || "",
      dekani_id: fakulteti.dekani_id || "",
      adresa: fakulteti.adresa || "",
      telefoni: fakulteti.telefoni || "",
      email: fakulteti.email || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFakulteti(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        dekani_id: form.dekani_id === "" ? null : Number(form.dekani_id),
      };

      if (editingFakulteti) {
        await API.put(`/fakultetet/${editingFakulteti.fakultet_id}`, payload);
      } else {
        await API.post("/fakultetet", payload);
      }

      closeModal();
      fetchFakultetet();
    } catch (err) {
      console.error(err);
      setError(
        editingFakulteti
          ? "Gabim gjatë përditësimit të fakultetit."
          : "Gabim gjatë shtimit të fakultetit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/fakultetet/${id}`);
      fetchFakultetet();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së fakultetit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Fakultetet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho fakultetet e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Fakultet
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë fakultetet...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Emri</th>
                  <th className="p-4 text-left">Dekani ID</th>
                  <th className="p-4 text-left">Adresa</th>
                  <th className="p-4 text-left">Telefoni</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {fakultetet.length > 0 ? (
                  fakultetet.map((fakulteti) => (
                    <tr
                      key={fakulteti.fakultet_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{fakulteti.fakultet_id}</td>
                      <td className="p-4">{fakulteti.emri}</td>
                      <td className="p-4">{fakulteti.dekani_id || "-"}</td>
                      <td className="p-4">{fakulteti.adresa}</td>
                      <td className="p-4">{fakulteti.telefoni}</td>
                      <td className="p-4">{fakulteti.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(fakulteti)}
                            className="bg-blue-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleDelete(fakulteti.fakultet_id)}
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
                      Nuk ka fakultete për momentin.
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
              {editingFakulteti ? "Edit Fakultet" : "Shto Fakultet"}
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
                  Dekani ID
                </p>
                <input
                  name="dekani_id"
                  type="number"
                  placeholder="Dekani ID"
                  value={form.dekani_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Adresa
                </p>
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
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Telefoni
                </p>
                <input
                  name="telefoni"
                  placeholder="Telefoni"
                  value={form.telefoni}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
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
                  {editingFakulteti ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FakultetetPage;
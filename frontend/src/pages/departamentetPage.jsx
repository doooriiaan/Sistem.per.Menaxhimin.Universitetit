import { useEffect, useState } from "react";
import API from "../services/api";

const emptyForm = {
  emri: "",
  fakulteti_id: 1,
  shefi_id: "",
  pershkrimi: "",
};

function DepartamentetPage() {
  const [departamentet, setDepartamentet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDepartamenti, setEditingDepartamenti] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchDepartamentet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/departamentet");
      setDepartamentet(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë marrjes së departamenteve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentet();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "fakulteti_id" || name === "shefi_id"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const openAddModal = () => {
    setEditingDepartamenti(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (departamenti) => {
    setEditingDepartamenti(departamenti);
    setForm({
      emri: departamenti.emri || "",
      fakulteti_id: departamenti.fakulteti_id || 1,
      shefi_id: departamenti.shefi_id || "",
      pershkrimi: departamenti.pershkrimi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartamenti(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        shefi_id: form.shefi_id === "" ? null : Number(form.shefi_id),
      };

      if (editingDepartamenti) {
        await API.put(
          `/departamentet/${editingDepartamenti.departament_id}`,
          payload
        );
      } else {
        await API.post("/departamentet", payload);
      }

      closeModal();
      fetchDepartamentet();
    } catch (err) {
      console.error(err);
      setError(
        editingDepartamenti
          ? "Gabim gjatë përditësimit të departamentit."
          : "Gabim gjatë shtimit të departamentit."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/departamentet/${id}`);
      fetchDepartamentet();
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë fshirjes së departamentit.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Departamentet
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho departamentet e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Departament
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marrë departamentet...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Emri</th>
                  <th className="p-4 text-left">Fakulteti ID</th>
                  <th className="p-4 text-left">Shefi ID</th>
                  <th className="p-4 text-left">Pershkrimi</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {departamentet.length > 0 ? (
                  departamentet.map((departamenti) => (
                    <tr
                      key={departamenti.departament_id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">{departamenti.departament_id}</td>
                      <td className="p-4">{departamenti.emri}</td>
                      <td className="p-4">{departamenti.fakulteti_id}</td>
                      <td className="p-4">{departamenti.shefi_id || "-"}</td>
                      <td className="p-4">{departamenti.pershkrimi}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(departamenti)}
                            className="bg-blue-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                          >
                            Update
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(departamenti.departament_id)
                            }
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
                      Nuk ka departamente për momentin.
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
              {editingDepartamenti ? "Edit Departament" : "Shto Departament"}
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
                  Shefi ID
                </p>
                <input
                  name="shefi_id"
                  type="number"
                  placeholder="Shefi ID"
                  value={form.shefi_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
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
                  {editingDepartamenti ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartamentetPage;
import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import { confirmDelete } from "../utils/confirmations";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import {
  buildFilterOptions,
  matchesSearchTerm,
  paginateItems,
} from "../utils/table";
import { getApiErrorMessage, validateSallaForm } from "../utils/validation";

const emptyForm = {
  emri: "",
  kapaciteti: 30,
  lokacioni: "",
  tipi: "Salle mesimi",
  statusi: "Aktive",
  pershkrimi: "",
};

function SallatPage() {
  const [sallat, setSallat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSalla, setEditingSalla] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const filteredSallat = sallat.filter((salla) => {
    const matchesFilter = filterValue === "all" || salla.statusi === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          salla.salla_id,
          salla.emri,
          salla.kapaciteti,
          salla.lokacioni,
          salla.tipi,
          salla.statusi,
          salla.pershkrimi,
        ],
        deferredSearchTerm
      )
    );
  });
  const sallatPagination = paginateItems(filteredSallat, currentPage, pageSize);
  const statusFilterOptions = buildFilterOptions(
    sallat,
    (salla) => salla.statusi,
    (salla) => salla.statusi,
    "Te gjitha statuset"
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchSallat = async () => {
    try {
      setLoading(true);
      const response = await API.get("/sallat");
      setSallat(response.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se sallave."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSallat();
  }, []);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    setError("");
    setForm((current) => ({
      ...current,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditingSalla(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (salla) => {
    setEditingSalla(salla);
    setForm({
      emri: salla.emri || "",
      kapaciteti: salla.kapaciteti || 30,
      lokacioni: salla.lokacioni || "",
      tipi: salla.tipi || "Salle mesimi",
      statusi: salla.statusi || "Aktive",
      pershkrimi: salla.pershkrimi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSalla(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateSallaForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      if (editingSalla) {
        await API.put(`/sallat/${editingSalla.salla_id}`, form);
      } else {
        await API.post("/sallat", form);
      }

      closeModal();
      fetchSallat();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          editingSalla
            ? "Gabim gjate perditesimit te salles."
            : "Gabim gjate shtimit te salles."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const salla = sallat.find((item) => item.salla_id === id);

    if (!confirmDelete(salla ? `sallen "${salla.emri}"` : "kete salle")) {
      return;
    }

    try {
      await API.delete(`/sallat/${id}`);
      fetchSallat();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se salles."));
    }
  };

  return (
    <div className="p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sallat</h2>
            <p className="mt-1 text-sm text-slate-500">
              Menaxho sallat qe perdoren ne provime dhe orare
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Shto Salle
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marre sallat...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, lokacionit ose tipit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={statusFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredSallat.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Emri</th>
                    <th className="p-4 text-left">Kapaciteti</th>
                    <th className="p-4 text-left">Lokacioni</th>
                    <th className="p-4 text-left">Tipi</th>
                    <th className="p-4 text-left">Statusi</th>
                    <th className="p-4 text-left">Pershkrimi</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sallatPagination.items.length > 0 ? (
                    sallatPagination.items.map((salla) => (
                      <tr
                        key={salla.salla_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{salla.salla_id}</td>
                        <td className="p-4">{salla.emri}</td>
                        <td className="p-4">{salla.kapaciteti}</td>
                        <td className="p-4">{salla.lokacioni}</td>
                        <td className="p-4">{salla.tipi}</td>
                        <td className="p-4">{salla.statusi}</td>
                        <td className="max-w-[240px] truncate p-4">
                          {salla.pershkrimi}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(salla)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Edito
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(salla.salla_id)}
                              className={DELETE_ACTION_BUTTON_CLASS}
                            >
                              Fshij
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-slate-500">
                        Nuk u gjet asnje salle per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={sallatPagination.currentPage}
              totalPages={sallatPagination.totalPages}
              totalItems={sallatPagination.totalItems}
              startItem={sallatPagination.startItem}
              endItem={sallatPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              {editingSalla ? "Edit Salle" : "Shto Salle"}
            </h3>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">Emri</p>
                <input
                  name="emri"
                  value={form.emri}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">Kapaciteti</p>
                <input
                  name="kapaciteti"
                  type="number"
                  min="1"
                  value={form.kapaciteti}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">Lokacioni</p>
                <input
                  name="lokacioni"
                  value={form.lokacioni}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">Tipi</p>
                <select
                  name="tipi"
                  value={form.tipi}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="Salle mesimi">Salle mesimi</option>
                  <option value="Laborator">Laborator</option>
                  <option value="Amfiteater">Amfiteater</option>
                  <option value="Salle provimi">Salle provimi</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <p className="mb-1 text-sm font-medium text-slate-700">Statusi</p>
                <select
                  name="statusi"
                  value={form.statusi}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="Aktive">Aktive</option>
                  <option value="Mirembajtje">Mirembajtje</option>
                  <option value="Jo aktive">Jo aktive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <p className="mb-1 text-sm font-medium text-slate-700">Pershkrimi</p>
                <textarea
                  name="pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  className="min-h-[110px] w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-slate-700"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-white"
                >
                  {saving ? "Duke ruajtur..." : "Ruaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SallatPage;

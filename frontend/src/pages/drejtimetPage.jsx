import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import {
  buildLookup,
  getDefaultId,
  getLabelById,
  normalizeFormValue,
} from "../utils/relations";
import {
  buildFilterOptions,
  matchesSearchTerm,
  paginateItems,
} from "../utils/table";
import { getApiErrorMessage, validateDrejtimiForm } from "../utils/validation";

const emptyForm = {
  emri: "",
  fakulteti_id: "",
  niveli: "",
  kohezgjatja_vite: 3,
  pershkrimi: "",
};

function DrejtimetPage() {
  const [drejtimet, setDrejtimet] = useState([]);
  const [fakultetet, setFakultetet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDrejtimi, setEditingDrejtimi] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const fakultetetLookup = buildLookup(
    fakultetet,
    "fakultet_id",
    (fakulteti) => fakulteti.emri
  );

  const filteredDrejtimet = drejtimet.filter((drejtimi) => {
    const fakultetiValue = String(drejtimi.fakulteti_id ?? "");
    const matchesFilter =
      filterValue === "all" || fakultetiValue === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          drejtimi.drejtim_id,
          drejtimi.emri,
          drejtimi.niveli,
          drejtimi.kohezgjatja_vite,
          drejtimi.pershkrimi,
          getLabelById(
            fakultetetLookup,
            drejtimi.fakulteti_id,
            "Fakulteti"
          ),
        ],
        deferredSearchTerm
      )
    );
  });

  const drejtimetPagination = paginateItems(
    filteredDrejtimet,
    currentPage,
    pageSize
  );
  const fakultetiFilterOptions = buildFilterOptions(
    fakultetet,
    (fakulteti) => fakulteti.fakultet_id,
    (fakulteti) => fakulteti.emri,
    "Te gjitha fakultetet"
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchDrejtimet = async () => {
    try {
      setLoading(true);
      const [drejtimetRes, fakultetetRes] = await Promise.all([
        API.get("/drejtimet"),
        API.get("/fakultetet"),
      ]);

      setDrejtimet(drejtimetRes.data);
      setFakultetet(fakultetetRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se drejtimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrejtimet();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setError("");

    setForm((prev) => ({
      ...prev,
      [name]: normalizeFormValue(name, value, type),
    }));
  };

  const openAddModal = () => {
    setEditingDrejtimi(null);
    setForm({
      ...emptyForm,
      fakulteti_id: getDefaultId(fakultetet, "fakultet_id"),
    });
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
    const validationError = validateDrejtimiForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

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
        getApiErrorMessage(
          err,
          editingDrejtimi
            ? "Gabim gjate perditesimit te drejtimit."
            : "Gabim gjate shtimit te drejtimit."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/drejtimet/${id}`);
      fetchDrejtimet();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se drejtimit."));
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
          <p className="text-slate-500">Duke i marre drejtimet...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, fakultetit ose nivelit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={fakultetiFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredDrejtimet.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Emri</th>
                    <th className="p-4 text-left">Fakulteti</th>
                    <th className="p-4 text-left">Niveli</th>
                    <th className="p-4 text-left">Kohezgjatja</th>
                    <th className="p-4 text-left">Pershkrimi</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDrejtimet.length > 0 ? (
                    drejtimetPagination.items.map((drejtimi) => (
                      <tr
                        key={drejtimi.drejtim_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{drejtimi.drejtim_id}</td>
                        <td className="p-4">{drejtimi.emri}</td>
                        <td className="p-4">
                          {getLabelById(
                            fakultetetLookup,
                            drejtimi.fakulteti_id,
                            "Fakulteti"
                          )}
                        </td>
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
                        Nuk u gjet asnje drejtim per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={drejtimetPagination.currentPage}
              totalPages={drejtimetPagination.totalPages}
              totalItems={drejtimetPagination.totalItems}
              startItem={drejtimetPagination.startItem}
              endItem={drejtimetPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingDrejtimi ? "Edit Drejtim" : "Shto Drejtim"}
            </h3>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

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
                  Fakulteti
                </p>
                <select
                  name="fakulteti_id"
                  value={form.fakulteti_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh fakultetin</option>
                  {fakultetet.map((fakulteti) => (
                    <option
                      key={fakulteti.fakultet_id}
                      value={fakulteti.fakultet_id}
                    >
                      {fakulteti.emri}
                    </option>
                  ))}
                </select>
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
                  min="1"
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

import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import {
  buildLookup,
  formatPersonName,
  getDefaultId,
  getLabelById,
  normalizeFormValue,
} from "../utils/relations";
import {
  buildFilterOptions,
  matchesSearchTerm,
  paginateItems,
} from "../utils/table";
import {
  getApiErrorMessage,
  validateDepartamentiForm,
} from "../utils/validation";

const emptyForm = {
  emri: "",
  fakulteti_id: "",
  shefi_id: "",
  pershkrimi: "",
};

function DepartamentetPage() {
  const [departamentet, setDepartamentet] = useState([]);
  const [fakultetet, setFakultetet] = useState([]);
  const [profesoret, setProfesoret] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartamenti, setEditingDepartamenti] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const fakultetetLookup = buildLookup(
    fakultetet,
    "fakultet_id",
    (fakulteti) => fakulteti.emri
  );
  const profesoretLookup = buildLookup(
    profesoret,
    "profesor_id",
    formatPersonName
  );

  const filteredDepartamentet = departamentet.filter((departamenti) => {
    const fakultetiValue = String(departamenti.fakulteti_id ?? "");
    const matchesFilter =
      filterValue === "all" || fakultetiValue === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          departamenti.departament_id,
          departamenti.emri,
          departamenti.pershkrimi,
          getLabelById(
            fakultetetLookup,
            departamenti.fakulteti_id,
            "Fakulteti"
          ),
          getLabelById(profesoretLookup, departamenti.shefi_id, "Shefi"),
        ],
        deferredSearchTerm
      )
    );
  });

  const departamentetPagination = paginateItems(
    filteredDepartamentet,
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

  const fetchDepartamentet = async () => {
    try {
      setLoading(true);
      const [departamentetRes, fakultetetRes, profesoretRes] =
        await Promise.all([
          API.get("/departamentet"),
          API.get("/fakultetet"),
          API.get("/profesoret"),
        ]);

      setDepartamentet(departamentetRes.data);
      setFakultetet(fakultetetRes.data);
      setProfesoret(profesoretRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se departamenteve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentet();
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
    setEditingDepartamenti(null);
    setForm({
      ...emptyForm,
      fakulteti_id: getDefaultId(fakultetet, "fakultet_id"),
    });
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
    const validationError = validateDepartamentiForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

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
        getApiErrorMessage(
          err,
          editingDepartamenti
            ? "Gabim gjate perditesimit te departamentit."
            : "Gabim gjate shtimit te departamentit."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/departamentet/${id}`);
      fetchDepartamentet();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se departamentit."));
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
          <p className="text-slate-500">Duke i marre departamentet...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, fakultetit ose shefit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={fakultetiFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredDepartamentet.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Emri</th>
                    <th className="p-4 text-left">Fakulteti</th>
                    <th className="p-4 text-left">Shefi</th>
                    <th className="p-4 text-left">Pershkrimi</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartamentet.length > 0 ? (
                    departamentetPagination.items.map((departamenti) => (
                      <tr
                        key={departamenti.departament_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{departamenti.departament_id}</td>
                        <td className="p-4">{departamenti.emri}</td>
                        <td className="p-4">
                          {getLabelById(
                            fakultetetLookup,
                            departamenti.fakulteti_id,
                            "Fakulteti"
                          )}
                        </td>
                        <td className="p-4">
                          {getLabelById(
                            profesoretLookup,
                            departamenti.shefi_id,
                            "Shefi"
                          )}
                        </td>
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
                        Nuk u gjet asnje departament per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={departamentetPagination.currentPage}
              totalPages={departamentetPagination.totalPages}
              totalItems={departamentetPagination.totalItems}
              startItem={departamentetPagination.startItem}
              endItem={departamentetPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingDepartamenti ? "Edit Departament" : "Shto Departament"}
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
                  Shefi
                </p>
                <select
                  name="shefi_id"
                  value={form.shefi_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="">Pa shef</option>
                  {profesoret.map((profesor) => (
                    <option key={profesor.profesor_id} value={profesor.profesor_id}>
                      {formatPersonName(profesor)}
                    </option>
                  ))}
                </select>
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

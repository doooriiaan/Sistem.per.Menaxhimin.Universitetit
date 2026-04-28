import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import {
  ACADEMIC_RANK_OPTIONS,
  withCurrentOption,
} from "../utils/formOptions";
import {
  buildLookup,
  formatDateInputValue,
  getDefaultId,
  getLabelById,
  normalizeFormValue,
} from "../utils/relations";
import {
  buildFilterOptions,
  matchesSearchTerm,
  paginateItems,
} from "../utils/table";
import { getApiErrorMessage, validateProfesorForm } from "../utils/validation";

const emptyForm = {
  emri: "",
  mbiemri: "",
  titulli_akademik: ACADEMIC_RANK_OPTIONS[0].value,
  departamenti_id: "",
  email: "",
  telefoni: "",
  specializimi: "",
  data_punesimit: "",
};

function ProfesoretPage() {
  const [profesoret, setProfesoret] = useState([]);
  const [departamentet, setDepartamentet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const departamentetLookup = buildLookup(
    departamentet,
    "departament_id",
    (departamenti) => departamenti.emri
  );

  const filteredProfesoret = profesoret.filter((profesor) => {
    const departmentValue = String(profesor.departamenti_id ?? "");
    const matchesFilter =
      filterValue === "all" || departmentValue === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          profesor.profesor_id,
          profesor.emri,
          profesor.mbiemri,
          profesor.email,
          profesor.titulli_akademik,
          profesor.specializimi,
          getLabelById(
            departamentetLookup,
            profesor.departamenti_id,
            "Departamenti"
          ),
        ],
        deferredSearchTerm
      )
    );
  });

  const profesoretPagination = paginateItems(
    filteredProfesoret,
    currentPage,
    pageSize
  );

  const departmentFilterOptions = buildFilterOptions(
    departamentet,
    (departamenti) => departamenti.departament_id,
    (departamenti) => departamenti.emri,
    "Te gjitha departamentet"
  );
  const academicRankOptions = withCurrentOption(
    ACADEMIC_RANK_OPTIONS,
    form.titulli_akademik
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchProfesoret = async () => {
    try {
      setLoading(true);
      const [profesoretRes, departamentetRes] = await Promise.all([
        API.get("/profesoret"),
        API.get("/departamentet"),
      ]);

      setProfesoret(profesoretRes.data);
      setDepartamentet(departamentetRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se profesoreve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesoret();
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
    setEditingProfesor(null);
    setForm({
      ...emptyForm,
      departamenti_id: getDefaultId(departamentet, "departament_id"),
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (profesor) => {
    setEditingProfesor(profesor);
    setForm({
      emri: profesor.emri || "",
      mbiemri: profesor.mbiemri || "",
      titulli_akademik: profesor.titulli_akademik || "",
      departamenti_id: profesor.departamenti_id || 1,
      email: profesor.email || "",
      telefoni: profesor.telefoni || "",
      specializimi: profesor.specializimi || "",
      data_punesimit: formatDateInputValue(profesor.data_punesimit),
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProfesor(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateProfesorForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingProfesor) {
        await API.put(`/profesoret/${editingProfesor.profesor_id}`, form);
      } else {
        await API.post("/profesoret", form);
      }

      closeModal();
      fetchProfesoret();
    } catch (err) {
      console.error(err);
      setError(
        getApiErrorMessage(
          err,
          editingProfesor
            ? "Gabim gjate perditesimit te profesorit."
            : "Gabim gjate shtimit te profesorit."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/profesoret/${id}`);
      fetchProfesoret();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se profesorit."));
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Profesoret</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho stafin akademik
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Profesor
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marre profesoret...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, email-it ose specializimit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={departmentFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredProfesoret.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Emri</th>
                    <th className="p-4 text-left">Mbiemri</th>
                    <th className="p-4 text-left">Titulli</th>
                    <th className="p-4 text-left">Departamenti</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Telefoni</th>
                    <th className="p-4 text-left">Specializimi</th>
                    <th className="p-4 text-left">Data Punesimit</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProfesoret.length > 0 ? (
                    profesoretPagination.items.map((profesor) => (
                      <tr
                        key={profesor.profesor_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{profesor.profesor_id}</td>
                        <td className="p-4">{profesor.emri}</td>
                        <td className="p-4">{profesor.mbiemri}</td>
                        <td className="p-4">{profesor.titulli_akademik}</td>
                        <td className="p-4">
                          {getLabelById(
                            departamentetLookup,
                            profesor.departamenti_id,
                            "Departamenti"
                          )}
                        </td>
                        <td className="p-4">{profesor.email}</td>
                        <td className="p-4">{profesor.telefoni}</td>
                        <td className="p-4">{profesor.specializimi}</td>
                        <td className="p-4">
                          {formatDateInputValue(profesor.data_punesimit)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(profesor)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Edito
                            </button>

                            <button
                              onClick={() => handleDelete(profesor.profesor_id)}
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
                      <td colSpan="10" className="p-6 text-center text-slate-500">
                        Nuk u gjet asnje profesor per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={profesoretPagination.currentPage}
              totalPages={profesoretPagination.totalPages}
              totalItems={profesoretPagination.totalItems}
              startItem={profesoretPagination.startItem}
              endItem={profesoretPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingProfesor ? "Edit Profesor" : "Shto Profesor"}
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
                  value={form.emri}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Mbiemri
                </p>
                <input
                  name="mbiemri"
                  value={form.mbiemri}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Titulli Akademik
                </p>
                <select
                  name="titulli_akademik"
                  value={form.titulli_akademik}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {academicRankOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Departamenti
                </p>
                <select
                  name="departamenti_id"
                  value={form.departamenti_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh departamentin</option>
                  {departamentet.map((departamenti) => (
                    <option
                      key={departamenti.departament_id}
                      value={departamenti.departament_id}
                    >
                      {departamenti.emri}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Email</p>
                <input
                  name="email"
                  type="email"
                  value={form.email}
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
                  value={form.telefoni}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Specializimi
                </p>
                <input
                  name="specializimi"
                  value={form.specializimi}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Data e Punesimit
                </p>
                <input
                  type="date"
                  name="data_punesimit"
                  value={form.data_punesimit}
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
                  Anulo
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white"
                >
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfesoretPage;

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
  COURSE_TYPE_OPTIONS,
  SEMESTER_OPTIONS,
  withCurrentOption,
} from "../utils/formOptions";
import {
  buildLookup,
  formatCourseName,
  formatPersonName,
  getDefaultId,
  getLabelById,
  getSelectedItem,
  normalizeFormValue,
} from "../utils/relations";
import {
  buildFilterOptions,
  matchesSearchTerm,
  paginateItems,
} from "../utils/table";
import { getApiErrorMessage, validateLendaForm } from "../utils/validation";

const emptyForm = {
  emri: "",
  kodi: "",
  kreditet: 0,
  semestri: 1,
  drejtimi_id: "",
  profesor_id: "",
  lloji: COURSE_TYPE_OPTIONS[0].value,
  pershkrimi: "",
};

function LendetPage() {
  const [lendet, setLendet] = useState([]);
  const [drejtimet, setDrejtimet] = useState([]);
  const [profesoret, setProfesoret] = useState([]);
  const [departamentet, setDepartamentet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingLenda, setEditingLenda] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const drejtimetLookup = buildLookup(
    drejtimet,
    "drejtim_id",
    (drejtimi) => drejtimi.emri
  );
  const profesoretLookup = buildLookup(
    profesoret,
    "profesor_id",
    formatPersonName
  );

  const filteredLendet = lendet.filter((lenda) => {
    const matchesFilter = filterValue === "all" || lenda.lloji === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          lenda.lende_id,
          lenda.emri,
          lenda.kodi,
          lenda.lloji,
          lenda.pershkrimi,
          getLabelById(drejtimetLookup, lenda.drejtimi_id, "Drejtimi"),
          getLabelById(profesoretLookup, lenda.profesor_id, "Profesori"),
        ],
        deferredSearchTerm
      )
    );
  });

  const lendetPagination = paginateItems(filteredLendet, currentPage, pageSize);
  const typeFilterOptions = buildFilterOptions(
    lendet,
    (lenda) => lenda.lloji,
    (lenda) => lenda.lloji,
    "Te gjitha llojet"
  );
  const courseTypeOptions = withCurrentOption(COURSE_TYPE_OPTIONS, form.lloji);
  const selectedDrejtimi = getSelectedItem(
    drejtimet,
    "drejtim_id",
    form.drejtimi_id
  );
  const selectedFacultyDepartments = departamentet.filter(
    (departamenti) =>
      selectedDrejtimi &&
      String(departamenti.fakulteti_id) === String(selectedDrejtimi.fakulteti_id)
  );
  const selectedDepartmentIds = new Set(
    selectedFacultyDepartments.map((departamenti) =>
      String(departamenti.departament_id)
    )
  );
  const filteredProfesoret = selectedDrejtimi
    ? profesoret.filter((profesor) =>
        selectedDepartmentIds.has(String(profesor.departamenti_id))
      )
    : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchLendet = async () => {
    try {
      setLoading(true);
      const [lendetRes, drejtimetRes, profesoretRes, departamentetRes] =
        await Promise.all([
        API.get("/lendet"),
        API.get("/drejtimet"),
        API.get("/profesoret"),
        API.get("/departamentet"),
      ]);

      setLendet(lendetRes.data);
      setDrejtimet(drejtimetRes.data);
      setProfesoret(profesoretRes.data);
      setDepartamentet(departamentetRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se lendeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLendet();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setError("");
    const normalizedValue = normalizeFormValue(name, value, type);

    if (name === "drejtimi_id") {
      const nextDrejtimi = getSelectedItem(drejtimet, "drejtim_id", normalizedValue);
      const nextDepartmentIds = new Set(
        departamentet
          .filter(
            (departamenti) =>
              nextDrejtimi &&
              String(departamenti.fakulteti_id) === String(nextDrejtimi.fakulteti_id)
          )
          .map((departamenti) => String(departamenti.departament_id))
      );
      const nextProfesoret = profesoret.filter((profesor) =>
        nextDepartmentIds.has(String(profesor.departamenti_id))
      );

      setForm((prev) => ({
        ...prev,
        drejtimi_id: normalizedValue,
        profesor_id: getDefaultId(nextProfesoret, "profesor_id"),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const openAddModal = () => {
    const defaultDrejtimiId = getDefaultId(drejtimet, "drejtim_id");
    const defaultDrejtimi = getSelectedItem(drejtimet, "drejtim_id", defaultDrejtimiId);
    const defaultDepartmentIds = new Set(
      departamentet
        .filter(
          (departamenti) =>
            defaultDrejtimi &&
            String(departamenti.fakulteti_id) === String(defaultDrejtimi.fakulteti_id)
        )
        .map((departamenti) => String(departamenti.departament_id))
    );
    const defaultProfesoret = profesoret.filter((profesor) =>
      defaultDepartmentIds.has(String(profesor.departamenti_id))
    );

    setEditingLenda(null);
    setForm({
      ...emptyForm,
      drejtimi_id: defaultDrejtimiId,
      profesor_id: getDefaultId(defaultProfesoret, "profesor_id"),
    });
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
      profesor_id: lenda.profesor_id || 1,
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
    const validationError = validateLendaForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
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
        getApiErrorMessage(
          err,
          editingLenda
            ? "Gabim gjate perditesimit te lendes."
            : "Gabim gjate shtimit te lendes."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const lenda = lendet.find((item) => item.lende_id === id);

    if (!confirmDelete(lenda ? `lenden "${formatCourseName(lenda)}"` : "kete lende")) {
      return;
    }

    try {
      await API.delete(`/lendet/${id}`);
      fetchLendet();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se lendes."));
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lendet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho lendet e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Lende
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marre lendet...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, kodit ose profesorit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={typeFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredLendet.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Emri</th>
                    <th className="p-4 text-left">Kodi</th>
                    <th className="p-4 text-left">Kreditet</th>
                    <th className="p-4 text-left">Semestri</th>
                    <th className="p-4 text-left">Drejtimi</th>
                    <th className="p-4 text-left">Profesori</th>
                    <th className="p-4 text-left">Lloji</th>
                    <th className="p-4 text-left">Pershkrimi</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLendet.length > 0 ? (
                    lendetPagination.items.map((lenda) => (
                      <tr
                        key={lenda.lende_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{lenda.lende_id}</td>
                        <td className="p-4">{lenda.emri}</td>
                        <td className="p-4">{lenda.kodi}</td>
                        <td className="p-4">{lenda.kreditet}</td>
                        <td className="p-4">{lenda.semestri}</td>
                        <td className="p-4">
                          {getLabelById(
                            drejtimetLookup,
                            lenda.drejtimi_id,
                            "Drejtimi"
                          )}
                        </td>
                        <td className="p-4">
                          {getLabelById(
                            profesoretLookup,
                            lenda.profesor_id,
                            "Profesori"
                          )}
                        </td>
                        <td className="p-4">{lenda.lloji}</td>
                        <td className="p-4 max-w-[220px] truncate">
                          {lenda.pershkrimi}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(lenda)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Edito
                            </button>

                            <button
                              onClick={() => handleDelete(lenda.lende_id)}
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
                        Nuk u gjet asnje lende per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={lendetPagination.currentPage}
              totalPages={lendetPagination.totalPages}
              totalItems={lendetPagination.totalItems}
              startItem={lendetPagination.startItem}
              endItem={lendetPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingLenda ? "Edit Lende" : "Shto Lende"}
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
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Kreditet
                </p>
                <input
                  name="kreditet"
                  type="number"
                  min="1"
                  value={form.kreditet}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Semestri
                </p>
                <select
                  name="semestri"
                  value={form.semestri}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  {SEMESTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Semestri {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Drejtimi
                </p>
                <select
                  name="drejtimi_id"
                  value={form.drejtimi_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="">Zgjidh drejtimin</option>
                  {drejtimet.map((drejtimi) => (
                    <option
                      key={drejtimi.drejtim_id}
                      value={drejtimi.drejtim_id}
                    >
                      {drejtimi.emri}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Profesori
                </p>
                <select
                  name="profesor_id"
                  value={form.profesor_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="">Zgjidh profesorin</option>
                  {filteredProfesoret.map((profesor) => (
                    <option key={profesor.profesor_id} value={profesor.profesor_id}>
                      {formatPersonName(profesor)}
                    </option>
                  ))}
                  {filteredProfesoret.length === 0 && (
                    <option value="" disabled>
                      Nuk ka profesor per kete drejtim
                    </option>
                  )}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Lloji</p>
                <select
                  name="lloji"
                  value={form.lloji}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  {courseTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white"
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

export default LendetPage;

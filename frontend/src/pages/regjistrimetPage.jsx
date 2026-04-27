import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import { formatFileSize } from "../utils/display";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import {
  REGISTRATION_STATUS_OPTIONS,
  SEMESTER_OPTIONS,
  buildAcademicYearOptions,
  withCurrentOption,
} from "../utils/formOptions";
import {
  buildLookup,
  formatCourseName,
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
  validateRegjistrimiForm,
} from "../utils/validation";

const defaultAcademicYearOptions = buildAcademicYearOptions();

const emptyForm = {
  student_id: "",
  lende_id: "",
  semestri: 1,
  viti_akademik: defaultAcademicYearOptions[0]?.value || "",
  statusi: REGISTRATION_STATUS_OPTIONS[0].value,
};

function RegjistrimetPage() {
  const [regjistrimet, setRegjistrimet] = useState([]);
  const [students, setStudents] = useState([]);
  const [lendet, setLendet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRegjistrimi, setEditingRegjistrimi] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [documentModalRegistration, setDocumentModalRegistration] = useState(null);
  const [registrationDocuments, setRegistrationDocuments] = useState([]);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const studentsLookup = buildLookup(students, "student_id", formatPersonName);
  const lendetLookup = buildLookup(lendet, "lende_id", formatCourseName);

  const filteredRegjistrimet = regjistrimet.filter((item) => {
    const matchesFilter = filterValue === "all" || item.statusi === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          item.regjistrimi_id,
          item.viti_akademik,
          item.statusi,
          getLabelById(studentsLookup, item.student_id, "Studenti"),
          getLabelById(lendetLookup, item.lende_id, "Lenda"),
        ],
        deferredSearchTerm
      )
    );
  });

  const regjistrimetPagination = paginateItems(
    filteredRegjistrimet,
    currentPage,
    pageSize
  );
  const statusFilterOptions = buildFilterOptions(
    regjistrimet,
    (item) => item.statusi,
    (item) => item.statusi,
    "Te gjitha statuset"
  );
  const registrationStatusOptions = withCurrentOption(
    REGISTRATION_STATUS_OPTIONS,
    form.statusi
  );
  const academicYearOptions = withCurrentOption(
    defaultAcademicYearOptions,
    form.viti_akademik
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchRegjistrimet = async () => {
    try {
      setLoading(true);
      const [regjistrimetRes, studentsRes, lendetRes] = await Promise.all([
        API.get("/regjistrimet"),
        API.get("/studentet"),
        API.get("/lendet"),
      ]);

      setRegjistrimet(regjistrimetRes.data);
      setStudents(studentsRes.data);
      setLendet(lendetRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se regjistrimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegjistrimet();
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
    setEditingRegjistrimi(null);
    setForm({
      ...emptyForm,
      student_id: getDefaultId(students, "student_id"),
      lende_id: getDefaultId(lendet, "lende_id"),
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (regjistrimi) => {
    setEditingRegjistrimi(regjistrimi);
    setForm({
      student_id: regjistrimi.student_id || 1,
      lende_id: regjistrimi.lende_id || 1,
      semestri: regjistrimi.semestri || "",
      viti_akademik: regjistrimi.viti_akademik || "",
      statusi: regjistrimi.statusi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegjistrimi(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegjistrimiForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingRegjistrimi) {
        await API.put(
          `/regjistrimet/${editingRegjistrimi.regjistrimi_id}`,
          form
        );
      } else {
        await API.post("/regjistrimet", form);
      }

      closeModal();
      fetchRegjistrimet();
    } catch (err) {
      console.error(err);
      setError(
        getApiErrorMessage(
          err,
          editingRegjistrimi
            ? "Gabim gjate perditesimit te regjistrimit."
            : "Gabim gjate shtimit te regjistrimit."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/regjistrimet/${id}`);
      fetchRegjistrimet();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se regjistrimit."));
    }
  };

  const openDocumentsModal = async (regjistrimi) => {
    setDocumentModalRegistration(regjistrimi);

    try {
      const response = await API.get(
        `/regjistrimet/${regjistrimi.regjistrimi_id}/dokumentet`
      );
      setRegistrationDocuments(response.data);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Gabim gjate marrjes se dokumenteve te regjistrimit.")
      );
      setRegistrationDocuments([]);
    }
  };

  const closeDocumentsModal = () => {
    setDocumentModalRegistration(null);
    setRegistrationDocuments([]);
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Regjistrimet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho regjistrimet e studenteve
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Regjistrim
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marre regjistrimet...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas studentit, lendes ose vitit akademik..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={statusFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredRegjistrimet.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Studenti</th>
                    <th className="p-4 text-left">Lenda</th>
                    <th className="p-4 text-left">Semestri</th>
                    <th className="p-4 text-left">Viti Akademik</th>
                    <th className="p-4 text-left">Statusi</th>
                    <th className="p-4 text-left">Dokumente</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegjistrimet.length > 0 ? (
                    regjistrimetPagination.items.map((item) => (
                      <tr
                        key={item.regjistrimi_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{item.regjistrimi_id}</td>
                        <td className="p-4">
                          {getLabelById(studentsLookup, item.student_id, "Studenti")}
                        </td>
                        <td className="p-4">
                          {getLabelById(lendetLookup, item.lende_id, "Lenda")}
                        </td>
                        <td className="p-4">{item.semestri}</td>
                        <td className="p-4">{item.viti_akademik}</td>
                        <td className="p-4">{item.statusi}</td>
                        <td className="p-4">{item.total_dokumenteve || 0}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(item)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => openDocumentsModal(item)}
                              className="px-3 py-2 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200 hover:bg-sky-100 transition"
                            >
                              Dokumente
                            </button>
                            <button
                              onClick={() => handleDelete(item.regjistrimi_id)}
                              className={DELETE_ACTION_BUTTON_CLASS}
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
                        Nuk u gjet asnje regjistrim per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={regjistrimetPagination.currentPage}
              totalPages={regjistrimetPagination.totalPages}
              totalItems={regjistrimetPagination.totalItems}
              startItem={regjistrimetPagination.startItem}
              endItem={regjistrimetPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingRegjistrimi ? "Edit Regjistrim" : "Shto Regjistrim"}
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
                <p className="text-sm font-medium text-slate-700 mb-1">Studenti</p>
                <select
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh studentin</option>
                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {formatPersonName(student)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Lenda</p>
                <select
                  name="lende_id"
                  value={form.lende_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh lenden</option>
                  {lendet.map((lenda) => (
                    <option key={lenda.lende_id} value={lenda.lende_id}>
                      {formatCourseName(lenda)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Semestri
                </p>
                <select
                  name="semestri"
                  value={form.semestri}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
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
                  Viti Akademik
                </p>
                <select
                  name="viti_akademik"
                  value={form.viti_akademik}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {academicYearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-700 mb-1">Statusi</p>
                <select
                  name="statusi"
                  value={form.statusi}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {registrationStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  {editingRegjistrimi ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {documentModalRegistration && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Dokumentet e regjistrimit #{documentModalRegistration.regjistrimi_id}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Shiko dokumentet qe studenti ka ngarkuar per kete regjistrim.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDocumentsModal}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700"
              >
                Mbyll
              </button>
            </div>

            <div className="space-y-3">
              {registrationDocuments.length > 0 ? (
                registrationDocuments.map((document) => (
                  <a
                    key={document.dokument_id}
                    href={document.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {document.emri_dokumentit}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {document.original_name} | {formatFileSize(document.file_size)}
                    </p>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Nuk ka dokumente te ngarkuara ende per kete regjistrim.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegjistrimetPage;

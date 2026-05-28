import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import { confirmDelete } from "../utils/confirmations";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import { GRADE_OPTIONS, withCurrentOption } from "../utils/formOptions";
import {
  buildLookup,
  formatCourseName,
  formatDateInputValue,
  formatExamName,
  formatPersonName,
  getDefaultId,
  getLabelById,
  normalizeFormValue,
} from "../utils/relations";
import { matchesSearchTerm, paginateItems } from "../utils/table";
import { getApiErrorMessage, validateNotaForm } from "../utils/validation";

const emptyForm = {
  student_id: "",
  provimi_id: "",
  nota: "",
  data_vendosjes: "",
};

function NotatPage() {
  const [notat, setNotat] = useState([]);
  const [students, setStudents] = useState([]);
  const [provimet, setProvimet] = useState([]);
  const [lendet, setLendet] = useState([]);
  const [profesoret, setProfesoret] = useState([]);
  const [regjistrimet, setRegjistrimet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const studentsLookup = buildLookup(students, "student_id", formatPersonName);
  const lendetLookup = buildLookup(lendet, "lende_id", formatCourseName);
  const profesoretLookup = buildLookup(
    profesoret,
    "profesor_id",
    formatPersonName
  );
  const provimetLookup = buildLookup(
    provimet,
    "provimi_id",
    (provimi) => formatExamName(provimi, lendetLookup, profesoretLookup)
  );

  const filteredNotat = notat.filter((item) => {
    const isPassing = Number(item.nota) >= 6;
    const matchesFilter =
      filterValue === "all" ||
      (filterValue === "passing" && isPassing) ||
      (filterValue === "failing" && !isPassing);

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          item.nota_id,
          item.nota,
          formatDateInputValue(item.data_vendosjes),
          getLabelById(studentsLookup, item.student_id, "Studenti"),
          getLabelById(provimetLookup, item.provimi_id, "Provimi"),
        ],
        deferredSearchTerm
      )
    );
  });

  const notatPagination = paginateItems(filteredNotat, currentPage, pageSize);
  const gradeOptions = withCurrentOption(GRADE_OPTIONS, form.nota);
  const selectedStudentRegistrations = regjistrimet.filter(
    (regjistrimi) => String(regjistrimi.student_id) === String(form.student_id)
  );
  const registeredCourseIds = new Set(
    selectedStudentRegistrations.map((regjistrimi) => String(regjistrimi.lende_id))
  );
  const filteredProvimet = form.student_id
    ? provimet.filter((provimi) => registeredCourseIds.has(String(provimi.lende_id)))
    : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchNotat = async () => {
    try {
      setLoading(true);
      const [
        notatRes,
        studentsRes,
        provimetRes,
        lendetRes,
        profesoretRes,
        regjistrimetRes,
      ] =
        await Promise.all([
          API.get("/notat"),
          API.get("/studentet"),
          API.get("/provimet"),
          API.get("/lendet"),
          API.get("/profesoret"),
          API.get("/regjistrimet"),
        ]);

      setNotat(notatRes.data);
      setStudents(studentsRes.data);
      setProvimet(provimetRes.data);
      setLendet(lendetRes.data);
      setProfesoret(profesoretRes.data);
      setRegjistrimet(regjistrimetRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se notave."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotat();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setError("");
    const normalizedValue = normalizeFormValue(name, value, type);

    if (name === "student_id") {
      const nextRegistrations = regjistrimet.filter(
        (regjistrimi) => String(regjistrimi.student_id) === String(normalizedValue)
      );
      const nextCourseIds = new Set(
        nextRegistrations.map((regjistrimi) => String(regjistrimi.lende_id))
      );
      const nextProvimet = provimet.filter((provimi) =>
        nextCourseIds.has(String(provimi.lende_id))
      );

      setForm((prev) => ({
        ...prev,
        student_id: normalizedValue,
        provimi_id: getDefaultId(nextProvimet, "provimi_id"),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const openAddModal = () => {
    const defaultStudentId = getDefaultId(students, "student_id");
    const defaultRegistrations = regjistrimet.filter(
      (regjistrimi) => String(regjistrimi.student_id) === String(defaultStudentId)
    );
    const defaultCourseIds = new Set(
      defaultRegistrations.map((regjistrimi) => String(regjistrimi.lende_id))
    );
    const defaultProvimet = provimet.filter((provimi) =>
      defaultCourseIds.has(String(provimi.lende_id))
    );

    setEditingNota(null);
    setForm({
      ...emptyForm,
      student_id: defaultStudentId,
      provimi_id: getDefaultId(defaultProvimet, "provimi_id"),
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (notaItem) => {
    setEditingNota(notaItem);
    setForm({
      student_id: notaItem.student_id || 1,
      provimi_id: notaItem.provimi_id || 1,
      nota: notaItem.nota || "",
      data_vendosjes: formatDateInputValue(notaItem.data_vendosjes),
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
    const validationError = validateNotaForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
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
        getApiErrorMessage(
          err,
          editingNota
            ? "Gabim gjate perditesimit te notes."
            : "Gabim gjate shtimit te notes."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const nota = notat.find((item) => item.nota_id === id);
    const notaLabel = nota
      ? `noten "${getLabelById(studentsLookup, nota.student_id, "Studenti")} - ${getLabelById(provimetLookup, nota.provimi_id, "Provimi")}"`
      : "kete note";

    if (!confirmDelete(notaLabel)) {
      return;
    }

    try {
      await API.delete(`/notat/${id}`);
      fetchNotat();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se notes."));
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
          <p className="text-slate-500">Duke i marre notat...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas studentit ose provimit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={[
                { value: "all", label: "Te gjitha notat" },
                { value: "passing", label: "Te kaluara" },
                { value: "failing", label: "Te pakaluara" },
              ]}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredNotat.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Studenti</th>
                    <th className="p-4 text-left">Provimi</th>
                    <th className="p-4 text-left">Nota</th>
                    <th className="p-4 text-left">Data Vendosjes</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotat.length > 0 ? (
                    notatPagination.items.map((item) => (
                      <tr
                        key={item.nota_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{item.nota_id}</td>
                        <td className="p-4">
                          {getLabelById(studentsLookup, item.student_id, "Studenti")}
                        </td>
                        <td className="p-4">
                          {getLabelById(provimetLookup, item.provimi_id, "Provimi")}
                        </td>
                        <td className="p-4">{item.nota}</td>
                        <td className="p-4">
                          {formatDateInputValue(item.data_vendosjes)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(item)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Edito
                            </button>
                            <button
                              onClick={() => handleDelete(item.nota_id)}
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
                      <td colSpan="6" className="p-6 text-center text-slate-500">
                        Nuk u gjet asnje note per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={notatPagination.currentPage}
              totalPages={notatPagination.totalPages}
              totalItems={notatPagination.totalItems}
              startItem={notatPagination.startItem}
              endItem={notatPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingNota ? "Edit Note" : "Shto Note"}
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
                {editingNota ? (
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {getLabelById(studentsLookup, form.student_id, "Studenti")}
                  </div>
                ) : (
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
                    {students.length === 0 && (
                      <option value="" disabled>
                        Nuk ka studente te regjistruar
                      </option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Provimi</p>
                {editingNota ? (
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {getLabelById(provimetLookup, form.provimi_id, "Provimi")}
                  </div>
                ) : (
                  <select
                    name="provimi_id"
                    value={form.provimi_id}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  >
                    <option value="">Zgjidh provimin</option>
                    {filteredProvimet.map((provimi) => (
                      <option key={provimi.provimi_id} value={provimi.provimi_id}>
                        {formatExamName(provimi, lendetLookup, profesoretLookup)}
                      </option>
                    ))}
                    {filteredProvimet.length === 0 && (
                      <option value="" disabled>
                        Nuk ka provime per kete student
                      </option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Nota</p>
                <select
                  name="nota"
                  value={form.nota}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh noten</option>
                  {gradeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Data Vendosjes
                </p>
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

export default NotatPage;

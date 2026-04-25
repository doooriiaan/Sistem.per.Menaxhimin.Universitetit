import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchNotat = async () => {
    try {
      setLoading(true);
      const [notatRes, studentsRes, provimetRes, lendetRes, profesoretRes] =
        await Promise.all([
          API.get("/notat"),
          API.get("/studentet"),
          API.get("/provimet"),
          API.get("/lendet"),
          API.get("/profesoret"),
        ]);

      setNotat(notatRes.data);
      setStudents(studentsRes.data);
      setProvimet(provimetRes.data);
      setLendet(lendetRes.data);
      setProfesoret(profesoretRes.data);
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

    setForm((prev) => ({
      ...prev,
      [name]: normalizeFormValue(name, value, type),
    }));
  };

  const openAddModal = () => {
    setEditingNota(null);
    setForm({
      ...emptyForm,
      student_id: getDefaultId(students, "student_id"),
      provimi_id: getDefaultId(provimet, "provimi_id"),
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
    }
  };

  const handleDelete = async (id) => {
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
                <p className="text-sm font-medium text-slate-700 mb-1">Provimi</p>
                <select
                  name="provimi_id"
                  value={form.provimi_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh provimin</option>
                  {provimet.map((provimi) => (
                    <option key={provimi.provimi_id} value={provimi.provimi_id}>
                      {formatExamName(provimi, lendetLookup, profesoretLookup)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Nota</p>
                <input
                  name="nota"
                  type="number"
                  min="5"
                  max="10"
                  step="0.5"
                  value={form.nota}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
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

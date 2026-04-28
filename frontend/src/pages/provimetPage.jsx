import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import { EXAM_TERM_OPTIONS, withCurrentOption } from "../utils/formOptions";
import {
  buildLookup,
  formatCourseName,
  formatDateInputValue,
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
import { getApiErrorMessage, validateProvimiForm } from "../utils/validation";

const emptyForm = {
  lende_id: "",
  profesor_id: "",
  data_provimit: "",
  ora: "",
  salla: "",
  afati: EXAM_TERM_OPTIONS[0].value,
};

function ProvimetPage() {
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
  const [editingProvimi, setEditingProvimi] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const lendetLookup = buildLookup(lendet, "lende_id", formatCourseName);
  const profesoretLookup = buildLookup(
    profesoret,
    "profesor_id",
    formatPersonName
  );

  const filteredProvimet = provimet.filter((item) => {
    const matchesFilter = filterValue === "all" || item.afati === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          item.provimi_id,
          item.salla,
          item.afati,
          item.ora,
          formatDateInputValue(item.data_provimit),
          getLabelById(lendetLookup, item.lende_id, "Lenda"),
          getLabelById(profesoretLookup, item.profesor_id, "Profesori"),
        ],
        deferredSearchTerm
      )
    );
  });

  const provimetPagination = paginateItems(
    filteredProvimet,
    currentPage,
    pageSize
  );
  const termFilterOptions = buildFilterOptions(
    provimet,
    (item) => item.afati,
    (item) => item.afati,
    "Te gjitha afatet"
  );
  const examTermOptions = withCurrentOption(EXAM_TERM_OPTIONS, form.afati);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchProvimet = async () => {
    try {
      setLoading(true);
      const [provimetRes, lendetRes, profesoretRes] = await Promise.all([
        API.get("/provimet"),
        API.get("/lendet"),
        API.get("/profesoret"),
      ]);

      setProvimet(provimetRes.data);
      setLendet(lendetRes.data);
      setProfesoret(profesoretRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se provimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvimet();
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
    setEditingProvimi(null);
    setForm({
      ...emptyForm,
      lende_id: getDefaultId(lendet, "lende_id"),
      profesor_id: getDefaultId(profesoret, "profesor_id"),
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (provimi) => {
    setEditingProvimi(provimi);
    setForm({
      lende_id: provimi.lende_id || 1,
      profesor_id: provimi.profesor_id || 1,
      data_provimit: formatDateInputValue(provimi.data_provimit),
      ora: provimi.ora || "",
      salla: provimi.salla || "",
      afati: provimi.afati || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProvimi(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateProvimiForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingProvimi) {
        await API.put(`/provimet/${editingProvimi.provimi_id}`, form);
      } else {
        await API.post("/provimet", form);
      }

      closeModal();
      fetchProvimet();
    } catch (err) {
      console.error(err);
      setError(
        getApiErrorMessage(
          err,
          editingProvimi
            ? "Gabim gjate perditesimit te provimit."
            : "Gabim gjate shtimit te provimit."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/provimet/${id}`);
      fetchProvimet();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se provimit."));
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Provimet</h2>
            <p className="text-sm text-slate-500 mt-1">Menaxho provimet</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Provim
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marre provimet...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas lendes, profesorit ose afatit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={termFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredProvimet.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Lenda</th>
                    <th className="p-4 text-left">Profesori</th>
                    <th className="p-4 text-left">Data</th>
                    <th className="p-4 text-left">Ora</th>
                    <th className="p-4 text-left">Salla</th>
                    <th className="p-4 text-left">Afati</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProvimet.length > 0 ? (
                    provimetPagination.items.map((item) => (
                      <tr
                        key={item.provimi_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{item.provimi_id}</td>
                        <td className="p-4">
                          {getLabelById(lendetLookup, item.lende_id, "Lenda")}
                        </td>
                        <td className="p-4">
                          {getLabelById(
                            profesoretLookup,
                            item.profesor_id,
                            "Profesori"
                          )}
                        </td>
                        <td className="p-4">
                          {formatDateInputValue(item.data_provimit)}
                        </td>
                        <td className="p-4">{item.ora}</td>
                        <td className="p-4">{item.salla}</td>
                        <td className="p-4">{item.afati}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(item)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Edito
                            </button>
                            <button
                              onClick={() => handleDelete(item.provimi_id)}
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
                        Nuk u gjet asnje provim per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={provimetPagination.currentPage}
              totalPages={provimetPagination.totalPages}
              totalItems={provimetPagination.totalItems}
              startItem={provimetPagination.startItem}
              endItem={provimetPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingProvimi ? "Edit Provim" : "Shto Provim"}
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
                  Profesori
                </p>
                <select
                  name="profesor_id"
                  value={form.profesor_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  <option value="">Zgjidh profesorin</option>
                  {profesoret.map((profesor) => (
                    <option key={profesor.profesor_id} value={profesor.profesor_id}>
                      {formatPersonName(profesor)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Data Provimit
                </p>
                <input
                  name="data_provimit"
                  type="date"
                  value={form.data_provimit}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Ora</p>
                <input
                  name="ora"
                  type="time"
                  value={form.ora}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Salla</p>
                <input
                  name="salla"
                  value={form.salla}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Afati</p>
                <select
                  name="afati"
                  value={form.afati}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {examTermOptions.map((option) => (
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

export default ProvimetPage;

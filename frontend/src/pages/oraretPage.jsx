import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import { DAY_OPTIONS, withCurrentOption } from "../utils/formOptions";
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
import { getApiErrorMessage, validateOrariForm } from "../utils/validation";

const emptyForm = {
  lende_id: "",
  profesor_id: "",
  dita: DAY_OPTIONS[0].value,
  ora_fillimit: "",
  ora_mbarimit: "",
  salla: "",
};

function OraretPage() {
  const [oraret, setOraret] = useState([]);
  const [lendet, setLendet] = useState([]);
  const [profesoret, setProfesoret] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingOrari, setEditingOrari] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const lendetLookup = buildLookup(lendet, "lende_id", formatCourseName);
  const profesoretLookup = buildLookup(
    profesoret,
    "profesor_id",
    formatPersonName
  );

  const filteredOraret = oraret.filter((item) => {
    const matchesFilter = filterValue === "all" || item.dita === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          item.orari_id,
          item.dita,
          item.salla,
          item.ora_fillimit,
          item.ora_mbarimit,
          getLabelById(lendetLookup, item.lende_id, "Lenda"),
          getLabelById(profesoretLookup, item.profesor_id, "Profesori"),
        ],
        deferredSearchTerm
      )
    );
  });

  const oraretPagination = paginateItems(filteredOraret, currentPage, pageSize);
  const dayFilterOptions = buildFilterOptions(
    oraret,
    (item) => item.dita,
    (item) => item.dita,
    "Te gjitha ditet"
  );
  const dayOptions = withCurrentOption(DAY_OPTIONS, form.dita);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchOraret = async () => {
    try {
      setLoading(true);
      const [oraretRes, lendetRes, profesoretRes] = await Promise.all([
        API.get("/oraret"),
        API.get("/lendet"),
        API.get("/profesoret"),
      ]);

      setOraret(oraretRes.data);
      setLendet(lendetRes.data);
      setProfesoret(profesoretRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se orareve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOraret();
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
    setEditingOrari(null);
    setForm({
      ...emptyForm,
      lende_id: getDefaultId(lendet, "lende_id"),
      profesor_id: getDefaultId(profesoret, "profesor_id"),
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (orari) => {
    setEditingOrari(orari);
    setForm({
      lende_id: orari.lende_id || 1,
      profesor_id: orari.profesor_id || 1,
      dita: orari.dita || "",
      ora_fillimit: orari.ora_fillimit || "",
      ora_mbarimit: orari.ora_mbarimit || "",
      salla: orari.salla || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrari(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateOrariForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingOrari) {
        await API.put(`/oraret/${editingOrari.orari_id}`, form);
      } else {
        await API.post("/oraret", form);
      }

      closeModal();
      fetchOraret();
    } catch (err) {
      console.error(err);
      setError(
        getApiErrorMessage(
          err,
          editingOrari
            ? "Gabim gjate perditesimit te orarit."
            : "Gabim gjate shtimit te orarit."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/oraret/${id}`);
      fetchOraret();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se orarit."));
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Oraret</h2>
            <p className="text-sm text-slate-500 mt-1">Menaxho oraret</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            + Shto Orar
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Duke i marre oraret...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas lendes, profesorit ose salles..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={dayFilterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredOraret.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Lenda</th>
                    <th className="p-4 text-left">Profesori</th>
                    <th className="p-4 text-left">Dita</th>
                    <th className="p-4 text-left">Ora Fillimit</th>
                    <th className="p-4 text-left">Ora Mbarimit</th>
                    <th className="p-4 text-left">Salla</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOraret.length > 0 ? (
                    oraretPagination.items.map((item) => (
                      <tr
                        key={item.orari_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{item.orari_id}</td>
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
                        <td className="p-4">{item.dita}</td>
                        <td className="p-4">{item.ora_fillimit}</td>
                        <td className="p-4">{item.ora_mbarimit}</td>
                        <td className="p-4">{item.salla}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(item)}
                              className={EDIT_ACTION_BUTTON_CLASS}
                            >
                              Edito
                            </button>
                            <button
                              onClick={() => handleDelete(item.orari_id)}
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
                        Nuk u gjet asnje orar per filtrat aktuale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={oraretPagination.currentPage}
              totalPages={oraretPagination.totalPages}
              totalItems={oraretPagination.totalItems}
              startItem={oraretPagination.startItem}
              endItem={oraretPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingOrari ? "Edit Orar" : "Shto Orar"}
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
                <p className="text-sm font-medium text-slate-700 mb-1">Dita</p>
                <select
                  name="dita"
                  value={form.dita}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {dayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Ora Fillimit
                </p>
                <input
                  name="ora_fillimit"
                  type="time"
                  value={form.ora_fillimit}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Ora Mbarimit
                </p>
                <input
                  name="ora_mbarimit"
                  type="time"
                  value={form.ora_mbarimit}
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

export default OraretPage;

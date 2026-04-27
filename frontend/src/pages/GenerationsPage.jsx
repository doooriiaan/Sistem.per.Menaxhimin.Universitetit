import { useDeferredValue, useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import { GENERATION_STATUS_OPTIONS } from "../utils/formOptions";
import {
  buildFilterOptions,
  matchesSearchTerm,
  paginateItems,
} from "../utils/table";
import {
  getApiErrorMessage,
  validateGenerationForm,
} from "../utils/validation";

const emptyForm = {
  emri: "",
  viti_regjistrimit: "",
  viti_diplomimit: "",
  statusi: GENERATION_STATUS_OPTIONS[0].value,
  pershkrimi: "",
};

function GenerationsPage() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGeneration, setEditingGeneration] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());

  const filteredGenerations = generations.filter((generation) => {
    const matchesFilter =
      filterValue === "all" || generation.statusi === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          generation.emri,
          generation.statusi,
          generation.viti_regjistrimit,
          generation.viti_diplomimit,
          generation.pershkrimi,
        ],
        deferredSearchTerm
      )
    );
  });

  const pagination = paginateItems(filteredGenerations, currentPage, pageSize);
  const filterOptions = buildFilterOptions(
    generations,
    (item) => item.statusi,
    (item) => item.statusi,
    "Te gjitha statuset"
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const response = await API.get("/gjeneratat");
      setGenerations(response.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se gjeneratave."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "viti_regjistrimit" || name === "viti_diplomimit"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
    setError("");
  };

  const openAddModal = () => {
    const currentYear = new Date().getFullYear();
    setEditingGeneration(null);
    setForm({
      ...emptyForm,
      viti_regjistrimit: currentYear,
      viti_diplomimit: currentYear + 3,
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (generation) => {
    setEditingGeneration(generation);
    setForm({
      emri: generation.emri || "",
      viti_regjistrimit: generation.viti_regjistrimit || "",
      viti_diplomimit: generation.viti_diplomimit || "",
      statusi: generation.statusi || GENERATION_STATUS_OPTIONS[0].value,
      pershkrimi: generation.pershkrimi || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGeneration(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateGenerationForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingGeneration) {
        await API.put(`/gjeneratat/${editingGeneration.gjenerata_id}`, form);
      } else {
        await API.post("/gjeneratat", form);
      }

      closeModal();
      fetchGenerations();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          editingGeneration
            ? "Gabim gjate perditesimit te gjenerates."
            : "Gabim gjate shtimit te gjenerates."
        )
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/gjeneratat/${id}`);
      fetchGenerations();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se gjenerates."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white shadow-[0_28px_70px_rgba(15,23,42,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Arkiva Akademike
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold">Gjeneratat aktive dhe te kaluara</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Menaxho gjeneratat e vjetra, gjeneratat aktuale dhe arkiven
              historike te studenteve ne nje vend.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            + Shto Gjenerate
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Duke i ngarkuar gjeneratat...</p>
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, viteve ose statusit..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={filterOptions}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredGenerations.length}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pagination.items.length > 0 ? (
                pagination.items.map((generation) => (
                  <article
                    key={generation.gjenerata_id}
                    className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {generation.statusi}
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">
                          {generation.emri}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {generation.total_studenteve || 0} studente
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-slate-600">
                      <p>Regjistrimi: {generation.viti_regjistrimit}</p>
                      <p>Diplomimi: {generation.viti_diplomimit}</p>
                      <p className="leading-6">{generation.pershkrimi}</p>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(generation)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                      >
                        Edito
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(generation.gjenerata_id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Fshij
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                  Nuk u gjet asnje gjenerate per filtrat aktuale.
                </div>
              )}
            </div>

            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingGeneration ? "Perditeso Gjeneraten" : "Shto Gjenerate"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Ruaj gjenerata te reja, aktive ose te arkivuara.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Emri i gjenerates
                </label>
                <input
                  name="emri"
                  value={form.emri}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Gjenerata 2025/2026"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Viti i regjistrimit
                </label>
                <input
                  type="number"
                  name="viti_regjistrimit"
                  value={form.viti_regjistrimit}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Viti i diplomimit
                </label>
                <input
                  type="number"
                  name="viti_diplomimit"
                  value={form.viti_diplomimit}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Statusi
                </label>
                <select
                  name="statusi"
                  value={form.statusi}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                >
                  {GENERATION_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Pershkrimi
                </label>
                <textarea
                  name="pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  className="min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Pershkrim i shkurter per statusin e kesaj gjenerate."
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {editingGeneration ? "Ruaj ndryshimet" : "Shto gjeneraten"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerationsPage;

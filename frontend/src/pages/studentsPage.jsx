import { useDeferredValue, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { EmptyState, SkeletonRows } from "../components/ui/Feedback";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/ToastProvider";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API from "../services/api";
import {
  GENDER_OPTIONS,
  STUDENT_DOCUMENT_TYPE_OPTIONS,
  STUDY_YEAR_OPTIONS,
} from "../utils/formOptions";
import { formatFileSize } from "../utils/display";
import { fileToPayload } from "../utils/files";
import {
  buildLookup,
  formatDateInputValue,
  getDefaultId,
  getLabelById,
  normalizeFormValue,
} from "../utils/relations";
import { matchesSearchTerm, paginateItems } from "../utils/table";
import {
  getApiErrorMessage,
  validateStudentDocumentForm,
  validateStudentForm,
} from "../utils/validation";
import { getResponseMessage } from "../services/api";

const emptyForm = {
  emri: "",
  mbiemri: "",
  numri_personal: "",
  data_lindjes: "",
  gjinia: "M",
  email: "",
  telefoni: "",
  adresa: "",
  drejtimi_id: "",
  gjenerata_id: "",
  viti_studimit: 1,
  statusi: "Aktiv",
};

function StudentsPage() {
  const { notifyError, notifySuccess } = useToast();
  const [students, setStudents] = useState([]);
  const [drejtimet, setDrejtimet] = useState([]);
  const [gjeneratat, setGjeneratat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [documentModalStudent, setDocumentModalStudent] = useState(null);
  const [studentDocuments, setStudentDocuments] = useState([]);
  const [documentForm, setDocumentForm] = useState({
    lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
    file: null,
    fileName: "",
  });

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const drejtimetLookup = buildLookup(
    drejtimet,
    "drejtim_id",
    (drejtimi) => drejtimi.emri
  );
  const gjeneratatLookup = buildLookup(
    gjeneratat,
    "gjenerata_id",
    (gjenerata) => gjenerata.emri
  );

  const filteredStudents = students.filter((student) => {
    const matchesFilter =
      filterValue === "all" || student.statusi === filterValue;

    return (
      matchesFilter &&
      matchesSearchTerm(
        [
          student.student_id,
          student.emri,
          student.mbiemri,
          student.numri_personal,
          student.email,
          student.telefoni,
          getLabelById(drejtimetLookup, student.drejtimi_id, "Drejtimi"),
          getLabelById(gjeneratatLookup, student.gjenerata_id, "Gjenerata"),
          student.statusi,
        ],
        deferredSearchTerm
      )
    );
  });

  const studentsPagination = paginateItems(
    filteredStudents,
    currentPage,
    pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, pageSize]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsRes, drejtimetRes, gjeneratatRes] = await Promise.all([
        API.get("/studentet"),
        API.get("/drejtimet"),
        API.get("/gjeneratat"),
      ]);

      setStudents(studentsRes.data);
      setDrejtimet(drejtimetRes.data);
      setGjeneratat(gjeneratatRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      const message = getApiErrorMessage(err, "Gabim gjate marrjes se studenteve.");
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
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
    setEditingStudent(null);
    setForm({
      ...emptyForm,
      drejtimi_id: getDefaultId(drejtimet, "drejtim_id"),
      gjenerata_id: getDefaultId(gjeneratat, "gjenerata_id"),
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      emri: student.emri || "",
      mbiemri: student.mbiemri || "",
      numri_personal: student.numri_personal || "",
      data_lindjes: formatDateInputValue(student.data_lindjes),
      gjinia: student.gjinia || "M",
      email: student.email || "",
      telefoni: student.telefoni || "",
      adresa: student.adresa || "",
      drejtimi_id: student.drejtimi_id || 1,
      gjenerata_id: student.gjenerata_id || "",
      viti_studimit: student.viti_studimit || 1,
      statusi: student.statusi || "Aktiv",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyForm);
  };

  const fetchStudentDocuments = async (studentId) => {
    try {
      const response = await API.get(`/studentet/${studentId}/dokumentet`);
      setStudentDocuments(response.data);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Gabim gjate marrjes se dokumenteve te studentit.")
      );
    }
  };

  const openDocumentModal = async (student) => {
    setDocumentModalStudent(student);
    setDocumentForm({
      lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
      file: null,
      fileName: "",
    });
    setStudentDocuments([]);
    await fetchStudentDocuments(student.student_id);
  };

  const closeDocumentModal = () => {
    setDocumentModalStudent(null);
    setStudentDocuments([]);
    setDocumentForm({
      lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
      file: null,
      fileName: "",
    });
  };

  const handleDocumentFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const payload = await fileToPayload(selectedFile);
      setDocumentForm((current) => ({
        ...current,
        file: payload,
        fileName: selectedFile.name,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Skedari nuk mund te ngarkohet.";
      setError(message);
      notifyError(message);
    } finally {
      event.target.value = "";
    }
  };

  const handleDocumentUpload = async () => {
    const validationError = validateStudentDocumentForm(documentForm);

    if (validationError || !documentModalStudent) {
      const message = validationError || "Studenti nuk u zgjodh.";
      setError(message);
      notifyError(message);
      return;
    }

    try {
      const response = await API.post(`/studentet/${documentModalStudent.student_id}/dokumentet`, {
        lloji_dokumentit: documentForm.lloji_dokumentit,
        file: documentForm.file,
      });
      setDocumentForm({
        lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
        file: null,
        fileName: "",
      });
      await fetchStudentDocuments(documentModalStudent.student_id);
      notifySuccess(
        getResponseMessage(response, "Dokumenti u ngarkua me sukses."),
        "Dokumenti u ruajt"
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate ngarkimit te dokumentit te studentit."
      );
      setError(message);
      notifyError(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateStudentForm(form);

    if (validationError) {
      setError(validationError);
      notifyError(validationError);
      return;
    }

    try {
      let response;
      if (editingStudent) {
        response = await API.put(`/studentet/${editingStudent.student_id}`, form);
      } else {
        response = await API.post("/studentet", form);
      }

      closeModal();
      fetchStudents();
      notifySuccess(
        getResponseMessage(response, "Studenti u ruajt me sukses."),
        editingStudent ? "Studenti u perditesua" : "Student i ri"
      );
    } catch (err) {
      console.error(err);
      const message = getApiErrorMessage(
        err,
        editingStudent
          ? "Gabim gjate perditesimit te studentit."
          : "Gabim gjate shtimit te studentit."
      );
      setError(message);
      notifyError(message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await API.delete(`/studentet/${id}`);
      fetchStudents();
      notifySuccess(
        getResponseMessage(response, "Studenti u fshi me sukses."),
        "Studenti u hoq"
      );
    } catch (err) {
      console.error(err);
      const message = getApiErrorMessage(err, "Gabim gjate fshirjes se studentit.");
      setError(message);
      notifyError(message);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Studentet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Menaxho studentet e universitetit
            </p>
          </div>

          <button
            onClick={openAddModal}
                    className="rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Shto student
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonRows count={4} />
        ) : (
          <>
            <TableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Kerko sipas emrit, email-it ose numrit personal..."
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              filterOptions={[
                { value: "all", label: "Te gjithe statuset" },
                { value: "Aktiv", label: "Aktiv" },
                { value: "Jo aktiv", label: "Jo aktiv" },
              ]}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredStudents.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Emri</th>
                    <th className="p-4 text-left">Mbiemri</th>
                    <th className="p-4 text-left">Nr. Personal</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Telefoni</th>
                    <th className="p-4 text-left">Drejtimi</th>
                    <th className="p-4 text-left">Gjenerata</th>
                    <th className="p-4 text-left">Viti</th>
                    <th className="p-4 text-left">Statusi</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length > 0 ? (
                    studentsPagination.items.map((student) => (
                      <tr
                        key={student.student_id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="p-4">{student.student_id}</td>
                        <td className="p-4">{student.emri}</td>
                        <td className="p-4">{student.mbiemri}</td>
                        <td className="p-4">{student.numri_personal}</td>
                        <td className="p-4">{student.email}</td>
                        <td className="p-4">{student.telefoni}</td>
                        <td className="p-4">
                          {getLabelById(
                            drejtimetLookup,
                            student.drejtimi_id,
                            "Drejtimi"
                          )}
                        </td>
                        <td className="p-4">
                          {getLabelById(
                            gjeneratatLookup,
                            student.gjenerata_id,
                            "Gjenerata"
                          )}
                        </td>
                        <td className="p-4">{student.viti_studimit}</td>
                        <td className="p-4">
                          <StatusBadge>{student.statusi}</StatusBadge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => openEditModal(student)}
                              size="sm"
                              variant="secondary"
                              icon="edit"
                            >
                              Edito
                            </Button>
                            <Button
                              onClick={() => openDocumentModal(student)}
                              size="sm"
                              variant="success"
                              icon="file"
                            >
                              Dokumente
                            </Button>

                            <Button
                              onClick={() => handleDelete(student.student_id)}
                              size="sm"
                              variant="danger"
                              icon="trash"
                            >
                              Fshij
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="p-6">
                        <EmptyState
                          title="Nuk u gjet asnje student"
                          description="Provo nje kombinim tjeter kerkimi ose filtri per te pare rezultate."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={studentsPagination.currentPage}
              totalPages={studentsPagination.totalPages}
              totalItems={studentsPagination.totalItems}
              startItem={studentsPagination.startItem}
              endItem={studentsPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {editingStudent ? "Edito studentin" : "Shto student"}
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
                  Mbiemri
                </p>
                <input
                  name="mbiemri"
                  placeholder="Mbiemri"
                  value={form.mbiemri}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Numri Personal
                </p>
                <input
                  name="numri_personal"
                  placeholder="Numri Personal"
                  value={form.numri_personal}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Data e Lindjes
                </p>

                <input
                  type="date"
                  name="data_lindjes"
                  value={form.data_lindjes}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Gjinia
                </p>

                <select
                  name="gjinia"
                  value={form.gjinia}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Email</p>

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
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
                  placeholder="Telefoni"
                  value={form.telefoni}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Adresa</p>

                <input
                  name="adresa"
                  placeholder="Adresa"
                  value={form.adresa}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Drejtimi
                </p>

                <select
                  name="drejtimi_id"
                  value={form.drejtimi_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
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
                  Viti Studimit
                </p>

                <select
                  name="viti_studimit"
                  value={form.viti_studimit}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                >
                  {STUDY_YEAR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Viti {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Gjenerata
                </p>

                <select
                  name="gjenerata_id"
                  value={form.gjenerata_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="">Zgjidh gjeneraten</option>
                  {gjeneratat.map((gjenerata) => (
                    <option
                      key={gjenerata.gjenerata_id}
                      value={gjenerata.gjenerata_id}
                    >
                      {gjenerata.emri}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Statusi
                </p>

                <select
                  name="statusi"
                  value={form.statusi}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 md:col-span-2"
                  required
                >
                  <option value="Aktiv">Aktiv</option>
                  <option value="Jo aktiv">Jo aktiv</option>
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

      {documentModalStudent && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Dokumentet baze te {documentModalStudent.emri}{" "}
                  {documentModalStudent.mbiemri}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Certifikata e lindjes, dokumentet e shkolles dhe dosja percjellese.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDocumentModal}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700"
              >
                Mbyll
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {studentDocuments.length > 0 ? (
                  studentDocuments.map((document) => (
                    <a
                      key={document.dokument_id}
                      href={document.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {document.lloji_dokumentit}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {document.original_name} | {formatFileSize(document.file_size)}
                      </p>
                    </a>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Nuk ka dokumente te ngarkuara ende.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  Ngarko dokument te ri
                </p>

                <div className="space-y-3">
                  <select
                    value={documentForm.lloji_dokumentit}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        lloji_dokumentit: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    {STUDENT_DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <label className="block rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600">
                    Zgjidh dokumentin nga kompjuteri
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleDocumentFileChange}
                    />
                  </label>

                  {documentForm.fileName && (
                    <p className="text-xs text-slate-500">{documentForm.fileName}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleDocumentUpload}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Ngarko dokumentin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;

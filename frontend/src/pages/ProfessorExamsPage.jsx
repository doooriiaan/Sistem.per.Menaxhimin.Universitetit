import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import {
  DELETE_ACTION_BUTTON_CLASS,
  EDIT_ACTION_BUTTON_CLASS,
} from "../utils/buttonStyles";
import { formatDateLabel, formatTimeLabel } from "../utils/display";
import {
  getApiErrorMessage,
  validateProfessorExamForm,
} from "../utils/validation";

const emptyForm = {
  lende_id: "",
  data_provimit: "",
  ora: "",
  salla: "",
  afati: "",
};

function ProfessorExamsPage() {
  const [searchParams] = useSearchParams();
  const courseFilter = searchParams.get("course");
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredExams = useMemo(() => {
    if (!courseFilter) {
      return exams;
    }

    return exams.filter((exam) => String(exam.lende_id) === String(courseFilter));
  }, [courseFilter, exams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, examsRes] = await Promise.all([
        API.get("/profesor/lendet"),
        API.get("/profesor/provimet"),
      ]);

      setCourses(coursesRes.data);
      setExams(examsRes.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se provimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingExam(null);
    setForm({
      ...emptyForm,
      lende_id: courseFilter || courses[0]?.lende_id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setForm({
      lende_id: exam.lende_id,
      data_provimit: String(exam.data_provimit).slice(0, 10),
      ora: formatTimeLabel(exam.ora),
      salla: exam.salla,
      afati: exam.afati,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateProfessorExamForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingExam) {
        await API.put(`/profesor/provimet/${editingExam.provimi_id}`, form);
      } else {
        await API.post("/profesor/provimet", form);
      }

      closeModal();
      fetchData();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          editingExam
            ? "Gabim gjate perditesimit te provimit."
            : "Gabim gjate shtimit te provimit."
        )
      );
    }
  };

  const handleDelete = async (examId) => {
    try {
      await API.delete(`/profesor/provimet/${examId}`);
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se provimit."));
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Provimet e mia</h2>
          <p className="mt-2 text-sm text-slate-500">
            {courseFilter
              ? "Po shikon provimet e lendes se zgjedhur nga moduli i lendeve."
              : "Krijo dhe menaxho provimet vetem per lendet e tua."}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + Shto provim
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Duke i ngarkuar provimet...</p>
      ) : filteredExams.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-3 font-medium">Lenda</th>
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium">Ora</th>
                <th className="pb-3 font-medium">Salla</th>
                <th className="pb-3 font-medium">Afati</th>
                <th className="pb-3 font-medium">Nota</th>
                <th className="pb-3 font-medium">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.provimi_id} className="border-b border-slate-100">
                  <td className="py-3 text-slate-900">
                    {exam.lenda} ({exam.kodi})
                  </td>
                  <td className="py-3 text-slate-600">
                    {formatDateLabel(exam.data_provimit)}
                  </td>
                  <td className="py-3 text-slate-600">{formatTimeLabel(exam.ora)}</td>
                  <td className="py-3 text-slate-600">{exam.salla}</td>
                  <td className="py-3 text-slate-600">{exam.afati}</td>
                  <td className="py-3 text-slate-600">{exam.total_notash}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(exam)}
                        className={EDIT_ACTION_BUTTON_CLASS}
                      >
                        Edito
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exam.provimi_id)}
                        className={DELETE_ACTION_BUTTON_CLASS}
                      >
                        Fshij
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {courseFilter
            ? "Nuk ka provime per lenden e filtruar aktualisht."
            : "Nuk ka provime te krijuara aktualisht."}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingExam ? "Perditeso provimin" : "Shto provim"}
            </h3>

            <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Lenda
                </label>
                <select
                  name="lende_id"
                  value={form.lende_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="">Zgjidh lenden</option>
                  {courses.map((course) => (
                    <option key={course.lende_id} value={course.lende_id}>
                      {course.emri} ({course.kodi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Data e provimit
                </label>
                <input
                  type="date"
                  name="data_provimit"
                  value={form.data_provimit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ora
                </label>
                <input
                  type="time"
                  name="ora"
                  value={form.ora}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Salla
                </label>
                <input
                  name="salla"
                  value={form.salla}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Afati
                </label>
                <input
                  name="afati"
                  value={form.afati}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-slate-700"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-white"
                >
                  {editingExam ? "Ruaj" : "Shto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessorExamsPage;

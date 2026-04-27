import { useEffect, useState } from "react";
import API from "../services/api";
import { formatCurrency, formatDateLabel } from "../utils/display";
import { buildAcademicYearOptions, SEMESTER_OPTIONS } from "../utils/formOptions";
import { formatCourseName } from "../utils/relations";
import {
  getApiErrorMessage,
  validateRepeatRequestForm,
} from "../utils/validation";

const academicYearOptions = buildAcademicYearOptions();

const emptyPayment = {
  cardholderName: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
};

const emptyForm = {
  lende_id: "",
  semestri: 1,
  viti_akademik: academicYearOptions[0]?.value || "",
  arsyeja: "",
  payment: emptyPayment,
};

function StudentRepeatCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, requestsRes] = await Promise.all([
        API.get("/student/rindjekjet/lendet"),
        API.get("/student/rindjekjet"),
      ]);
      setCourses(coursesRes.data);
      setRequests(requestsRes.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se rindjekjeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (course = null) => {
    setForm({
      ...emptyForm,
      lende_id: course?.lende_id || "",
      semestri: course?.semestri || 1,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const selectedCourse = courses.find(
    (course) => String(course.lende_id) === String(form.lende_id)
  );
  const amountDue = selectedCourse ? Number(selectedCourse.kreditet) * 15 : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateRepeatRequestForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.post("/student/rindjekjet", form);
      closeModal();
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate dergimit te rindjekjes."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Academic Recovery
        </p>
        <h2 className="mt-4 text-3xl font-extrabold">
          Ri-ndjekja e lendeve me pagese te integruar
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Zgjidh lenden qe deshiron ta ndjekesh serish, arsyeje kerkesen dhe
          kompleto pagesen ne te njejtin flow.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Lendet e disponueshme</h3>
            <p className="mt-1 text-sm text-slate-500">
              Te gjitha lendet e lidhura me regjistrimet e tua.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            + Kerkese e re
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Duke i ngarkuar lendet...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.lende_id}
                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <h4 className="text-lg font-bold text-slate-900">
                  {formatCourseName(course)}
                </h4>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>Semestri: {course.semestri}</p>
                  <p>Kredite: {course.kreditet}</p>
                  <p>Nota e fundit: {course.nota_me_e_fundit || "-"}</p>
                  <p>Tarifa: {formatCurrency(Number(course.kreditet) * 15, "EUR")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openModal(course)}
                  className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Kerkese per rindjekje
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Kerkesat e mia</h3>
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <article
                key={request.rindjekja_id}
                className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {request.lenda} ({request.kodi})
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {request.arsyeja}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 lg:min-w-[220px]">
                    <p>Statusi: {request.statusi}</p>
                    <p>Pagesa: {request.statusi_pageses}</p>
                    <p>Detyrimi: {formatCurrency(request.shuma_detyrimit, "EUR")}</p>
                    <p>Reference: {request.reference_pagese || "-"}</p>
                    <p>Data: {formatDateLabel(request.requested_at)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Nuk ke derguar ende kerkesa per rindjekje te lendeve.
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Kerkese per rindjekje
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tarifa e llogaritur: {formatCurrency(amountDue, "EUR")}
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
              <select
                value={form.lende_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lende_id: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              >
                <option value="">Zgjidh lenden</option>
                {courses.map((course) => (
                  <option key={course.lende_id} value={course.lende_id}>
                    {formatCourseName(course)}
                  </option>
                ))}
              </select>
              <select
                value={form.semestri}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    semestri: Number(event.target.value),
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                {SEMESTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Semestri {option.label}
                  </option>
                ))}
              </select>
              <select
                value={form.viti_akademik}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    viti_akademik: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                {academicYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                value={form.arsyeja}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    arsyeja: event.target.value,
                  }))
                }
                className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
                placeholder="Arsyeja e rindjekjes"
              />
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Pagesa me kartele</p>
              </div>
              <input
                value={form.payment.cardholderName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      cardholderName: event.target.value,
                    },
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
                placeholder="Emri ne kartel"
              />
              <input
                value={form.payment.cardNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      cardNumber: event.target.value,
                    },
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
                placeholder="0000 0000 0000 0000"
              />
              <input
                value={form.payment.expiryMonth}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      expiryMonth: event.target.value,
                    },
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="MM"
              />
              <input
                value={form.payment.expiryYear}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      expiryYear: event.target.value,
                    },
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="YY"
              />
              <input
                value={form.payment.cvv}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment: {
                      ...current.payment,
                      cvv: event.target.value,
                    },
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
                placeholder="CVV"
              />
              <div className="md:col-span-2 flex justify-end gap-3">
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
                  Paguaj dhe dergo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentRepeatCoursesPage;

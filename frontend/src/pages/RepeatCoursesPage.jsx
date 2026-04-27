import { useEffect, useState } from "react";
import API from "../services/api";
import { formatCurrency, formatDateLabel } from "../utils/display";
import {
  PAYMENT_STATUS_OPTIONS,
  SERVICE_REQUEST_STATUS_OPTIONS,
} from "../utils/formOptions";
import {
  getApiErrorMessage,
  validateRepeatUpdateForm,
} from "../utils/validation";

const emptyForm = {
  statusi: SERVICE_REQUEST_STATUS_OPTIONS[0].value,
  statusi_pageses: PAYMENT_STATUS_OPTIONS[0].value,
  shenime_admin: "",
};

function RepeatCoursesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRequest, setEditingRequest] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await API.get("/rindjekjet");
      setRequests(response.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se rindjekjeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openManager = (request) => {
    setEditingRequest(request);
    setForm({
      statusi: request.statusi || SERVICE_REQUEST_STATUS_OPTIONS[0].value,
      statusi_pageses: request.statusi_pageses || PAYMENT_STATUS_OPTIONS[0].value,
      shenime_admin: request.shenime_admin || "",
    });
  };

  const closeManager = () => {
    setEditingRequest(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateRepeatUpdateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.put(`/rindjekjet/${editingRequest.rindjekja_id}`, form);
      closeManager();
      fetchRequests();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate perditesimit te rindjekjes."));
    }
  };

  const pendingRequests = requests.filter((item) => item.statusi === "Ne pritje").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] bg-slate-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Rindjekja e Lendeve
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">
            Menaxho kerkesat per ri-ndjekje dhe pagesat per kredite
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Shiko lendet qe studentet duan t&apos;i ndjekin serish, verifiko
            pagesat dhe aprovo ose refuzo kerkesat akademike.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Kerkesa totale</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {requests.length}
            </h3>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Ne pritje</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {pendingRequests}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Duke i ngarkuar rindjekjet...</p>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <article
                key={request.rindjekja_id}
                className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {request.lenda} ({request.kodi})
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {request.studenti_emri} {request.studenti_mbiemri} |{" "}
                      {request.studenti_email}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {request.arsyeja}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600 lg:min-w-[250px]">
                    <p>Semestri: {request.semestri}</p>
                    <p>Viti akademik: {request.viti_akademik}</p>
                    <p>Statusi: {request.statusi}</p>
                    <p>Pagesa: {request.statusi_pageses}</p>
                    <p>Detyrimi: {formatCurrency(request.shuma_detyrimit, "EUR")}</p>
                    <p>Paguar: {formatCurrency(request.shuma_paguar, "EUR")}</p>
                    <p>Reference: {request.reference_pagese || "-"}</p>
                    <p>Data: {formatDateLabel(request.requested_at)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => openManager(request)}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Menaxho rindjekjen
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            Nuk ka kerkesa te reja per rindjekje te lendeve.
          </div>
        )}
      </section>

      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Menaxho rindjekjen
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingRequest.lenda} per {editingRequest.studenti_emri}{" "}
                  {editingRequest.studenti_mbiemri}
                </p>
              </div>
              <button
                type="button"
                onClick={closeManager}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Statusi
                </label>
                <select
                  value={form.statusi}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, statusi: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                >
                  {SERVICE_REQUEST_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Statusi i pageses
                </label>
                <select
                  value={form.statusi_pageses}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      statusi_pageses: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                >
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Shenime te adminit
                </label>
                <textarea
                  value={form.shenime_admin}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      shenime_admin: event.target.value,
                    }))
                  }
                  className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeManager}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Ruaj statusin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepeatCoursesPage;

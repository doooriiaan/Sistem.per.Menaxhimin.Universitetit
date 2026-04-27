import { useEffect, useState } from "react";
import API from "../services/api";
import { formatCurrency, formatDateLabel } from "../utils/display";
import {
  PAYMENT_STATUS_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_REQUEST_STATUS_OPTIONS,
} from "../utils/formOptions";
import {
  getApiErrorMessage,
  validateServiceForm,
  validateServiceRequestUpdateForm,
} from "../utils/validation";

const emptyServiceForm = {
  emri: "",
  kategoria: SERVICE_CATEGORY_OPTIONS[0].value,
  pershkrimi: "",
  cmimi: 0,
  valuta: "EUR",
  aktiv: true,
  kerkon_dokument: false,
};

const emptyRequestForm = {
  statusi: SERVICE_REQUEST_STATUS_OPTIONS[0].value,
  statusi_pageses: PAYMENT_STATUS_OPTIONS[0].value,
  shenime_admin: "",
};

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [managingRequest, setManagingRequest] = useState(null);
  const [requestForm, setRequestForm] = useState(emptyRequestForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, requestsRes] = await Promise.all([
        API.get("/sherbimet"),
        API.get("/sherbimet/kerkesat"),
      ]);

      setServices(servicesRes.data);
      setRequests(requestsRes.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se sherbimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleServiceChange = (event) => {
    const { name, value, type, checked } = event.target;
    setServiceForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "cmimi"
            ? value
            : value,
    }));
    setError("");
  };

  const openAddModal = () => {
    setEditingService(null);
    setServiceForm(emptyServiceForm);
    setShowServiceModal(true);
    setError("");
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setServiceForm({
      emri: service.emri || "",
      kategoria: service.kategoria || SERVICE_CATEGORY_OPTIONS[0].value,
      pershkrimi: service.pershkrimi || "",
      cmimi: service.cmimi || 0,
      valuta: service.valuta || "EUR",
      aktiv: Boolean(service.aktiv),
      kerkon_dokument: Boolean(service.kerkon_dokument),
    });
    setShowServiceModal(true);
    setError("");
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    setServiceForm(emptyServiceForm);
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateServiceForm(serviceForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingService) {
        await API.put(`/sherbimet/${editingService.sherbimi_id}`, serviceForm);
      } else {
        await API.post("/sherbimet", serviceForm);
      }

      closeServiceModal();
      fetchData();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          editingService
            ? "Gabim gjate perditesimit te sherbimit."
            : "Gabim gjate shtimit te sherbimit."
        )
      );
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await API.delete(`/sherbimet/${id}`);
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se sherbimit."));
    }
  };

  const openRequestManager = (request) => {
    setManagingRequest(request);
    setRequestForm({
      statusi: request.statusi || SERVICE_REQUEST_STATUS_OPTIONS[0].value,
      statusi_pageses: request.statusi_pageses || PAYMENT_STATUS_OPTIONS[0].value,
      shenime_admin: request.shenime_admin || "",
    });
  };

  const closeRequestManager = () => {
    setManagingRequest(null);
    setRequestForm(emptyRequestForm);
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateServiceRequestUpdateForm(requestForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.put(`/sherbimet/kerkesat/${managingRequest.kerkesa_id}`, requestForm);
      closeRequestManager();
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate perditesimit te kerkeses."));
    }
  };

  const activeServices = services.filter((item) => Number(item.aktiv) === 1).length;
  const paidRequests = requests.filter(
    (item) => item.statusi_pageses === "Paguajtur"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] bg-slate-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Sherbime Studentore
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">
            Pagesa, kartela ID dhe administrata studentore
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Menaxho katalogun e sherbimeve me pagese, kartelat e reja ID dhe
            aprovimin administrativ te kerkesave te studenteve.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
          >
            + Shto Sherbim
          </button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Sherbime aktive</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {activeServices}
            </h3>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Kerkesa totale</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {requests.length}
            </h3>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pagesa te kompletuara</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {paidRequests}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Duke i ngarkuar sherbimet...
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Katalogu i sherbimeve
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Sherbimet qe studentet mund t&apos;i kerkojne dhe paguajne online.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.sherbimi_id}
                  className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {service.kategoria}
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-slate-900">
                        {service.emri}
                      </h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {Number(service.aktiv) === 1 ? "Aktiv" : "Jo aktiv"}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {service.pershkrimi}
                  </p>

                  <div className="mt-5 grid gap-2 text-sm text-slate-600">
                    <p>Cmimi: {formatCurrency(service.cmimi, service.valuta)}</p>
                    <p>Dokument shtese: {Number(service.kerkon_dokument) === 1 ? "Po" : "Jo"}</p>
                    <p>Kerkesa: {service.total_kerkesave || 0}</p>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                      Edito
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.sherbimi_id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Fshij
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Kerkesat dhe pagesat
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Menaxho statusin administrativ dhe statusin e pageses per secilen kerkese.
              </p>
            </div>

            <div className="space-y-4">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <article
                    key={request.kerkesa_id}
                    className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {request.sherbimi}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {request.studenti_emri} {request.studenti_mbiemri} |{" "}
                          {request.studenti_email}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {request.arsyeja}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-600 lg:min-w-[240px]">
                        <p>Statusi: {request.statusi}</p>
                        <p>Pagesa: {request.statusi_pageses}</p>
                        <p>Shuma: {formatCurrency(request.shuma_paguar, "EUR")}</p>
                        <p>Reference: {request.reference_pagese || "-"}</p>
                        <p>Kartela: {request.karta_maskuar || "-"}</p>
                        <p>Data: {formatDateLabel(request.requested_at)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => openRequestManager(request)}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Menaxho kerkesen
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  Nuk ka ende kerkesa per sherbime.
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingService ? "Perditeso Sherbimin" : "Shto Sherbim"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Defino cmimin, kategorine dhe kerkesat administrative.
                </p>
              </div>
              <button
                type="button"
                onClick={closeServiceModal}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Emri i sherbimit
                </label>
                <input
                  name="emri"
                  value={serviceForm.emri}
                  onChange={handleServiceChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Kategoria
                </label>
                <select
                  name="kategoria"
                  value={serviceForm.kategoria}
                  onChange={handleServiceChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                >
                  {SERVICE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Cmimi
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="cmimi"
                  value={serviceForm.cmimi}
                  onChange={handleServiceChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Valuta
                </label>
                <input
                  name="valuta"
                  value={serviceForm.valuta}
                  onChange={handleServiceChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <input
                  id="aktiv"
                  type="checkbox"
                  name="aktiv"
                  checked={serviceForm.aktiv}
                  onChange={handleServiceChange}
                />
                <label htmlFor="aktiv" className="text-sm font-semibold text-slate-700">
                  Sherbim aktiv
                </label>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <input
                  id="kerkon_dokument"
                  type="checkbox"
                  name="kerkon_dokument"
                  checked={serviceForm.kerkon_dokument}
                  onChange={handleServiceChange}
                />
                <label
                  htmlFor="kerkon_dokument"
                  className="text-sm font-semibold text-slate-700"
                >
                  Kjo kerkese kerkon dokument shtese
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Pershkrimi
                </label>
                <textarea
                  name="pershkrimi"
                  value={serviceForm.pershkrimi}
                  onChange={handleServiceChange}
                  className="min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {editingService ? "Ruaj ndryshimet" : "Shto sherbimin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {managingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Menaxho kerkesen
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {managingRequest.sherbimi} per {managingRequest.studenti_emri}{" "}
                  {managingRequest.studenti_mbiemri}
                </p>
              </div>
              <button
                type="button"
                onClick={closeRequestManager}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Statusi i kerkeses
                </label>
                <select
                  value={requestForm.statusi}
                  onChange={(event) =>
                    setRequestForm((current) => ({
                      ...current,
                      statusi: event.target.value,
                    }))
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
                  value={requestForm.statusi_pageses}
                  onChange={(event) =>
                    setRequestForm((current) => ({
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
                  value={requestForm.shenime_admin}
                  onChange={(event) =>
                    setRequestForm((current) => ({
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
                  onClick={closeRequestManager}
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

export default ServicesPage;

import { useEffect, useState } from "react";
import API from "../services/api";
import { formatCurrency, formatDateLabel } from "../utils/display";
import {
  getApiErrorMessage,
  validateStudentServiceRequestForm,
} from "../utils/validation";

const emptyPayment = {
  cardholderName: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
};

const emptyForm = {
  sherbimi_id: "",
  arsyeja: "",
  payment: emptyPayment,
};

function StudentServicesPage() {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/sherbimet");
      setServices(response.data.services || []);
      setRequests(response.data.requests || []);
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

  const openRequestModal = (service) => {
    setSelectedService(service);
    setForm({
      sherbimi_id: service.sherbimi_id,
      arsyeja: "",
      payment: emptyPayment,
    });
  };

  const closeRequestModal = () => {
    setSelectedService(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateStudentServiceRequestForm(form, {
      requirePayment: Number(selectedService?.cmimi) > 0,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.post("/student/sherbimet/kerkesat", form);
      closeRequestModal();
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate dergimit te kerkeses."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Student Services
        </p>
        <h2 className="mt-4 text-3xl font-extrabold">
          Sherbimet e universitetit me pagesa online
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Kerko kartelen e re ID, vertetime, transkript dhe sherbime te tjera
          administrative. Pagesa behet direkt nga modal-i i dedikuar.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Sherbimet aktive</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Duke i ngarkuar sherbimet...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.sherbimi_id}
                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {service.kategoria}
                </p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">
                  {service.emri}
                </h4>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {service.pershkrimi}
                </p>
                <div className="mt-5 grid gap-2 text-sm text-slate-600">
                  <p>Cmimi: {formatCurrency(service.cmimi, service.valuta)}</p>
                  <p>
                    Dokument shtese: {Number(service.kerkon_dokument) === 1 ? "Po" : "Jo"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openRequestModal(service)}
                  className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Kerko sherbimin
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
                key={request.kerkesa_id}
                className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{request.sherbimi}</p>
                    <p className="mt-1 text-sm text-slate-500">{request.kategoria}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {request.arsyeja}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 lg:min-w-[220px]">
                    <p>Statusi: {request.statusi}</p>
                    <p>Pagesa: {request.statusi_pageses}</p>
                    <p>Shuma: {formatCurrency(request.shuma_paguar, request.valuta || "EUR")}</p>
                    <p>Reference: {request.reference_pagese || "-"}</p>
                    <p>Data: {formatDateLabel(request.requested_at)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Nuk ke derguar ende kerkesa per sherbime.
            </div>
          )}
        </div>
      </section>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Kerkese per {selectedService.emri}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(selectedService.cmimi, selectedService.valuta)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Arsyeja / pershkrimi
                </label>
                <textarea
                  value={form.arsyeja}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      arsyeja: event.target.value,
                    }))
                  }
                  className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              {Number(selectedService.cmimi) > 0 && (
                <>
                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Payment Modal
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Te dhenat ruhen vetem si reference dhe kartela e maskuar.
                    </p>
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
                </>
              )}

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRequestModal}
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

export default StudentServicesPage;

import { useEffect, useState } from "react";
import API from "../services/api";
import { formatCurrency, formatDateLabel, formatFileSize } from "../utils/display";
import { fileToPayload } from "../utils/files";
import {
  getApiErrorMessage,
  validateScholarshipApplicationForm,
} from "../utils/validation";

const emptyForm = {
  bursa_id: "",
  motivimi: "",
  dokument: null,
  dokumentName: "",
};

function StudentScholarshipsPage() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/bursat");
      setOffers(response.data.offers || []);
      setApplications(response.data.applications || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se bursave."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (offer) => {
    setSelectedOffer(offer);
    setForm({
      ...emptyForm,
      bursa_id: offer.bursa_id,
    });
  };

  const closeModal = () => {
    setSelectedOffer(null);
    setForm(emptyForm);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const payload = await fileToPayload(file);
      setForm((current) => ({
        ...current,
        dokument: payload,
        dokumentName: file.name,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Skedari nuk mund te ngarkohet.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateScholarshipApplicationForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.post("/student/bursat/apliko", {
        bursa_id: form.bursa_id,
        motivimi: form.motivimi,
        dokument: form.dokument,
      });
      closeModal();
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate aplikimit per burse."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Scholarships
        </p>
        <h2 className="mt-4 text-3xl font-extrabold">
          Apliko per bursa me motivim dhe dokumente
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Shiko thirrjet e hapura, kriteret financiare dhe ngarko dokumentet
          percjellese direkt nga kompjuteri yt.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Bursat e hapura</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Duke i ngarkuar bursat...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <article
                key={offer.bursa_id}
                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {offer.lloji}
                </p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">
                  {offer.titulli}
                </h4>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {offer.pershkrimi}
                </p>
                <div className="mt-5 grid gap-2 text-sm text-slate-600">
                  <p>Shuma: {formatCurrency(offer.shuma, "EUR")}</p>
                  <p>Afati: {formatDateLabel(offer.afati_aplikimit)}</p>
                </div>
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                  {offer.kriteret}
                </div>
                <button
                  type="button"
                  onClick={() => openModal(offer)}
                  className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Apliko tani
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Aplikimet e mia</h3>
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <article
                key={application.aplikimi_id}
                className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {application.titulli}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {application.motivimi}
                    </p>
                    {application.dokument_url && (
                      <a
                        href={application.dokument_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                      >
                        Hap dokumentin
                      </a>
                    )}
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 lg:min-w-[220px]">
                    <p>Statusi: {application.statusi}</p>
                    <p>Shuma: {formatCurrency(application.shuma, "EUR")}</p>
                    <p>Data: {formatDateLabel(application.applied_at)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Nuk ke aplikuar ende per bursa.
            </div>
          )}
        </div>
      </section>

      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Aplikim per {selectedOffer.titulli}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(selectedOffer.shuma, "EUR")}
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

            <form onSubmit={handleSubmit} className="grid gap-4">
              <textarea
                value={form.motivimi}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    motivimi: event.target.value,
                  }))
                }
                className="min-h-32 rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Shkruaj motivimin tend"
              />
              <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
                Ngarko dokument percjelles (opsionale)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {form.dokumentName && (
                <p className="text-sm text-slate-500">
                  {form.dokumentName}
                  {form.dokument?.size ? ` • ${formatFileSize(form.dokument.size)}` : ""}
                </p>
              )}
              <div className="flex justify-end gap-3">
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
                  Dergo aplikimin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentScholarshipsPage;

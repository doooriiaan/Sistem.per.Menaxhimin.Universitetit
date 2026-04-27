import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDateLabel, formatFileSize } from "../utils/display";
import { fileToPayload } from "../utils/files";
import {
  getApiErrorMessage,
  validateErasmusApplicationForm,
} from "../utils/validation";

const emptyForm = {
  erasmus_id: "",
  motivimi: "",
  dokument: null,
  dokumentName: "",
};

function StudentErasmusPage() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/erasmus");
      setOffers(response.data.offers || []);
      setApplications(response.data.applications || []);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se programeve Erasmus."));
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
      erasmus_id: offer.erasmus_id,
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
    const validationError = validateErasmusApplicationForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.post("/student/erasmus/apliko", {
        erasmus_id: form.erasmus_id,
        motivimi: form.motivimi,
        dokument: form.dokument,
      });
      closeModal();
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate aplikimit per Erasmus."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950 p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Erasmus
        </p>
        <h2 className="mt-4 text-3xl font-extrabold">
          Apliko per shkembim nderkombetar
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Zgjidh universitetin partner, ngarko dokumentin percjelles dhe dergo
          motivimin per mobilitetin akademik.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Programet e hapura</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Duke i ngarkuar programet...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <article
                key={offer.erasmus_id}
                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {offer.shteti}
                </p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">
                  {offer.universiteti}
                </h4>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {offer.pershkrimi}
                </p>
                <div className="mt-5 grid gap-2 text-sm text-slate-600">
                  <p>Semestri: {offer.semestri}</p>
                  <p>Viti: {offer.viti_akademik}</p>
                  <p>Financimi: {offer.financimi}</p>
                  <p>Afati: {formatDateLabel(offer.afati_aplikimit)}</p>
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
                      {application.universiteti}
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
                    <p>Shteti: {application.shteti}</p>
                    <p>Viti: {application.viti_akademik}</p>
                    <p>Data: {formatDateLabel(application.applied_at)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Nuk ke aplikuar ende per Erasmus.
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
                  Aplikim per {selectedOffer.universiteti}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{selectedOffer.shteti}</p>
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
                placeholder="Shkruaj motivimin tend per mobilitetin"
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

export default StudentErasmusPage;

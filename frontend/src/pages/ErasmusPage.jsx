import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDateLabel } from "../utils/display";
import {
  APPLICATION_STATUS_OPTIONS,
  ERASMUS_SEMESTER_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
} from "../utils/formOptions";
import {
  getApiErrorMessage,
  validateApplicationStatusForm,
  validateErasmusForm,
} from "../utils/validation";

const emptyOfferForm = {
  universiteti: "",
  shteti: "",
  semestri: ERASMUS_SEMESTER_OPTIONS[0].value,
  viti_akademik: "",
  financimi: "",
  pershkrimi: "",
  afati_aplikimit: "",
  statusi: OPPORTUNITY_STATUS_OPTIONS[0].value,
  drejtimi_id: "",
};

const emptyApplicationForm = {
  statusi: APPLICATION_STATUS_OPTIONS[0].value,
  shenime_admin: "",
};

function ErasmusPage() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [drejtimet, setDrejtimet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [editingApplication, setEditingApplication] = useState(null);
  const [applicationForm, setApplicationForm] = useState(emptyApplicationForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersRes, applicationsRes, drejtimetRes] = await Promise.all([
        API.get("/erasmus"),
        API.get("/erasmus/aplikimet"),
        API.get("/drejtimet"),
      ]);
      setOffers(offersRes.data);
      setApplications(applicationsRes.data);
      setDrejtimet(drejtimetRes.data);
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

  const openOfferModal = (offer = null) => {
    setEditingOffer(offer);
    setOfferForm(
      offer
        ? {
            universiteti: offer.universiteti || "",
            shteti: offer.shteti || "",
            semestri: offer.semestri || ERASMUS_SEMESTER_OPTIONS[0].value,
            viti_akademik: offer.viti_akademik || "",
            financimi: offer.financimi || "",
            pershkrimi: offer.pershkrimi || "",
            afati_aplikimit: String(offer.afati_aplikimit || "").split("T")[0],
            statusi: offer.statusi || OPPORTUNITY_STATUS_OPTIONS[0].value,
            drejtimi_id: offer.drejtimi_id || "",
          }
        : emptyOfferForm
    );
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setEditingOffer(null);
    setOfferForm(emptyOfferForm);
  };

  const handleOfferSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateErasmusForm(offerForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editingOffer) {
        await API.put(`/erasmus/${editingOffer.erasmus_id}`, offerForm);
      } else {
        await API.post("/erasmus", offerForm);
      }

      closeOfferModal();
      fetchData();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          editingOffer
            ? "Gabim gjate perditesimit te programit Erasmus."
            : "Gabim gjate shtimit te programit Erasmus."
        )
      );
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await API.delete(`/erasmus/${id}`);
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate fshirjes se programit Erasmus."));
    }
  };

  const openApplicationManager = (application) => {
    setEditingApplication(application);
    setApplicationForm({
      statusi: application.statusi || APPLICATION_STATUS_OPTIONS[0].value,
      shenime_admin: application.shenime_admin || "",
    });
  };

  const closeApplicationManager = () => {
    setEditingApplication(null);
    setApplicationForm(emptyApplicationForm);
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateApplicationStatusForm(applicationForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.put(
        `/erasmus/aplikimet/${editingApplication.aplikimi_id}`,
        applicationForm
      );
      closeApplicationManager();
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate perditesimit te aplikimit."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] bg-slate-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Mobility Office
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">
            Shkembime Erasmus dhe mobilitet akademik nderkombetar
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Menaxho partneritetet me universitete te huaja, semestrat e
            mobilitetit, financimin dhe aplikimet e studenteve.
          </p>
          <button
            type="button"
            onClick={() => openOfferModal()}
            className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
          >
            + Shto Program
          </button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Programe aktive</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {offers.filter((item) => item.statusi === "Hapur").length}
            </h3>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Aplikime</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {applications.length}
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
        <h3 className="mb-5 text-xl font-bold text-slate-900">Partneritetet Erasmus</h3>
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
                  <p>Drejtimi: {offer.drejtimi || "Te gjitha drejtimet"}</p>
                  <p>Afati: {formatDateLabel(offer.afati_aplikimit)}</p>
                  <p>Aplikime: {offer.total_aplikimeve || 0}</p>
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openOfferModal(offer)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    Edito
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOffer(offer.erasmus_id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                  >
                    Fshij
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Aplikimet Erasmus</h3>
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
                    <p className="mt-1 text-sm text-slate-500">
                      {application.studenti_emri} {application.studenti_mbiemri} |{" "}
                      {application.studenti_email}
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

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => openApplicationManager(application)}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Menaxho aplikimin
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Nuk ka ende aplikime Erasmus.
            </div>
          )}
        </div>
      </section>

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingOffer ? "Perditeso Programin" : "Shto Program Erasmus"}
              </h3>
              <button
                type="button"
                onClick={closeOfferModal}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="grid gap-4 md:grid-cols-2">
              <input
                value={offerForm.universiteti}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    universiteti: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Universiteti"
              />
              <input
                value={offerForm.shteti}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    shteti: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Shteti"
              />
              <select
                value={offerForm.semestri}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    semestri: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                {ERASMUS_SEMESTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                value={offerForm.viti_akademik}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    viti_akademik: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="2026/2027"
              />
              <input
                value={offerForm.financimi}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    financimi: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
                placeholder="Lloji i financimit"
              />
              <input
                type="date"
                value={offerForm.afati_aplikimit}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    afati_aplikimit: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />
              <select
                value={offerForm.statusi}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    statusi: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                {OPPORTUNITY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={offerForm.drejtimi_id}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    drejtimi_id: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
              >
                <option value="">Te gjitha drejtimet</option>
                {drejtimet.map((drejtimi) => (
                  <option key={drejtimi.drejtim_id} value={drejtimi.drejtim_id}>
                    {drejtimi.emri}
                  </option>
                ))}
              </select>
              <textarea
                value={offerForm.pershkrimi}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    pershkrimi: event.target.value,
                  }))
                }
                className="min-h-32 rounded-2xl border border-slate-300 px-4 py-3 md:col-span-2"
                placeholder="Pershkrimi"
              />
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeOfferModal}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {editingOffer ? "Ruaj ndryshimet" : "Shto programin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">
                Menaxho aplikimin
              </h3>
              <button
                type="button"
                onClick={closeApplicationManager}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={handleApplicationSubmit} className="grid gap-4">
              <select
                value={applicationForm.statusi}
                onChange={(event) =>
                  setApplicationForm((current) => ({
                    ...current,
                    statusi: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                {APPLICATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                value={applicationForm.shenime_admin}
                onChange={(event) =>
                  setApplicationForm((current) => ({
                    ...current,
                    shenime_admin: event.target.value,
                  }))
                }
                className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Shenime te adminit"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeApplicationManager}
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

export default ErasmusPage;

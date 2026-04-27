import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import { formatDateLabel } from "../utils/display";
import {
  getApiErrorMessage,
  validateNotificationForm,
} from "../utils/validation";

const emptyForm = {
  tag: "",
  titulli: "",
  pershkrimi: "",
};

function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roli === "admin";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/njoftime");
      setNotices(response.data);
      setPageError("");
    } catch (err) {
      setPageError(getApiErrorMessage(err, "Gabim gjate marrjes se njoftimeve."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openAddModal = () => {
    setEditingNotice(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setForm({
      tag: notice.tag || "",
      titulli: notice.titulli || "",
      pershkrimi: notice.pershkrimi || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNotice(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateNotificationForm(form);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      if (editingNotice) {
        await API.put(`/njoftime/${editingNotice.njoftim_id}`, form);
      } else {
        await API.post("/njoftime", form);
      }

      closeModal();
      fetchNotices();
    } catch (err) {
      setFormError(
        getApiErrorMessage(
          err,
          editingNotice
            ? "Gabim gjate perditesimit te njoftimit."
            : "Gabim gjate shtimit te njoftimit."
        )
      );
    }
  };

  const handleDelete = async (notice) => {
    const shouldDelete = window.confirm(
      `A deshironi ta fshini njoftimin "${notice.titulli}"?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await API.delete(`/njoftime/${notice.njoftim_id}`);
      setPageError("");

      if (editingNotice?.njoftim_id === notice.njoftim_id) {
        closeModal();
      }

      fetchNotices();
    } catch (err) {
      setPageError(getApiErrorMessage(err, "Gabim gjate fshirjes se njoftimit."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden rounded-[28px] p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-teal-700">
              Njoftime
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
              Qendra e komunikimeve te universitetit
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isAdmin
                ? "Publikoni njoftime te reja per afate, ndryshime orari dhe perditesime te sistemit per te gjithe perdoruesit."
                : "Ketu shfaqen njoftimet me te rendesishme per afate, ndryshime orari dhe perditesime te sistemit."}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="rounded-2xl bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-sm">
              {notices.length} njoftime ne sistem
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={openAddModal}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                + Shto Njoftim
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {pageError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : null}

      {loading ? (
        <div className="surface-card rounded-[24px] p-6 text-sm text-slate-500">
          Duke i ngarkuar njoftimet...
        </div>
      ) : notices.length ? (
        <section className="grid gap-5 xl:grid-cols-3">
          {notices.map((notice) => (
            <article
              key={notice.njoftim_id}
              className="surface-card rounded-[24px] p-6 transition duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                  {notice.tag}
                </span>

                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(notice)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edito
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(notice)}
                      className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Fshi
                    </button>
                  </div>
                ) : null}
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                {notice.titulli}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {notice.pershkrimi}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>{formatDateLabel(notice.created_at)}</span>
                {notice.created_by_name ? (
                  <span>Nga {notice.created_by_name}</span>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="surface-card rounded-[24px] p-8 text-sm text-slate-500">
          Ende nuk ka njoftime te publikuara.
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                  {editingNotice ? "Perditeso njoftimin" : "Njoftim i ri"}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {editingNotice
                    ? "Ndrysho permbajtjen e njoftimit"
                    : "Publiko nje njoftim te ri"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Mbyll
              </button>
            </div>

            {formError ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Kategoria
                </span>
                <input
                  type="text"
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  placeholder="Shembull: Akademik"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Titulli
                </span>
                <input
                  type="text"
                  name="titulli"
                  value={form.titulli}
                  onChange={handleChange}
                  placeholder="Shkruaj titullin e njoftimit"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Pershkrimi
                </span>
                <textarea
                  name="pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Shkruaj permbajtjen qe do te shfaqet per studentet dhe profesoret"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  {editingNotice ? "Ruaj ndryshimet" : "Publiko njoftimin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationsPage;

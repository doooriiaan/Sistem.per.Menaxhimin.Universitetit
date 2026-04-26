import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import {
  getApiErrorMessage,
  validatePasswordChangeForm,
} from "../utils/validation";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AccountPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setSuccess("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePasswordChangeForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await API.put("/auth/password", form);
      setSuccess("Fjalekalimi u ndryshua me sukses.");
      setForm(emptyForm);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Gabim gjate ndryshimit te fjalekalimit.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
          Llogaria
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          Informacioni bazik
        </h2>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Emri i plote
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {[user?.emri, user?.mbiemri].filter(Boolean).join(" ") || "-"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {user?.email || "-"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Roli
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {user?.roli_label || "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
          Siguria
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          Ndrysho fjalekalimin
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Perdor nje fjalekalim te ri me te pakten 8 karaktere.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fjalekalimi aktual
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fjalekalimi i ri
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Konfirmo fjalekalimin e ri
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {submitting ? "Duke ruajtur..." : "Ruaj ndryshimet"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AccountPage;

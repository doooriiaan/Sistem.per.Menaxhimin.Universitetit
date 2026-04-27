import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackendStatusBanner from "../components/BackendStatusBanner";
import { useBackendStatus } from "../hooks/useBackendStatus";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import {
  getApiErrorMessage,
  validateRegisterForm,
} from "../utils/validation";

const emptyForm = {
  role: "student",
  email: "",
  password: "",
  confirmPassword: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const backendStatus = useBackendStatus();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateRegisterForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const response = await API.post("/auth/register", {
        role: form.role,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      login({
        token: response.data.token,
        user: response.data.user,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate regjistrimit."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[36px] border border-white/50 bg-white/58 shadow-[0_40px_120px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
        <div className="hidden w-1/2 flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.24),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.9))] p-10 text-white lg:flex">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-teal-200/80">
              Aktivizimi i llogarise
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
              Regjistrohu si student ose profesor.
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-300">
              Regjistrimi funksionon vetem nese administratori te ka krijuar me
              pare ne tabelen perkatese dhe email-i yt perputhet me rekordin
              ekzistues.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">
              Admini nuk regjistrohet publikisht
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Llogarite e adminit krijohen nga konfigurimi i sistemit.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-transparent p-8 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-md text-center font-semibold uppercase tracking-[0.28em] text-slate-600">
                Regjistrim
              </p>

              <h1 className="mt-4 text-center text-3xl font-bold text-slate-950">
                Aktivizo qasjen tende
              </h1>
              <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                Zgjidh rolin dhe perdor email-in qe ekziston ne sistem.
              </p>
            </div>

            {backendStatus === "offline" && <BackendStatusBanner />}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-5 rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Roli
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="student">Student</option>
                  <option value="profesor">Profesor</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fjalekalimi
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Te pakten 8 karaktere"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Konfirmo fjalekalimin
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Shkruaje perseri"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {submitting ? "Duke u regjistruar..." : "Regjistrohu"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Ke llogari?
              <Link
                to="/login"
                className="ml-2 font-semibold text-slate-900 underline underline-offset-4"
              >
                Kthehu te hyrja
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

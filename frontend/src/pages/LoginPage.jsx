import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackendStatusBanner from "../components/BackendStatusBanner";
import { useBackendStatus } from "../hooks/useBackendStatus";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import {
  getApiErrorMessage,
  validateLoginForm,
} from "../utils/validation";

const emptyForm = {
  email: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const backendStatus = useBackendStatus();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passwordChanged = Boolean(location.state?.passwordChanged);

  const redirectPath = location.state?.from?.pathname || "/";

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

    const validationError = validateLoginForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const response = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      login({
        token: response.data.token,
        user: response.data.user,
      });

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate identifikimit."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[36px] border border-white/50 bg-white/58 shadow-[0_40px_120px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
        <div className="hidden w-1/2 flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.28),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.9))] p-10 text-white lg:flex">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-teal-200/80">
              University Management System
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
              Hyr ne sistem sipas rolit tend.
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-300">
              Admini menaxhon te gjithe sistemin, profesori sheh lendet dhe
              orarin e vet, ndersa studenti sheh regjistrimet, provimet dhe
              notat personale.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">
              Nuk ke llogari ende?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Studentet dhe profesoret mund te regjistrohen nese email-i i tyre
              ekziston tashme ne sistem.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-transparent p-8 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-md text-center font-semibold uppercase tracking-[0.28em] text-slate-600">
                Login
              </p>

              <h1 className="mt-4 text-center text-3xl font-bold text-slate-950">
                Mire se erdhe perseri
              </h1>
              <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                Identifikohu per te vazhduar ne sistem.
              </p>
            </div>

            {backendStatus === "offline" && <BackendStatusBanner />}

            {passwordChanged && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
                Fjalekalimi u ndryshua. Identifikohu perseri per te vazhduar.
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-5 rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl" onSubmit={handleSubmit}>
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
                  placeholder="Shkruaj fjalekalimin"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {submitting ? "Duke u identifikuar..." : "Hyr ne sistem"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Student ose profesor?
              <Link
                to="/register"
                className="ml-2 font-semibold text-slate-900 underline underline-offset-4"
              >
                Krijo llogari
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

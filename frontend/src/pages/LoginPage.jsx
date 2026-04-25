import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(90vh-5rem)] max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/40">
        <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-10 text-white lg:flex">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-400">
              University Management System
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-slate-200 ">
              Hyr ne sistem sipas rolit tend.
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-300">
              Admini menaxhon te gjithe sistemin, profesori sheh lendet dhe
              orarin e vet, ndersa studenti sheh regjistrimet, provimet dhe
              notat personale.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <p className="text-sm font-semibold text-white">
              Nuk ke llogari ende?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Studentet dhe profesoret mund te regjistrohen nese email-i i tyre
              ekziston tashme ne sistem.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-slate-100 p-8 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-md font-semibold uppercase tracking-[0.25em] text-slate-800 text-center  ">
                Login
              </p>
              
              <p className="mt-2 text-sm leading-6 text-slate-500 text-center">
                Identifikohu per te vazhduar ne sistem.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
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

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const adminItems = [
  { path: "/", label: "Dashboard" },
  { path: "/studentet", label: "Studentet" },
  { path: "/profesoret", label: "Profesoret" },
  { path: "/gjeneratat", label: "Gjeneratat" },
  { path: "/lendet", label: "Lendet" },
  { path: "/regjistrimet", label: "Regjistrimet" },
  { path: "/sherbimet", label: "Sherbimet" },
  { path: "/rindjekjet", label: "Rindjekje" },
  { path: "/bursat", label: "Bursat" },
  { path: "/praktikat", label: "Internships" },
  { path: "/erasmus", label: "Erasmus" },
  { path: "/provimet", label: "Provimet" },
  { path: "/notat", label: "Notat" },
  { path: "/oraret", label: "Oraret" },
  { path: "/drejtimet", label: "Drejtimet" },
  { path: "/fakultetet", label: "Fakultetet" },
  { path: "/departamentet", label: "Departamentet" },
  { path: "/njoftime", label: "Njoftime" },
  { path: "/raporte", label: "Raporte" },
  { path: "/ndihme", label: "Ndihme" },
  { path: "/llogaria", label: "Llogaria" },
];

const profesorItems = [
  { path: "/", label: "Dashboard" },
  { path: "/profesor/lendet", label: "Lendet e Mia" },
  { path: "/profesor/provimet", label: "Provimet e Mia" },
  { path: "/profesor/notat", label: "Vendos Nota" },
  { path: "/profesor/orari", label: "Orari Im" },
  { path: "/njoftime", label: "Njoftime" },
  { path: "/raporte", label: "Raporte" },
  { path: "/ndihme", label: "Ndihme" },
  { path: "/llogaria", label: "Llogaria" },
];

const studentItems = [
  { path: "/", label: "Dashboard" },
  { path: "/student/profili", label: "Profili Im" },
  { path: "/student/regjistrimet", label: "Regjistrimet" },
  { path: "/student/sherbimet", label: "Sherbimet" },
  { path: "/student/rindjekjet", label: "Rindjekje" },
  { path: "/student/bursat", label: "Bursat" },
  { path: "/student/praktikat", label: "Internships" },
  { path: "/student/erasmus", label: "Erasmus" },
  { path: "/student/notat", label: "Notat e Mia" },
  { path: "/student/provimet", label: "Provimet" },
  { path: "/student/orari", label: "Orari Im" },
  { path: "/njoftime", label: "Njoftime" },
  { path: "/raporte", label: "Raporte" },
  { path: "/ndihme", label: "Ndihme" },
  { path: "/llogaria", label: "Llogaria" },
];

const roleDescriptions = {
  admin: "Menaxhon databazen, pagesat, gjeneratat dhe aplikimet akademike.",
  profesor: "Sheh lendet, provimet, orarin dhe procesin e vleresimit.",
  student: "Menaxhon progresin, sherbimet, aplikimet dhe dokumentet personale.",
};

function Navbar({ isMobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const { user } = useAuth();

  const items =
    user?.roli === "admin"
      ? adminItems
      : user?.roli === "profesor"
        ? profesorItems
        : studentItems;

  const linkClass = (path) =>
    `group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      location.pathname === path
        ? "border-white bg-white text-slate-950 shadow-lg shadow-slate-950/18"
        : "border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <button
        type="button"
        aria-label="Mbyll navigimin"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm transition lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[18.5rem] px-3 py-3 transition-transform duration-300 lg:px-4 lg:py-6 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-800/70 bg-slate-900 shadow-[0_34px_90px_rgba(2,6,23,0.45)]">
          <div className="border-b border-white/10 px-5 pb-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-blue-400">
                  UMS Portal
                </p>
                <h1 className="mt-3 text-xl font-extrabold leading-tight text-white">
                  Sistemi i Menaxhimit te Universitetit
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-100">
                  Platforme e avancuar per administrate, studente dhe profesore.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 lg:hidden"
              >
                Mbyll
              </button>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="rounded-[24px] border border-blue-400 bg-blue-950 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-200">
                Roli aktiv
              </p>
              <p className="mt-3 text-base font-bold text-white">
                {user?.roli_label || "Perdorues"}
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                {roleDescriptions[user?.roli] || "Qasje e kufizuar sipas rolit."}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-5">
            <nav className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={linkClass(item.path)}
                >
                  <span>{item.label}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      location.pathname === item.path
                        ? "bg-teal-500"
                        : "bg-slate-700 group-hover:bg-slate-500"
                    }`}
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navbar;

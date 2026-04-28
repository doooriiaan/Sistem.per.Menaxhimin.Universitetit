import { Link, useLocation, useNavigate } from "react-router-dom";
import NavigationIcon from "./NavigationIcon";
import { useAuth } from "../hooks/useAuth";
import { getUtilityItems, isPathActive } from "../utils/navigation";

const titles = {
  "/": "Dashboard",
  "/njoftime": "Njoftime",
  "/raporte": "Analitika",
  "/ndihme": "Ndihme",
  "/studentet": "Studentet",
  "/profesoret": "Profesoret",
  "/gjeneratat": "Gjeneratat",
  "/lendet": "Lendet",
  "/drejtimet": "Drejtimet",
  "/fakultetet": "Fakultetet",
  "/departamentet": "Departamentet",
  "/regjistrimet": "Regjistrimet",
  "/sherbimet": "Sherbimet Studentore",
  "/rindjekjet": "Rindjekja e Lendeve",
  "/bursat": "Bursat",
  "/praktikat": "Internships",
  "/erasmus": "Programet Erasmus",
  "/provimet": "Provimet",
  "/notat": "Notat",
  "/oraret": "Oraret",
  "/profesor/lendet": "Lendet e Mia",
  "/profesor/provimet": "Provimet e Mia",
  "/profesor/notat": "Vendos Nota",
  "/profesor/orari": "Orari Im",
  "/student/profili": "Profili Im",
  "/student/notat": "Notat e Mia",
  "/student/regjistrimet": "Regjistrimet e Mia",
  "/student/sherbimet": "Sherbimet e Mia",
  "/student/rindjekjet": "Rindjekja e Lendeve",
  "/student/bursat": "Bursat",
  "/student/praktikat": "Internships",
  "/student/erasmus": "Erasmus",
  "/student/provimet": "Provimet e Mia",
  "/student/orari": "Orari Im",
  "/llogaria": "Llogaria",
};

function Topbar({ onMenuToggle = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const utilityItems = getUtilityItems();
  const pageTitle = titles[location.pathname] || "Dashboard";
  const initials =
    `${user?.emri?.[0] || ""}${user?.mbiemri?.[0] || ""}`.toUpperCase() ||
    "U";
  const fullName =
    [user?.emri, user?.mbiemri].filter(Boolean).join(" ") || "Perdorues";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/82 px-4 py-4 backdrop-blur-xl sm:px-5 lg:px-8 2xl:px-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
            aria-label="Hape navigimin"
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-slate-500">
              University Workspace
            </p>
            <h2 className="mt-2 truncate text-2xl font-extrabold text-slate-950">
              {pageTitle}
            </h2>
            <p className="text-sm text-slate-500">
              Sistem universitar me module akademike dhe administrative
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-1.5 rounded-[22px]  bg-white/90 p-1.5  gap-3">
            {utilityItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                title={item.label}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 ${
                  isPathActive(location.pathname, item.path)
                    ? "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <NavigationIcon icon={item.icon} className="h-5 w-5" />
              </Link>
            ))}
          </div>

          <Link
            to="/profili"
            className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white/92 px-3 py-2 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-slate-300 sm:flex"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-semibold text-white shadow-sm">
              {initials}
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">{fullName}</p>
              <p className="text-xs text-slate-500">
                {user?.roli_label || "Perdorues"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-slate-800"
          >
            Dil
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

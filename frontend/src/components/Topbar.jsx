import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const titles = {
  "/": "Dashboard",
  "/studentet": "Studentet",
  "/profesoret": "Profesoret",
  "/lendet": "Lendet",
  "/drejtimet": "Drejtimet",
  "/fakultetet": "Fakultetet",
  "/departamentet": "Departamentet",
  "/regjistrimet": "Regjistrimet",
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
  "/student/provimet": "Provimet e Mia",
  "/student/orari": "Orari Im",
  "/llogaria": "Llogaria",
};

function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const pageTitle = titles[location.pathname] || "Dashboard";
  const initials =
    `${user?.emri?.[0] || ""}${user?.mbiemri?.[0] || ""}`.toUpperCase() ||
    "U";
  const fullName =
    [user?.emri, user?.mbiemri].filter(Boolean).join(" ") || "User";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900 px-8">
      <div>
        <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>
        <p className="text-sm text-slate-400">University Management System</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-semibold text-slate-900">
            {initials}
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">{fullName}</p>
            <p className="text-xs text-slate-400">
              {user?.roli_label || "User"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

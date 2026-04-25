import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const adminItems = [
  { path: "/", label: "Dashboard" },
  { path: "/njoftime", label: "Njoftime" },
  { path: "/raporte", label: "Raporte" },
  { path: "/studentet", label: "Studentet" },
  { path: "/profesoret", label: "Profesoret" },
  { path: "/lendet", label: "Lendet" },
  { path: "/drejtimet", label: "Drejtimet" },
  { path: "/fakultetet", label: "Fakultetet" },
  { path: "/departamentet", label: "Departamentet" },
  { path: "/regjistrimet", label: "Regjistrimet" },
  { path: "/provimet", label: "Provimet" },
  { path: "/notat", label: "Notat" },
  { path: "/oraret", label: "Oraret" },
  { path: "/ndihme", label: "Ndihme" },
  { path: "/llogaria", label: "Llogaria" },
];

const profesorItems = [
  { path: "/", label: "Dashboard" },
  { path: "/njoftime", label: "Njoftime" },
  { path: "/raporte", label: "Raporte" },
  { path: "/profesor/lendet", label: "Lendet e Mia" },
  { path: "/profesor/provimet", label: "Provimet e Mia" },
  { path: "/profesor/notat", label: "Vendos Nota" },
  { path: "/profesor/orari", label: "Orari Im" },
  { path: "/ndihme", label: "Ndihme" },
  { path: "/llogaria", label: "Llogaria" },
];

const studentItems = [
  { path: "/", label: "Dashboard" },
  { path: "/njoftime", label: "Njoftime" },
  { path: "/raporte", label: "Raporte" },
  { path: "/student/profili", label: "Profili Im" },
  { path: "/student/notat", label: "Notat e Mia" },
  { path: "/student/regjistrimet", label: "Regjistrimet" },
  { path: "/student/provimet", label: "Provimet" },
  { path: "/student/orari", label: "Orari Im" },
  { path: "/ndihme", label: "Ndihme" },
  { path: "/llogaria", label: "Llogaria" },
];

const roleDescriptions = {
  admin: "Kontroll i plote i sistemit",
  profesor: "Lendet, provimet dhe notimi personal",
  student: "Qasje ne rezultatet dhe progresin personal",
};

function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const items =
    user?.roli === "admin"
      ? adminItems
      : user?.roli === "profesor"
        ? profesorItems
        : studentItems;

  const linkClass = (path) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 overflow-y-auto bg-slate-900 px-4 py-6">
      <h1 className="mb-8 text-xl font-bold text-white">
        University Management System
      </h1>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Role
        </p>
        <p className="mt-2 text-sm font-semibold text-white">
          {user?.roli_label || "User"}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {roleDescriptions[user?.roli] || "Qasje e kufizuar sipas rolit."}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <Link key={item.path} to={item.path} className={linkClass(item.path)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Navbar;

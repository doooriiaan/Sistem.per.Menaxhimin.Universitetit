import { useLocation } from "react-router-dom";

function Topbar() {
  const location = useLocation();

  const titles = {
    "/": "Dashboard",
    "/studentet": "Studentët",
    "/profesoret": "Profesorët",
    "/lendet": "Lëndët",
  };

  const pageTitle = titles[location.pathname] || "Dashboard";

  return (
    <header className="sticky top-0 h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>
        <p className="text-sm text-slate-400">
          University Management System
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="w-72 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-slate-500"
        />

        {/* Profile */}
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
          <div className="w-9 h-9 rounded-lg bg-white text-slate-900 flex items-center justify-center font-semibold">
            D
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Dorian</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
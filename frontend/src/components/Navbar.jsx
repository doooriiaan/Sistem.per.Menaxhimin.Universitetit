import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col px-4 py-5 ">
      <div className="px-3 pb-6 border-b border-slate-800   ">
        <h1 className="text-2xl font-bold tracking-tight text-white ">
          University Management System
        </h1>
      </div>

      <nav className="mt-6 flex flex-col gap-2">
        <Link to="/" className={linkClass("/")}>
          <span className="text-lg">◻</span>
          <span>Dashboard</span>
        </Link>

        <Link to="/studentet" className={linkClass("/studentet")}>
          <span className="text-lg">◻</span>
          <span>Studentët</span>
        </Link>

        <Link to="/profesoret" className={linkClass("/profesoret")}>
          <span className="text-lg">◻</span>
          <span>Profesorët</span>
        </Link>

        <Link to="/lendet" className={linkClass("/lendet")}>
          <span className="text-lg">◻</span>
          <span>Lëndët</span>
        </Link>
      </nav>
    </aside>
  );
}

export default Navbar;
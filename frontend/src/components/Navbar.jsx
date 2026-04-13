import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">
          Sistemi i Universitetit
        </h1>

        <div className="flex gap-3">
          <Link to="/" className={linkClass("/")}>
            Dashboard
          </Link>
          <Link to="/studentet" className={linkClass("/studentet")}>
            Studentet
          </Link>
          <Link to="/profesoret" className={linkClass("/profesoret")}>
            Profesoret
          </Link>
          <Link to="/lendet" className={linkClass("/lendet")}>
            Lendet
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 px-4 py-6">
      <h1 className="text-white text-xl font-bold mb-8">
        University Management System
      </h1>

      <nav className="flex flex-col gap-2">
        <Link to="/" className={linkClass("/")}>
          Dashboard
        </Link>

        <Link to="/studentet" className={linkClass("/studentet")}>
          Studentët
        </Link>

        <Link to="/profesoret" className={linkClass("/profesoret")}>
          Profesorët
        </Link>

        <Link to="/lendet" className={linkClass("/lendet")}>
          Lëndët
        </Link>

        <Link to="/drejtimet" className={linkClass("/drejtimet")}>
          Drejtimet
        </Link>

        <Link to="/fakultetet" className={linkClass("/fakultetet")}>
          Fakultetet
        </Link>
        <Link to="/departamentet" className={linkClass("/departamentet")}>
          Departamentet
        </Link>
        <Link to="/regjistrimet" className={linkClass("/regjistrimet")}>
          Regjistrimet
        </Link>

        <Link to="/provimet" className={linkClass("/provimet")}>
          Provimet
        </Link>

        <Link to="/notat" className={linkClass("/notat")}>
          Notat
        </Link>

        <Link to="/oraret" className={linkClass("/oraret")}>
          Oraret
        </Link>
      </nav>
    </aside>
  );
}

export default Navbar;
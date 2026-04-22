import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Topbar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/studentsPage";
import ProfesoretPage from "./pages/profesoretPage";
import LendetPage from "./pages/lendetPage";
import DrejtimetPage from "./pages/drejtimetPage";
import FakultetetPage from "./pages/FakultetetPage";
import DepartamentetPage from "./pages/departamentetPage";
import RegjistrimetPage from "./pages/regjistrimetPage";
import ProvimetPage from "./pages/provimetPage";
import NotatPage from "./pages/notatPage";
import OraretPage from "./pages/oraretPage";

function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex-1 ml-64">
        <Topbar />

        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/studentet" element={<StudentsPage />} />
            <Route path="/profesoret" element={<ProfesoretPage />} />
            <Route path="/lendet" element={<LendetPage />} />
            <Route path="/drejtimet" element={<DrejtimetPage />} />
            <Route path="/fakultetet" element={<FakultetetPage />} />
            <Route path="/departamentet" element={<DepartamentetPage />} />
            <Route path="/regjistrimet" element={<RegjistrimetPage />} />
            <Route path="/provimet" element={<ProvimetPage />} />
            <Route path="/notat" element={<NotatPage />} />
            <Route path="/oraret" element={<OraretPage />} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Topbar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/studentsPage";
import ProfesoretPage from "./pages/profesoretPage";
import LendetPage from "./pages/lendetPage";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
  <Navbar />

  <div className="flex-1 flex flex-col">
    <Topbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/studentet" element={<StudentsPage />} />
            <Route path="/profesoret" element={<ProfesoretPage />} />
            <Route path="/lendet" element={<LendetPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
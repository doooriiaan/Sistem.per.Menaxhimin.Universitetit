import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import { useAuth } from "./hooks/useAuth";
import AccountPage from "./pages/AccountPage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
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
import ProfessorCoursesPage from "./pages/ProfessorCoursesPage";
import ProfessorExamsPage from "./pages/ProfessorExamsPage";
import ProfessorGradesPage from "./pages/ProfessorGradesPage";
import ProfessorSchedulePage from "./pages/ProfessorSchedulePage";
import StudentEnrollmentsPage from "./pages/StudentEnrollmentsPage";
import StudentExamsPage from "./pages/StudentExamsPage";
import StudentGradesPage from "./pages/StudentGradesPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentSchedulePage from "./pages/StudentSchedulePage";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Navbar />

      <div className="ml-64 flex-1">
        <Topbar />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/llogaria" element={<AccountPage />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
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
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["profesor"]} />}>
            <Route path="/profesor/lendet" element={<ProfessorCoursesPage />} />
            <Route path="/profesor/provimet" element={<ProfessorExamsPage />} />
            <Route path="/profesor/notat" element={<ProfessorGradesPage />} />
            <Route path="/profesor/orari" element={<ProfessorSchedulePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student/profili" element={<StudentProfilePage />} />
            <Route path="/student/notat" element={<StudentGradesPage />} />
            <Route
              path="/student/regjistrimet"
              element={<StudentEnrollmentsPage />}
            />
            <Route path="/student/provimet" element={<StudentExamsPage />} />
            <Route path="/student/orari" element={<StudentSchedulePage />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;

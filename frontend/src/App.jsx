import { Suspense, lazy, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import BackendStatusBanner from "./components/BackendStatusBanner";
import FloatingBackButton from "./components/FloatingBackButton";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Topbar from "./components/Topbar";
import { useAuth } from "./hooks/useAuth";
import { useBackendStatus } from "./hooks/useBackendStatus";

const AccountPage = lazy(() => import("./pages/AccountPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const StudentsPage = lazy(() => import("./pages/studentsPage"));
const ProfesoretPage = lazy(() => import("./pages/profesoretPage"));
const LendetPage = lazy(() => import("./pages/lendetPage"));
const DrejtimetPage = lazy(() => import("./pages/drejtimetPage"));
const FakultetetPage = lazy(() => import("./pages/FakultetetPage"));
const DepartamentetPage = lazy(() => import("./pages/departamentetPage"));
const GenerationsPage = lazy(() => import("./pages/GenerationsPage"));
const RegjistrimetPage = lazy(() => import("./pages/regjistrimetPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const RepeatCoursesPage = lazy(() => import("./pages/RepeatCoursesPage"));
const ScholarshipsPage = lazy(() => import("./pages/ScholarshipsPage"));
const InternshipsPage = lazy(() => import("./pages/InternshipsPage"));
const ErasmusPage = lazy(() => import("./pages/ErasmusPage"));
const ProvimetPage = lazy(() => import("./pages/provimetPage"));
const NotatPage = lazy(() => import("./pages/notatPage"));
const OraretPage = lazy(() => import("./pages/oraretPage"));
const ProfessorCoursesPage = lazy(() => import("./pages/ProfessorCoursesPage"));
const ProfessorExamsPage = lazy(() => import("./pages/ProfessorExamsPage"));
const ProfessorGradesPage = lazy(() => import("./pages/ProfessorGradesPage"));
const ProfessorSchedulePage = lazy(() => import("./pages/ProfessorSchedulePage"));
const StudentEnrollmentsPage = lazy(() =>
  import("./pages/StudentEnrollmentsPage")
);
const StudentExamsPage = lazy(() => import("./pages/StudentExamsPage"));
const StudentGradesPage = lazy(() => import("./pages/StudentGradesPage"));
const StudentProfilePage = lazy(() => import("./pages/StudentProfilePage"));
const StudentSchedulePage = lazy(() => import("./pages/StudentSchedulePage"));
const StudentServicesPage = lazy(() => import("./pages/StudentServicesPage"));
const StudentRepeatCoursesPage = lazy(() =>
  import("./pages/StudentRepeatCoursesPage")
);
const StudentScholarshipsPage = lazy(() =>
  import("./pages/StudentScholarshipsPage")
);
const StudentInternshipsPage = lazy(() =>
  import("./pages/StudentInternshipsPage")
);
const StudentErasmusPage = lazy(() => import("./pages/StudentErasmusPage"));

function PageLoader({ fullscreen = false, label = "Duke ngarkuar faqen..." }) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullscreen ? "min-h-screen px-6 py-10" : "min-h-[40vh]"
      }`}
    >
      <div className="glass-panel rounded-[28px] px-6 py-5 text-sm font-semibold text-slate-600">
        {label}
      </div>
    </div>
  );
}

function AppLayout() {
  const backendStatus = useBackendStatus();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen">
      <div aria-hidden="true" className="app-backdrop">
        <span className="app-sidewash" />
        <span className="app-orb app-orb-primary" />
        <span className="app-orb app-orb-secondary" />
        <span className="app-orb app-orb-tertiary" />
        <span className="app-grid" />
      </div>

      <Navbar
        isMobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      <FloatingBackButton />

      <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:ml-[18.5rem] lg:px-6 lg:py-6">
        <div className="app-chrome min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[28px] sm:min-h-[calc(100vh-2rem)] sm:rounded-[30px] lg:min-h-[calc(100vh-3rem)] lg:rounded-[34px]">
          <Topbar
            onMenuToggle={() => setIsMobileNavOpen((current) => !current)}
          />

          <main className="page-stage p-4 sm:p-5 lg:p-8">
            {backendStatus === "offline" && <BackendStatusBanner />}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
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
            <Route path="/njoftime" element={<NotificationsPage />} />
            <Route path="/raporte" element={<ReportsPage />} />
            <Route path="/ndihme" element={<HelpCenterPage />} />
            <Route path="/llogaria" element={<AccountPage />} />

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/studentet" element={<StudentsPage />} />
              <Route path="/profesoret" element={<ProfesoretPage />} />
              <Route path="/gjeneratat" element={<GenerationsPage />} />
              <Route path="/lendet" element={<LendetPage />} />
              <Route path="/drejtimet" element={<DrejtimetPage />} />
              <Route path="/fakultetet" element={<FakultetetPage />} />
              <Route path="/departamentet" element={<DepartamentetPage />} />
              <Route path="/regjistrimet" element={<RegjistrimetPage />} />
              <Route path="/sherbimet" element={<ServicesPage />} />
              <Route path="/rindjekjet" element={<RepeatCoursesPage />} />
              <Route path="/bursat" element={<ScholarshipsPage />} />
              <Route path="/praktikat" element={<InternshipsPage />} />
              <Route path="/erasmus" element={<ErasmusPage />} />
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
              <Route path="/student/sherbimet" element={<StudentServicesPage />} />
              <Route
                path="/student/rindjekjet"
                element={<StudentRepeatCoursesPage />}
              />
              <Route
                path="/student/bursat"
                element={<StudentScholarshipsPage />}
              />
              <Route
                path="/student/praktikat"
                element={<StudentInternshipsPage />}
              />
              <Route
                path="/student/erasmus"
                element={<StudentErasmusPage />}
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
    </Suspense>
  );
}

export default App;

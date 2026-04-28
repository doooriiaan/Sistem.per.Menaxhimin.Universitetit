import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import API from "../services/api";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

function ProfessorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profesor/lendet");
      const nextCourses = response.data || [];
      setCourses(nextCourses);
      setError("");

      if (nextCourses.length > 0) {
        setSelectedCourse((prev) => prev || nextCourses[0]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se lendeve."));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      setStudentsLoading(true);
      const response = await API.get(`/profesor/lendet/${courseId}/studentet`);
      setSelectedCourse(response.data.course);
      setStudents(response.data.students || []);
      setError("");
    } catch (err) {
      setStudents([]);
      setError(
        getApiErrorMessage(err, "Gabim gjate marrjes se studenteve te lendes.")
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse?.lende_id) {
      fetchStudents(selectedCourse.lende_id);
    }
  }, [selectedCourse?.lende_id]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Lendet aktive",
        value: courses.length,
        icon: "book",
        tone: "accent",
      },
      {
        label: "Studentet ne lenden e zgjedhur",
        value: students.length,
        icon: "users",
      },
      {
        label: "Kreditet e lendes",
        value: selectedCourse?.kreditet || 0,
        icon: "graduation",
        tone: "dark",
      },
    ],
    [courses.length, selectedCourse?.kreditet, students.length]
  );

  if (loading) {
    return <SkeletonRows count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Professor Courses"
        title="Lendet dhe studentet"
        description="Nga kjo faqe kalon nga lenda te lista e studenteve, pastaj direkt te provimet dhe moduli i notave."
        actions={
          <>
            <Link
              to="/profesor/provimet"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Menaxho provimet
            </Link>
            <Link
              to={`/profesor/notat${selectedCourse?.lende_id ? `?course=${selectedCourse.lende_id}` : ""}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Shko te notat
            </Link>
          </>
        }
      />

      <SectionNav items={getRoleConnections("profesor")} />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            tone={card.tone}
            value={card.value}
          />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Lendet e mia</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Zgjidh nje lende dhe vazhdo drejt studenteve, provimeve ose notimit.
            </p>
          </div>

          {courses.length ? (
            <div className="space-y-3">
              {courses.map((course) => (
                <button
                  key={course.lende_id}
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full rounded-[26px] border p-4 text-left transition ${
                    selectedCourse?.lende_id === course.lende_id
                      ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                      : "border-slate-200 bg-slate-50/70 text-slate-950 hover:-translate-y-0.5 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{course.emri}</p>
                      <p
                        className={`mt-1 text-sm ${
                          selectedCourse?.lende_id === course.lende_id
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {course.kodi} | Semestri {course.semestri}
                      </p>
                    </div>
                    <StatusBadge
                      tone={selectedCourse?.lende_id === course.lende_id ? "neutral" : "info"}
                      className={
                        selectedCourse?.lende_id === course.lende_id
                          ? "border-white/10 bg-white/10 text-white"
                          : ""
                      }
                    >
                      {course.kreditet} kredi
                    </StatusBadge>
                  </div>
                  <div
                    className={`mt-4 flex flex-wrap gap-2 text-xs ${
                      selectedCourse?.lende_id === course.lende_id
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    <span>{course.total_studentesh} studente</span>
                    <span>{course.total_provimeve} provime</span>
                    <span>{course.lloji}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nuk ka lende te caktuara"
              description="Kur lendet e tua te lidhen me profilin, lista do te shfaqet ketu."
            />
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Studentet e lendes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {selectedCourse
                  ? `${selectedCourse.emri} (${selectedCourse.kodi})`
                  : "Zgjidh nje lende nga lista."}
              </p>
            </div>

            {selectedCourse ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/profesor/provimet?course=${selectedCourse.lende_id}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                >
                  Provimet e lendes
                </Link>
                <Link
                  to={`/profesor/notat?course=${selectedCourse.lende_id}`}
                  className="rounded-2xl border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Vazhdo te notat
                </Link>
              </div>
            ) : null}
          </div>

          {studentsLoading ? (
            <SkeletonRows count={3} />
          ) : students.length ? (
            <div className="overflow-x-auto">
              <table className="data-table min-w-full">
                <thead>
                  <tr>
                    <th>Studenti</th>
                    <th>Email</th>
                    <th>Viti</th>
                    <th>Semestri</th>
                    <th>Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.regjistrimi_id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.emri} {student.mbiemri}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Student ID: {student.student_id}
                          </p>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.viti_studimit}</td>
                      <td>{student.semestri}</td>
                      <td>
                        <StatusBadge>{student.statusi_regjistrimit}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Nuk ka studente te regjistruar"
              description="Kur studentet te regjistrohen ne kete lende, ata do te shfaqen ketu bashke me lidhjen drejt notimit."
            />
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}

export default ProfessorCoursesPage;

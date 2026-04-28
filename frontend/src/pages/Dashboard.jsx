import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import API from "../services/api";
import { formatDateLabel, formatTimeLabel } from "../utils/display";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await API.get("/auth/dashboard");

        if (active) {
          setDashboard(response.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, "Gabim gjate marrjes se dashboard-it."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  const roleConnections = getRoleConnections(user?.roli);

  const studentHighlights = useMemo(
    () => [
      {
        label: "Mesatarja",
        value:
          dashboard?.summary?.mesatarja === null ||
          dashboard?.summary?.mesatarja === undefined
            ? "-"
            : Number(dashboard.summary.mesatarja).toFixed(2),
        icon: "graduation",
        tone: "accent",
      },
      {
        label: "Regjistrimet aktive",
        value: dashboard?.enrollments?.length || 0,
        icon: "book",
      },
      {
        label: "Provimet e lidhura",
        value: dashboard?.exams?.length || 0,
        icon: "calendar",
      },
      {
        label: "Kerkesa sherbimesh",
        value: dashboard?.summary?.total_kerkesave_sherbimeve || 0,
        icon: "file",
        tone: "dark",
      },
    ],
    [dashboard]
  );

  const professorHighlights = useMemo(
    () => [
      {
        label: "Lendet e mia",
        value: dashboard?.courses?.length || 0,
        icon: "book",
        tone: "accent",
      },
      {
        label: "Provimet",
        value: dashboard?.exams?.length || 0,
        icon: "calendar",
      },
      {
        label: "Seanca ne orar",
        value: dashboard?.schedule?.length || 0,
        icon: "clock",
      },
    ],
    [dashboard]
  );

  const adminHighlights = useMemo(
    () => [
      {
        label: "Studentet",
        value: dashboard?.counts?.students || 0,
        icon: "users",
        tone: "accent",
      },
      {
        label: "Profesoret",
        value: dashboard?.counts?.profesoret || 0,
        icon: "user",
      },
      {
        label: "Lendet",
        value: dashboard?.counts?.lendet || 0,
        icon: "book",
      },
      {
        label: "Regjistrimet",
        value: dashboard?.counts?.regjistrimet || 0,
        icon: "graduation",
      },
      {
        label: "Provimet",
        value: dashboard?.counts?.provimet || 0,
        icon: "calendar",
        tone: "dark",
      },
      {
        label: "Sherbimet",
        value: dashboard?.counts?.kerkesat_sherbimeve || 0,
        icon: "file",
      },
    ],
    [dashboard]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="University Control"
        title={
          user?.roli === "admin"
            ? "Qendra e menaxhimit universitar"
            : user?.roli === "profesor"
              ? `Mire se erdhe, ${dashboard?.profile?.emri || user?.emri || "Profesor"}`
              : `Mire se erdhe, ${dashboard?.profile?.emri || user?.emri || "Student"}`
        }
        description={
          user?.roli === "admin"
            ? "Pamja kryesore per kontrollin e sistemit, me akses te shpejte drejt moduleve, analitikes dhe proceseve akademike."
            : user?.roli === "profesor"
              ? "Menaxho lendet, studentet dhe vleresimet nga nje panel i vetem pune."
              : "Ketu i ke te lidhura profili, regjistrimet, notat, provimet dhe dokumentet personale."
        }
        actions={
          user?.roli === "admin" ? (
            <Link
              to="/raporte"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Hap analitiken
            </Link>
          ) : null
        }
      />

      <SectionNav items={roleConnections} />

      {loading ? (
        <SkeletonRows count={4} />
      ) : error ? (
        <InlineAlert>{error}</InlineAlert>
      ) : user?.roli === "admin" ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {adminHighlights.map((card) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                tone={card.tone}
                value={card.value}
              />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {[
              {
                path: "/studentet",
                title: "Student pipeline",
                body: "Kalo nga lista e studenteve ne profile, dokumente dhe historik akademik.",
              },
              {
                path: "/regjistrimet",
                title: "Registration control",
                body: "Monitoro semestrat, statuset dhe ngarkesen e lendeve ne kohe reale.",
              },
              {
                path: "/sherbimet",
                title: "Service desk",
                body: "Menaxho pagesat, dokumentet dhe kerkesat administrative nga i njejti vend.",
              },
            ].map((card) => (
              <Link
                key={card.path}
                to={card.path}
                className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_38px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(15,23,42,0.09)]"
              >
                <p className="text-lg font-bold text-slate-950">{card.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{card.body}</p>
              </Link>
            ))}
          </section>
        </>
      ) : user?.roli === "profesor" ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {professorHighlights.map((card) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                tone={card.tone}
                value={card.value}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SurfaceCard>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Lendet e mia</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Hyrje direkte nga lenda te studentet dhe te moduli i notimit.
                  </p>
                </div>
                <Link to="/profesor/lendet" className="text-sm font-semibold text-teal-700">
                  Menaxho
                </Link>
              </div>
              {dashboard?.courses?.length ? (
                <div className="space-y-3">
                  {dashboard.courses.slice(0, 4).map((course) => (
                    <div
                      key={course.lende_id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{course.emri}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {course.kodi} | Semestri {course.semestri}
                          </p>
                        </div>
                        <StatusBadge tone="info">{course.kreditet} kredi</StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka lende te lidhura"
                  description="Kur profili lidhet me lende aktive, ato do te shfaqen ketu."
                />
              )}
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Provimet e aferta</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Provimet me te fundit te caktuara ne kalendarin tend.
                  </p>
                </div>
                <Link to="/profesor/provimet" className="text-sm font-semibold text-teal-700">
                  Shiko te gjitha
                </Link>
              </div>
              {dashboard?.exams?.length ? (
                <div className="space-y-3">
                  {dashboard.exams.slice(0, 4).map((exam) => (
                    <div
                      key={exam.provimi_id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <p className="font-semibold text-slate-900">{exam.lenda}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateLabel(exam.data_provimit)} | {formatTimeLabel(exam.ora)} |{" "}
                        {exam.salla}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka provime te planifikuara"
                  description="Sapo te shtohen provime per lendet e tua, ato do te shfaqen ne kete seksion."
                />
              )}
            </SurfaceCard>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {studentHighlights.map((card) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                tone={card.tone}
                value={card.value}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SurfaceCard>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Notat e fundit</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Nga kjo liste mund te kalosh direkt te moduli i notave ose profili yt.
                  </p>
                </div>
                <Link to="/student/notat" className="text-sm font-semibold text-teal-700">
                  Hap notat
                </Link>
              </div>
              {dashboard?.grades?.length ? (
                <div className="space-y-3">
                  {dashboard.grades.slice(0, 4).map((grade) => (
                    <div
                      key={grade.nota_id}
                      className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{grade.lenda}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {grade.profesori || "-"} | {formatDateLabel(grade.data_vendosjes)}
                        </p>
                      </div>
                      <StatusBadge tone="dark">{grade.nota}</StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka nota te regjistruara"
                  description="Kur te publikohen nota te reja, ato do te shfaqen ketu."
                />
              )}
            </SurfaceCard>

            <SurfaceCard>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Regjistrimet e mia</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Lidhje direkte nga lenda drejt dokumenteve dhe progresit.
                  </p>
                </div>
                <Link
                  to="/student/regjistrimet"
                  className="text-sm font-semibold text-teal-700"
                >
                  Hap regjistrimet
                </Link>
              </div>
              {dashboard?.enrollments?.length ? (
                <div className="space-y-3">
                  {dashboard.enrollments.slice(0, 4).map((enrollment) => (
                    <div
                      key={enrollment.regjistrimi_id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{enrollment.lenda}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {enrollment.kodi} | {enrollment.viti_akademik}
                          </p>
                        </div>
                        <StatusBadge>{enrollment.statusi}</StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka regjistrime aktive"
                  description="Pasi te lidhen regjistrime me profilin tend, ato do te shfaqen ketu."
                />
              )}
            </SurfaceCard>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import {
  BarChartCard,
  DonutChartCard,
  WorkloadChartCard,
} from "../components/ui/Charts";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const endpoint =
          user?.roli === "admin" ? "/analytics/overview" : "/auth/dashboard";
        const response = await API.get(endpoint);

        if (active) {
          setReportData(response.data || null);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, "Gabim gjate marrjes se analitikes.")
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user?.roli]);

  const studentChartData = useMemo(() => {
    if (!reportData?.grades?.length) {
      return [];
    }

    return reportData.grades.slice(0, 6).map((grade) => ({
      label: grade.lenda,
      value: Number(grade.nota) || 0,
    }));
  }, [reportData?.grades]);

  const studentStatusDistribution = useMemo(() => {
    if (!reportData?.enrollments?.length) {
      return [];
    }

    return Object.entries(
      reportData.enrollments.reduce((accumulator, enrollment) => {
        const key = enrollment.statusi || "Pa status";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([label, value]) => ({ label, value }));
  }, [reportData?.enrollments]);

  const professorCourseLoad = useMemo(() => {
    if (!reportData?.courses?.length) {
      return [];
    }

    return reportData.courses.slice(0, 6).map((course) => ({
      label: course.emri,
      value: Number(course.kreditet) || 0,
    }));
  }, [reportData?.courses]);

  const professorExamTerms = useMemo(() => {
    if (!reportData?.exams?.length) {
      return [];
    }

    return Object.entries(
      reportData.exams.reduce((accumulator, exam) => {
        const key = exam.afati || "Pa afat";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {})
    ).map(([label, value]) => ({ label, value }));
  }, [reportData?.exams]);

  const adminSummaryCards = reportData?.summary
    ? [
        {
          label: "Studentet totale",
          value: reportData.summary.total_students || 0,
          icon: "users",
          tone: "accent",
        },
        {
          label: "Profesoret",
          value: reportData.summary.total_professors || 0,
          icon: "user",
        },
        {
          label: "Lendet",
          value: reportData.summary.total_courses || 0,
          icon: "book",
        },
        {
          label: "Regjistrimet",
          value: reportData.summary.total_registrations || 0,
          icon: "graduation",
          tone: "dark",
        },
        {
          label: "Provimet",
          value: reportData.summary.total_exams || 0,
          icon: "calendar",
        },
        {
          label: "Kerkesa ne pritje",
          value: reportData.summary.pending_service_requests || 0,
          icon: "file",
        },
      ]
    : [];

  const roleConnections = getRoleConnections(user?.roli);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics Workspace"
        title={
          user?.roli === "admin"
            ? "Analitika e universitetit"
            : user?.roli === "profesor"
              ? "Analitika e mesimdhenies"
              : "Analitika personale"
        }
        description={
          user?.roli === "admin"
            ? "Panel i unifikuar per fakultetet, regjistrimet, shpendarjen e notave dhe ngarkesen e profesoreve."
            : user?.roli === "profesor"
              ? "Pamje e shpejte mbi lendet, provimet dhe intensitetin e punes akademike."
              : "Pamje e qarte mbi rezultatet, regjistrimet dhe progresin tend akademik."
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
            {adminSummaryCards.map((card) => (
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
            <BarChartCard
              title="Studentet sipas fakultetit"
              description="Tregon shperndarjen aktuale te studenteve neper njesi akademike."
              data={(reportData?.studentsByFaculty || []).map((item) => ({
                label: item.faculty,
                value: item.total,
              }))}
            />
            <BarChartCard
              title="Regjistrimet sipas semestrit"
              description="Ngarkesa e regjistrimeve neper vite akademike dhe semestra."
              color="#0ea5e9"
              data={(reportData?.registrationsBySemester || []).map((item) => ({
                label: `${item.academic_year} • ${item.semestri}`,
                value: item.total,
              }))}
            />
            <DonutChartCard
              title="Shperndarja e notave"
              description="Numri i notave te regjistruara per cdo vlere."
              data={(reportData?.gradeDistribution || []).map((item) => ({
                label: `Nota ${item.grade}`,
                value: item.total,
              }))}
            />
            <WorkloadChartCard
              title="Ngarkesa e profesoreve"
              description="Lendet, studentet dhe slot-et ne orar per profesoret me aktivitetin me te larte."
              data={reportData?.professorWorkload || []}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            {[
              {
                path: "/studentet",
                title: "Student Management",
                body: "Hap listat, profilin dhe dokumentet e studenteve.",
              },
              {
                path: "/regjistrimet",
                title: "Registrations",
                body: "Verifiko semestrat, ngarkesen dhe statuset akademike.",
              },
              {
                path: "/lendet",
                title: "Courses",
                body: "Menaxho kurrikulen, kreditete dhe profesoret pergjegjes.",
              },
              {
                path: "/sherbimet",
                title: "Services",
                body: "Kontrollo kerkesa, pagesa dhe dokumentet shoqeruese.",
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
            <StatCard
              icon="book"
              label="Lendet aktive"
              value={reportData?.courses?.length || 0}
              tone="accent"
            />
            <StatCard
              icon="calendar"
              label="Provimet"
              value={reportData?.exams?.length || 0}
            />
            <StatCard
              icon="clock"
              label="Seancat ne orar"
              value={reportData?.schedule?.length || 0}
              tone="dark"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {professorCourseLoad.length ? (
              <BarChartCard
                title="Ngarkesa sipas lendeve"
                description="Kreditet e lendeve qe ke nen pergjegjesi."
                data={professorCourseLoad}
                color="#0f172a"
              />
            ) : (
              <SurfaceCard>
                <EmptyState
                  title="Nuk ka ngarkese te regjistruar"
                  description="Kur te lidhen lendet me profilin tend, ketu do te shfaqet ndarja sipas krediteve."
                />
              </SurfaceCard>
            )}

            {professorExamTerms.length ? (
              <DonutChartCard
                title="Provimet sipas afatit"
                description="Shperndarja e provimeve neper afate zyrtare."
                data={professorExamTerms}
              />
            ) : (
              <SurfaceCard>
                <EmptyState
                  title="Nuk ka provime per analize"
                  description="Krijo ose lidhi provimet e tua per te pare shpendarjen sipas afateve."
                />
              </SurfaceCard>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard
              icon="graduation"
              label="Notat e fundit"
              value={reportData?.grades?.length || 0}
              tone="accent"
            />
            <StatCard
              icon="book"
              label="Regjistrimet"
              value={reportData?.enrollments?.length || 0}
            />
            <StatCard
              icon="calendar"
              label="Provimet"
              value={reportData?.exams?.length || 0}
            />
            <StatCard
              icon="file"
              label="Kerkesa sherbimesh"
              value={reportData?.summary?.total_kerkesave_sherbimeve || 0}
              tone="dark"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {studentChartData.length ? (
              <BarChartCard
                title="Nota sipas lendes"
                description="Pamje e shpejte e rezultateve te fundit sipas lendes."
                data={studentChartData}
                color="#f97316"
              />
            ) : (
              <SurfaceCard>
                <EmptyState
                  title="Nuk ka nota per analize"
                  description="Kur te regjistrohen nota te reja, grafiku do te shfaqe trendin sipas lendeve."
                />
              </SurfaceCard>
            )}

            {studentStatusDistribution.length ? (
              <DonutChartCard
                title="Regjistrimet sipas statusit"
                description="Shperndarja e regjistrimeve aktive, ne pritje ose te perfunduara."
                data={studentStatusDistribution}
              />
            ) : (
              <SurfaceCard>
                <EmptyState
                  title="Nuk ka regjistrime per analize"
                  description="Regjistrimet e tua do te shfaqen ketu sapo te lidhen me profilin."
                />
              </SurfaceCard>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ReportsPage;

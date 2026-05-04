import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavigationIcon from "../components/NavigationIcon";
import { useAuth } from "../hooks/useAuth";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import API from "../services/api";
import {
  formatAverageLabel,
  formatDateLabel,
  formatTimeLabel,
} from "../utils/display";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

const DAY_LABELS = [
  "E diel",
  "E hene",
  "E marte",
  "E merkure",
  "E enjte",
  "E premte",
  "E shtune",
];

const panelLinkClass = "text-sm font-semibold text-teal-700";

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const parsed = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseDateTime = (dateValue, timeValue = "00:00") => {
  const date = normalizeDate(dateValue);

  if (!date) {
    return null;
  }

  const [hours = 0, minutes = 0] = String(timeValue || "00:00")
    .split(":")
    .map((part) => Number(part));

  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const getDaysUntil = (dateValue) => {
  const target = normalizeDate(dateValue);

  if (!target) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const getDueLabel = (dateValue) => {
  const days = getDaysUntil(dateValue);

  if (days === null) {
    return "-";
  }

  if (days < 0) {
    return "Ka kaluar";
  }

  if (days === 0) {
    return "Sot";
  }

  if (days === 1) {
    return "Neser";
  }

  return `Pas ${days} ditesh`;
};

const getDueTone = (dateValue) => {
  const days = getDaysUntil(dateValue);

  if (days === null) {
    return "neutral";
  }

  if (days < 0) {
    return "danger";
  }

  if (days <= 3) {
    return "warning";
  }

  return "info";
};

const getUpcomingItems = (items = []) => {
  const now = new Date();

  return items
    .map((item) => ({
      ...item,
      startsAt: parseDateTime(item.data_provimit || item.due_date, item.ora),
    }))
    .filter((item) => item.startsAt && item.startsAt >= now)
    .sort((first, second) => first.startsAt - second.startsAt);
};

const getTodaySchedule = (schedule = []) => {
  const todayLabel = DAY_LABELS[new Date().getDay()];

  return schedule
    .filter((item) => item.dita === todayLabel)
    .sort((first, second) =>
      String(first.ora_fillimit || "").localeCompare(String(second.ora_fillimit || ""))
    );
};

const getProgressPercent = (value, total) => {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;

  if (numericTotal <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((numericValue / numericTotal) * 100));
};

const getPositiveCount = (value) => Number(value) || 0;

const getExamPath = (role) => {
  if (role === "profesor") {
    return "/profesor/provimet";
  }

  if (role === "student") {
    return "/student/provimet";
  }

  return "/provimet";
};

const getSchedulePath = (role) => {
  if (role === "profesor") {
    return "/profesor/orari";
  }

  if (role === "student") {
    return "/student/orari";
  }

  return "/oraret";
};

const getDeadlinePath = (type, role) => {
  const normalized = String(type || "").toLowerCase();

  if (normalized.includes("praktike")) {
    return role === "student" ? "/student/praktikat" : "/praktikat";
  }

  if (normalized.includes("erasmus")) {
    return role === "student" ? "/student/erasmus" : "/erasmus";
  }

  return role === "student" ? "/student/bursat" : "/bursat";
};

const getApplicationPath = (type) => getDeadlinePath(type, "student");

const getActivityPath = (type) =>
  String(type || "").toLowerCase().includes("dokument") ? "/studentet" : "/sherbimet";

function DashboardPanel({ action, children, description, title }) {
  return (
    <SurfaceCard className="h-full">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </SurfaceCard>
  );
}

function DashboardListItem({
  badge,
  badgeTone,
  icon = "grid",
  meta,
  title,
  to,
}) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800">
        <NavigationIcon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-950">{title || "-"}</p>
        {meta ? <p className="mt-1 text-sm leading-5 text-slate-500">{meta}</p> : null}
      </div>
      {badge ? (
        <StatusBadge tone={badgeTone} className="shrink-0">
          {badge}
        </StatusBadge>
      ) : null}
      {to ? <NavigationIcon icon="arrow" className="h-4 w-4 shrink-0 text-slate-400" /> : null}
    </>
  );

  const className =
    "flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 transition hover:border-slate-300";

  if (to) {
    return (
      <Link to={to} className={`${className} hover:-translate-y-0.5`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function ProgressBlock({ description, label, total, value }) {
  const percent = getProgressPercent(value, total);

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <p className="text-sm font-bold text-slate-950">
          {Number(value) || 0}/{Number(total) || 0}
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#0ea5e9)] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">{percent}%</p>
    </div>
  );
}

function QuickActionGrid({ items = [] }) {
  const activeItems = items.filter((item) => getPositiveCount(item.value) > 0);

  if (!activeItems.length) {
    return (
      <EmptyState
        title="Nuk ka asgje per vemendje"
        description="Kur te kete kerkesa, aplikime ose veprime reale, ato do te shfaqen ketu."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {activeItems.map((item) => (
        <DashboardListItem
          key={item.title}
          badge={String(item.value)}
          badgeTone={item.tone || "warning"}
          icon={item.icon}
          meta={item.meta}
          title={item.title}
          to={item.to}
        />
      ))}
    </div>
  );
}

function StatCardLink({ card }) {
  const content = (
    <StatCard
      icon={card.icon}
      label={card.label}
      tone={card.tone}
      value={card.value}
    />
  );

  if (!card.to) {
    return content;
  }

  return (
    <Link
      to={card.to}
      className="block rounded-[28px] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
    >
      {content}
    </Link>
  );
}

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
  const examSource = user?.roli === "admin" ? dashboard?.upcomingExams : dashboard?.exams;
  const upcomingExams = useMemo(() => getUpcomingItems(examSource || []), [examSource]);
  const todaysSchedule = useMemo(
    () => getTodaySchedule(dashboard?.schedule || []),
    [dashboard?.schedule]
  );
  const nextExam = upcomingExams[0] || null;

  const studentProgress = useMemo(() => {
    const totalCredits = getPositiveCount(dashboard?.summary?.total_kredite);
    const completedCredits = getPositiveCount(dashboard?.summary?.kredite_te_kaluara);
    const passedCourses = getPositiveCount(dashboard?.summary?.lende_te_kaluara);
    const totalCourses = getPositiveCount(dashboard?.summary?.total_regjistrimeve);

    return {
      completedCredits,
      openCourses: getPositiveCount(dashboard?.summary?.lende_pa_note_kaluese),
      passedCourses,
      totalCourses,
      totalCredits,
    };
  }, [dashboard]);

  const studentHighlights = useMemo(
    () => [
      {
        label: "Mesatarja",
        value: formatAverageLabel(dashboard?.summary?.mesatarja),
        icon: "graduation",
        tone: "accent",
        to: "/student/notat",
      },
      {
        label: "Kredite te kaluara",
        value: `${studentProgress.completedCredits}/${studentProgress.totalCredits}`,
        icon: "chart",
        to: "/student/profili#history",
      },
      {
        label: "Provime te ardhshme",
        value: dashboard?.summary?.upcoming_exams_count || 0,
        icon: "calendar",
        to: "/student/provimet",
      },
      {
        label: "Kerkesa sherbimesh",
        value: dashboard?.summary?.total_kerkesave_sherbimeve || 0,
        icon: "file",
        tone: "dark",
        to: "/student/sherbimet",
      },
    ],
    [dashboard, studentProgress]
  );

  const professorHighlights = useMemo(
    () => [
      {
        label: "Lendet e mia",
        value: dashboard?.summary?.total_courses || dashboard?.courses?.length || 0,
        icon: "book",
        tone: "accent",
        to: "/profesor/lendet",
      },
      {
        label: "Studente",
        value: dashboard?.summary?.total_students || 0,
        icon: "users",
        to: "/profesor/lendet",
      },
      {
        label: "Provimet",
        value: dashboard?.summary?.total_exams || dashboard?.exams?.length || 0,
        icon: "calendar",
        to: "/profesor/provimet",
      },
      {
        label: "Nota per vendosje",
        value: dashboard?.summary?.pending_grades_total || 0,
        icon: "graduation",
        tone: "dark",
        to: "/profesor/notat",
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
        to: "/studentet",
      },
      {
        label: "Profesoret",
        value: dashboard?.counts?.profesoret || 0,
        icon: "user",
        to: "/profesoret",
      },
      {
        label: "Lendet",
        value: dashboard?.counts?.lendet || 0,
        icon: "book",
        to: "/lendet",
      },
      {
        label: "Regjistrimet",
        value: dashboard?.counts?.regjistrimet || 0,
        icon: "graduation",
        to: "/regjistrimet",
      },
      {
        label: "Provimet",
        value: dashboard?.counts?.provimet || 0,
        icon: "calendar",
        tone: "dark",
        to: "/provimet",
      },
      {
        label: "Sherbimet",
        value: dashboard?.counts?.kerkesat_sherbimeve || 0,
        icon: "file",
        to: "/sherbimet",
      },
    ],
    [dashboard]
  );

  const adminActionItems = useMemo(() => {
    const attention = dashboard?.attention || {};

    return [
      {
        title: "Sherbime ne pritje",
        meta: "Kerkesa administrative per shqyrtim",
        value: getPositiveCount(attention.pending_service_requests),
        icon: "file",
        to: "/sherbimet",
      },
      {
        title: "Rindjekje ne pritje",
        meta: "Kerkesa per lende te perseritura",
        value: getPositiveCount(attention.pending_repeat_requests),
        icon: "refresh",
        to: "/rindjekjet",
      },
      {
        title: "Aplikime bursash",
        meta: "Aplikime qe presin vendim",
        value: getPositiveCount(attention.pending_scholarship_applications),
        icon: "spark",
        to: "/bursat",
      },
      {
        title: "Aplikime praktikash",
        meta: "Kandidate qe presin shqyrtim",
        value: getPositiveCount(attention.pending_internship_applications),
        icon: "spark",
        to: "/praktikat",
      },
      {
        title: "Aplikime Erasmus",
        meta: "Mobilitete qe presin vendim",
        value: getPositiveCount(attention.pending_erasmus_applications),
        icon: "building",
        to: "/erasmus",
      },
      {
        title: "Kontakte te paplota",
        meta: "Profile studentesh pa email ose telefon",
        value: getPositiveCount(attention.incomplete_student_contacts),
        icon: "users",
        to: "/studentet",
        tone: "info",
      },
    ];
  }, [dashboard]);

  const professorActionItems = useMemo(
    () => [
      {
        title: "Provime pa nota",
        meta: "Afate qe kane nevoje per vleresim",
        value: getPositiveCount(dashboard?.summary?.pending_grade_exams),
        icon: "graduation",
        to: "/profesor/notat",
      },
    ],
    [dashboard]
  );

  const studentActionItems = useMemo(() => {
    const pendingServices = getPositiveCount(dashboard?.summary?.pending_service_requests);
    const pendingRepeatRequests = getPositiveCount(
      dashboard?.summary?.pending_repeat_requests
    );
    const pendingApplications = getPositiveCount(
      dashboard?.summary?.pending_applications_count
    );

    return [
      {
        title: "Rindjekje ne pritje",
        meta: "Kerkesa per lende te perseritura",
        value: pendingRepeatRequests,
        icon: "refresh",
        to: "/student/rindjekjet",
      },
      {
        title: "Sherbime ne pritje",
        meta: "Kerkesa qe presin pergjigje",
        value: pendingServices,
        icon: "help",
        to: "/student/sherbimet",
      },
      {
        title: "Aplikime aktive",
        meta: "Bursa, praktika ose Erasmus",
        value: pendingApplications,
        icon: "spark",
        to: "/student/bursat",
        tone: "info",
      },
    ];
  }, [dashboard]);

  const renderDeadlineList = (items = []) =>
    items.length ? (
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <DashboardListItem
            key={`${item.type}-${item.title}-${item.due_date}`}
            badge={getDueLabel(item.due_date)}
            badgeTone={getDueTone(item.due_date)}
            icon={item.type === "Erasmus" ? "building" : "spark"}
            meta={`${item.meta || "-"} | ${formatDateLabel(item.due_date)}`}
            title={`${item.type}: ${item.title}`}
            to={getDeadlinePath(item.type, user?.roli)}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        title="Nuk ka afate te hapura"
        description="Afatet e bursave, praktikave dhe Erasmus do te shfaqen ketu."
      />
    );

  const renderUpcomingExamList = (items = []) =>
    items.length ? (
      <div className="space-y-3">
        {items.slice(0, 5).map((exam) => (
          <DashboardListItem
            key={exam.provimi_id}
            badge={exam.afati}
            icon="calendar"
            meta={`${formatDateLabel(exam.data_provimit)} | ${formatTimeLabel(exam.ora)} | ${
              exam.salla || "-"
            }`}
            title={exam.lenda}
            to={getExamPath(user?.roli)}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        title="Nuk ka provime te aferta"
        description="Provimet e ardhshme do te shfaqen ketu sapo te planifikohen."
      />
    );

  const studentDeadlineItems = dashboard?.deadlines || [];
  const studentApplicationItems = dashboard?.applications || [];
  const hasStudentDeadlines = studentDeadlineItems.length > 0;
  const hasStudentApplications = studentApplicationItems.length > 0;

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
              <StatCardLink key={card.label} card={card} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardPanel
              title="Kerkojne vemendje"
              description="Puna qe administrata duhet ta kape shpejt para se te krijohen vonesa."
            >
              <QuickActionGrid items={adminActionItems} />
            </DashboardPanel>

            <DashboardPanel
              title="Afatet ne horizont"
              description="Aplikime dhe mundesi studentore qe po afrohen."
              action={
                <Link to="/bursat" className={panelLinkClass}>
                  Menaxho mundesite
                </Link>
              }
            >
              {renderDeadlineList(dashboard?.deadlines || [])}
            </DashboardPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <DashboardPanel
              title="Provimet e ardhshme"
              description="Kalendari i afert akademik ne nivel universiteti."
              action={
                <Link to="/provimet" className={panelLinkClass}>
                  Hap provimet
                </Link>
              }
            >
              {renderUpcomingExamList(upcomingExams)}
            </DashboardPanel>

            <DashboardPanel
              title="Aktiviteti i fundit"
              description="Levizjet me te reja nga sherbimet dhe dokumentet."
            >
              {dashboard?.recentActivity?.length ? (
                <div className="space-y-3">
                  {dashboard.recentActivity.slice(0, 6).map((item) => (
                    <DashboardListItem
                      key={`${item.type}-${item.reference_id}-${item.activity_date}`}
                      badge={item.statusi}
                      icon={item.type === "Dokument" ? "file" : "help"}
                      meta={`${item.meta || "-"} | ${formatDateLabel(item.activity_date)}`}
                      title={`${item.type}: ${item.title || "-"}`}
                      to={getActivityPath(item.type)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Ende nuk ka aktivitet"
                  description="Aktivitetet e reja do te shfaqen ketu kur sistemi te perdoret."
                />
              )}
            </DashboardPanel>
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {professorHighlights.map((card) => (
              <StatCardLink key={card.label} card={card} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardPanel
              title="Dita e sotme"
              description="Orari i dites dhe provimi me i afert ne nje pamje te vetme."
              action={
                <Link to="/profesor/orari" className={panelLinkClass}>
                  Hap orarin
                </Link>
              }
            >
              <div className="space-y-3">
                {todaysSchedule.length ? (
                  todaysSchedule.slice(0, 3).map((item) => (
                    <DashboardListItem
                      key={item.orari_id}
                      badge={item.salla}
                      icon="clock"
                      meta={`${formatTimeLabel(item.ora_fillimit)} - ${formatTimeLabel(
                        item.ora_mbarimit
                      )}`}
                      title={item.lenda}
                      to={getSchedulePath(user?.roli)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Nuk ka seanca sot"
                    description="Orari i sotem eshte i lire ose nuk ka seanca te regjistruara."
                  />
                )}

                {nextExam ? (
                  <DashboardListItem
                    badge={getDueLabel(nextExam.data_provimit)}
                    badgeTone={getDueTone(nextExam.data_provimit)}
                    icon="calendar"
                    meta={`${formatDateLabel(nextExam.data_provimit)} | ${formatTimeLabel(
                      nextExam.ora
                    )} | ${nextExam.salla || "-"}`}
                    title={`Provimi i radhes: ${nextExam.lenda}`}
                    to="/profesor/provimet"
                  />
                ) : null}
              </div>
            </DashboardPanel>

            <DashboardPanel
              title="Action center"
              description="Sinjalet kryesore per ligjeratat, notimin dhe ngarkesen."
            >
              <QuickActionGrid items={professorActionItems} />
            </DashboardPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <DashboardPanel
              title="Pipeline i notimit"
              description="Provimet ku mund te kontrollosh sa studente presin note."
              action={
                <Link to="/profesor/notat" className={panelLinkClass}>
                  Vendos nota
                </Link>
              }
            >
              {dashboard?.gradePipeline?.length ? (
                <div className="space-y-3">
                  {dashboard.gradePipeline.slice(0, 5).map((item) => (
                    <DashboardListItem
                      key={item.provimi_id}
                      badge={`${item.pending_grades} pa nota`}
                      badgeTone={item.pending_grades > 0 ? "warning" : "success"}
                      icon="graduation"
                      meta={`${formatDateLabel(item.data_provimit)} | ${item.total_grades}/${
                        item.total_students
                      } te vleresuar`}
                      title={item.lenda}
                      to="/profesor/notat"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka pipeline notimi"
                  description="Provimet dhe notat do te shfaqen ketu sapo te kete aktivitet."
                />
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Provimet e aferta"
              description="Provimet me te fundit te caktuara ne kalendarin tend."
              action={
                <Link to="/profesor/provimet" className={panelLinkClass}>
                  Shiko te gjitha
                </Link>
              }
            >
              {renderUpcomingExamList(upcomingExams)}
            </DashboardPanel>
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
                <Link to="/profesor/lendet" className={panelLinkClass}>
                  Menaxho
                </Link>
              </div>
              {dashboard?.courses?.length ? (
                <div className="space-y-3">
                  {dashboard.courses.slice(0, 4).map((course) => (
                    <Link
                      key={course.lende_id}
                      to="/profesor/lendet"
                      className="block rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{course.emri}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {course.kodi} | Semestri {course.semestri} |{" "}
                            {course.total_studentesh || 0} studente
                          </p>
                        </div>
                        <StatusBadge tone="info">{course.kreditet} kredi</StatusBadge>
                      </div>
                    </Link>
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
                  <h3 className="text-lg font-bold text-slate-950">Ngarkesa e lendeve</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Lendet me studentet dhe provimet e regjistruara.
                  </p>
                </div>
                <Link to="/profesor/lendet" className={panelLinkClass}>
                  Hap lendet
                </Link>
              </div>
              {dashboard?.courses?.length ? (
                <div className="space-y-3">
                  {dashboard.courses.slice(0, 4).map((course) => (
                    <Link
                      key={`load-${course.lende_id}`}
                      to="/profesor/lendet"
                      className="block rounded-[24px] transition hover:-translate-y-0.5"
                    >
                      <ProgressBlock
                        description={`${course.total_provimeve || 0} provime te lidhura`}
                        label={course.emri}
                        total={Math.max(
                          getPositiveCount(dashboard?.summary?.total_students),
                          getPositiveCount(course.total_studentesh)
                        )}
                        value={course.total_studentesh || 0}
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka ngarkese per shfaqje"
                  description="Ngarkesa do te shfaqet pasi lendet te kene regjistrime."
                />
              )}
            </SurfaceCard>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {studentHighlights.map((card) => (
              <StatCardLink key={card.label} card={card} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardPanel
              title="Sot dhe ne vazhdim"
              description="Orari i dites dhe provimi i radhes per te mos humbur ritmin."
              action={
                <Link to="/student/orari" className={panelLinkClass}>
                  Hap orarin
                </Link>
              }
            >
              <div className="space-y-3">
                {todaysSchedule.length ? (
                  todaysSchedule.slice(0, 3).map((item) => (
                    <DashboardListItem
                      key={item.orari_id}
                      badge={item.salla}
                      icon="clock"
                      meta={`${formatTimeLabel(item.ora_fillimit)} - ${formatTimeLabel(
                        item.ora_mbarimit
                      )} | ${item.profesori || "-"}`}
                      title={item.lenda}
                      to={getSchedulePath(user?.roli)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Nuk ka orar sot"
                    description="Kur te kete seanca per diten e sotme, ato do te shfaqen ketu."
                  />
                )}

                {nextExam ? (
                  <DashboardListItem
                    badge={getDueLabel(nextExam.data_provimit)}
                    badgeTone={getDueTone(nextExam.data_provimit)}
                    icon="calendar"
                    meta={`${formatDateLabel(nextExam.data_provimit)} | ${formatTimeLabel(
                      nextExam.ora
                    )} | ${nextExam.salla || "-"}`}
                    title={`Provimi i radhes: ${nextExam.lenda}`}
                    to="/student/provimet"
                  />
                ) : null}
              </div>
            </DashboardPanel>

            <DashboardPanel
              title="Progres akademik"
              description="Kreditet, lendet dhe mesatarja e permbledhur ne nje vend."
              action={
                <Link to="/student/profili#history" className={panelLinkClass}>
                  Historiku
                </Link>
              }
            >
              <div className="space-y-3">
                <Link
                  to="/student/profili#history"
                  className="block rounded-[24px] transition hover:-translate-y-0.5"
                >
                  <ProgressBlock
                    description="Nga kreditet e regjistruara ne profil"
                    label="Kredite te kaluara"
                    total={studentProgress.totalCredits}
                    value={studentProgress.completedCredits}
                  />
                </Link>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashboardListItem
                    badge={`${studentProgress.passedCourses}`}
                    badgeTone="success"
                    icon="graduation"
                    meta="Lende me note kaluese"
                    title="Te kaluara"
                    to="/student/notat"
                  />
                  <DashboardListItem
                    badge={`${studentProgress.openCourses}`}
                    badgeTone={studentProgress.openCourses > 0 ? "warning" : "success"}
                    icon="book"
                    meta="Lende pa note kaluese"
                    title="Pa note kaluese"
                    to="/student/notat"
                  />
                </div>
              </div>
            </DashboardPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <DashboardPanel
              title="Kerkojne vemendje"
              description="Detyrat e vogla qe ia vlejne te mbyllen sa me heret."
            >
              <QuickActionGrid items={studentActionItems} />
            </DashboardPanel>

            <DashboardPanel
              title="Afate dhe aplikime"
              description="Mundesi studentore te hapura dhe aplikimet e tua me status."
              action={
                <Link to="/student/bursat" className={panelLinkClass}>
                  Shiko mundesite
                </Link>
              }
            >
              {hasStudentDeadlines || hasStudentApplications ? (
                <div
                  className={`grid gap-4 ${
                    hasStudentDeadlines && hasStudentApplications ? "lg:grid-cols-2" : ""
                  }`}
                >
                  {hasStudentDeadlines ? (
                    <div>{renderDeadlineList(studentDeadlineItems)}</div>
                  ) : null}
                  {hasStudentApplications ? (
                    <div className="space-y-3">
                      {studentApplicationItems.slice(0, 5).map((item) => (
                        <DashboardListItem
                          key={`${item.type}-${item.title}-${item.activity_date}`}
                          badge={item.statusi}
                          icon="spark"
                          meta={formatDateLabel(item.activity_date)}
                          title={`${item.type}: ${item.title}`}
                          to={getApplicationPath(item.type)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="Nuk ka afate apo aplikime"
                  description="Mundesite studentore dhe aplikimet e tua do te shfaqen ketu."
                />
              )}
            </DashboardPanel>
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
                <Link to="/student/notat" className={panelLinkClass}>
                  Hap notat
                </Link>
              </div>
              {dashboard?.grades?.length ? (
                <div className="space-y-3">
                  {dashboard.grades.slice(0, 4).map((grade) => (
                    <Link
                      key={grade.nota_id}
                      to="/student/notat"
                      className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{grade.lenda}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {grade.profesori || "-"} | {formatDateLabel(grade.data_vendosjes)}
                        </p>
                      </div>
                      <StatusBadge tone="dark">{grade.nota}</StatusBadge>
                    </Link>
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
                  className={panelLinkClass}
                >
                  Hap regjistrimet
                </Link>
              </div>
              {dashboard?.enrollments?.length ? (
                <div className="space-y-3">
                  {dashboard.enrollments.slice(0, 4).map((enrollment) => (
                    <Link
                      key={enrollment.regjistrimi_id}
                      to="/student/regjistrimet"
                      className="block rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{enrollment.lenda}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {enrollment.kodi} | {enrollment.viti_akademik} |{" "}
                            {enrollment.kreditet || 0} kredi
                          </p>
                        </div>
                        <StatusBadge>{enrollment.statusi}</StatusBadge>
                      </div>
                    </Link>
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

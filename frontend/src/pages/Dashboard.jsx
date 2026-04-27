import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";
import { formatDateLabel, formatTimeLabel } from "../utils/display";
import { getApiErrorMessage } from "../utils/validation";

const adminCards = [
  { key: "students", label: "Studentet", path: "/studentet" },
  { key: "profesoret", label: "Profesoret", path: "/profesoret" },
  { key: "gjeneratat", label: "Gjeneratat", path: "/gjeneratat" },
  { key: "lendet", label: "Lendet", path: "/lendet" },
  { key: "provimet", label: "Provimet", path: "/provimet" },
  { key: "regjistrimet", label: "Regjistrimet", path: "/regjistrimet" },
  { key: "kerkesat_sherbimeve", label: "Sherbimet", path: "/sherbimet" },
  { key: "rindjekjet", label: "Rindjekje", path: "/rindjekjet" },
  { key: "bursat", label: "Bursat", path: "/bursat" },
  { key: "praktikat", label: "Internships", path: "/praktikat" },
  { key: "erasmus", label: "Erasmus", path: "/erasmus" },
];

const emptyDashboard = {};

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {message}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await API.get("/auth/dashboard");
      setDashboard(response.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se dashboard-it."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Duke ngarkuar dashboard-in...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
        <p className="font-semibold">{error}</p>
        <button
          type="button"
          onClick={fetchDashboard}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          Provo perseri
        </button>
      </div>
    );
  }

  if (user?.roli === "admin") {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-900 p-8 text-white text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Paneli i administratorit
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-100">Kontroll i plote i sistemit</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 text-center mx-auto">
            Menaxho studentet, profesoret, lendet, provimet dhe regjistrimet nga
            i njejti panel. Te gjitha modulet CRUD jane te kufizuara vetem per
            administratorin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {adminCards.map((card) => (
            <Link
              key={card.key}
              to={card.path}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">
                {dashboard.counts?.[card.key] ?? 0}
              </h3>
              <span className="mt-4 inline-block text-sm font-semibold text-slate-900">
                Hape modulin
              </span>
            </Link>
          ))}
        </div>

        <SectionCard
          title="Qasja sipas roleve"
          subtitle="Versioni i ri i autentikimit mbeshtet tri role te ndryshme."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-5">
              <p className="text-sm font-semibold text-slate-900">Admin</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ka qasje ne te gjitha modulet CRUD dhe menaxhon te dhenat baze
                te universitetit.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-5">
              <p className="text-sm font-semibold text-slate-900">Profesor</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mund te identifikohet dhe sheh dashboard-in me lendet,
                provimet dhe orarin personal.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-5">
              <p className="text-sm font-semibold text-slate-900">Student</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mund te regjistrohet me email ekzistues dhe sheh notat,
                provimet, orarin dhe regjistrimet personale.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (user?.roli === "profesor") {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title={`Mire se erdhe, ${dashboard.profile?.emri || user?.emri || "Profesor"}`}
            subtitle="Pamje personale me te dhenat e tua akademike."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Email
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {dashboard.profile?.email || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Departamenti
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {dashboard.profile?.departamenti || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Titulli
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {dashboard.profile?.titulli_akademik || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Specializimi
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {dashboard.profile?.specializimi || "-"}
                </p>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-900 p-5 text-white">
              <p className="text-sm text-slate-400">Lendet e mia</p>
              <h3 className="mt-3 text-3xl font-bold  text-slate-300">
                {dashboard.courses?.length ?? 0}
              </h3>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Provimet e fundit</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">
                {dashboard.exams?.length ?? 0}
              </h3>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Orari javor</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">
                {dashboard.schedule?.length ?? 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Lendet e mia"
            subtitle="Lista e lendeve ku je caktuar si profesor."
          >
            {dashboard.courses?.length ? (
              <div className="space-y-3">
                {dashboard.courses.map((course) => (
                  <div
                    key={course.lende_id}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {course.emri}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {course.kodi} | Semestri {course.semestri}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {course.kreditet} kredi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Nuk ka lende te lidhura me kete llogari." />
            )}
          </SectionCard>

          <SectionCard
            title="Provimet e mia"
            subtitle="Provimet me te fundit ku je caktuar si profesor."
          >
            {dashboard.exams?.length ? (
              <div className="space-y-3">
                {dashboard.exams.map((exam) => (
                  <div
                    key={exam.provimi_id}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <p className="font-semibold text-slate-900">{exam.lenda}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateLabel(exam.data_provimit)} | {formatTimeLabel(exam.ora)} |
                      {" "}
                      {exam.salla} | {exam.afati}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Nuk ka provime te lidhura me kete llogari." />
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Orari im"
          subtitle="Seancat e ardhshme te mesimit sipas lendeve te tua."
        >
          {dashboard.schedule?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 font-medium">Lenda</th>
                    <th className="pb-3 font-medium">Dita</th>
                    <th className="pb-3 font-medium">Ora</th>
                    <th className="pb-3 font-medium">Salla</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.schedule.map((item) => (
                    <tr key={item.orari_id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-900">{item.lenda}</td>
                      <td className="py-3 text-slate-600">{item.dita}</td>
                      <td className="py-3 text-slate-600">
                        {formatTimeLabel(item.ora_fillimit)} -{" "}
                        {formatTimeLabel(item.ora_mbarimit)}
                      </td>
                      <td className="py-3 text-slate-600">{item.salla}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Nuk ka orar te lidhur me kete llogari." />
          )}
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title={`Mire se erdhe, ${dashboard.profile?.emri || user?.emri || "Student"}`}
          subtitle="Pamje personale me progresin tend akademik."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Email
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {dashboard.profile?.email || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Drejtimi
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {dashboard.profile?.drejtimi || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Gjenerata
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {dashboard.profile?.gjenerata || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Fakulteti
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {dashboard.profile?.fakulteti || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Statusi
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {dashboard.profile?.statusi || "-"}
              </p>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
            <p className="text-sm text-slate-400">Notat e fundit</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-100">
              {dashboard.grades?.length ?? 0}
            </h3>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Regjistrimet</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.enrollments?.length ?? 0}
            </h3>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Provimet e lidhura</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.exams?.length ?? 0}
            </h3>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Kerkesa sherbimesh</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.summary?.total_kerkesave_sherbimeve ?? 0}
            </h3>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Rindjekje</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {dashboard.summary?.total_rindjekjeve ?? 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Notat e mia"
          subtitle="Rezultatet e fundit te regjistruara per ty."
        >
          {dashboard.grades?.length ? (
            <div className="space-y-3">
              {dashboard.grades.map((grade) => (
                <div
                  key={grade.nota_id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{grade.lenda}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {grade.profesori || "-"} | {formatDateLabel(grade.data_vendosjes)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                    {grade.nota}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Nuk ka nota te lidhura me kete llogari." />
          )}
        </SectionCard>

        <SectionCard
          title="Regjistrimet e mia"
          subtitle="Lendet ku je regjistruar aktualisht."
        >
          {dashboard.enrollments?.length ? (
            <div className="space-y-3">
              {dashboard.enrollments.map((enrollment) => (
                <div
                  key={enrollment.regjistrimi_id}
                  className="rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {enrollment.lenda}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {enrollment.kodi} | Semestri {enrollment.semestri} |{" "}
                        {enrollment.viti_akademik}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {enrollment.statusi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Nuk ka regjistrime te lidhura me kete llogari." />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Provimet e mia"
          subtitle="Provimet e lendeve ku je i regjistruar."
        >
          {dashboard.exams?.length ? (
            <div className="space-y-3">
              {dashboard.exams.map((exam) => (
                <div
                  key={exam.provimi_id}
                  className="rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <p className="font-semibold text-slate-900">{exam.lenda}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDateLabel(exam.data_provimit)} | {formatTimeLabel(exam.ora)} |{" "}
                    {exam.salla} | {exam.afati}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Nuk ka provime te lidhura me kete llogari." />
          )}
        </SectionCard>

        <SectionCard
          title="Orari im"
          subtitle="Orari i lendeve ku je i regjistruar."
        >
          {dashboard.schedule?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 font-medium">Lenda</th>
                    <th className="pb-3 font-medium">Dita</th>
                    <th className="pb-3 font-medium">Ora</th>
                    <th className="pb-3 font-medium">Salla</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.schedule.map((item) => (
                    <tr key={item.orari_id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-900">{item.lenda}</td>
                      <td className="py-3 text-slate-600">{item.dita}</td>
                      <td className="py-3 text-slate-600">
                        {formatTimeLabel(item.ora_fillimit)} -{" "}
                        {formatTimeLabel(item.ora_mbarimit)}
                      </td>
                      <td className="py-3 text-slate-600">{item.salla}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Nuk ka orar te lidhur me kete llogari." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default Dashboard;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, StatCard, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/ToastProvider";
import API, { getResponseMessage } from "../services/api";
import {
  formatAverageLabel,
  formatDateLabel,
  formatFileSize,
} from "../utils/display";
import { fileToPayload } from "../utils/files";
import { STUDENT_DOCUMENT_TYPE_OPTIONS } from "../utils/formOptions";
import {
  getApiErrorMessage,
  validateStudentDocumentForm,
} from "../utils/validation";

const emptyOverview = {
  profile: null,
  summary: null,
  grades: [],
  enrollments: [],
  documents: [],
  history: [],
};

function InfoField({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function renderDocumentPreview(file) {
  if (!file?.dataUrl) {
    return null;
  }

  if (file.mimeType?.startsWith("image/")) {
    return (
      <img
        src={file.dataUrl}
        alt={file.originalName || "Preview"}
        className="h-52 w-full rounded-[24px] border border-slate-200 object-cover"
      />
    );
  }

  if (file.mimeType === "application/pdf") {
    return (
      <iframe
        title="Document preview"
        src={file.dataUrl}
        className="h-64 w-full rounded-[24px] border border-slate-200 bg-white"
      />
    );
  }

  return null;
}

function StudentProfilePage() {
  const { notifyError, notifySuccess } = useToast();
  const [overview, setOverview] = useState(emptyOverview);
  const [documentForm, setDocumentForm] = useState({
    lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
    file: null,
    fileName: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/profili/overview");
      setOverview(response.data || emptyOverview);
      setError("");
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate marrjes se profilit te studentit."
      );
      setError(message);
      notifyError(message, "Profili nuk u ngarkua");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        label: "Mesatarja",
        value: formatAverageLabel(overview.summary?.mesatarja),
        icon: "graduation",
        tone: "accent",
      },
      {
        label: "Regjistrimet",
        value: overview.summary?.total_regjistrimeve || 0,
        icon: "book",
      },
      {
        label: "Dokumentet",
        value: overview.documents?.length || 0,
        icon: "file",
      },
      {
        label: "Rindjekjet",
        value: overview.summary?.total_rindjekjeve || 0,
        icon: "chart",
        tone: "dark",
      },
    ],
    [overview]
  );

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const payload = await fileToPayload(selectedFile);
      setDocumentForm((current) => ({
        ...current,
        file: payload,
        fileName: selectedFile.name,
      }));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Skedari nuk mund te ngarkohet.";
      setError(message);
      notifyError(message);
    } finally {
      event.target.value = "";
    }
  };

  const handleDocumentUpload = async () => {
    const validationError = validateStudentDocumentForm(documentForm);

    if (validationError) {
      setError(validationError);
      notifyError(validationError);
      return;
    }

    try {
      setUploading(true);
      const response = await API.post("/student/dokumentet", {
        lloji_dokumentit: documentForm.lloji_dokumentit,
        file: documentForm.file,
      });

      setDocumentForm({
        lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
        file: null,
        fileName: "",
      });
      setError("");
      await fetchOverview();
      notifySuccess(
        getResponseMessage(response, "Dokumenti u ngarkua me sukses."),
        "Dokument i ri"
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate ngarkimit te dokumentit."
      );
      setError(message);
      notifyError(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <SkeletonRows count={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Profile"
        title="Profili im akademik"
        description="Pamja e plote ku bashkohen te dhenat personale, regjistrimet, notat, dokumentet dhe historiku akademik."
        actions={
          <>
            <Link
              to="/student/regjistrimet"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Shko te regjistrimet
            </Link>
            <Link
              to="/student/notat"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Shiko notat
            </Link>
          </>
        }
      />

      <SectionNav
        items={[
          { href: "#overview", label: "Profili", icon: "user" },
          { href: "#courses", label: "Regjistrimet", icon: "book" },
          { href: "#grades", label: "Notat", icon: "graduation" },
          { href: "#documents", label: "Dokumentet", icon: "file" },
          { href: "#history", label: "Historiku", icon: "chart" },
        ]}
      />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section id="overview" className="grid scroll-mt-32 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <SurfaceCard>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Informacion personal</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Te dhenat kryesore personale dhe akademike per llogarine tende.
            </p>
          </div>

          {overview.profile ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label="Emri i plote"
                value={`${overview.profile.emri} ${overview.profile.mbiemri}`}
              />
              <InfoField label="Email" value={overview.profile.email} />
              <InfoField label="Telefoni" value={overview.profile.telefoni} />
              <InfoField label="Fakulteti" value={overview.profile.fakulteti} />
              <InfoField label="Drejtimi" value={overview.profile.drejtimi} />
              <InfoField label="Gjenerata" value={overview.profile.gjenerata} />
              <InfoField
                label="Viti i studimit"
                value={`Viti ${overview.profile.viti_studimit || "-"}`}
              />
              <InfoField label="Statusi" value={overview.profile.statusi} />
              <InfoField
                label="Data e lindjes"
                value={formatDateLabel(overview.profile.data_lindjes)}
              />
              <div className="md:col-span-2">
                <InfoField label="Adresa" value={overview.profile.adresa} />
              </div>
            </div>
          ) : (
            <EmptyState
              title="Profili nuk u gjet"
              description="Kontakto administraten nese llogaria nuk ka te dhena te lidhura."
            />
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Lidhje te shpejta</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kalo direkt nga profili te modulet qe te duhen me shpesh.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Regjistrimet e mia",
                body: "Shiko lendet aktive, statuset dhe dokumentet e lidhura me secilin regjistrim.",
                to: "/student/regjistrimet",
                icon: "book",
              },
              {
                title: "Notat e mia",
                body: "Hyr ne vleresim dhe ndiq mesataren, afatet dhe progresin neper lende.",
                to: "/student/notat",
                icon: "graduation",
              },
              {
                title: "Dokumentet",
                body: "Menaxho certifikata, transkripte dhe dokumente shtese ne nje vend te vetem.",
                href: "#documents",
                icon: "file",
              },
            ].map((item) =>
              item.to ? (
                <Link
                  key={item.title}
                  to={item.to}
                  className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  <p className="text-base font-bold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.body}</p>
                </Link>
              ) : (
                <a
                  key={item.title}
                  href={item.href}
                  className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  <p className="text-base font-bold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.body}</p>
                </a>
              )
            )}
          </div>
        </SurfaceCard>
      </section>

      <section id="courses" className="scroll-mt-32">
        <SurfaceCard>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Lendet e regjistruara</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Lidhja direkte mes regjistrimeve, statusit akademik dhe dokumenteve percjellese.
              </p>
            </div>
            <Link to="/student/regjistrimet" className="text-sm font-semibold text-teal-700">
              Menaxho regjistrimet
            </Link>
          </div>

          {overview.enrollments?.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {overview.enrollments.map((enrollment) => (
                <article
                  key={enrollment.regjistrimi_id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{enrollment.lenda}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {enrollment.kodi} | {enrollment.profesor || "-"}
                      </p>
                    </div>
                    <StatusBadge>{enrollment.statusi}</StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Semestri: {enrollment.semestri}</p>
                    <p>Viti akademik: {enrollment.viti_akademik}</p>
                    <p>Kredite: {enrollment.kreditet}</p>
                    <p>Dokumente te lidhura: {enrollment.total_dokumenteve || 0}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nuk ka regjistrime aktive"
              description="Kur te regjistrohen lende ne profilin tend, ato do te shfaqen ketu."
            />
          )}
        </SurfaceCard>
      </section>

      <section id="grades" className="scroll-mt-32">
        <SurfaceCard>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Rezultatet akademike</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Vleresimet e fundit te lidhura me lendet dhe afatet e tua.
              </p>
            </div>
            <Link to="/student/notat" className="text-sm font-semibold text-teal-700">
              Hape modulin e notave
            </Link>
          </div>

          {overview.grades?.length ? (
            <div className="space-y-3">
              {overview.grades.slice(0, 6).map((grade) => (
                <div
                  key={grade.nota_id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{grade.lenda}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {grade.profesori || "-"} | {formatDateLabel(grade.data_provimit)} |{" "}
                      {grade.afati}
                    </p>
                  </div>
                  <StatusBadge tone="dark">{grade.nota}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nuk ka nota te regjistruara"
              description="Rezultatet do te shfaqen ketu sapo te publikohen nga profesoret."
            />
          )}
        </SurfaceCard>
      </section>

      <section
        id="documents"
        className="grid scroll-mt-32 gap-6 xl:grid-cols-[1.05fr_0.95fr]"
      >
        <SurfaceCard>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Dokumentet e mia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Certifikata, transkripte dhe dokumente shtese me preview dhe shkarkim.
              </p>
            </div>
            <StatusBadge tone="info">
              {(overview.documents || []).length} dokumente
            </StatusBadge>
          </div>

          {overview.documents?.length ? (
            <div className="space-y-3">
              {overview.documents.map((document) => (
                <div
                  key={document.dokument_id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {document.lloji_dokumentit}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {document.original_name} | {formatFileSize(document.file_size)} |{" "}
                        {formatDateLabel(document.uploaded_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={document.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                      >
                        Preview
                      </a>
                      <a
                        href={document.download_url}
                        download
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nuk ka dokumente te ngarkuara"
              description="Ngarko dokumentin e pare per te krijuar dosjen tende dixhitale."
            />
          )}
        </SurfaceCard>

        <SurfaceCard>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Ngarko dokument</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Validim automatik per formatin dhe madhesine e skedarit, plus preview para ruajtjes.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Kategoria
              </label>
              <select
                value={documentForm.lloji_dokumentit}
                onChange={(event) =>
                  setDocumentForm((current) => ({
                    ...current,
                    lloji_dokumentit: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              >
                {STUDENT_DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="block rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100/70">
              Zgjidh PDF ose imazh
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {documentForm.fileName ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                Skedari i zgjedhur: <span className="font-semibold">{documentForm.fileName}</span>
              </div>
            ) : null}

            {renderDocumentPreview(documentForm.file)}

            <div className="flex flex-wrap gap-3">
              <Button
                icon="upload"
                loading={uploading}
                onClick={handleDocumentUpload}
              >
                Ngarko dokumentin
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  setDocumentForm({
                    lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
                    file: null,
                    fileName: "",
                  })
                }
              >
                Pastro formen
              </Button>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section id="history" className="scroll-mt-32">
        <SurfaceCard>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Historiku akademik</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nje pamje sipas semestrave me ngarkesen e lendeve, kalueshmerine dhe mesataren.
            </p>
          </div>

          {overview.history?.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {overview.history.map((item) => (
                <article
                  key={`${item.viti_akademik}-${item.semestri}`}
                  className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{item.viti_akademik}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Semestri {item.semestri}
                      </p>
                    </div>
                    <StatusBadge tone="dark">
                      Mes. {formatAverageLabel(item.average_grade)}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Lende totale: {item.total_courses}</p>
                    <p>Te kaluara: {item.passed_courses}</p>
                    <p>Ne proces / te hapura: {item.open_courses}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nuk ka historik te disponueshem"
              description="Historiku do te ndertohet sapo te kesh regjistrime dhe vleresime ne sistem."
            />
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

export default StudentProfilePage;

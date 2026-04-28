import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { EmptyState, InlineAlert, SkeletonRows } from "../components/ui/Feedback";
import { PageHeader, SectionNav, SurfaceCard } from "../components/ui/Layout";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/ToastProvider";
import API, { getResponseMessage } from "../services/api";
import { formatFileSize } from "../utils/display";
import { fileToPayload } from "../utils/files";
import { getRoleConnections } from "../utils/navigation";
import { getApiErrorMessage } from "../utils/validation";

function StudentEnrollmentsPage() {
  const { notifyError, notifySuccess } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [documentsByEnrollment, setDocumentsByEnrollment] = useState({});
  const [uploadForms, setUploadForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateUploadForm = (registrationId, nextValues) => {
    setUploadForms((current) => ({
      ...current,
      [registrationId]: {
        emri_dokumentit: "",
        file: null,
        fileName: "",
        isSubmitting: false,
        error: "",
        ...(current[registrationId] || {}),
        ...nextValues,
      },
    }));
  };

  const fetchDocuments = async (registrationId) => {
    try {
      const response = await API.get(`/student/regjistrimet/${registrationId}/dokumentet`);
      setDocumentsByEnrollment((current) => ({
        ...current,
        [registrationId]: response.data || [],
      }));
    } catch (err) {
      const message = getApiErrorMessage(err, "Dokumentet nuk u ngarkuan.");
      updateUploadForm(registrationId, { error: message });
      notifyError(message);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/regjistrimet");
      const nextEnrollments = response.data || [];
      setEnrollments(nextEnrollments);
      setError("");
      await Promise.all(
        nextEnrollments.map((item) => fetchDocuments(item.regjistrimi_id))
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate marrjes se regjistrimeve."
      );
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleLabelChange = (registrationId, value) => {
    updateUploadForm(registrationId, {
      emri_dokumentit: value,
      error: "",
    });
  };

  const handleFileChange = async (registrationId, event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const payload = await fileToPayload(selectedFile);
      updateUploadForm(registrationId, {
        file: payload,
        fileName: selectedFile.name,
        error: "",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Skedari nuk mund te ngarkohet.";
      updateUploadForm(registrationId, {
        file: null,
        fileName: "",
        error: message,
      });
      notifyError(message);
    } finally {
      event.target.value = "";
    }
  };

  const handleUpload = async (registrationId) => {
    const currentForm = uploadForms[registrationId] || {};

    if (!currentForm.emri_dokumentit?.trim()) {
      const message = "Emri i dokumentit eshte i detyrueshem.";
      updateUploadForm(registrationId, { error: message });
      notifyError(message);
      return;
    }

    if (!currentForm.file) {
      const message = "Zgjidh nje skedar nga kompjuteri.";
      updateUploadForm(registrationId, { error: message });
      notifyError(message);
      return;
    }

    try {
      updateUploadForm(registrationId, {
        isSubmitting: true,
        error: "",
      });

      const response = await API.post(`/student/regjistrimet/${registrationId}/dokumentet`, {
        emri_dokumentit: currentForm.emri_dokumentit,
        file: currentForm.file,
      });

      updateUploadForm(registrationId, {
        emri_dokumentit: "",
        file: null,
        fileName: "",
        isSubmitting: false,
        error: "",
      });
      await fetchDocuments(registrationId);
      notifySuccess(
        getResponseMessage(response, "Dokumenti u ngarkua me sukses."),
        "Regjistrimi u perditesua"
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate ngarkimit te dokumentit."
      );
      updateUploadForm(registrationId, {
        isSubmitting: false,
        error: message,
      });
      notifyError(message);
    }
  };

  if (loading) {
    return <SkeletonRows count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Enrollments"
        title="Regjistrimet e mia"
        description="Nga kjo faqe kalon nga lenda te dokumentet percjellese, statusi akademik dhe moduli i notave."
        actions={
          <>
            <Link
              to="/student/profili"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Kthehu te profili
            </Link>
            <Link
              to="/student/notat"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Shko te notat
            </Link>
          </>
        }
      />

      <SectionNav items={getRoleConnections("student")} />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      {enrollments.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {enrollments.map((item) => {
            const documents = documentsByEnrollment[item.regjistrimi_id] || [];
            const uploadForm = uploadForms[item.regjistrimi_id] || {};

            return (
              <SurfaceCard key={item.regjistrimi_id} className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      {item.lenda} ({item.kodi})
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.profesor || "-"} | Semestri {item.semestri}
                    </p>
                  </div>
                  <StatusBadge>{item.statusi}</StatusBadge>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>Viti akademik: {item.viti_akademik}</p>
                  <p>Kredite: {item.kreditet}</p>
                  <p>Lloji: {item.lloji}</p>
                  <p>Dokumente te lidhura: {documents.length}</p>
                </div>

                <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Dokumentet e regjistrimit
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ruaj prova pagese, dokumente shtese dhe materiale shoqeruese.
                      </p>
                    </div>
                    <Button
                      icon="refresh"
                      size="sm"
                      variant="secondary"
                      onClick={() => fetchDocuments(item.regjistrimi_id)}
                    >
                      Rifresko
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {documents.length ? (
                      documents.map((document) => (
                        <div
                          key={document.dokument_id}
                          className="rounded-[22px] border border-slate-200 bg-white px-4 py-3"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {document.emri_dokumentit}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {document.original_name} | {formatFileSize(document.file_size)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <a
                                href={document.download_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                              >
                                Preview
                              </a>
                              <a
                                href={document.download_url}
                                download
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="Nuk ka dokumente per kete regjistrim"
                        description="Ngarko dokumentin e pare per ta lidhur me kete lende."
                      />
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 ">
                    <input
                      type="text"
                      value={uploadForm.emri_dokumentit || ""}
                      onChange={(event) =>
                        handleLabelChange(item.regjistrimi_id, event.target.value)
                      }
                      placeholder="p.sh. Deshmia e pageses"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <label className="block rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                      Zgjidh skedarin
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(event) => handleFileChange(item.regjistrimi_id, event)}
                      />
                    </label>

                    {uploadForm.fileName ? (
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                        Skedari i zgjedhur: {uploadForm.fileName}
                      </div>
                    ) : null}

                    {uploadForm.error ? (
                      <InlineAlert>{uploadForm.error}</InlineAlert>
                    ) : null}

                    <Button
                      className="justify-self-start"
                      icon="upload"
                      loading={uploadForm.isSubmitting}
                      onClick={() => handleUpload(item.regjistrimi_id)}
                    >
                      Ngarko dokumentin
                    </Button>
                  </div>
                  
                </div>
               
              </SurfaceCard>
            );
          })}
        </div>
      ) : (
        <SurfaceCard>
          <EmptyState
            title="Nuk ka regjistrime te lidhura"
            description="Kur llogaria jote te lidhet me regjistrime aktive, ato do te shfaqen ketu bashke me dokumentet percjellese."
          />
        </SurfaceCard>
      )}
    </div>
  );
}

export default StudentEnrollmentsPage;

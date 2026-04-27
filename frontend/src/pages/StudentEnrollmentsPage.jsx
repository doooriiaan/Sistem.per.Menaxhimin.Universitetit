import { useEffect, useState } from "react";
import API from "../services/api";
import { formatFileSize } from "../utils/display";
import { fileToPayload } from "../utils/files";
import { getApiErrorMessage } from "../utils/validation";

function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [documentsByEnrollment, setDocumentsByEnrollment] = useState({});
  const [uploadForms, setUploadForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDocuments = async (registrationId) => {
    try {
      const response = await API.get(`/student/regjistrimet/${registrationId}/dokumentet`);
      setDocumentsByEnrollment((current) => ({
        ...current,
        [registrationId]: response.data,
      }));
    } catch (err) {
      setUploadForms((current) => ({
        ...current,
        [registrationId]: {
          ...(current[registrationId] || {}),
          error: getApiErrorMessage(err, "Dokumentet nuk u ngarkuan."),
        },
      }));
    }
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/regjistrimet");
        setEnrollments(response.data);
        setError("");
        await Promise.all(
          response.data.map((item) => fetchDocuments(item.regjistrimi_id))
        );
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Gabim gjate marrjes se regjistrimeve.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

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
      updateUploadForm(registrationId, {
        file: null,
        fileName: "",
        error: err instanceof Error ? err.message : "Skedari nuk mund te ngarkohet.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleUpload = async (registrationId) => {
    const currentForm = uploadForms[registrationId] || {};

    if (!currentForm.emri_dokumentit?.trim()) {
      updateUploadForm(registrationId, {
        error: "Emri i dokumentit eshte i detyrueshem.",
      });
      return;
    }

    if (!currentForm.file) {
      updateUploadForm(registrationId, {
        error: "Zgjidh nje skedar nga kompjuteri.",
      });
      return;
    }

    try {
      updateUploadForm(registrationId, {
        isSubmitting: true,
        error: "",
      });

      await API.post(`/student/regjistrimet/${registrationId}/dokumentet`, {
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
    } catch (err) {
      updateUploadForm(registrationId, {
        isSubmitting: false,
        error: getApiErrorMessage(err, "Gabim gjate ngarkimit te dokumentit."),
      });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Regjistrimet e mia</h2>
      <p className="mt-2 text-sm text-slate-500">
        Lendet ku je regjistruar, dokumentet percjellese dhe ngarkimi real i
        skedareve nga kompjuteri yt.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">
          Duke i ngarkuar regjistrimet...
        </p>
      ) : enrollments.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {enrollments.map((item) => {
            const documents = documentsByEnrollment[item.regjistrimi_id] || [];
            const uploadForm = uploadForms[item.regjistrimi_id] || {};

            return (
              <div
                key={item.regjistrimi_id}
                className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.lenda} ({item.kodi})
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.profesor || "-"} | Semestri {item.semestri}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {item.statusi}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>Viti akademik: {item.viti_akademik}</p>
                  <p>Kredite: {item.kreditet}</p>
                  <p>Lloji: {item.lloji}</p>
                  <p>Dokumente: {documents.length}</p>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Dokumentet e regjistrimit
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ngarko PDF ose imazh dhe ruaje direkt ne sistem.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchDocuments(item.regjistrimi_id)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      Rifresko
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {documents.length > 0 ? (
                      documents.map((document) => (
                        <a
                          key={document.dokument_id}
                          href={document.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              {document.emri_dokumentit}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {document.original_name} |{" "}
                              {formatFileSize(document.file_size)}
                            </p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Hap
                          </span>
                        </a>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        Nuk ka ende dokumente te ngarkuara per kete regjistrim.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3">
                    <input
                      type="text"
                      value={uploadForm.emri_dokumentit || ""}
                      onChange={(event) =>
                        handleLabelChange(item.regjistrimi_id, event.target.value)
                      }
                      placeholder="p.sh. Deshmia e pageses"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label className="flex-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                        Zgjidh skedarin
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(event) =>
                            handleFileChange(item.regjistrimi_id, event)
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleUpload(item.regjistrimi_id)}
                        disabled={uploadForm.isSubmitting}
                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {uploadForm.isSubmitting ? "Duke ngarkuar..." : "Ngarko"}
                      </button>
                    </div>

                    {uploadForm.fileName && (
                      <p className="text-xs text-slate-500">
                        Skedari i zgjedhur: {uploadForm.fileName}
                      </p>
                    )}

                    {uploadForm.error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {uploadForm.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nuk ka regjistrime te lidhura me llogarine tende.
        </div>
      )}
    </div>
  );
}

export default StudentEnrollmentsPage;

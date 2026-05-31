import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [availableCourses, setAvailableCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [documentsByEnrollment, setDocumentsByEnrollment] = useState({});
  const [uploadForms, setUploadForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [registeringCourseId, setRegisteringCourseId] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [error, setError] = useState("");

  const availableForEnrollment = useMemo(
    () => availableCourses.filter((course) => !Number(course.is_registered)),
    [availableCourses]
  );

  const filteredCourses = useMemo(() => {
    const searchValue = courseSearch.trim().toLowerCase();

    if (!searchValue) {
      return availableCourses;
    }

    return availableCourses.filter((course) =>
      [course.lenda, course.kodi, course.profesori, course.lloji]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue))
    );
  }, [availableCourses, courseSearch]);

  const selectedCourses = useMemo(
    () =>
      availableCourses.filter((course) =>
        selectedCourseIds.includes(course.lende_id)
      ),
    [availableCourses, selectedCourseIds]
  );

  const selectedCredits = selectedCourses.reduce(
    (total, course) => total + Number(course.kreditet || 0),
    0
  );

  const updateUploadForm = useCallback((registrationId, nextValues) => {
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
  }, []);

  const fetchDocuments = useCallback(async (registrationId) => {
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
  }, [notifyError, updateUploadForm]);

  const fetchEnrollments = useCallback(async (semesterOverride = "") => {
    try {
      setLoading(true);
      const [enrollmentsRes, semestersRes] = await Promise.all([
        API.get("/student/regjistrimet"),
        API.get("/student/semestrat"),
      ]);
      const nextEnrollments = enrollmentsRes.data || [];
      const nextSemesters = semestersRes.data || [];
      const nextSemester =
        semesterOverride ||
        nextSemesters.find((semester) => Number(semester.is_current))?.semestri ||
        nextSemesters[0]?.semestri ||
        "";
      const availableCoursesRes = await API.get("/student/lendet-disponueshme", {
        params: nextSemester ? { semestri: nextSemester } : {},
      });

      setEnrollments(nextEnrollments);
      setSemesters(nextSemesters);
      setSelectedSemester(nextSemester ? String(nextSemester) : "");
      setAvailableCourses(availableCoursesRes.data || []);
      setSelectedCourseIds([]);
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
  }, [fetchDocuments, notifyError]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleSemesterChange = (semester) => {
    setSelectedSemester(String(semester));
    fetchEnrollments(semester);
  };

  const handleRegisterCourse = async (course) => {
    if (Number(course.is_registered)) {
      return;
    }

    try {
      setRegisteringCourseId(course.lende_id);
      const response = await API.post(
        "/student/regjistrimet",
        { lende_id: course.lende_id, semestri: selectedSemester },
        { showToast: false }
      );

      await fetchEnrollments(selectedSemester);
      notifySuccess(getResponseMessage(response, "Lenda u regjistrua me sukses."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Gabim gjate regjistrimit te lendes.");
      setError(message);
      notifyError(message);
    } finally {
      setRegisteringCourseId(null);
    }
  };

  const toggleSelectedCourse = (courseId) => {
    const course = availableCourses.find((item) => item.lende_id === courseId);

    if (!course || Number(course.is_registered)) {
      return;
    }

    setSelectedCourseIds((current) =>
      current.includes(courseId)
        ? current.filter((selectedId) => selectedId !== courseId)
        : [...current, courseId]
    );
  };

  const handleRegisterSelectedCourses = async () => {
    if (selectedCourseIds.length === 0) {
      const message = "Zgjidh te pakten nje lende per regjistrim.";
      setError(message);
      notifyError(message);
      return;
    }

    try {
      setRegisteringCourseId("bulk");
      const response = await API.post(
        "/student/regjistrimet",
        { lende_ids: selectedCourseIds, semestri: selectedSemester },
        { showToast: false }
      );

      await fetchEnrollments(selectedSemester);
      notifySuccess(getResponseMessage(response, "Lendet u regjistruan me sukses."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Gabim gjate regjistrimit te lendeve.");
      setError(message);
      notifyError(message);
    } finally {
      setRegisteringCourseId(null);
    }
  };

  const handleDeleteEnrollment = async (course) => {
    if (!course.regjistrimi_id) {
      return;
    }

    try {
      setRegisteringCourseId(`delete-${course.regjistrimi_id}`);
      const response = await API.delete(
        `/student/regjistrimet/${course.regjistrimi_id}`,
        { showToast: false }
      );

      await fetchEnrollments(selectedSemester);
      notifySuccess(getResponseMessage(response, "Regjistrimi u hoq me sukses."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Gabim gjate heqjes se regjistrimit.");
      setError(message);
      notifyError(message);
    } finally {
      setRegisteringCourseId(null);
    }
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

      const response = await API.post(
        `/student/regjistrimet/${registrationId}/dokumentet`,
        {
          emri_dokumentit: currentForm.emri_dokumentit,
          file: currentForm.file,
        },
        { showToast: false }
      );

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

      <SurfaceCard>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Course enrolment
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Shfleto lendet e semestrit, zgjidh ato qe do dhe regjistrohu si ne Moodle.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="info">{availableForEnrollment.length} te hapura</StatusBadge>
            <Button
              size="sm"
              loading={registeringCourseId === "bulk"}
              disabled={selectedCourseIds.length === 0}
              onClick={handleRegisterSelectedCourses}
            >
              Enroll {selectedCourseIds.length || ""} lende
            </Button>
          </div>
        </div>

        {semesters.length ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {semesters.map((semester) => {
              const isSelected = String(semester.semestri) === String(selectedSemester);

              return (
                <button
                  key={semester.semestri}
                  type="button"
                  onClick={() => handleSemesterChange(semester.semestri)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Semestri {semester.semestri}
                  <span className={isSelected ? "ml-2 text-slate-300" : "ml-2 text-slate-400"}>
                    {semester.total_regjistruar}/{semester.total_lende}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <input
            type="search"
            value={courseSearch}
            onChange={(event) => setCourseSearch(event.target.value)}
            placeholder="Kerko lende sipas emrit, kodit ose profesorit..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
              {availableCourses.length} ne semestrin {selectedSemester || "-"}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
              {selectedCredits} kredi te zgjedhura
            </span>
          </div>
        </div>

        {availableCourses.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {filteredCourses.map((course) => {
              const isSelected = selectedCourseIds.includes(course.lende_id);
              const isRegistered = Number(course.is_registered) === 1;

              return (
                <div
                  key={course.lende_id}
                  className={`rounded-[24px] border p-4 transition ${
                    isRegistered
                      ? "border-emerald-200 bg-emerald-50/70"
                      : isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50/80"
                  }`}
                >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <label className={`flex gap-3 ${isRegistered ? "cursor-default" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isRegistered}
                      onChange={() => toggleSelectedCourse(course.lende_id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>
                    <p className={`font-semibold ${isSelected ? "text-white" : "text-slate-950"}`}>
                      {course.lenda} ({course.kodi})
                    </p>
                    <p className={`mt-1 text-sm ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {isRegistered
                        ? `Regjistruar: ${course.studenti_regjistruar || "ti"}`
                        : `Semestri ${course.semestri}`}
                    </p>
                    <div className={`mt-3 flex flex-wrap gap-2 text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      <span>{course.kreditet} kredi</span>
                      <span>{course.lloji}</span>
                      {isRegistered ? (
                        <span className="font-semibold text-emerald-700">
                          I regjistruar
                        </span>
                      ) : null}
                    </div>
                    </span>
                  </label>
                  <Button
                    size="sm"
                    variant={isRegistered ? "danger" : isSelected ? "secondary" : "primary"}
                    loading={
                      registeringCourseId === course.lende_id ||
                      registeringCourseId === `delete-${course.regjistrimi_id}`
                    }
                    disabled={registeringCourseId === "bulk"}
                    onClick={() =>
                      isRegistered
                        ? handleDeleteEnrollment(course)
                        : handleRegisterCourse(course)
                    }
                  >
                    {isRegistered ? "Hiq" : "Enroll"}
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nuk ka lende ne katalog per kete semester"
            description="Lendet shfaqen ketu kur i perkasin drejtimit dhe semestrit tend aktual."
          />
        )}
        {availableCourses.length && filteredCourses.length === 0 ? (
          <EmptyState
            title="Nuk u gjet asnje lende"
            description="Provo nje emer, kod ose profesor tjeter."
          />
        ) : null}
      </SurfaceCard>

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

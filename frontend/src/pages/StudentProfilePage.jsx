import { useEffect, useState } from "react";
import API from "../services/api";
import { formatAverageLabel, formatDateLabel, formatFileSize } from "../utils/display";
import { fileToPayload } from "../utils/files";
import { STUDENT_DOCUMENT_TYPE_OPTIONS } from "../utils/formOptions";
import { getApiErrorMessage, validateStudentDocumentForm } from "../utils/validation";

function StudentProfilePage() {
  const [data, setData] = useState({ profile: null, summary: null });
  const [documents, setDocuments] = useState([]);
  const [documentForm, setDocumentForm] = useState({
    lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
    file: null,
    fileName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [profileResponse, documentsResponse] = await Promise.all([
          API.get("/student/profili"),
          API.get("/student/dokumentet"),
        ]);
        setData(profileResponse.data);
        setDocuments(documentsResponse.data);
        setError("");
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Gabim gjate marrjes se profilit te studentit.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Skedari nuk mund te ngarkohet.");
    } finally {
      event.target.value = "";
    }
  };

  const refreshDocuments = async () => {
    const response = await API.get("/student/dokumentet");
    setDocuments(response.data);
  };

  const handleDocumentUpload = async () => {
    const validationError = validateStudentDocumentForm(documentForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await API.post("/student/dokumentet", {
        lloji_dokumentit: documentForm.lloji_dokumentit,
        file: documentForm.file,
      });
      setDocumentForm({
        lloji_dokumentit: STUDENT_DOCUMENT_TYPE_OPTIONS[0].value,
        file: null,
        fileName: "",
      });
      await refreshDocuments();
      setError("");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Gabim gjate ngarkimit te dokumentit baze.")
      );
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Duke e ngarkuar profilin...
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Profili im</h2>
        <p className="mt-2 text-sm text-slate-500">
          Te dhenat kryesore akademike dhe personale.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data.profile && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Emri
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.emri} {data.profile.mbiemri}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Email
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.email}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Fakulteti
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.fakulteti || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Drejtimi
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.drejtimi || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Viti i studimit
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.viti_studimit}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Gjenerata
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.gjenerata || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Statusi
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.statusi}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Telefoni
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.telefoni || "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Data e lindjes
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatDateLabel(data.profile.data_lindjes)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Adresa
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.profile.adresa || "-"}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Progresi akademik</h2>
        <p className="mt-2 text-sm text-slate-500">
          Permbledhje e shpejte e rezultateve dhe regjistrimeve.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-sm text-slate-400">Mesatarja</p>
            <h3 className="mt-3 text-4xl font-bold text-slate-100">
              {formatAverageLabel(data.summary?.mesatarja)}
            </h3>
          </div>
          <div className="rounded-2xl bg-slate-100 p-5">
            <p className="text-sm text-slate-500">Notat totale</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {data.summary?.total_notash || 0}
            </h3>
          </div>
          <div className="rounded-2xl bg-slate-100 p-5">
            <p className="text-sm text-slate-500">Regjistrimet totale</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {data.summary?.total_regjistrimeve || 0}
            </h3>
          </div>
          <div className="rounded-2xl bg-slate-100 p-5">
            <p className="text-sm text-slate-500">Kerkesa sherbimesh</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {data.summary?.total_kerkesave_sherbimeve || 0}
            </h3>
          </div>
          <div className="rounded-2xl bg-slate-100 p-5">
            <p className="text-sm text-slate-500">Rindjekje te lendeve</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {data.summary?.total_rindjekjeve || 0}
            </h3>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Dokumentet baze</h2>
            <p className="mt-2 text-sm text-slate-500">
              Certifikata e lindjes, dokumentet e shkolles dhe dosja percjellese.
            </p>

            <div className="mt-6 space-y-3">
              {documents.length > 0 ? (
                documents.map((document) => (
                  <a
                    key={document.dokument_id}
                    href={document.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {document.lloji_dokumentit}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {document.original_name} | {formatFileSize(document.file_size)}
                    </p>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Nuk ke ngarkuar ende dokumente baze.
                </div>
              )}
            </div>
          </div>

          <div className="w-full xl:max-w-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Ngarko dokument te ri
              </p>
              <div className="mt-4 space-y-3">
                <select
                  value={documentForm.lloji_dokumentit}
                  onChange={(event) =>
                    setDocumentForm((current) => ({
                      ...current,
                      lloji_dokumentit: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  {STUDENT_DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="block rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600">
                  Zgjidh dokumentin
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {documentForm.fileName && (
                  <p className="text-xs text-slate-500">{documentForm.fileName}</p>
                )}

                <button
                  type="button"
                  onClick={handleDocumentUpload}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  Ngarko dokumentin
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentProfilePage;

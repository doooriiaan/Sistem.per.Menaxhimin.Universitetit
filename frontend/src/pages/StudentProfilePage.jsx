import { useEffect, useState } from "react";
import API from "../services/api";
import { formatAverageLabel, formatDateLabel } from "../utils/display";
import { getApiErrorMessage } from "../utils/validation";

function StudentProfilePage() {
  const [data, setData] = useState({ profile: null, summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await API.get("/student/profili");
        setData(response.data);
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
        </div>
      </section>
    </div>
  );
}

export default StudentProfilePage;

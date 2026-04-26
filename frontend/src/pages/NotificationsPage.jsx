const notices = [
  {
    id: 1,
    tag: "Akademik",
    title: "Afati i regjistrimeve mbetet i hapur deri te premten",
    text: "Studentet mund te perfundojne regjistrimet aktive deri ne fund te javes pa penalizime shtese.",
  },
  {
    id: 2,
    tag: "Provime",
    title: "Orari i sesionit te ardhshem eshte publikuar",
    text: "Profesoret dhe studentet mund te verifikojne sallat, datat dhe oraret nga modulet perkatese.",
  },
  {
    id: 3,
    tag: "Sistem",
    title: "Paneli i ri i menaxhimit eshte optimizuar",
    text: "Navigimi, kartat informative dhe pamja e pergjithshme tani jane me te qarta per perdorim ditor.",
  },
];

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden rounded-[28px] p-8">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-teal-700">
          Njoftime
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Qendra e komunikimeve te universitetit
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Ketu mund te shfaqen njoftimet me te rendesishme per afate,
              ndryshime orari dhe perditesime te sistemit.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-sm">
            3 njoftime aktive kete jave
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {notices.map((notice) => (
          <article
            key={notice.id}
            className="surface-card rounded-[24px] p-6 transition duration-200 hover:-translate-y-1"
          >
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              {notice.tag}
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {notice.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {notice.text}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default NotificationsPage;

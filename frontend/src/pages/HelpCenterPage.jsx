const helpItems = [
  {
    title: "Si të menaxhoj llogarinë?",
    text: "Nga faqja e llogarisë mund të ndryshosh të dhënat personale dhe fjalëkalimin.",
  },
  {
    title: "Ku i gjej provimet dhe orarin?",
    text: "Secili rol ka modulet e veta në navigim. Studentët dhe profesorët kanë seksione të dedikuara.",
  },
  {
    title: "Pse nuk mund të regjistrohem?",
    text: "Regjistrimi funksionon vetëm nëse email-i yt ekziston paraprakisht në bazën e të dhënave.",
  },
];

function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] p-8">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-600">
          Ndihmë
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Qendra e ndihmës për përdoruesit
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Një hapësirë e thjeshtë ku përdoruesit gjejnë përgjigjet më të
          shpejta për përdorimin e sistemit.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {helpItems.map((item) => (
          <article key={item.title} className="surface-card rounded-[24px] p-6">
            <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="surface-card rounded-[24px] p-6">
        <h2 className="text-lg font-bold text-slate-900">Kontakt teknik</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Për probleme me qasje, role ose të dhëna të pasakta, përdoruesi duhet
          të kontaktojë administratorin e sistemit ose zyrën e IT-së së
          universitetit.
        </p>
      </section>
    </div>
  );
}

export default HelpCenterPage;

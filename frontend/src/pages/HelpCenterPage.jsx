const helpItems = [
  {
    title: "Si ta menaxhoj llogarine?",
    text: "Nga faqja e llogarise mund te ndryshosh te dhenat personale dhe fjalekalimin.",
  },
  {
    title: "Ku i gjej provimet dhe orarin?",
    text: "Secili rol ka modulet e veta ne navigim. Studentet dhe profesoret kane seksione te dedikuara.",
  },
  {
    title: "Pse nuk mund te regjistrohem?",
    text: "Regjistrimi funksionon vetem nese email-i yt ekziston paraprakisht ne bazen e te dhenave.",
  },
];

function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] p-8">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-600">
          Ndihme
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Qendra e ndihmes per perdoruesit
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Nje hapesire e thjeshte ku perdoruesit gjejne pergjigjet me te
          shpejta per perdorimin e sistemit.
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
          Per probleme me qasje, role ose te dhena te pasakta, perdoruesi duhet
          te kontaktoje administratorin e sistemit ose zyren e IT-se se
          universitetit.
        </p>
      </section>
    </div>
  );
}

export default HelpCenterPage;

function BackendStatusBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 shadow-sm">
      <p className="font-semibold">Backend-i nuk po pergjigjet.</p>
      <p className="mt-1 leading-6 text-amber-800">
        Nise serverin e backend-it ne `localhost:5001` qe faqet te marrin te
        dhenat normalisht.
      </p>
      <p className="mt-2 font-mono text-xs text-amber-700">
        cd backend && npm start
      </p>
    </div>
  );
}

export default BackendStatusBanner;

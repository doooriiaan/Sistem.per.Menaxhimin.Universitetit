function PaymentProcessingOverlay({
  show,
  title = "Duke procesuar pagesen",
  message = "Ju lutem pritni pak derisa pagesa te verifikohet.",
}) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-[28px] border border-white/20 bg-white p-6 text-center shadow-[0_32px_100px_rgba(15,23,42,0.35)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-950">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/35 border-t-white" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export default PaymentProcessingOverlay;

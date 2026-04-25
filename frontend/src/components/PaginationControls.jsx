function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPageChange,
}) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <p>
        Po shfaqen {startItem}-{endItem} nga {totalItems} rezultate
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-xl border border-slate-300 px-3 py-2 font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Para
        </button>

        <span className="min-w-[108px] text-center font-medium text-slate-700">
          Faqja {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-xl border border-slate-300 px-3 py-2 font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tjetra
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;

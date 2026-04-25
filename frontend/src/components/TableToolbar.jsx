import { PAGE_SIZE_OPTIONS } from "../utils/table";

function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterValue = "all",
  onFilterChange,
  filterOptions = [],
  pageSize,
  onPageSizeChange,
  totalItems,
}) {
  const hasFilter = filterOptions.length > 1;

  return (
    <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div
        className={`grid gap-3 ${
          hasFilter ? "md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]" : ""
        }`}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Kerko
          </label>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {hasFilter && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Filtri
            </label>
            <select
              value={filterValue}
              onChange={(event) => onFilterChange(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>{totalItems} rezultate</span>
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            / faqe
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TableToolbar;

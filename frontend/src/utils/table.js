export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const normalizeSearchValue = (value) =>
  String(value ?? "").trim().toLowerCase();

export const matchesSearchTerm = (values, searchTerm) => {
  if (!searchTerm) {
    return true;
  }

  return values.some((value) => normalizeSearchValue(value).includes(searchTerm));
};

export const buildFilterOptions = (
  items,
  getValue,
  getLabel,
  allLabel = "Te gjitha"
) => {
  const seenValues = new Set();
  const options = [{ value: "all", label: allLabel }];

  items.forEach((item) => {
    const value = getValue(item);
    const label = getLabel(item);

    if (value === null || value === undefined || value === "" || !label) {
      return;
    }

    const normalizedValue = String(value);

    if (seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    options.push({
      value: normalizedValue,
      label,
    });
  });

  return options;
};

export const paginateItems = (items, currentPage, pageSize) => {
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safeCurrentPage = Math.min(
    Math.max(1, Number(currentPage) || 1),
    totalPages
  );
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + safePageSize, totalItems);

  return {
    items: items.slice(startIndex, endIndex),
    totalItems,
    totalPages,
    currentPage: safeCurrentPage,
    startItem: totalItems === 0 ? 0 : startIndex + 1,
    endItem: endIndex,
  };
};

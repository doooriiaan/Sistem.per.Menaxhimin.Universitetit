export const formatDateInputValue = (value) =>
  value ? String(value).split("T")[0] : "";

export const normalizeFormValue = (name, value, type) => {
  if (type === "number" || name.endsWith("_id")) {
    return value === "" ? "" : Number(value);
  }

  return value;
};

export const getDefaultId = (items, idField) =>
  items.length > 0 ? items[0][idField] : "";

export const formatPersonName = (person) =>
  [person?.emri, person?.mbiemri].filter(Boolean).join(" ");

export const formatCourseName = (course) => {
  if (!course) {
    return "";
  }

  return course.kodi ? `${course.emri} (${course.kodi})` : course.emri;
};

export const buildLookup = (items, idField, getLabel) =>
  items.reduce((lookup, item) => {
    lookup[item[idField]] = getLabel(item);
    return lookup;
  }, {});

export const getLabelById = (lookup, id, entityName) => {
  if (id === null || id === undefined || id === "") {
    return "—";
  }

  return lookup[id] || `${entityName} #${id}`;
};

export const formatExamName = (provimi, lendetLookup, profesoretLookup) => {
  const lenda = getLabelById(lendetLookup, provimi.lende_id, "Lenda");
  const dataProvimit = formatDateInputValue(provimi.data_provimit);
  const profesori = getLabelById(
    profesoretLookup,
    provimi.profesor_id,
    "Profesori"
  );

  return [lenda, dataProvimit, profesori].filter(Boolean).join(" - ");
};

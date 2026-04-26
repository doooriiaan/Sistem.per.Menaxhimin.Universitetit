const createNumberOptions = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => {
    const value = start + index;
    return { value, label: String(value) };
  });

export const withCurrentOption = (options, currentValue) => {
  if (currentValue === null || currentValue === undefined || currentValue === "") {
    return options;
  }

  const exists = options.some(
    (option) => String(option.value) === String(currentValue)
  );

  if (exists) {
    return options;
  }

  return [{ value: currentValue, label: String(currentValue) }, ...options];
};

export const DAY_OPTIONS = [
  { value: "E hene", label: "E hene" },
  { value: "E marte", label: "E marte" },
  { value: "E merkure", label: "E merkure" },
  { value: "E enjte", label: "E enjte" },
  { value: "E premte", label: "E premte" },
  { value: "E shtune", label: "E shtune" },
  { value: "E diele", label: "E diele" },
];

export const COURSE_TYPE_OPTIONS = [
  { value: "Obligative", label: "Obligative" },
  { value: "Zgjedhore", label: "Zgjedhore" },
  { value: "Praktike", label: "Praktike" },
  { value: "Laboratorike", label: "Laboratorike" },
];

export const EXAM_TERM_OPTIONS = [
  { value: "Shkurt", label: "Shkurt" },
  { value: "Qershor", label: "Qershor" },
  { value: "Shtator", label: "Shtator" },
  { value: "Tetor", label: "Tetor" },
  { value: "Janar", label: "Janar" },
];

export const REGISTRATION_STATUS_OPTIONS = [
  { value: "Aktiv", label: "Aktiv" },
  { value: "Ne pritje", label: "Ne pritje" },
  { value: "Perfunduar", label: "Perfunduar" },
  { value: "Anuluar", label: "Anuluar" },
];

export const DEGREE_LEVEL_OPTIONS = [
  { value: "Bachelor", label: "Bachelor" },
  { value: "Master", label: "Master" },
  { value: "Doktorate", label: "Doktorate" },
];

export const ACADEMIC_RANK_OPTIONS = [
  { value: "Prof. Dr.", label: "Prof. Dr." },
  { value: "Prof. Ass.", label: "Prof. Ass." },
  { value: "Lektor", label: "Lektor" },
  { value: "Asistent", label: "Asistent" },
];

export const GENDER_OPTIONS = [
  { value: "M", label: "Mashkull" },
  { value: "F", label: "Femer" },
];

export const SEMESTER_OPTIONS = createNumberOptions(1, 12);
export const STUDY_YEAR_OPTIONS = createNumberOptions(1, 6);
export const PROGRAM_DURATION_OPTIONS = createNumberOptions(1, 5);

export const GRADE_OPTIONS = Array.from({ length: 11 }, (_, index) => {
  const value = 5 + index * 0.5;
  const label = Number.isInteger(value) ? String(value) : value.toFixed(1);

  return { value, label };
});

export const buildAcademicYearOptions = () => {
  const today = new Date();
  const startYear =
    today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;

  return Array.from({ length: 6 }, (_, index) => {
    const year = startYear + index;
    const value = `${year}/${year + 1}`;

    return { value, label: value };
  });
};

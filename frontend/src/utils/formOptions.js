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

export const GENERATION_STATUS_OPTIONS = [
  { value: "Aktive", label: "Aktive" },
  { value: "Diplomuar", label: "Diplomuar" },
  { value: "Arkivuar", label: "Arkivuar" },
];

export const SERVICE_CATEGORY_OPTIONS = [
  { value: "Administrate", label: "Administrate" },
  { value: "Akademike", label: "Akademike" },
  { value: "Identifikim", label: "Identifikim" },
  { value: "Financa", label: "Financa" },
];

export const SERVICE_REQUEST_STATUS_OPTIONS = [
  { value: "Ne pritje", label: "Ne pritje" },
  { value: "Ne shqyrtim", label: "Ne shqyrtim" },
  { value: "Miratuar", label: "Miratuar" },
  { value: "Perfunduar", label: "Perfunduar" },
  { value: "Refuzuar", label: "Refuzuar" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "Ne pritje", label: "Ne pritje" },
  { value: "Paguajtur", label: "Paguajtur" },
  { value: "Nuk kerkohet", label: "Nuk kerkohet" },
  { value: "Rimbursuar", label: "Rimbursuar" },
];

export const OPPORTUNITY_STATUS_OPTIONS = [
  { value: "Hapur", label: "Hapur" },
  { value: "Mbyllur", label: "Mbyllur" },
  { value: "Arkivuar", label: "Arkivuar" },
];

export const APPLICATION_STATUS_OPTIONS = [
  { value: "Ne pritje", label: "Ne pritje" },
  { value: "Ne shqyrtim", label: "Ne shqyrtim" },
  { value: "Pranuar", label: "Pranuar" },
  { value: "Refuzuar", label: "Refuzuar" },
];

export const STUDENT_DOCUMENT_TYPE_OPTIONS = [
  { value: "Certifikata e lindjes", label: "Certifikata e lindjes" },
  { value: "Diploma e shkolles se mesme", label: "Diploma e shkolles se mesme" },
  { value: "Transkripti i shkolles se mesme", label: "Transkripti i shkolles se mesme" },
  { value: "Dokument identifikimi", label: "Dokument identifikimi" },
  { value: "Fotografi per kartel ID", label: "Fotografi per kartel ID" },
  { value: "Dokument shtese", label: "Dokument shtese" },
];

export const SCHOLARSHIP_TYPE_OPTIONS = [
  { value: "Merite", label: "Merite" },
  { value: "Sociale", label: "Sociale" },
  { value: "Hulumtuese", label: "Hulumtuese" },
  { value: "Sportive", label: "Sportive" },
];

export const INTERNSHIP_TYPE_OPTIONS = [
  { value: "Me pagese", label: "Me pagese" },
  { value: "Pa pagese", label: "Pa pagese" },
  { value: "Hibrid", label: "Hibrid" },
];

export const ERASMUS_SEMESTER_OPTIONS = [
  { value: "Dimeror", label: "Dimeror" },
  { value: "Veror", label: "Veror" },
  { value: "Vjetor", label: "Vjetor" },
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

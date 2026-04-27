const isBlank = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "") ||
  value === "";

const isPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
};

const isNullablePositiveInteger = (value) =>
  isBlank(value) || isPositiveInteger(value);

const isValidEmail = (value) =>
  !isBlank(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidDate = (value) => {
  if (isBlank(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isValidTime = (value) =>
  !isBlank(value) && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);

const normalizeTime = (value) => (value.length === 5 ? `${value}:00` : value);

const requiredText = (value, label) =>
  isBlank(value) ? `${label} eshte i detyrueshem.` : null;

const positiveInteger = (value, label, { max } = {}) => {
  if (!isPositiveInteger(value)) {
    return `${label} duhet te jete numer pozitiv.`;
  }

  if (max && Number(value) > max) {
    return `${label} duhet te jete nga 1 deri ne ${max}.`;
  }

  return null;
};

const nullablePositiveInteger = (value, label) =>
  !isNullablePositiveInteger(value) ? `${label} duhet te zgjidhet sakte.` : null;

const validEmail = (value) =>
  !isValidEmail(value) ? "Email nuk eshte valid." : null;

const validDate = (value, label) =>
  !isValidDate(value) ? `${label} nuk eshte valide.` : null;

const validTime = (value, label) =>
  !isValidTime(value) ? `${label} nuk eshte valide.` : null;

const numberRange = (value, label, min, max) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return `${label} duhet te jete nga ${min} deri ne ${max}.`;
  }

  return null;
};

const timeOrder = (startTime, endTime) => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return null;
  }

  return normalizeTime(startTime) < normalizeTime(endTime)
    ? null
    : "Ora e mbarimit duhet te jete pas ores se fillimit.";
};

const runValidators = (...validators) => validators.find(Boolean) || null;

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.code === "ECONNABORTED") {
    return "Backend-i po vonon ose nuk po pergjigjet. Provo perseri pasi ta ndizni serverin.";
  }

  if (!error?.response && error?.request) {
    return "Backend-i nuk po pergjigjet. Nise serverin ne portin 5001 dhe rifresko faqen.";
  }

  return fallbackMessage;
};

export const validateLoginForm = (form) =>
  runValidators(
    validEmail(form.email),
    requiredText(form.password, "Fjalekalimi")
  );

export const validateRegisterForm = (form) =>
  runValidators(
    form.role === "student" || form.role === "profesor"
      ? null
      : "Roli duhet te jete student ose profesor.",
    validEmail(form.email),
    requiredText(form.password, "Fjalekalimi"),
    form.password && form.password.length >= 8
      ? null
      : "Fjalekalimi duhet te kete te pakten 8 karaktere.",
    form.password === form.confirmPassword
      ? null
      : "Fjalekalimet nuk perputhen."
  );

export const validatePasswordChangeForm = (form) =>
  runValidators(
    requiredText(form.currentPassword, "Fjalekalimi aktual"),
    requiredText(form.newPassword, "Fjalekalimi i ri"),
    form.newPassword && form.newPassword.length >= 8
      ? null
      : "Fjalekalimi i ri duhet te kete te pakten 8 karaktere.",
    form.newPassword === form.confirmPassword
      ? null
      : "Fjalekalimet nuk perputhen.",
    form.currentPassword && form.currentPassword === form.newPassword
      ? "Fjalekalimi i ri duhet te jete i ndryshem nga ai aktual."
      : null
  );

export const validateProfessorExamForm = (form) =>
  runValidators(
    positiveInteger(form.lende_id, "Lenda"),
    validDate(form.data_provimit, "Data e provimit"),
    validTime(form.ora, "Ora e provimit"),
    requiredText(form.salla, "Salla"),
    requiredText(form.afati, "Afati")
  );

export const validateProfessorGradeForm = (form, { requireStudent = true } = {}) =>
  runValidators(
    requireStudent ? positiveInteger(form.student_id, "Studenti") : null,
    positiveInteger(form.provimi_id, "Provimi"),
    numberRange(form.nota, "Nota", 5, 10),
    validDate(form.data_vendosjes, "Data e vendosjes")
  );

export const validateStudentForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri"),
    requiredText(form.mbiemri, "Mbiemri"),
    requiredText(form.numri_personal, "Numri personal"),
    validDate(form.data_lindjes, "Data e lindjes"),
    form.gjinia === "M" || form.gjinia === "F"
      ? null
      : "Gjinia duhet te jete M ose F.",
    validEmail(form.email),
    requiredText(form.telefoni, "Telefoni"),
    requiredText(form.adresa, "Adresa"),
    positiveInteger(form.drejtimi_id, "Drejtimi"),
    nullablePositiveInteger(form.gjenerata_id, "Gjenerata"),
    positiveInteger(form.viti_studimit, "Viti i studimit", { max: 6 }),
    requiredText(form.statusi, "Statusi")
  );

export const validateProfesorForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri"),
    requiredText(form.mbiemri, "Mbiemri"),
    requiredText(form.titulli_akademik, "Titulli akademik"),
    positiveInteger(form.departamenti_id, "Departamenti"),
    validEmail(form.email),
    requiredText(form.telefoni, "Telefoni"),
    requiredText(form.specializimi, "Specializimi"),
    validDate(form.data_punesimit, "Data e punesimit")
  );

export const validateLendaForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri"),
    requiredText(form.kodi, "Kodi"),
    positiveInteger(form.kreditet, "Kreditet"),
    positiveInteger(form.semestri, "Semestri", { max: 12 }),
    positiveInteger(form.drejtimi_id, "Drejtimi"),
    positiveInteger(form.profesor_id, "Profesori"),
    requiredText(form.lloji, "Lloji"),
    requiredText(form.pershkrimi, "Pershkrimi")
  );

export const validateDrejtimiForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri"),
    positiveInteger(form.fakulteti_id, "Fakulteti"),
    requiredText(form.niveli, "Niveli"),
    positiveInteger(form.kohezgjatja_vite, "Kohezgjatja"),
    requiredText(form.pershkrimi, "Pershkrimi")
  );

export const validateFakultetiForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri"),
    nullablePositiveInteger(form.dekani_id, "Dekani"),
    requiredText(form.adresa, "Adresa"),
    requiredText(form.telefoni, "Telefoni"),
    validEmail(form.email)
  );

export const validateDepartamentiForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri"),
    positiveInteger(form.fakulteti_id, "Fakulteti"),
    nullablePositiveInteger(form.shefi_id, "Shefi"),
    requiredText(form.pershkrimi, "Pershkrimi")
  );

export const validateRegjistrimiForm = (form) =>
  runValidators(
    positiveInteger(form.student_id, "Studenti"),
    positiveInteger(form.lende_id, "Lenda"),
    positiveInteger(form.semestri, "Semestri", { max: 12 }),
    requiredText(form.viti_akademik, "Viti akademik"),
    requiredText(form.statusi, "Statusi")
  );

export const validateGenerationForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri i gjenerates"),
    positiveInteger(form.viti_regjistrimit, "Viti i regjistrimit"),
    positiveInteger(form.viti_diplomimit, "Viti i diplomimit"),
    Number(form.viti_diplomimit) >= Number(form.viti_regjistrimit)
      ? null
      : "Viti i diplomimit duhet te jete pas vitit te regjistrimit.",
    requiredText(form.statusi, "Statusi"),
    requiredText(form.pershkrimi, "Pershkrimi")
  );

export const validateServiceForm = (form) =>
  runValidators(
    requiredText(form.emri, "Emri i sherbimit"),
    requiredText(form.kategoria, "Kategoria"),
    requiredText(form.pershkrimi, "Pershkrimi"),
    Number.isFinite(Number(form.cmimi)) && Number(form.cmimi) >= 0
      ? null
      : "Cmimi duhet te jete numer valid.",
    requiredText(form.valuta, "Valuta")
  );

export const validateServiceRequestUpdateForm = (form) =>
  runValidators(
    requiredText(form.statusi, "Statusi"),
    requiredText(form.statusi_pageses, "Statusi i pageses")
  );

export const validatePaymentForm = (payment) =>
  runValidators(
    payment
      ? null
      : "Detajet e pageses jane te detyrueshme.",
    requiredText(payment?.cardholderName, "Emri ne kartel"),
    String(payment?.cardNumber || "").replace(/\D/g, "").length >= 12
      ? null
      : "Numri i karteles nuk eshte valid.",
    /^\d{2}$/.test(String(payment?.expiryMonth || "")) &&
    Number(payment?.expiryMonth) >= 1 &&
    Number(payment?.expiryMonth) <= 12
      ? null
      : "Muaji i skadimit nuk eshte valid.",
    /^\d{2,4}$/.test(String(payment?.expiryYear || ""))
      ? null
      : "Viti i skadimit nuk eshte valid.",
    /^\d{3,4}$/.test(String(payment?.cvv || ""))
      ? null
      : "CVV nuk eshte valid."
  );

export const validateStudentServiceRequestForm = (form, { requirePayment = false } = {}) =>
  runValidators(
    positiveInteger(form.sherbimi_id, "Sherbimi"),
    requiredText(form.arsyeja, "Arsyeja"),
    requirePayment ? validatePaymentForm(form.payment) : null
  );

export const validateRepeatRequestForm = (form) =>
  runValidators(
    positiveInteger(form.lende_id, "Lenda"),
    positiveInteger(form.semestri, "Semestri", { max: 12 }),
    requiredText(form.viti_akademik, "Viti akademik"),
    requiredText(form.arsyeja, "Arsyeja"),
    validatePaymentForm(form.payment)
  );

export const validateRepeatUpdateForm = (form) =>
  runValidators(
    requiredText(form.statusi, "Statusi"),
    requiredText(form.statusi_pageses, "Statusi i pageses")
  );

export const validateScholarshipForm = (form) =>
  runValidators(
    requiredText(form.titulli, "Titulli"),
    requiredText(form.pershkrimi, "Pershkrimi"),
    requiredText(form.lloji, "Lloji"),
    Number.isFinite(Number(form.shuma)) && Number(form.shuma) > 0
      ? null
      : "Shuma duhet te jete numer valid.",
    requiredText(form.kriteret, "Kriteret"),
    validDate(form.afati_aplikimit, "Afati i aplikimit"),
    requiredText(form.statusi, "Statusi")
  );

export const validateApplicationStatusForm = (form) =>
  runValidators(requiredText(form.statusi, "Statusi"));

export const validateScholarshipApplicationForm = (form) =>
  runValidators(
    positiveInteger(form.bursa_id, "Bursa"),
    requiredText(form.motivimi, "Motivimi")
  );

export const validateInternshipForm = (form) =>
  runValidators(
    requiredText(form.kompania, "Kompania"),
    requiredText(form.pozita, "Pozita"),
    requiredText(form.pershkrimi, "Pershkrimi"),
    requiredText(form.lokacioni, "Lokacioni"),
    requiredText(form.kompensimi, "Kompensimi"),
    requiredText(form.lloji, "Lloji"),
    validDate(form.afati_aplikimit, "Afati i aplikimit"),
    requiredText(form.statusi, "Statusi")
  );

export const validateInternshipApplicationForm = (form) =>
  runValidators(
    positiveInteger(form.praktika_id, "Praktika"),
    requiredText(form.mesazh, "Mesazhi")
  );

export const validateErasmusForm = (form) =>
  runValidators(
    requiredText(form.universiteti, "Universiteti"),
    requiredText(form.shteti, "Shteti"),
    requiredText(form.semestri, "Semestri"),
    requiredText(form.viti_akademik, "Viti akademik"),
    requiredText(form.financimi, "Financimi"),
    requiredText(form.pershkrimi, "Pershkrimi"),
    validDate(form.afati_aplikimit, "Afati i aplikimit"),
    requiredText(form.statusi, "Statusi")
  );

export const validateErasmusApplicationForm = (form) =>
  runValidators(
    positiveInteger(form.erasmus_id, "Programi Erasmus"),
    requiredText(form.motivimi, "Motivimi")
  );

export const validateRegistrationDocumentForm = (form) =>
  runValidators(
    requiredText(form.emri_dokumentit, "Emri i dokumentit"),
    form.file ? null : "Skedari eshte i detyrueshem."
  );

export const validateStudentDocumentForm = (form) =>
  runValidators(
    requiredText(form.lloji_dokumentit, "Lloji i dokumentit"),
    form.file ? null : "Skedari eshte i detyrueshem."
  );

export const validateProvimiForm = (form) =>
  runValidators(
    positiveInteger(form.lende_id, "Lenda"),
    positiveInteger(form.profesor_id, "Profesori"),
    validDate(form.data_provimit, "Data e provimit"),
    validTime(form.ora, "Ora e provimit"),
    requiredText(form.salla, "Salla"),
    requiredText(form.afati, "Afati")
  );

export const validateNotaForm = (form) =>
  runValidators(
    positiveInteger(form.student_id, "Studenti"),
    positiveInteger(form.provimi_id, "Provimi"),
    numberRange(form.nota, "Nota", 5, 10),
    validDate(form.data_vendosjes, "Data e vendosjes")
  );

export const validateOrariForm = (form) =>
  runValidators(
    positiveInteger(form.lende_id, "Lenda"),
    positiveInteger(form.profesor_id, "Profesori"),
    requiredText(form.dita, "Dita"),
    validTime(form.ora_fillimit, "Ora e fillimit"),
    validTime(form.ora_mbarimit, "Ora e mbarimit"),
    timeOrder(form.ora_fillimit, form.ora_mbarimit),
    requiredText(form.salla, "Salla")
  );

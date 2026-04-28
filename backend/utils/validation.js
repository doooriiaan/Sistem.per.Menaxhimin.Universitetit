const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim() !== "";

const isPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
};

const isNullablePositiveInteger = (value) =>
  value === null || value === undefined || value === "" || isPositiveInteger(value);

const isValidEmail = (value) =>
  isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidDate = (value) => {
  if (!isNonEmptyString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isValidTime = (value) =>
  isNonEmptyString(value) && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);

const isEnumValue = (value, allowedValues) => allowedValues.includes(value);

const isNumberInRange = (value, min, max) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
};

const areTimesOrdered = (startTime, endTime) => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  const normalize = (time) => (time.length === 5 ? `${time}:00` : time);

  return normalize(startTime) < normalize(endTime);
};

const sendValidationError = (res, message) =>
  res.status(400).json({ success: false, message });

const getDuplicateEntryMessage = (err) => {
  const errorMessage = err?.sqlMessage || err?.message || "";

  if (errorMessage.includes("uq_studentet_numri_personal")) {
    return "Ky numer personal ekziston tashme.";
  }

  if (errorMessage.includes("uq_studentet_email")) {
    return "Ky email studenti ekziston tashme.";
  }

  if (errorMessage.includes("uq_profesoret_email")) {
    return "Ky email profesori ekziston tashme.";
  }

  if (
    errorMessage.includes("uq_notat_student_provimi") ||
    errorMessage.includes("student_id") && errorMessage.includes("provimi_id")
  ) {
    return "Ky student e ka tashme nje note per kete provim.";
  }

  if (
    errorMessage.includes("uq_regjistrimet_student_lende_viti") ||
    errorMessage.includes("student_id") && errorMessage.includes("viti_akademik")
  ) {
    return "Ky student eshte tashme i regjistruar ne kete lende per kete vit akademik.";
  }

  if (errorMessage.includes("uq_aplikimet_bursave_student")) {
    return "Studenti ka aplikuar tashme per kete burse.";
  }

  if (errorMessage.includes("uq_aplikimet_praktikave_student")) {
    return "Studenti ka aplikuar tashme per kete praktike.";
  }

  if (errorMessage.includes("uq_aplikimet_erasmus_student")) {
    return "Studenti ka aplikuar tashme per kete program Erasmus.";
  }

  if (errorMessage.includes("email")) {
    return "Ky email ekziston tashme.";
  }

  if (errorMessage.includes("kodi")) {
    return "Ky kod i lendes ekziston tashme.";
  }

  return "Ky rekord ekziston tashme.";
};

const handleDbError = (res, err, fallbackMessage) => {
  console.error(err);

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: getDuplicateEntryMessage(err),
    });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
    return res.status(400).json({
      success: false,
      message: "Nje lidhje me nje rekord tjeter nuk eshte e vlefshme.",
    });
  }

  if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
    return res.status(409).json({
      success: false,
      message: "Ky rekord nuk mund te fshihet sepse po perdoret nga te dhena te tjera.",
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage || "Ndodhi nje gabim ne databaze.",
  });
};

module.exports = {
  areTimesOrdered,
  handleDbError,
  isEnumValue,
  isNonEmptyString,
  isNullablePositiveInteger,
  isNumberInRange,
  isPositiveInteger,
  isValidDate,
  isValidEmail,
  isValidTime,
  sendValidationError,
};

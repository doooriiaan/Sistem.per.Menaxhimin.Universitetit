const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");
const { buildFileUrl, saveBase64Upload } = require("../utils/fileStorage");

const connection = db.promise();

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maskCardNumber = (cardNumber) => {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  return digits.length >= 4 ? `**** ${digits.slice(-4)}` : null;
};

const generatePaymentReference = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

const validatePaymentPayload = (payment, { required = true } = {}) => {
  if (!required) {
    return null;
  }

  const cardNumber = String(payment?.cardNumber || "").replace(/\D/g, "");
  const cardholderName = String(payment?.cardholderName || "").trim();
  const expiryMonth = String(payment?.expiryMonth || "").trim();
  const expiryYear = String(payment?.expiryYear || "").trim();
  const cvv = String(payment?.cvv || "").trim();

  if (cardNumber.length < 12 || cardNumber.length > 19) {
    return "Numri i karteles nuk eshte valid.";
  }

  if (!cardholderName) {
    return "Emri ne kartel eshte i detyrueshem.";
  }

  if (!/^\d{2}$/.test(expiryMonth) || Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
    return "Muaji i skadimit nuk eshte valid.";
  }

  if (!/^\d{2,4}$/.test(expiryYear)) {
    return "Viti i skadimit nuk eshte valid.";
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    return "CVV nuk eshte valid.";
  }

  return null;
};

const getRegistrationByStudent = async (studentId, registrationId) => {
  const [rows] = await connection.query(
    `
      SELECT r.*, l.emri AS lenda
      FROM regjistrimet r
      JOIN lendet l ON r.lende_id = l.lende_id
      WHERE r.regjistrimi_id = ? AND r.student_id = ?
      LIMIT 1
    `,
    [registrationId, studentId]
  );

  return rows[0] || null;
};

const getStudentServices = async (req, res) => {
  try {
    const [services, requests] = await Promise.all([
      connection.query(
        `
          SELECT *
          FROM sherbimet_studentore
          WHERE aktiv = 1
          ORDER BY kategoria, emri
        `
      ),
      connection.query(
        `
          SELECT
            k.*,
            s.emri AS sherbimi,
            s.kategoria,
            s.valuta
          FROM kerkesat_sherbimeve k
          JOIN sherbimet_studentore s ON k.sherbimi_id = s.sherbimi_id
          WHERE k.student_id = ?
          ORDER BY k.requested_at DESC
        `,
        [req.user.student_id]
      ),
    ]);

    res.json({
      services: services[0],
      requests: requests[0],
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se sherbimeve studentore.");
  }
};

const createStudentServiceRequest = async (req, res) => {
  const { sherbimi_id, arsyeja, payment } = req.body;

  if (!isPositiveInteger(sherbimi_id)) {
    return sendValidationError(res, "Sherbimi duhet te zgjidhet sakte.");
  }

  if (!isNonEmptyString(arsyeja)) {
    return sendValidationError(res, "Arsyeja eshte e detyrueshme.");
  }

  try {
    const [serviceRows] = await connection.query(
      `
        SELECT *
        FROM sherbimet_studentore
        WHERE sherbimi_id = ? AND aktiv = 1
        LIMIT 1
      `,
      [sherbimi_id]
    );

    const service = serviceRows[0];

    if (!service) {
      return res.status(404).json({ message: "Sherbimi nuk u gjet." });
    }

    const requiresPayment = Number(service.cmimi) > 0;
    const paymentError = validatePaymentPayload(payment, {
      required: requiresPayment,
    });

    if (paymentError) {
      return sendValidationError(res, paymentError);
    }

    const reference = requiresPayment
      ? generatePaymentReference("SRV")
      : null;

    const [result] = await connection.query(
      `
        INSERT INTO kerkesat_sherbimeve
          (sherbimi_id, student_id, arsyeja, statusi, statusi_pageses, metoda_pageses, karta_maskuar, reference_pagese, shuma_paguar, paid_at)
        VALUES (?, ?, ?, 'Ne pritje', ?, ?, ?, ?, ?, ?)
      `,
      [
        sherbimi_id,
        req.user.student_id,
        arsyeja.trim(),
        requiresPayment ? "Paguajtur" : "Nuk kerkohet",
        requiresPayment ? "Kartel" : null,
        requiresPayment ? maskCardNumber(payment.cardNumber) : null,
        reference,
        requiresPayment ? Number(service.cmimi) : 0,
        requiresPayment ? new Date() : null,
      ]
    );

    res.status(201).json({
      message: "Kerkesa per sherbim u dergua me sukses.",
      id: result.insertId,
      reference,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate krijimit te kerkeses.");
  }
};

const getRetakeCourses = async (req, res) => {
  try {
    const [rows] = await connection.query(
      `
        SELECT
          l.lende_id,
          l.emri,
          l.kodi,
          l.kreditet,
          MAX(r.semestri) AS semestri,
          MAX(r.viti_akademik) AS viti_akademik_i_fundit,
          MAX(n.nota) AS nota_me_e_fundit
        FROM regjistrimet r
        JOIN lendet l ON r.lende_id = l.lende_id
        LEFT JOIN provimet p ON p.lende_id = r.lende_id
        LEFT JOIN notat n ON n.provimi_id = p.provimi_id AND n.student_id = r.student_id
        WHERE r.student_id = ?
        GROUP BY l.lende_id, l.emri, l.kodi, l.kreditet
        ORDER BY l.emri
      `,
      [req.user.student_id]
    );

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se lendeve per rindjekje.");
  }
};

const getStudentRetakeRequests = async (req, res) => {
  try {
    const [rows] = await connection.query(
      `
        SELECT
          r.*,
          l.emri AS lenda,
          l.kodi,
          l.kreditet
        FROM rindjekjet_lendeve r
        JOIN lendet l ON r.lende_id = l.lende_id
        WHERE r.student_id = ?
        ORDER BY r.requested_at DESC
      `,
      [req.user.student_id]
    );

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se kerkesave per rindjekje.");
  }
};

const createRetakeRequest = async (req, res) => {
  const { lende_id, semestri, viti_akademik, arsyeja, payment } = req.body;

  if (!isPositiveInteger(lende_id)) {
    return sendValidationError(res, "Lenda duhet te zgjidhet sakte.");
  }

  if (!isPositiveInteger(semestri)) {
    return sendValidationError(res, "Semestri duhet te jete valid.");
  }

  if (!isNonEmptyString(viti_akademik)) {
    return sendValidationError(res, "Viti akademik eshte i detyrueshem.");
  }

  if (!isNonEmptyString(arsyeja)) {
    return sendValidationError(res, "Arsyeja eshte e detyrueshme.");
  }

  try {
    const [courseRows] = await connection.query(
      `
        SELECT l.*
        FROM lendet l
        JOIN regjistrimet r ON r.lende_id = l.lende_id
        WHERE l.lende_id = ? AND r.student_id = ?
        LIMIT 1
      `,
      [lende_id, req.user.student_id]
    );

    const course = courseRows[0];

    if (!course) {
      return res.status(404).json({
        message: "Kjo lende nuk eshte e lidhur me regjistrimet e studentit.",
      });
    }

    const paymentError = validatePaymentPayload(payment, { required: true });

    if (paymentError) {
      return sendValidationError(res, paymentError);
    }

    const amountDue = Number(course.kreditet) * 15;
    const reference = generatePaymentReference("RND");

    const [result] = await connection.query(
      `
        INSERT INTO rindjekjet_lendeve
          (student_id, lende_id, semestri, viti_akademik, arsyeja, statusi, statusi_pageses, karta_maskuar, reference_pagese, shuma_detyrimit, shuma_paguar)
        VALUES (?, ?, ?, ?, ?, 'Ne pritje', 'Paguajtur', ?, ?, ?, ?)
      `,
      [
        req.user.student_id,
        lende_id,
        semestri,
        viti_akademik.trim(),
        arsyeja.trim(),
        maskCardNumber(payment.cardNumber),
        reference,
        amountDue,
        amountDue,
      ]
    );

    res.status(201).json({
      message: "Kerkesa per rindjekje u dergua me sukses.",
      id: result.insertId,
      reference,
      amountDue,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate krijimit te rindjekjes.");
  }
};

const getRegistrationDocuments = async (req, res) => {
  try {
    const registration = await getRegistrationByStudent(
      req.user.student_id,
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet." });
    }

    const [rows] = await connection.query(
      `
        SELECT *
        FROM regjistrim_dokumentet
        WHERE regjistrimi_id = ?
        ORDER BY uploaded_at DESC
      `,
      [req.params.id]
    );

    res.json(
      rows.map((row) => ({
        ...row,
        download_url: buildFileUrl(req, row.file_path),
      }))
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se dokumenteve.");
  }
};

const uploadRegistrationDocument = async (req, res) => {
  const { emri_dokumentit, file } = req.body;

  if (!file?.dataUrl || !file?.originalName) {
    return sendValidationError(res, "Skedari per ngarkim eshte i detyrueshem.");
  }

  try {
    const registration = await getRegistrationByStudent(
      req.user.student_id,
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet." });
    }

    const stored = saveBase64Upload(file, {
      directory: `regjistrimet/student-${req.user.student_id}/regjistrim-${req.params.id}`,
      allowedMimeTypes: DOCUMENT_MIME_TYPES,
    });

    const label = isNonEmptyString(emri_dokumentit)
      ? emri_dokumentit.trim()
      : stored.originalName;

    const [result] = await connection.query(
      `
        INSERT INTO regjistrim_dokumentet
          (regjistrimi_id, student_id, emri_dokumentit, file_name, original_name, file_path, mime_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.params.id,
        req.user.student_id,
        label,
        stored.fileName,
        stored.originalName,
        stored.filePath,
        stored.mimeType,
        stored.fileSize,
      ]
    );

    res.status(201).json({
      message: "Dokumenti u ngarkua me sukses.",
      id: result.insertId,
      download_url: buildFileUrl(req, stored.filePath),
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Gabim gjate ngarkimit te dokumentit.";

    if (message !== "Gabim gjate ngarkimit te dokumentit.") {
      return res.status(400).json({ message });
    }

    return handleDbError(res, err, message);
  }
};

const getStudentBaseDocuments = async (req, res) => {
  try {
    const [rows] = await connection.query(
      `
        SELECT *
        FROM student_dokumentet
        WHERE student_id = ?
        ORDER BY uploaded_at DESC
      `,
      [req.user.student_id]
    );

    res.json(
      rows.map((row) => ({
        ...row,
        download_url: buildFileUrl(req, row.file_path),
      }))
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se dokumenteve baze.");
  }
};

const uploadStudentBaseDocument = async (req, res) => {
  const { lloji_dokumentit, file } = req.body;

  if (!isNonEmptyString(lloji_dokumentit)) {
    return sendValidationError(res, "Lloji i dokumentit eshte i detyrueshem.");
  }

  if (!file?.dataUrl || !file?.originalName) {
    return sendValidationError(res, "Skedari per ngarkim eshte i detyrueshem.");
  }

  try {
    const stored = saveBase64Upload(file, {
      directory: `studentet/student-${req.user.student_id}/dokumente`,
      allowedMimeTypes: DOCUMENT_MIME_TYPES,
    });

    const [result] = await connection.query(
      `
        INSERT INTO student_dokumentet
          (student_id, lloji_dokumentit, file_name, original_name, file_path, mime_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.student_id,
        lloji_dokumentit.trim(),
        stored.fileName,
        stored.originalName,
        stored.filePath,
        stored.mimeType,
        stored.fileSize,
      ]
    );

    res.status(201).json({
      message: "Dokumenti baze u ngarkua me sukses.",
      id: result.insertId,
      download_url: buildFileUrl(req, stored.filePath),
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Gabim gjate ngarkimit te dokumentit baze.";

    if (message !== "Gabim gjate ngarkimit te dokumentit baze.") {
      return res.status(400).json({ message });
    }

    return handleDbError(res, err, message);
  }
};

module.exports = {
  createRetakeRequest,
  createStudentServiceRequest,
  getStudentBaseDocuments,
  getRegistrationDocuments,
  getRetakeCourses,
  getStudentRetakeRequests,
  getStudentServices,
  uploadStudentBaseDocument,
  uploadRegistrationDocument,
};

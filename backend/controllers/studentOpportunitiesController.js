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

const getStudentContext = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT student_id, drejtimi_id
      FROM studentet
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  return rows[0] || null;
};

const saveOptionalDocument = (file, directory) => {
  if (!file?.dataUrl || !file?.originalName) {
    return null;
  }

  return saveBase64Upload(file, {
    directory,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
  });
};

const mapApplicationDocuments = (req, rows) =>
  rows.map((row) => ({
    ...row,
    dokument_url: buildFileUrl(req, row.dokument_path),
  }));

const getStudentBursat = async (req, res) => {
  try {
    const [offers, applications] = await Promise.all([
      connection.query(
        `
          SELECT *
          FROM bursat
          WHERE statusi = 'Hapur'
          ORDER BY afati_aplikimit ASC, titulli
        `
      ),
      connection.query(
        `
          SELECT
            a.*,
            b.titulli,
            b.lloji,
            b.shuma
          FROM aplikimet_bursave a
          JOIN bursat b ON a.bursa_id = b.bursa_id
          WHERE a.student_id = ?
          ORDER BY a.applied_at DESC
        `,
        [req.user.student_id]
      ),
    ]);

    res.json({
      offers: offers[0],
      applications: mapApplicationDocuments(req, applications[0]),
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se bursave.");
  }
};

const applyToBursa = async (req, res) => {
  const { bursa_id, motivimi, dokument } = req.body;

  if (!isPositiveInteger(bursa_id)) {
    return sendValidationError(res, "Bursa duhet te zgjidhet sakte.");
  }

  if (!isNonEmptyString(motivimi)) {
    return sendValidationError(res, "Motivimi eshte i detyrueshem.");
  }

  try {
    const [offerRows] = await connection.query(
      `
        SELECT *
        FROM bursat
        WHERE bursa_id = ? AND statusi = 'Hapur'
        LIMIT 1
      `,
      [bursa_id]
    );

    if (!offerRows.length) {
      return res.status(404).json({ message: "Bursa nuk u gjet ose nuk eshte aktive." });
    }

    const stored = saveOptionalDocument(
      dokument,
      `bursat/student-${req.user.student_id}`
    );

    const [result] = await connection.query(
      `
        INSERT INTO aplikimet_bursave
          (bursa_id, student_id, motivimi, statusi, dokument_name, dokument_path, dokument_mime, dokument_size)
        VALUES (?, ?, ?, 'Ne pritje', ?, ?, ?, ?)
      `,
      [
        bursa_id,
        req.user.student_id,
        motivimi.trim(),
        stored?.originalName || null,
        stored?.filePath || null,
        stored?.mimeType || null,
        stored?.fileSize || null,
      ]
    );

    res.status(201).json({
      message: "Aplikimi per burse u dergua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Lloji i skedarit nuk lejohet."
        ? err.message
        : null;

    if (message) {
      return res.status(400).json({ message });
    }

    return handleDbError(res, err, "Gabim gjate aplikimit per burse.");
  }
};

const getStudentPraktikat = async (req, res) => {
  try {
    const student = await getStudentContext(req.user.student_id);
    const directionId = student?.drejtimi_id || null;
    const [offers, applications] = await Promise.all([
      connection.query(
        `
          SELECT p.*, d.emri AS drejtimi
          FROM praktikat p
          LEFT JOIN drejtimet d ON p.drejtimi_id = d.drejtim_id
          WHERE p.statusi = 'Hapur' AND (p.drejtimi_id IS NULL OR p.drejtimi_id = ?)
          ORDER BY p.afati_aplikimit ASC, p.kompania
        `,
        [directionId]
      ),
      connection.query(
        `
          SELECT
            a.*,
            p.kompania,
            p.pozita,
            p.lokacioni
          FROM aplikimet_praktikave a
          JOIN praktikat p ON a.praktika_id = p.praktika_id
          WHERE a.student_id = ?
          ORDER BY a.applied_at DESC
        `,
        [req.user.student_id]
      ),
    ]);

    res.json({
      offers: offers[0],
      applications: mapApplicationDocuments(req, applications[0]),
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se praktikave.");
  }
};

const applyToPraktika = async (req, res) => {
  const { praktika_id, mesazh, dokument } = req.body;

  if (!isPositiveInteger(praktika_id)) {
    return sendValidationError(res, "Praktika duhet te zgjidhet sakte.");
  }

  if (!isNonEmptyString(mesazh)) {
    return sendValidationError(res, "Mesazhi eshte i detyrueshem.");
  }

  try {
    const [offerRows] = await connection.query(
      `
        SELECT *
        FROM praktikat
        WHERE praktika_id = ? AND statusi = 'Hapur'
        LIMIT 1
      `,
      [praktika_id]
    );

    if (!offerRows.length) {
      return res.status(404).json({ message: "Praktika nuk u gjet ose nuk eshte aktive." });
    }

    const stored = saveOptionalDocument(
      dokument,
      `praktikat/student-${req.user.student_id}`
    );

    const [result] = await connection.query(
      `
        INSERT INTO aplikimet_praktikave
          (praktika_id, student_id, mesazh, statusi, dokument_name, dokument_path, dokument_mime, dokument_size)
        VALUES (?, ?, ?, 'Ne pritje', ?, ?, ?, ?)
      `,
      [
        praktika_id,
        req.user.student_id,
        mesazh.trim(),
        stored?.originalName || null,
        stored?.filePath || null,
        stored?.mimeType || null,
        stored?.fileSize || null,
      ]
    );

    res.status(201).json({
      message: "Aplikimi per praktike u dergua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Lloji i skedarit nuk lejohet."
        ? err.message
        : null;

    if (message) {
      return res.status(400).json({ message });
    }

    return handleDbError(res, err, "Gabim gjate aplikimit per praktike.");
  }
};

const getStudentErasmusPrograms = async (req, res) => {
  try {
    const student = await getStudentContext(req.user.student_id);
    const directionId = student?.drejtimi_id || null;
    const [offers, applications] = await Promise.all([
      connection.query(
        `
          SELECT e.*, d.emri AS drejtimi
          FROM programet_erasmus e
          LEFT JOIN drejtimet d ON e.drejtimi_id = d.drejtim_id
          WHERE e.statusi = 'Hapur' AND (e.drejtimi_id IS NULL OR e.drejtimi_id = ?)
          ORDER BY e.afati_aplikimit ASC, e.universiteti
        `,
        [directionId]
      ),
      connection.query(
        `
          SELECT
            a.*,
            e.universiteti,
            e.shteti,
            e.viti_akademik
          FROM aplikimet_erasmus a
          JOIN programet_erasmus e ON a.erasmus_id = e.erasmus_id
          WHERE a.student_id = ?
          ORDER BY a.applied_at DESC
        `,
        [req.user.student_id]
      ),
    ]);

    res.json({
      offers: offers[0],
      applications: mapApplicationDocuments(req, applications[0]),
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se programeve Erasmus.");
  }
};

const applyToErasmus = async (req, res) => {
  const { erasmus_id, motivimi, dokument } = req.body;

  if (!isPositiveInteger(erasmus_id)) {
    return sendValidationError(res, "Programi Erasmus duhet te zgjidhet sakte.");
  }

  if (!isNonEmptyString(motivimi)) {
    return sendValidationError(res, "Motivimi eshte i detyrueshem.");
  }

  try {
    const [offerRows] = await connection.query(
      `
        SELECT *
        FROM programet_erasmus
        WHERE erasmus_id = ? AND statusi = 'Hapur'
        LIMIT 1
      `,
      [erasmus_id]
    );

    if (!offerRows.length) {
      return res.status(404).json({
        message: "Programi Erasmus nuk u gjet ose nuk eshte aktiv.",
      });
    }

    const stored = saveOptionalDocument(
      dokument,
      `erasmus/student-${req.user.student_id}`
    );

    const [result] = await connection.query(
      `
        INSERT INTO aplikimet_erasmus
          (erasmus_id, student_id, motivimi, statusi, dokument_name, dokument_path, dokument_mime, dokument_size)
        VALUES (?, ?, ?, 'Ne pritje', ?, ?, ?, ?)
      `,
      [
        erasmus_id,
        req.user.student_id,
        motivimi.trim(),
        stored?.originalName || null,
        stored?.filePath || null,
        stored?.mimeType || null,
        stored?.fileSize || null,
      ]
    );

    res.status(201).json({
      message: "Aplikimi per Erasmus u dergua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Lloji i skedarit nuk lejohet."
        ? err.message
        : null;

    if (message) {
      return res.status(400).json({ message });
    }

    return handleDbError(res, err, "Gabim gjate aplikimit per Erasmus.");
  }
};

module.exports = {
  applyToBursa,
  applyToErasmus,
  applyToPraktika,
  getStudentBursat,
  getStudentErasmusPrograms,
  getStudentPraktikat,
};

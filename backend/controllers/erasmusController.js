const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isNullablePositiveInteger,
  isValidDate,
  sendValidationError,
} = require("../utils/validation");
const { buildFileUrl } = require("../utils/fileStorage");

const connection = db.promise();

const validateErasmusPayload = (payload) => {
  const {
    universiteti,
    shteti,
    semestri,
    viti_akademik,
    financimi,
    pershkrimi,
    afati_aplikimit,
    statusi,
    drejtimi_id,
  } = payload;

  if (!isNonEmptyString(universiteti)) return "Universiteti eshte i detyrueshem.";
  if (!isNonEmptyString(shteti)) return "Shteti eshte i detyrueshem.";
  if (!isNonEmptyString(semestri)) return "Semestri eshte i detyrueshem.";
  if (!isNonEmptyString(viti_akademik)) return "Viti akademik eshte i detyrueshem.";
  if (!isNonEmptyString(financimi)) return "Financimi eshte i detyrueshem.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";
  if (!isValidDate(afati_aplikimit)) return "Afati i aplikimit nuk eshte valid.";
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";
  if (!isNullablePositiveInteger(drejtimi_id)) return "Drejtimi duhet te jete valid.";

  return null;
};

const validateApplicationUpdate = (payload) => {
  if (!isNonEmptyString(payload.statusi)) return "Statusi eshte i detyrueshem.";
  return null;
};

const getAllErasmusPrograms = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        e.*,
        d.emri AS drejtimi,
        (
          SELECT COUNT(*)
          FROM aplikimet_erasmus a
          WHERE a.erasmus_id = e.erasmus_id
        ) AS total_aplikimeve
      FROM programet_erasmus e
      LEFT JOIN drejtimet d ON e.drejtimi_id = d.drejtim_id
      ORDER BY e.afati_aplikimit ASC, e.universiteti
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se programeve Erasmus.");
  }
};

const createErasmusProgram = async (req, res) => {
  const validationError = validateErasmusPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    universiteti,
    shteti,
    semestri,
    viti_akademik,
    financimi,
    pershkrimi,
    afati_aplikimit,
    statusi,
    drejtimi_id = null,
  } = req.body;

  try {
    const [result] = await connection.query(
      `
        INSERT INTO programet_erasmus
          (universiteti, shteti, semestri, viti_akademik, financimi, pershkrimi, afati_aplikimit, statusi, drejtimi_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        universiteti,
        shteti,
        semestri,
        viti_akademik,
        financimi,
        pershkrimi,
        afati_aplikimit,
        statusi,
        drejtimi_id || null,
      ]
    );

    res.status(201).json({
      message: "Programi Erasmus u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te programit Erasmus.");
  }
};

const updateErasmusProgram = async (req, res) => {
  const validationError = validateErasmusPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    universiteti,
    shteti,
    semestri,
    viti_akademik,
    financimi,
    pershkrimi,
    afati_aplikimit,
    statusi,
    drejtimi_id = null,
  } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE programet_erasmus
        SET universiteti = ?, shteti = ?, semestri = ?, viti_akademik = ?, financimi = ?, pershkrimi = ?, afati_aplikimit = ?, statusi = ?, drejtimi_id = ?
        WHERE erasmus_id = ?
      `,
      [
        universiteti,
        shteti,
        semestri,
        viti_akademik,
        financimi,
        pershkrimi,
        afati_aplikimit,
        statusi,
        drejtimi_id || null,
        req.params.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Programi Erasmus nuk u gjet." });
    }

    res.json({ message: "Programi Erasmus u perditesua me sukses." });
  } catch (err) {
    return handleDbError(
      res,
      err,
      "Gabim gjate perditesimit te programit Erasmus."
    );
  }
};

const deleteErasmusProgram = async (req, res) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM programet_erasmus WHERE erasmus_id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Programi Erasmus nuk u gjet." });
    }

    res.json({ message: "Programi Erasmus u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se programit Erasmus.");
  }
};

const getErasmusApplications = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        a.*,
        e.universiteti,
        e.shteti,
        e.viti_akademik,
        st.emri AS studenti_emri,
        st.mbiemri AS studenti_mbiemri,
        st.email AS studenti_email
      FROM aplikimet_erasmus a
      JOIN programet_erasmus e ON a.erasmus_id = e.erasmus_id
      JOIN studentet st ON a.student_id = st.student_id
      ORDER BY a.applied_at DESC
    `);

    res.json(
      rows.map((row) => ({
        ...row,
        dokument_url: buildFileUrl(req, row.dokument_path),
      }))
    );
  } catch (err) {
    return handleDbError(
      res,
      err,
      "Gabim gjate marrjes se aplikimeve Erasmus."
    );
  }
};

const updateErasmusApplication = async (req, res) => {
  const validationError = validateApplicationUpdate(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { statusi, shenime_admin = "" } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE aplikimet_erasmus
        SET statusi = ?, shenime_admin = ?
        WHERE aplikimi_id = ?
      `,
      [statusi, shenime_admin, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Aplikimi nuk u gjet." });
    }

    res.json({ message: "Aplikimi u perditesua me sukses." });
  } catch (err) {
    return handleDbError(
      res,
      err,
      "Gabim gjate perditesimit te aplikimit Erasmus."
    );
  }
};

module.exports = {
  createErasmusProgram,
  deleteErasmusProgram,
  getAllErasmusPrograms,
  getErasmusApplications,
  updateErasmusApplication,
  updateErasmusProgram,
};

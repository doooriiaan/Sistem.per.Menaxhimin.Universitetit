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

const validateInternshipPayload = (payload) => {
  const {
    kompania,
    pozita,
    pershkrimi,
    lokacioni,
    kompensimi,
    lloji,
    afati_aplikimit,
    statusi,
    drejtimi_id,
  } = payload;

  if (!isNonEmptyString(kompania)) return "Kompania eshte e detyrueshme.";
  if (!isNonEmptyString(pozita)) return "Pozita eshte e detyrueshme.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";
  if (!isNonEmptyString(lokacioni)) return "Lokacioni eshte i detyrueshem.";
  if (!isNonEmptyString(kompensimi)) return "Kompensimi eshte i detyrueshem.";
  if (!isNonEmptyString(lloji)) return "Lloji eshte i detyrueshem.";
  if (!isValidDate(afati_aplikimit)) return "Afati i aplikimit nuk eshte valid.";
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";
  if (!isNullablePositiveInteger(drejtimi_id)) return "Drejtimi duhet te jete valid.";

  return null;
};

const validateInternshipApplicationUpdate = (payload) => {
  if (!isNonEmptyString(payload.statusi)) return "Statusi eshte i detyrueshem.";
  return null;
};

const getAllPraktikat = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        p.*,
        d.emri AS drejtimi,
        (
          SELECT COUNT(*)
          FROM aplikimet_praktikave a
          WHERE a.praktika_id = p.praktika_id
        ) AS total_aplikimeve
      FROM praktikat p
      LEFT JOIN drejtimet d ON p.drejtimi_id = d.drejtim_id
      ORDER BY p.afati_aplikimit ASC, p.pozita
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se praktikave.");
  }
};

const createPraktika = async (req, res) => {
  const validationError = validateInternshipPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    kompania,
    pozita,
    pershkrimi,
    lokacioni,
    kompensimi,
    lloji,
    afati_aplikimit,
    statusi,
    drejtimi_id = null,
  } = req.body;

  try {
    const [result] = await connection.query(
      `
        INSERT INTO praktikat
          (kompania, pozita, pershkrimi, lokacioni, kompensimi, lloji, afati_aplikimit, statusi, drejtimi_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        kompania,
        pozita,
        pershkrimi,
        lokacioni,
        kompensimi,
        lloji,
        afati_aplikimit,
        statusi,
        drejtimi_id || null,
      ]
    );

    res.status(201).json({
      message: "Praktika u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te praktikes.");
  }
};

const updatePraktika = async (req, res) => {
  const validationError = validateInternshipPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    kompania,
    pozita,
    pershkrimi,
    lokacioni,
    kompensimi,
    lloji,
    afati_aplikimit,
    statusi,
    drejtimi_id = null,
  } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE praktikat
        SET kompania = ?, pozita = ?, pershkrimi = ?, lokacioni = ?, kompensimi = ?, lloji = ?, afati_aplikimit = ?, statusi = ?, drejtimi_id = ?
        WHERE praktika_id = ?
      `,
      [
        kompania,
        pozita,
        pershkrimi,
        lokacioni,
        kompensimi,
        lloji,
        afati_aplikimit,
        statusi,
        drejtimi_id || null,
        req.params.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Praktika nuk u gjet." });
    }

    res.json({ message: "Praktika u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te praktikes.");
  }
};

const deletePraktika = async (req, res) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM praktikat WHERE praktika_id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Praktika nuk u gjet." });
    }

    res.json({ message: "Praktika u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se praktikes.");
  }
};

const getInternshipApplications = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        a.*,
        p.kompania,
        p.pozita,
        st.emri AS studenti_emri,
        st.mbiemri AS studenti_mbiemri,
        st.email AS studenti_email
      FROM aplikimet_praktikave a
      JOIN praktikat p ON a.praktika_id = p.praktika_id
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
    return handleDbError(res, err, "Gabim gjate marrjes se aplikimeve.");
  }
};

const updateInternshipApplication = async (req, res) => {
  const validationError = validateInternshipApplicationUpdate(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { statusi, shenime_admin = "" } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE aplikimet_praktikave
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
    return handleDbError(res, err, "Gabim gjate perditesimit te aplikimit.");
  }
};

module.exports = {
  createPraktika,
  deletePraktika,
  getAllPraktikat,
  getInternshipApplications,
  updateInternshipApplication,
  updatePraktika,
};

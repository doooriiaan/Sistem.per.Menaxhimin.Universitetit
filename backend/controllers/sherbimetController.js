const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const parseAmount = (value) => Number.parseFloat(value);

const validateServicePayload = (payload) => {
  const { emri, kategoria, pershkrimi, cmimi, valuta } = payload;

  if (!isNonEmptyString(emri)) return "Emri i sherbimit eshte i detyrueshem.";
  if (!isNonEmptyString(kategoria)) return "Kategoria eshte e detyrueshme.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";
  if (!Number.isFinite(parseAmount(cmimi)) || parseAmount(cmimi) < 0) {
    return "Cmimi duhet te jete numer valid.";
  }
  if (!isNonEmptyString(valuta)) return "Valuta eshte e detyrueshme.";

  return null;
};

const validateRequestUpdatePayload = (payload) => {
  if (!isNonEmptyString(payload.statusi)) return "Statusi eshte i detyrueshem.";
  if (!isNonEmptyString(payload.statusi_pageses)) {
    return "Statusi i pageses eshte i detyrueshem.";
  }

  return null;
};

const getAllSherbimet = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        s.*,
        (
          SELECT COUNT(*)
          FROM kerkesat_sherbimeve k
          WHERE k.sherbimi_id = s.sherbimi_id
        ) AS total_kerkesave
      FROM sherbimet_studentore s
      ORDER BY s.aktiv DESC, s.emri
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se sherbimeve.");
  }
};

const createSherbimi = async (req, res) => {
  const validationError = validateServicePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    kategoria,
    pershkrimi,
    cmimi,
    valuta,
    aktiv = true,
    kerkon_dokument = false,
  } = req.body;

  try {
    const [result] = await connection.query(
      `
        INSERT INTO sherbimet_studentore
          (emri, kategoria, pershkrimi, cmimi, valuta, aktiv, kerkon_dokument)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        emri,
        kategoria,
        pershkrimi,
        parseAmount(cmimi),
        valuta,
        aktiv ? 1 : 0,
        kerkon_dokument ? 1 : 0,
      ]
    );

    res.status(201).json({
      message: "Sherbimi u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te sherbimit.");
  }
};

const updateSherbimi = async (req, res) => {
  const validationError = validateServicePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    kategoria,
    pershkrimi,
    cmimi,
    valuta,
    aktiv = true,
    kerkon_dokument = false,
  } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE sherbimet_studentore
        SET emri = ?, kategoria = ?, pershkrimi = ?, cmimi = ?, valuta = ?, aktiv = ?, kerkon_dokument = ?
        WHERE sherbimi_id = ?
      `,
      [
        emri,
        kategoria,
        pershkrimi,
        parseAmount(cmimi),
        valuta,
        aktiv ? 1 : 0,
        kerkon_dokument ? 1 : 0,
        req.params.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Sherbimi nuk u gjet." });
    }

    res.json({ message: "Sherbimi u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te sherbimit.");
  }
};

const deleteSherbimi = async (req, res) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM sherbimet_studentore WHERE sherbimi_id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Sherbimi nuk u gjet." });
    }

    res.json({ message: "Sherbimi u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se sherbimit.");
  }
};

const getServiceRequests = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        k.*,
        s.emri AS sherbimi,
        s.kategoria,
        st.emri AS studenti_emri,
        st.mbiemri AS studenti_mbiemri,
        st.email AS studenti_email
      FROM kerkesat_sherbimeve k
      JOIN sherbimet_studentore s ON k.sherbimi_id = s.sherbimi_id
      JOIN studentet st ON k.student_id = st.student_id
      ORDER BY k.requested_at DESC
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se kerkesave.");
  }
};

const updateServiceRequest = async (req, res) => {
  const validationError = validateRequestUpdatePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { statusi, statusi_pageses, shenime_admin = "" } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE kerkesat_sherbimeve
        SET
          statusi = ?,
          statusi_pageses = ?,
          shenime_admin = ?,
          paid_at = CASE
            WHEN ? = 'Paguajtur' AND paid_at IS NULL THEN NOW()
            ELSE paid_at
          END,
          approved_at = CASE
            WHEN ? IN ('Miratuar', 'Perfunduar') AND approved_at IS NULL THEN NOW()
            ELSE approved_at
          END
        WHERE kerkesa_id = ?
      `,
      [
        statusi,
        statusi_pageses,
        shenime_admin,
        statusi_pageses,
        statusi,
        req.params.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Kerkesa nuk u gjet." });
    }

    res.json({ message: "Kerkesa u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te kerkeses.");
  }
};

module.exports = {
  createSherbimi,
  deleteSherbimi,
  getAllSherbimet,
  getServiceRequests,
  updateServiceRequest,
  updateSherbimi,
};

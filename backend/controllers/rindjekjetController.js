const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const validateRepeatUpdatePayload = (payload) => {
  if (!isNonEmptyString(payload.statusi)) return "Statusi eshte i detyrueshem.";
  if (!isNonEmptyString(payload.statusi_pageses)) {
    return "Statusi i pageses eshte i detyrueshem.";
  }

  return null;
};

const getAllRindjekjet = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        r.*,
        l.emri AS lenda,
        l.kodi,
        st.emri AS studenti_emri,
        st.mbiemri AS studenti_mbiemri,
        st.email AS studenti_email
      FROM rindjekjet_lendeve r
      JOIN lendet l ON r.lende_id = l.lende_id
      JOIN studentet st ON r.student_id = st.student_id
      ORDER BY r.requested_at DESC
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se rindjekjeve.");
  }
};

const updateRindjekja = async (req, res) => {
  const validationError = validateRepeatUpdatePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { statusi, statusi_pageses, shenime_admin = "" } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE rindjekjet_lendeve
        SET statusi = ?, statusi_pageses = ?, shenime_admin = ?
        WHERE rindjekja_id = ?
      `,
      [statusi, statusi_pageses, shenime_admin, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Rindjekja nuk u gjet." });
    }

    res.json({ message: "Rindjekja u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te rindjekjes.");
  }
};

module.exports = {
  getAllRindjekjet,
  updateRindjekja,
};

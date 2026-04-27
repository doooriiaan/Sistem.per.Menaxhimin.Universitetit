const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isValidDate,
  sendValidationError,
} = require("../utils/validation");
const { buildFileUrl } = require("../utils/fileStorage");

const connection = db.promise();

const parseAmount = (value) => Number.parseFloat(value);

const validateScholarshipPayload = (payload) => {
  const { titulli, pershkrimi, lloji, shuma, kriteret, afati_aplikimit, statusi } =
    payload;

  if (!isNonEmptyString(titulli)) return "Titulli eshte i detyrueshem.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";
  if (!isNonEmptyString(lloji)) return "Lloji eshte i detyrueshem.";
  if (!Number.isFinite(parseAmount(shuma)) || parseAmount(shuma) <= 0) {
    return "Shuma duhet te jete numer valid.";
  }
  if (!isNonEmptyString(kriteret)) return "Kriteret jane te detyrueshme.";
  if (!isValidDate(afati_aplikimit)) return "Afati i aplikimit nuk eshte valid.";
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";

  return null;
};

const validateApplicationUpdate = (payload) => {
  if (!isNonEmptyString(payload.statusi)) return "Statusi eshte i detyrueshem.";
  return null;
};

const getAllBursat = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        b.*,
        (
          SELECT COUNT(*)
          FROM aplikimet_bursave a
          WHERE a.bursa_id = b.bursa_id
        ) AS total_aplikimeve
      FROM bursat b
      ORDER BY b.afati_aplikimit ASC, b.titulli
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se bursave.");
  }
};

const createBursa = async (req, res) => {
  const validationError = validateScholarshipPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { titulli, pershkrimi, lloji, shuma, kriteret, afati_aplikimit, statusi } =
    req.body;

  try {
    const [result] = await connection.query(
      `
        INSERT INTO bursat
          (titulli, pershkrimi, lloji, shuma, kriteret, afati_aplikimit, statusi)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [titulli, pershkrimi, lloji, parseAmount(shuma), kriteret, afati_aplikimit, statusi]
    );

    res.status(201).json({
      message: "Bursa u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te burses.");
  }
};

const updateBursa = async (req, res) => {
  const validationError = validateScholarshipPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { titulli, pershkrimi, lloji, shuma, kriteret, afati_aplikimit, statusi } =
    req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE bursat
        SET titulli = ?, pershkrimi = ?, lloji = ?, shuma = ?, kriteret = ?, afati_aplikimit = ?, statusi = ?
        WHERE bursa_id = ?
      `,
      [
        titulli,
        pershkrimi,
        lloji,
        parseAmount(shuma),
        kriteret,
        afati_aplikimit,
        statusi,
        req.params.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Bursa nuk u gjet." });
    }

    res.json({ message: "Bursa u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te burses.");
  }
};

const deleteBursa = async (req, res) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM bursat WHERE bursa_id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Bursa nuk u gjet." });
    }

    res.json({ message: "Bursa u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se burses.");
  }
};

const getScholarshipApplications = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        a.*,
        b.titulli,
        b.lloji,
        st.emri AS studenti_emri,
        st.mbiemri AS studenti_mbiemri,
        st.email AS studenti_email
      FROM aplikimet_bursave a
      JOIN bursat b ON a.bursa_id = b.bursa_id
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

const updateScholarshipApplication = async (req, res) => {
  const validationError = validateApplicationUpdate(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { statusi, shenime_admin = "" } = req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE aplikimet_bursave
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
  createBursa,
  deleteBursa,
  getAllBursat,
  getScholarshipApplications,
  updateBursa,
  updateScholarshipApplication,
};

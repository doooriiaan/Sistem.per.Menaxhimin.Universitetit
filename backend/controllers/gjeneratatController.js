const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const validateGenerationPayload = (payload) => {
  const { emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi } =
    payload;

  if (!isNonEmptyString(emri)) return "Emri i gjenerates eshte i detyrueshem.";
  if (!isPositiveInteger(viti_regjistrimit)) return "Viti i regjistrimit duhet te jete valid.";
  if (!isPositiveInteger(viti_diplomimit)) return "Viti i diplomimit duhet te jete valid.";
  if (Number(viti_diplomimit) < Number(viti_regjistrimit)) {
    return "Viti i diplomimit duhet te jete pas vitit te regjistrimit.";
  }
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";

  return null;
};

const getAllGjeneratat = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        g.*,
        (
          SELECT COUNT(*)
          FROM studentet s
          WHERE s.gjenerata_id = g.gjenerata_id
        ) AS total_studenteve
      FROM gjeneratat g
      ORDER BY g.viti_regjistrimit DESC, g.emri
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se gjeneratave.");
  }
};

const getGjenerataById = async (req, res) => {
  try {
    const [rows] = await connection.query(
      `
        SELECT *
        FROM gjeneratat
        WHERE gjenerata_id = ?
        LIMIT 1
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Gjenerata nuk u gjet." });
    }

    res.json(rows[0]);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se gjenerates.");
  }
};

const createGjenerata = async (req, res) => {
  const validationError = validateGenerationPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi } =
    req.body;

  try {
    const [result] = await connection.query(
      `
        INSERT INTO gjeneratat
          (emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi)
        VALUES (?, ?, ?, ?, ?)
      `,
      [emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi]
    );

    res.status(201).json({
      message: "Gjenerata u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te gjenerates.");
  }
};

const updateGjenerata = async (req, res) => {
  const validationError = validateGenerationPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi } =
    req.body;

  try {
    const [result] = await connection.query(
      `
        UPDATE gjeneratat
        SET emri = ?, viti_regjistrimit = ?, viti_diplomimit = ?, statusi = ?, pershkrimi = ?
        WHERE gjenerata_id = ?
      `,
      [
        emri,
        viti_regjistrimit,
        viti_diplomimit,
        statusi,
        pershkrimi,
        req.params.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Gjenerata nuk u gjet." });
    }

    res.json({ message: "Gjenerata u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te gjenerates.");
  }
};

const deleteGjenerata = async (req, res) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM gjeneratat WHERE gjenerata_id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Gjenerata nuk u gjet." });
    }

    res.json({ message: "Gjenerata u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se gjenerates.");
  }
};

module.exports = {
  createGjenerata,
  deleteGjenerata,
  getAllGjeneratat,
  getGjenerataById,
  updateGjenerata,
};

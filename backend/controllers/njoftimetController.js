const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const normalizeText = (value) => String(value || "").trim();

const validateNotificationPayload = ({ tag, titulli, pershkrimi }) => {
  if (!isNonEmptyString(tag)) {
    return "Kategoria e njoftimit eshte e detyrueshme.";
  }

  if (normalizeText(tag).length > 80) {
    return "Kategoria e njoftimit duhet te kete maksimumi 80 karaktere.";
  }

  if (!isNonEmptyString(titulli)) {
    return "Titulli i njoftimit eshte i detyrueshem.";
  }

  if (normalizeText(titulli).length > 180) {
    return "Titulli i njoftimit duhet te kete maksimumi 180 karaktere.";
  }

  if (!isNonEmptyString(pershkrimi)) {
    return "Pershkrimi i njoftimit eshte i detyrueshem.";
  }

  return null;
};

const getAllNjoftimet = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        n.*,
        NULLIF(
          TRIM(
            CONCAT(
              COALESCE(a.emri, p.emri, s.emri, ""),
              " ",
              COALESCE(a.mbiemri, p.mbiemri, s.mbiemri, "")
            )
          ),
          ""
        ) AS created_by_name
      FROM njoftimet n
      LEFT JOIN users u ON n.created_by_user_id = u.user_id
      LEFT JOIN admins a ON u.admin_id = a.admin_id
      LEFT JOIN profesoret p ON u.profesor_id = p.profesor_id
      LEFT JOIN studentet s ON u.student_id = s.student_id
      ORDER BY n.created_at DESC, n.njoftim_id DESC
    `);

    res.json(rows);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se njoftimeve.");
  }
};

const createNjoftim = async (req, res) => {
  const validationError = validateNotificationPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const tag = normalizeText(req.body.tag);
  const titulli = normalizeText(req.body.titulli);
  const pershkrimi = normalizeText(req.body.pershkrimi);

  try {
    const [result] = await connection.query(
      `
        INSERT INTO njoftimet (tag, titulli, pershkrimi, created_by_user_id)
        VALUES (?, ?, ?, ?)
      `,
      [tag, titulli, pershkrimi, req.user?.user_id || null]
    );

    res.status(201).json({
      message: "Njoftimi u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te njoftimit.");
  }
};

const updateNjoftim = async (req, res) => {
  const validationError = validateNotificationPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const tag = normalizeText(req.body.tag);
  const titulli = normalizeText(req.body.titulli);
  const pershkrimi = normalizeText(req.body.pershkrimi);

  try {
    const [result] = await connection.query(
      `
        UPDATE njoftimet
        SET tag = ?, titulli = ?, pershkrimi = ?
        WHERE njoftim_id = ?
      `,
      [tag, titulli, pershkrimi, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Njoftimi nuk u gjet." });
    }

    res.json({ message: "Njoftimi u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te njoftimit.");
  }
};

const deleteNjoftim = async (req, res) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM njoftimet WHERE njoftim_id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Njoftimi nuk u gjet." });
    }

    res.json({ message: "Njoftimi u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se njoftimit.");
  }
};

module.exports = {
  createNjoftim,
  deleteNjoftim,
  getAllNjoftimet,
  updateNjoftim,
};

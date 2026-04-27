const db = require("../db");
const { buildFileUrl } = require("../utils/fileStorage");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const validateRegjistrimiPayload = (payload) => {
  const { student_id, lende_id, semestri, viti_akademik, statusi } = payload;

  if (!isPositiveInteger(student_id)) return "Studenti duhet te zgjidhet sakte.";
  if (!isPositiveInteger(lende_id)) return "Lenda duhet te zgjidhet sakte.";
  if (!isPositiveInteger(semestri) || Number(semestri) > 12) {
    return "Semestri duhet te jete nga 1 deri ne 12.";
  }
  if (!isNonEmptyString(viti_akademik)) return "Viti akademik eshte i detyrueshem.";
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";

  return null;
};

const getAllRegjistrimet = (req, res) => {
  const sql = `
    SELECT
      regjistrimi_id,
      student_id,
      lende_id,
      semestri,
      viti_akademik,
      statusi,
      (
        SELECT COUNT(*)
        FROM regjistrim_dokumentet rd
        WHERE rd.regjistrimi_id = regjistrimet.regjistrimi_id
      ) AS total_dokumenteve
    FROM regjistrimet
  `;

  db.query(sql, (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se regjistrimeve.");
    res.json(results);
  });
};

const getRegjistrimiById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      regjistrimi_id,
      student_id,
      lende_id,
      semestri,
      viti_akademik,
      statusi,
      (
        SELECT COUNT(*)
        FROM regjistrim_dokumentet rd
        WHERE rd.regjistrimi_id = regjistrimet.regjistrimi_id
      ) AS total_dokumenteve
    FROM regjistrimet
    WHERE regjistrimi_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se regjistrimit.");

    if (results.length === 0) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createRegjistrimi = (req, res) => {
  const validationError = validateRegjistrimiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    student_id,
    lende_id,
    semestri,
    viti_akademik,
    statusi
  } = req.body;

  const sql = `
    INSERT INTO regjistrimet
    (student_id, lende_id, semestri, viti_akademik, statusi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [student_id, lende_id, semestri, viti_akademik, statusi],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate shtimit te regjistrimit.");

      res.status(201).json({
        message: "Regjistrimi u shtua",
        id: result.insertId
      });
    }
  );
};

const updateRegjistrimi = (req, res) => {
  const { id } = req.params;
  const validationError = validateRegjistrimiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    student_id,
    lende_id,
    semestri,
    viti_akademik,
    statusi
  } = req.body;

  const sql = `
    UPDATE regjistrimet
    SET student_id = ?, lende_id = ?, semestri = ?, viti_akademik = ?, statusi = ?
    WHERE regjistrimi_id = ?
  `;

  db.query(
    sql,
    [student_id, lende_id, semestri, viti_akademik, statusi, id],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate perditesimit te regjistrimit.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
      }

      res.json({ message: "Regjistrimi u perditesua" });
    }
  );
};

const deleteRegjistrimi = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM regjistrimet WHERE regjistrimi_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate fshirjes se regjistrimit.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    res.json({ message: "Regjistrimi u fshi" });
  });
};

const getRegjistrimiDocuments = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT
          rd.*,
          s.emri AS studenti_emri,
          s.mbiemri AS studenti_mbiemri
        FROM regjistrim_dokumentet rd
        JOIN studentet s ON rd.student_id = s.student_id
        WHERE rd.regjistrimi_id = ?
        ORDER BY rd.uploaded_at DESC
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
    return handleDbError(res, err, "Gabim gjate marrjes se dokumenteve te regjistrimit.");
  }
};

module.exports = {
  getAllRegjistrimet,
  getRegjistrimiById,
  createRegjistrimi,
  updateRegjistrimi,
  deleteRegjistrimi,
  getRegjistrimiDocuments
};

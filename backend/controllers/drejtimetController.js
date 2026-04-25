const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const validateDrejtimiPayload = (payload) => {
  const { emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi } = payload;

  if (!isNonEmptyString(emri)) return "Emri eshte i detyrueshem.";
  if (!isPositiveInteger(fakulteti_id)) return "Fakulteti duhet te zgjidhet sakte.";
  if (!isNonEmptyString(niveli)) return "Niveli eshte i detyrueshem.";
  if (!isPositiveInteger(kohezgjatja_vite)) {
    return "Kohezgjatja duhet te jete numer pozitiv.";
  }
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";

  return null;
};

const getAllDrejtimet = (req, res) => {
  db.query("SELECT * FROM drejtimet", (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se drejtimeve.");
    res.json(results);
  });
};

const getDrejtimiById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM drejtimet WHERE drejtim_id = ?",
    [id],
    (err, results) => {
      if (err) return handleDbError(res, err, "Gabim gjate marrjes se drejtimit.");

      if (results.length === 0) {
        return res.status(404).json({ message: "Drejtimi nuk u gjet" });
      }

      res.json(results[0]);
    }
  );
};

const createDrejtimi = (req, res) => {
  const validationError = validateDrejtimiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi } = req.body;

  const sql = `
    INSERT INTO drejtimet (emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate shtimit te drejtimit.");

    res.status(201).json({
      message: "Drejtimi u shtua",
      id: result.insertId
    });
  });
};

const updateDrejtimi = (req, res) => {
  const { id } = req.params;
  const validationError = validateDrejtimiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi } = req.body;

  const sql = `
    UPDATE drejtimet
    SET emri = ?, fakulteti_id = ?, niveli = ?, kohezgjatja_vite = ?, pershkrimi = ?
    WHERE drejtim_id = ?
  `;

  db.query(sql, [emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi, id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate perditesimit te drejtimit.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Drejtimi nuk u gjet" });
    }

    res.json({ message: "Drejtimi u perditesua" });
  });
};

const deleteDrejtimi = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM drejtimet WHERE drejtim_id = ?",
    [id],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate fshirjes se drejtimit.");

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Drejtimi nuk u gjet" });
      }

      res.json({ message: "Drejtimi u fshi" });
    }
  );
};

module.exports = {
  getAllDrejtimet,
  getDrejtimiById,
  createDrejtimi,
  updateDrejtimi,
  deleteDrejtimi
};

const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isNullablePositiveInteger,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const validateDepartamentiPayload = (payload) => {
  const { emri, fakulteti_id, shefi_id, pershkrimi } = payload;

  if (!isNonEmptyString(emri)) return "Emri eshte i detyrueshem.";
  if (!isPositiveInteger(fakulteti_id)) return "Fakulteti duhet te zgjidhet sakte.";
  if (!isNullablePositiveInteger(shefi_id)) return "Shefi duhet te zgjidhet sakte.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";

  return null;
};

const getAllDepartamentet = (req, res) => {
  db.query("SELECT * FROM departamentet", (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se departamenteve.");
    res.json(results);
  });
};

const getDepartamentiById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM departamentet WHERE departament_id = ?",
    [id],
    (err, results) => {
      if (err) return handleDbError(res, err, "Gabim gjate marrjes se departamentit.");

      if (results.length === 0) {
        return res.status(404).json({ message: "Departamenti nuk u gjet" });
      }

      res.json(results[0]);
    }
  );
};

const createDepartamenti = (req, res) => {
  const validationError = validateDepartamentiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, fakulteti_id, shefi_id, pershkrimi } = req.body;

  const sql = `
    INSERT INTO departamentet (emri, fakulteti_id, shefi_id, pershkrimi)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [emri, fakulteti_id, shefi_id, pershkrimi], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate shtimit te departamentit.");

    res.status(201).json({
      message: "Departamenti u shtua",
      id: result.insertId
    });
  });
};

const updateDepartamenti = (req, res) => {
  const { id } = req.params;
  const validationError = validateDepartamentiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, fakulteti_id, shefi_id, pershkrimi } = req.body;

  const sql = `
    UPDATE departamentet
    SET emri = ?, fakulteti_id = ?, shefi_id = ?, pershkrimi = ?
    WHERE departament_id = ?
  `;

  db.query(sql, [emri, fakulteti_id, shefi_id, pershkrimi, id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate perditesimit te departamentit.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Departamenti nuk u gjet" });
    }

    res.json({ message: "Departamenti u perditesua" });
  });
};

const deleteDepartamenti = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM departamentet WHERE departament_id = ?",
    [id],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate fshirjes se departamentit.");

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Departamenti nuk u gjet" });
      }

      res.json({ message: "Departamenti u fshi" });
    }
  );
};

module.exports = {
  getAllDepartamentet,
  getDepartamentiById,
  createDepartamenti,
  updateDepartamenti,
  deleteDepartamenti
};

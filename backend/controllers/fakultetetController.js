const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isNullablePositiveInteger,
  isValidEmail,
  sendValidationError,
} = require("../utils/validation");

const validateFakultetiPayload = (payload) => {
  const { emri, dekani_id, adresa, telefoni, email } = payload;

  if (!isNonEmptyString(emri)) return "Emri eshte i detyrueshem.";
  if (!isNullablePositiveInteger(dekani_id)) return "Dekani duhet te zgjidhet sakte.";
  if (!isNonEmptyString(adresa)) return "Adresa eshte e detyrueshme.";
  if (!isNonEmptyString(telefoni)) return "Telefoni eshte i detyrueshem.";
  if (!isValidEmail(email)) return "Email nuk eshte valid.";

  return null;
};

const getAllFakultetet = (req, res) => {
  const sql = "SELECT * FROM fakultetet";

  db.query(sql, (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se fakulteteve.");
    res.json(results);
  });
};

const getFakultetiById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM fakultetet WHERE fakultet_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se fakultetit.");

    if (results.length === 0) {
      return res.status(404).json({ message: "Fakulteti nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createFakulteti = (req, res) => {
  const validationError = validateFakultetiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, dekani_id, adresa, telefoni, email } = req.body;

  const sql = `
    INSERT INTO fakultetet (emri, dekani_id, adresa, telefoni, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [emri, dekani_id, adresa, telefoni, email], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate shtimit te fakultetit.");

    res.status(201).json({
      message: "Fakulteti u shtua",
      id: result.insertId
    });
  });
};

const updateFakulteti = (req, res) => {
  const { id } = req.params;
  const validationError = validateFakultetiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, dekani_id, adresa, telefoni, email } = req.body;

  const sql = `
    UPDATE fakultetet
    SET emri = ?, dekani_id = ?, adresa = ?, telefoni = ?, email = ?
    WHERE fakultet_id = ?
  `;

  db.query(sql, [emri, dekani_id, adresa, telefoni, email, id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate perditesimit te fakultetit.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Fakulteti nuk u gjet" });
    }

    res.json({ message: "Fakulteti u perditesua" });
  });
};

const deleteFakulteti = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM fakultetet WHERE fakultet_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate fshirjes se fakultetit.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Fakulteti nuk u gjet" });
    }

    res.json({ message: "Fakulteti u fshi" });
  });
};

module.exports = {
  getAllFakultetet,
  getFakultetiById,
  createFakulteti,
  updateFakulteti,
  deleteFakulteti
};

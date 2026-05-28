const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const validateSallaPayload = (payload) => {
  const { emri, kapaciteti, lokacioni, tipi, statusi, pershkrimi } = payload;

  if (!isNonEmptyString(emri)) return "Emri i salles eshte i detyrueshem.";
  if (!isPositiveInteger(kapaciteti)) return "Kapaciteti duhet te jete numer pozitiv.";
  if (!isNonEmptyString(lokacioni)) return "Lokacioni eshte i detyrueshem.";
  if (!isNonEmptyString(tipi)) return "Tipi i salles eshte i detyrueshem.";
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";

  return null;
};

const getAllSallat = (req, res) => {
  db.query("SELECT * FROM sallat ORDER BY emri ASC", (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se sallave.");
    res.json(results);
  });
};

const getSallaById = (req, res) => {
  db.query(
    "SELECT * FROM sallat WHERE salla_id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return handleDbError(res, err, "Gabim gjate marrjes se salles.");

      if (results.length === 0) {
        return res.status(404).json({ message: "Salla nuk u gjet" });
      }

      res.json(results[0]);
    }
  );
};

const createSalla = (req, res) => {
  const validationError = validateSallaPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, kapaciteti, lokacioni, tipi, statusi, pershkrimi } = req.body;

  db.query(
    `
      INSERT INTO sallat
        (emri, kapaciteti, lokacioni, tipi, statusi, pershkrimi)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [emri, kapaciteti, lokacioni, tipi, statusi, pershkrimi],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate shtimit te salles.");

      res.status(201).json({
        message: "Salla u shtua",
        id: result.insertId,
      });
    }
  );
};

const updateSalla = (req, res) => {
  const validationError = validateSallaPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { emri, kapaciteti, lokacioni, tipi, statusi, pershkrimi } = req.body;

  db.query(
    `
      UPDATE sallat
      SET emri = ?, kapaciteti = ?, lokacioni = ?, tipi = ?, statusi = ?, pershkrimi = ?
      WHERE salla_id = ?
    `,
    [emri, kapaciteti, lokacioni, tipi, statusi, pershkrimi, req.params.id],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate perditesimit te salles.");

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Salla nuk u gjet" });
      }

      res.json({ message: "Salla u perditesua" });
    }
  );
};

const deleteSalla = (req, res) => {
  db.query(
    "DELETE FROM sallat WHERE salla_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate fshirjes se salles.");

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Salla nuk u gjet" });
      }

      res.json({ message: "Salla u fshi" });
    }
  );
};

module.exports = {
  getAllSallat,
  getSallaById,
  createSalla,
  updateSalla,
  deleteSalla,
};

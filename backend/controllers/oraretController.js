const db = require("../db");
const {
  areTimesOrdered,
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  isValidTime,
  sendValidationError,
} = require("../utils/validation");

const validateOrariPayload = (payload) => {
  const {
    lende_id,
    profesor_id,
    dita,
    ora_fillimit,
    ora_mbarimit,
    salla,
  } = payload;

  if (!isPositiveInteger(lende_id)) return "Lenda duhet te zgjidhet sakte.";
  if (!isPositiveInteger(profesor_id)) return "Profesori duhet te zgjidhet sakte.";
  if (!isNonEmptyString(dita)) return "Dita eshte e detyrueshme.";
  if (!isValidTime(ora_fillimit)) return "Ora e fillimit nuk eshte valide.";
  if (!isValidTime(ora_mbarimit)) return "Ora e mbarimit nuk eshte valide.";
  if (!areTimesOrdered(ora_fillimit, ora_mbarimit)) {
    return "Ora e mbarimit duhet te jete pas ores se fillimit.";
  }
  if (!isNonEmptyString(salla)) return "Salla eshte e detyrueshme.";

  return null;
};

const getAllOraret = (req, res) => {
  const sql = "SELECT * FROM oraret";

  db.query(sql, (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se orareve.");
    res.json(results);
  });
};

const getOrariById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM oraret WHERE orari_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se orarit.");

    if (results.length === 0) {
      return res.status(404).json({ message: "Orari nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createOrari = (req, res) => {
  const validationError = validateOrariPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    lende_id,
    profesor_id,
    dita,
    ora_fillimit,
    ora_mbarimit,
    salla
  } = req.body;

  const sql = `
    INSERT INTO oraret
    (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate shtimit te orarit.");

      res.status(201).json({
        message: "Orari u shtua",
        id: result.insertId
      });
    }
  );
};

const updateOrari = (req, res) => {
  const { id } = req.params;
  const validationError = validateOrariPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    lende_id,
    profesor_id,
    dita,
    ora_fillimit,
    ora_mbarimit,
    salla
  } = req.body;

  const sql = `
    UPDATE oraret
    SET lende_id = ?, profesor_id = ?, dita = ?, ora_fillimit = ?, ora_mbarimit = ?, salla = ?
    WHERE orari_id = ?
  `;

  db.query(
    sql,
    [lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla, id],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate perditesimit te orarit.");

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Orari nuk u gjet" });
      }

      res.json({ message: "Orari u perditesua" });
    }
  );
};

const deleteOrari = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM oraret WHERE orari_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate fshirjes se orarit.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Orari nuk u gjet" });
    }

    res.json({ message: "Orari u fshi" });
  });
};

module.exports = {
  getAllOraret,
  getOrariById,
  createOrari,
  updateOrari,
  deleteOrari
};

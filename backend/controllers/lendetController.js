const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const validateLendaPayload = (payload) => {
  const {
    emri,
    kodi,
    kreditet,
    semestri,
    drejtimi_id,
    profesor_id,
    lloji,
    pershkrimi,
  } = payload;

  if (!isNonEmptyString(emri)) return "Emri eshte i detyrueshem.";
  if (!isNonEmptyString(kodi)) return "Kodi eshte i detyrueshem.";
  if (!isPositiveInteger(kreditet)) return "Kreditet duhet te jene numer pozitiv.";
  if (!isPositiveInteger(semestri) || Number(semestri) > 12) {
    return "Semestri duhet te jete nga 1 deri ne 12.";
  }
  if (!isPositiveInteger(drejtimi_id)) return "Drejtimi duhet te zgjidhet sakte.";
  if (!isPositiveInteger(profesor_id)) return "Profesori duhet te zgjidhet sakte.";
  if (!isNonEmptyString(lloji)) return "Lloji eshte i detyrueshem.";
  if (!isNonEmptyString(pershkrimi)) return "Pershkrimi eshte i detyrueshem.";

  return null;
};

const getalllendet = (req, res) => {
  const sql = "SELECT * FROM lendet";

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se lendeve.");
    }

    res.json(results);
  });
};

const getlendabyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM lendet WHERE lende_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se lendes.");
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createlenda = (req, res) => {
  const validationError = validateLendaPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    kodi,
    kreditet,
    semestri,
    drejtimi_id,
    profesor_id,
    lloji,
    pershkrimi
  } = req.body;

  const sql = `
    INSERT INTO lendet
    (emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate shtimit te lendes.");
      }

      res.status(201).json({
        message: "Lenda u shtua",
        id: result.insertId
      });
    }
  );
};

const updatelenda = (req, res) => {
  const { id } = req.params;
  const validationError = validateLendaPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    kodi,
    kreditet,
    semestri,
    drejtimi_id,
    profesor_id,
    lloji,
    pershkrimi
  } = req.body;

  const sql = `
    UPDATE lendet
    SET emri = ?, kodi = ?, kreditet = ?, semestri = ?, drejtimi_id = ?, profesor_id = ?, lloji = ?, pershkrimi = ?
    WHERE lende_id = ?
  `;

  db.query(
    sql,
    [emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi, id],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate perditesimit te lendes.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lenda nuk u gjet" });
      }

      res.json({ message: "Lenda u perditesua" });
    }
  );
};

const deletelenda = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM lendet WHERE lende_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate fshirjes se lendes.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    res.json({ message: "Lenda u fshi" });
  });
};

module.exports = {
  getalllendet,
  getlendabyid,
  createlenda,
  updatelenda,
  deletelenda
};

const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  isValidDate,
  isValidEmail,
  sendValidationError,
} = require("../utils/validation");

const validateProfesorPayload = (payload) => {
  const {
    emri,
    mbiemri,
    titulli_akademik,
    departamenti_id,
    email,
    telefoni,
    specializimi,
    data_punesimit,
  } = payload;

  if (!isNonEmptyString(emri)) return "Emri eshte i detyrueshem.";
  if (!isNonEmptyString(mbiemri)) return "Mbiemri eshte i detyrueshem.";
  if (!isNonEmptyString(titulli_akademik)) {
    return "Titulli akademik eshte i detyrueshem.";
  }
  if (!isPositiveInteger(departamenti_id)) return "Departamenti duhet te zgjidhet sakte.";
  if (!isValidEmail(email)) return "Email nuk eshte valid.";
  if (!isNonEmptyString(telefoni)) return "Telefoni eshte i detyrueshem.";
  if (!isNonEmptyString(specializimi)) return "Specializimi eshte i detyrueshem.";
  if (!isValidDate(data_punesimit)) return "Data e punesimit nuk eshte valide.";

  return null;
};

const getallprofesoret = (req, res) => {
  const sql = "SELECT * FROM profesoret";

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se profesoreve.");
    }

    res.json(results);
  });
};

const getprofesoribyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM profesoret WHERE profesor_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se profesorit.");
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createprofesor = (req, res) => {
  const validationError = validateProfesorPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    mbiemri,
    titulli_akademik,
    departamenti_id,
    email,
    telefoni,
    specializimi,
    data_punesimit
  } = req.body;

  const sql = `
    INSERT INTO profesoret
    (emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate shtimit te profesorit.");
      }

      res.status(201).json({
        message: "Profesori u shtua",
        id: result.insertId
      });
    }
  );
};

const updateprofesor = (req, res) => {
  const { id } = req.params;
  const validationError = validateProfesorPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    mbiemri,
    titulli_akademik,
    departamenti_id,
    email,
    telefoni,
    specializimi,
    data_punesimit
  } = req.body;

  const sql = `
    UPDATE profesoret
    SET emri = ?, mbiemri = ?, titulli_akademik = ?, departamenti_id = ?, email = ?, telefoni = ?, specializimi = ?, data_punesimit = ?
    WHERE profesor_id = ?
  `;

  db.query(
    sql,
    [emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit, id],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate perditesimit te profesorit.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Profesori nuk u gjet" });
      }

      res.json({ message: "Profesori u perditesua" });
    }
  );
};

const deleteprofesor = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM profesoret WHERE profesor_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate fshirjes se profesorit.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    res.json({ message: "Profesori u fshi" });
  });
};

module.exports = {
  getallprofesoret,
  getprofesoribyid,
  createprofesor,
  updateprofesor,
  deleteprofesor
};

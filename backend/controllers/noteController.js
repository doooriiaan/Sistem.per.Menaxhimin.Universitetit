const db = require("../db");
const {
  handleDbError,
  isNumberInRange,
  isPositiveInteger,
  isValidDate,
  sendValidationError,
} = require("../utils/validation");

const validateNotaPayload = (payload) => {
  const { student_id, provimi_id, nota, data_vendosjes } = payload;

  if (!isPositiveInteger(student_id)) return "Studenti duhet te zgjidhet sakte.";
  if (!isPositiveInteger(provimi_id)) return "Provimi duhet te zgjidhet sakte.";
  if (!isNumberInRange(nota, 5, 10)) return "Nota duhet te jete nga 5 deri ne 10.";
  if (!isValidDate(data_vendosjes)) return "Data e vendosjes nuk eshte valide.";

  return null;
};

const getallnotat = (req, res) => {
  const sql = "SELECT * FROM notat";

  db.query(sql, (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se notave.");
    res.json(results);
  });
};

const getnotabyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM notat WHERE nota_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se notes.");

    if (results.length === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createnota = (req, res) => {
  const validationError = validateNotaPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { student_id, provimi_id, nota, data_vendosjes } = req.body;

  const sql = `
    INSERT INTO notat
    (student_id, provimi_id, nota, data_vendosjes)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [student_id, provimi_id, nota, data_vendosjes],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate shtimit te notes.");

      res.status(201).json({
        message: "Nota u shtua",
        id: result.insertId
      });
    }
  );
};

const updatenota = (req, res) => {
  const { id } = req.params;
  const validationError = validateNotaPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const { student_id, provimi_id, nota, data_vendosjes } = req.body;

  const sql = `
    UPDATE notat
    SET student_id = ?, provimi_id = ?, nota = ?, data_vendosjes = ?
    WHERE nota_id = ?
  `;

  db.query(
    sql,
    [student_id, provimi_id, nota, data_vendosjes, id],
    (err, result) => {
      if (err) return handleDbError(res, err, "Gabim gjate perditesimit te notes.");

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nota nuk u gjet" });
      }

      res.json({ message: "Nota u perditesua" });
    }
  );
};

const deletenota = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM notat WHERE nota_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return handleDbError(res, err, "Gabim gjate fshirjes se notes.");

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json({ message: "Nota u fshi" });
  });
};

const getnotatdetails = (req, res) => {
  const sql = `
    SELECT 
      n.nota_id,
      s.emri,
      s.mbiemri,
      l.emri AS lenda,
      pr.emri AS profesori,
      n.nota,
      n.data_vendosjes
    FROM notat n
    JOIN studentet s ON n.student_id = s.student_id
    JOIN provimet p ON n.provimi_id = p.provimi_id
    JOIN lendet l ON p.lende_id = l.lende_id
    JOIN profesoret pr ON p.profesor_id = pr.profesor_id
  `;

  db.query(sql, (err, results) => {
    if (err) return handleDbError(res, err, "Gabim gjate marrjes se detajeve te notave.");
    res.json(results);
  });
};

module.exports = {
  getallnotat,
  getnotabyid,
  createnota,
  updatenota,
  deletenota,
  getnotatdetails
};

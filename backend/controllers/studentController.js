const db = require("../db");
const {
  handleDbError,
  isEnumValue,
  isNonEmptyString,
  isPositiveInteger,
  isValidDate,
  isValidEmail,
  sendValidationError,
} = require("../utils/validation");

const validateStudentPayload = (payload) => {
  const {
    emri,
    mbiemri,
    numri_personal,
    data_lindjes,
    gjinia,
    email,
    telefoni,
    adresa,
    drejtimi_id,
    viti_studimit,
    statusi,
  } = payload;

  if (!isNonEmptyString(emri)) return "Emri eshte i detyrueshem.";
  if (!isNonEmptyString(mbiemri)) return "Mbiemri eshte i detyrueshem.";
  if (!isNonEmptyString(numri_personal)) return "Numri personal eshte i detyrueshem.";
  if (!isValidDate(data_lindjes)) return "Data e lindjes nuk eshte valide.";
  if (!isEnumValue(gjinia, ["M", "F"])) return "Gjinia duhet te jete M ose F.";
  if (!isValidEmail(email)) return "Email nuk eshte valid.";
  if (!isNonEmptyString(telefoni)) return "Telefoni eshte i detyrueshem.";
  if (!isNonEmptyString(adresa)) return "Adresa eshte e detyrueshme.";
  if (!isPositiveInteger(drejtimi_id)) return "Drejtimi duhet te zgjidhet sakte.";
  if (!isPositiveInteger(viti_studimit) || Number(viti_studimit) > 6) {
    return "Viti i studimit duhet te jete nga 1 deri ne 6.";
  }
  if (!isNonEmptyString(statusi)) return "Statusi eshte i detyrueshem.";

  return null;
};

const getallstudents = (req, res) => {
  const sql = "SELECT * FROM studentet";

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se studenteve.");
    }

    res.json(results);
  });
};

const getstudentbyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM studentet WHERE student_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se studentit.");
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createstudent = (req, res) => {
  const validationError = validateStudentPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    mbiemri,
    numri_personal,
    data_lindjes,
    gjinia,
    email,
    telefoni,
    adresa,
    drejtimi_id,
    viti_studimit,
    statusi
  } = req.body;

  const sql = `
    INSERT INTO studentet
    (emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, viti_studimit, statusi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      emri,
      mbiemri,
      numri_personal,
      data_lindjes,
      gjinia,
      email,
      telefoni,
      adresa,
      drejtimi_id,
      viti_studimit,
      statusi
    ],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate shtimit te studentit.");
      }

      res.status(201).json({
        message: "Studenti u shtua",
        id: result.insertId
      });
    }
  );
};

const updatestudent = (req, res) => {
  const { id } = req.params;
  const validationError = validateStudentPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    emri,
    mbiemri,
    numri_personal,
    data_lindjes,
    gjinia,
    email,
    telefoni,
    adresa,
    drejtimi_id,
    viti_studimit,
    statusi
  } = req.body;

  const sql = `
    UPDATE studentet
    SET emri = ?, mbiemri = ?, numri_personal = ?, data_lindjes = ?, gjinia = ?, email = ?, telefoni = ?, adresa = ?, drejtimi_id = ?, viti_studimit = ?, statusi = ?
    WHERE student_id = ?
  `;

  db.query(
    sql,
    [
      emri,
      mbiemri,
      numri_personal,
      data_lindjes,
      gjinia,
      email,
      telefoni,
      adresa,
      drejtimi_id,
      viti_studimit,
      statusi,
      id
    ],
    (err, result) => {
      if (err) {
        return handleDbError(res, err, "Gabim gjate perditesimit te studentit.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Studenti nuk u gjet" });
      }

      res.json({ message: "Studenti u perditesua" });
    }
  );
};

const deletestudent = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM studentet WHERE student_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate fshirjes se studentit.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    res.json({ message: "Studenti u fshi" });
  });
};

const getstudentdetails = (req, res) => {
  const sql = `
    SELECT 
      s.student_id,
      s.emri,
      s.mbiemri,
      d.emri AS drejtimi,
      f.emri AS fakulteti,
      s.viti_studimit,
      s.statusi
    FROM studentet s
    JOIN drejtimet d ON s.drejtimi_id = d.drejtim_id
    JOIN fakultetet f ON d.fakulteti_id = f.fakultet_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se detajeve te studenteve.");
    }

    res.json(results);
  });
};

module.exports = {
  getallstudents,
  getstudentbyid,
  createstudent,
  updatestudent,
  deletestudent,
  getstudentdetails
};

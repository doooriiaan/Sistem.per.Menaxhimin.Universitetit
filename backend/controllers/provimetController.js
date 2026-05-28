const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isPositiveInteger,
  isValidDate,
  isValidTime,
  sendValidationError,
} = require("../utils/validation");

const validateProvimiPayload = (payload) => {
  const {
    lende_id,
    profesor_id,
    data_provimit,
    ora,
    salla_id,
    salla,
    afati,
  } = payload;

  if (!isPositiveInteger(lende_id)) return "Lenda duhet te zgjidhet sakte.";
  if (!isPositiveInteger(profesor_id)) return "Profesori duhet te zgjidhet sakte.";
  if (!isValidDate(data_provimit)) return "Data e provimit nuk eshte valide.";
  if (!isValidTime(ora)) return "Ora e provimit nuk eshte valide.";
  if (!isPositiveInteger(salla_id) && !isNonEmptyString(salla)) {
    return "Salla eshte e detyrueshme.";
  }
  if (!isNonEmptyString(afati)) return "Afati eshte i detyrueshem.";

  return null;
};

const isProfesorAssignedToLenda = async (lendeId, profesorId) => {
  const [rows] = await db.promise().query(
    `
      SELECT lende_id
      FROM lendet
      WHERE lende_id = ? AND profesor_id = ?
      LIMIT 1
    `,
    [lendeId, profesorId]
  );

  return rows.length > 0;
};

const resolveSalla = async ({ salla_id, salla }) => {
  if (isPositiveInteger(salla_id)) {
    const [rows] = await db.promise().query(
      "SELECT salla_id, emri FROM sallat WHERE salla_id = ? LIMIT 1",
      [salla_id]
    );

    return rows[0] || null;
  }

  const [rows] = await db.promise().query(
    "SELECT salla_id, emri FROM sallat WHERE emri = ? LIMIT 1",
    [salla]
  );

  return rows[0] || null;
};

const hasExamConflict = async ({
  data_provimit,
  ora,
  profesor_id,
  salla_id,
  excludeProvimiId = null,
}) => {
  const [rows] = await db.promise().query(
    `
      SELECT provimi_id
      FROM provimet
      WHERE data_provimit = ?
        AND ora = ?
        AND (profesor_id = ? OR salla_id = ?)
        AND (? IS NULL OR provimi_id <> ?)
      LIMIT 1
    `,
    [data_provimit, ora, profesor_id, salla_id, excludeProvimiId, excludeProvimiId]
  );

  return rows.length > 0;
};

const getallprovimet = (req, res) => {
  const sql = "SELECT * FROM provimet";

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se provimeve.");
    }

    res.json(results);
  });
};

const getprovimibyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM provimet WHERE provimi_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se provimit.");
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Provimi nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createprovimi = async (req, res) => {
  const validationError = validateProvimiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    lende_id,
    profesor_id,
    data_provimit,
    ora,
    salla_id,
    salla,
    afati
  } = req.body;

  try {
    const isValidRelation = await isProfesorAssignedToLenda(
      lende_id,
      profesor_id
    );

    if (!isValidRelation) {
      return sendValidationError(
        res,
        "Profesori duhet te jete profesori i lendes se zgjedhur."
      );
    }

    const selectedSalla = await resolveSalla({ salla_id, salla });

    if (!selectedSalla) {
      return sendValidationError(res, "Salla duhet te zgjidhet nga lista e sallave.");
    }

    if (
      await hasExamConflict({
        data_provimit,
        ora,
        profesor_id,
        salla_id: selectedSalla.salla_id,
      })
    ) {
      return sendValidationError(
        res,
        "Ky profesor ose kjo salle ka tashme provim ne kete date dhe ore."
      );
    }

    const sql = `
      INSERT INTO provimet
      (lende_id, profesor_id, data_provimit, ora, salla_id, salla, afati)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        lende_id,
        profesor_id,
        data_provimit,
        ora,
        selectedSalla.salla_id,
        selectedSalla.emri,
        afati,
      ],
      (err, result) => {
        if (err) {
          return handleDbError(res, err, "Gabim gjate shtimit te provimit.");
        }

        res.status(201).json({
          message: "Provimi u shtua",
          id: result.insertId
        });
      }
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate validimit te provimit.");
  }
};

const updateprovimi = async (req, res) => {
  const { id } = req.params;
  const validationError = validateProvimiPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const {
    lende_id,
    profesor_id,
    data_provimit,
    ora,
    salla_id,
    salla,
    afati
  } = req.body;

  try {
    const isValidRelation = await isProfesorAssignedToLenda(
      lende_id,
      profesor_id
    );

    if (!isValidRelation) {
      return sendValidationError(
        res,
        "Profesori duhet te jete profesori i lendes se zgjedhur."
      );
    }

    const selectedSalla = await resolveSalla({ salla_id, salla });

    if (!selectedSalla) {
      return sendValidationError(res, "Salla duhet te zgjidhet nga lista e sallave.");
    }

    if (
      await hasExamConflict({
        data_provimit,
        ora,
        profesor_id,
        salla_id: selectedSalla.salla_id,
        excludeProvimiId: id,
      })
    ) {
      return sendValidationError(
        res,
        "Ky profesor ose kjo salle ka tashme provim ne kete date dhe ore."
      );
    }

    const sql = `
      UPDATE provimet
      SET lende_id = ?, profesor_id = ?, data_provimit = ?, ora = ?, salla_id = ?, salla = ?, afati = ?
      WHERE provimi_id = ?
    `;

    db.query(
      sql,
      [
        lende_id,
        profesor_id,
        data_provimit,
        ora,
        selectedSalla.salla_id,
        selectedSalla.emri,
        afati,
        id,
      ],
      (err, result) => {
        if (err) {
          return handleDbError(res, err, "Gabim gjate perditesimit te provimit.");
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Provimi nuk u gjet" });
        }

        res.json({ message: "Provimi u perditesua" });
      }
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate validimit te provimit.");
  }
};

const deleteprovimi = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM provimet WHERE provimi_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate fshirjes se provimit.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Provimi nuk u gjet" });
    }

    res.json({ message: "Provimi u fshi" });
  });
};

const getprovimetdetails = (req, res) => {
  const sql = `
    SELECT 
      p.provimi_id,
      l.emri AS lenda,
      pr.emri AS profesori,
      p.data_provimit,
      p.ora,
      p.salla,
      p.afati
    FROM provimet p
    JOIN lendet l ON p.lende_id = l.lende_id
    JOIN profesoret pr ON p.profesor_id = pr.profesor_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se detajeve te provimeve.");
    }

    res.json(results);
  });
};

module.exports = {
  getallprovimet,
  getprovimibyid,
  createprovimi,
  updateprovimi,
  deleteprovimi,
  getprovimetdetails
};

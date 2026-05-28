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
    salla_id,
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
  if (!isPositiveInteger(salla_id) && !isNonEmptyString(salla)) {
    return "Salla eshte e detyrueshme.";
  }

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

const hasScheduleConflict = async ({
  dita,
  ora_fillimit,
  ora_mbarimit,
  profesor_id,
  salla_id,
  excludeOrariId = null,
}) => {
  const [rows] = await db.promise().query(
    `
      SELECT orari_id
      FROM oraret
      WHERE dita = ?
        AND (? < ora_mbarimit AND ? > ora_fillimit)
        AND (profesor_id = ? OR salla_id = ?)
        AND (? IS NULL OR orari_id <> ?)
      LIMIT 1
    `,
    [
      dita,
      ora_fillimit,
      ora_mbarimit,
      profesor_id,
      salla_id,
      excludeOrariId,
      excludeOrariId,
    ]
  );

  return rows.length > 0;
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

const createOrari = async (req, res) => {
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
    salla_id,
    salla
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
      await hasScheduleConflict({
        dita,
        ora_fillimit,
        ora_mbarimit,
        profesor_id,
        salla_id: selectedSalla.salla_id,
      })
    ) {
      return sendValidationError(
        res,
        "Ky profesor ose kjo salle ka tashme orar ne kete interval."
      );
    }

    const sql = `
      INSERT INTO oraret
      (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla_id, salla)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        lende_id,
        profesor_id,
        dita,
        ora_fillimit,
        ora_mbarimit,
        selectedSalla.salla_id,
        selectedSalla.emri,
      ],
      (err, result) => {
        if (err) return handleDbError(res, err, "Gabim gjate shtimit te orarit.");

        res.status(201).json({
          message: "Orari u shtua",
          id: result.insertId
        });
      }
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate validimit te orarit.");
  }
};

const updateOrari = async (req, res) => {
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
    salla_id,
    salla
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
      await hasScheduleConflict({
        dita,
        ora_fillimit,
        ora_mbarimit,
        profesor_id,
        salla_id: selectedSalla.salla_id,
        excludeOrariId: id,
      })
    ) {
      return sendValidationError(
        res,
        "Ky profesor ose kjo salle ka tashme orar ne kete interval."
      );
    }

    const sql = `
      UPDATE oraret
      SET lende_id = ?, profesor_id = ?, dita = ?, ora_fillimit = ?, ora_mbarimit = ?, salla_id = ?, salla = ?
      WHERE orari_id = ?
    `;

    db.query(
      sql,
      [
        lende_id,
        profesor_id,
        dita,
        ora_fillimit,
        ora_mbarimit,
        selectedSalla.salla_id,
        selectedSalla.emri,
        id,
      ],
      (err, result) => {
        if (err) return handleDbError(res, err, "Gabim gjate perditesimit te orarit.");

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Orari nuk u gjet" });
        }

        res.json({ message: "Orari u perditesua" });
      }
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate validimit te orarit.");
  }
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

const db = require("../db");
const { buildFileUrl, saveBase64Upload } = require("../utils/fileStorage");
const {
  handleDbError,
  isEnumValue,
  isNonEmptyString,
  isNullablePositiveInteger,
  isPositiveInteger,
  isValidDate,
  isValidEmail,
  sendValidationError,
} = require("../utils/validation");

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

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
    gjenerata_id,
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
  if (!isNullablePositiveInteger(gjenerata_id)) return "Gjenerata duhet te zgjidhet sakte.";
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
    gjenerata_id,
    viti_studimit,
    statusi
  } = req.body;

  const sql = `
    INSERT INTO studentet
    (emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      gjenerata_id || null,
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
    gjenerata_id,
    viti_studimit,
    statusi
  } = req.body;

  const sql = `
    UPDATE studentet
    SET emri = ?, mbiemri = ?, numri_personal = ?, data_lindjes = ?, gjinia = ?, email = ?, telefoni = ?, adresa = ?, drejtimi_id = ?, gjenerata_id = ?, viti_studimit = ?, statusi = ?
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
      gjenerata_id || null,
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
      g.emri AS gjenerata,
      f.emri AS fakulteti,
      s.viti_studimit,
      s.statusi
    FROM studentet s
    JOIN drejtimet d ON s.drejtimi_id = d.drejtim_id
    LEFT JOIN gjeneratat g ON s.gjenerata_id = g.gjenerata_id
    JOIN fakultetet f ON d.fakulteti_id = f.fakultet_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err, "Gabim gjate marrjes se detajeve te studenteve.");
    }

    res.json(results);
  });
};

const getStudentDocuments = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT *
        FROM student_dokumentet
        WHERE student_id = ?
        ORDER BY uploaded_at DESC
      `,
      [req.params.id]
    );

    res.json(
      rows.map((row) => ({
        ...row,
        download_url: buildFileUrl(req, row.file_path),
      }))
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se dokumenteve te studentit.");
  }
};

const uploadStudentDocument = async (req, res) => {
  const { lloji_dokumentit, file } = req.body;

  if (!isNonEmptyString(lloji_dokumentit)) {
    return sendValidationError(res, "Lloji i dokumentit eshte i detyrueshem.");
  }

  if (!file?.dataUrl || !file?.originalName) {
    return sendValidationError(res, "Skedari per ngarkim eshte i detyrueshem.");
  }

  try {
    const stored = saveBase64Upload(file, {
      directory: `studentet/student-${req.params.id}/dokumente`,
      allowedMimeTypes: DOCUMENT_MIME_TYPES,
    });

    const [result] = await db.promise().query(
      `
        INSERT INTO student_dokumentet
          (student_id, lloji_dokumentit, file_name, original_name, file_path, mime_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.params.id,
        lloji_dokumentit.trim(),
        stored.fileName,
        stored.originalName,
        stored.filePath,
        stored.mimeType,
        stored.fileSize,
      ]
    );

    res.status(201).json({
      message: "Dokumenti i studentit u ngarkua me sukses.",
      id: result.insertId,
      download_url: buildFileUrl(req, stored.filePath),
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Gabim gjate ngarkimit te dokumentit.";

    if (message !== "Gabim gjate ngarkimit te dokumentit.") {
      return res.status(400).json({ message });
    }

    return handleDbError(res, err, message);
  }
};

module.exports = {
  getallstudents,
  getstudentbyid,
  createstudent,
  updatestudent,
  deletestudent,
  getstudentdetails,
  getStudentDocuments,
  uploadStudentDocument
};

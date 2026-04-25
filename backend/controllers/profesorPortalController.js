const db = require("../db");
const {
  handleDbError,
  isNonEmptyString,
  isNumberInRange,
  isPositiveInteger,
  isValidDate,
  isValidTime,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const validateExamPayload = ({ lende_id, data_provimit, ora, salla, afati }) => {
  if (!isPositiveInteger(lende_id)) {
    return "Lenda duhet te zgjidhet sakte.";
  }

  if (!isValidDate(data_provimit)) {
    return "Data e provimit nuk eshte valide.";
  }

  if (!isValidTime(ora)) {
    return "Ora e provimit nuk eshte valide.";
  }

  if (!isNonEmptyString(salla)) {
    return "Salla eshte e detyrueshme.";
  }

  if (!isNonEmptyString(afati)) {
    return "Afati eshte i detyrueshem.";
  }

  return null;
};

const validateGradeCreatePayload = ({
  student_id,
  provimi_id,
  nota,
  data_vendosjes,
}) => {
  if (!isPositiveInteger(student_id)) {
    return "Studenti duhet te zgjidhet sakte.";
  }

  if (!isPositiveInteger(provimi_id)) {
    return "Provimi duhet te zgjidhet sakte.";
  }

  if (!isNumberInRange(nota, 5, 10)) {
    return "Nota duhet te jete nga 5 deri ne 10.";
  }

  if (!isValidDate(data_vendosjes)) {
    return "Data e vendosjes nuk eshte valide.";
  }

  return null;
};

const validateGradeUpdatePayload = ({ nota, data_vendosjes }) => {
  if (!isNumberInRange(nota, 5, 10)) {
    return "Nota duhet te jete nga 5 deri ne 10.";
  }

  if (!isValidDate(data_vendosjes)) {
    return "Data e vendosjes nuk eshte valide.";
  }

  return null;
};

const getOwnedCourse = async (profesorId, lendeId) => {
  const [rows] = await connection.query(
    `
      SELECT lende_id, emri, kodi, semestri, kreditet, lloji, pershkrimi
      FROM lendet
      WHERE lende_id = ? AND profesor_id = ?
      LIMIT 1
    `,
    [lendeId, profesorId]
  );

  return rows[0] || null;
};

const getOwnedExam = async (profesorId, provimiId) => {
  const [rows] = await connection.query(
    `
      SELECT
        p.provimi_id,
        p.lende_id,
        p.profesor_id,
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati,
        l.emri AS lenda,
        l.kodi
      FROM provimet p
      JOIN lendet l ON p.lende_id = l.lende_id
      WHERE p.provimi_id = ? AND p.profesor_id = ?
      LIMIT 1
    `,
    [provimiId, profesorId]
  );

  return rows[0] || null;
};

const isStudentEnrolledInCourse = async (studentId, lendeId) => {
  const [rows] = await connection.query(
    `
      SELECT COUNT(*) AS total
      FROM regjistrimet
      WHERE student_id = ? AND lende_id = ?
    `,
    [studentId, lendeId]
  );

  return rows[0].total > 0;
};

const getProfesorProfile = async (profesorId) => {
  const [rows] = await connection.query(
    `
      SELECT
        p.profesor_id,
        p.emri,
        p.mbiemri,
        p.email,
        p.telefoni,
        p.titulli_akademik,
        p.specializimi,
        p.data_punesimit,
        d.emri AS departamenti
      FROM profesoret p
      LEFT JOIN departamentet d ON p.departamenti_id = d.departament_id
      WHERE p.profesor_id = ?
      LIMIT 1
    `,
    [profesorId]
  );

  return rows[0] || null;
};

const getProfesorCourses = async (profesorId) => {
  const [rows] = await connection.query(
    `
      SELECT
        l.lende_id,
        l.emri,
        l.kodi,
        l.semestri,
        l.kreditet,
        l.lloji,
        l.pershkrimi,
        (
          SELECT COUNT(DISTINCT r.student_id)
          FROM regjistrimet r
          WHERE r.lende_id = l.lende_id
        ) AS total_studentesh,
        (
          SELECT COUNT(*)
          FROM provimet p
          WHERE p.lende_id = l.lende_id
        ) AS total_provimeve
      FROM lendet l
      WHERE l.profesor_id = ?
      ORDER BY l.emri
    `,
    [profesorId]
  );

  return rows;
};

const getProfesorSchedule = async (profesorId) => {
  const [rows] = await connection.query(
    `
      SELECT
        o.orari_id,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        o.dita,
        o.ora_fillimit,
        o.ora_mbarimit,
        o.salla
      FROM oraret o
      JOIN lendet l ON o.lende_id = l.lende_id
      WHERE o.profesor_id = ?
      ORDER BY FIELD(o.dita, 'E hene', 'E marte', 'E merkure', 'E enjte', 'E premte', 'E shtune', 'E diel'), o.ora_fillimit
    `,
    [profesorId]
  );

  return rows;
};

const getProfesorExams = async (profesorId) => {
  const [rows] = await connection.query(
    `
      SELECT
        p.provimi_id,
        p.lende_id,
        l.emri AS lenda,
        l.kodi,
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati,
        (
          SELECT COUNT(*)
          FROM notat n
          WHERE n.provimi_id = p.provimi_id
        ) AS total_notash
      FROM provimet p
      JOIN lendet l ON p.lende_id = l.lende_id
      WHERE p.profesor_id = ?
      ORDER BY p.data_provimit DESC, p.ora DESC
    `,
    [profesorId]
  );

  return rows;
};

const getProfile = async (req, res) => {
  try {
    const profile = await getProfesorProfile(req.user.profesor_id);

    if (!profile) {
      return res.status(404).json({ message: "Profili nuk u gjet." });
    }

    res.json({ profile });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se profilit te profesorit.");
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await getProfesorCourses(req.user.profesor_id);
    res.json(courses);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se lendeve te profesorit.");
  }
};

const getCourseStudents = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await getOwnedCourse(req.user.profesor_id, id);

    if (!course) {
      return res.status(404).json({ message: "Lenda nuk u gjet." });
    }

    const [rows] = await connection.query(
      `
        SELECT
          s.student_id,
          s.emri,
          s.mbiemri,
          s.email,
          s.viti_studimit,
          s.statusi,
          MAX(r.regjistrimi_id) AS regjistrimi_id,
          MAX(r.viti_akademik) AS viti_akademik,
          MAX(r.semestri) AS semestri,
          MAX(r.statusi) AS statusi_regjistrimit
        FROM regjistrimet r
        JOIN studentet s ON r.student_id = s.student_id
        WHERE r.lende_id = ?
        GROUP BY s.student_id, s.emri, s.mbiemri, s.email, s.viti_studimit, s.statusi
        ORDER BY s.emri, s.mbiemri
      `,
      [id]
    );

    res.json({
      course,
      students: rows,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se studenteve te lendes.");
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await getProfesorExams(req.user.profesor_id);
    res.json(exams);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se provimeve te profesorit.");
  }
};

const createExam = async (req, res) => {
  const validationError = validateExamPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const course = await getOwnedCourse(req.user.profesor_id, req.body.lende_id);

    if (!course) {
      return res.status(403).json({
        message: "Mund te krijoni provim vetem per lendet tuaja.",
      });
    }

    const [result] = await connection.query(
      `
        INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        req.body.lende_id,
        req.user.profesor_id,
        req.body.data_provimit,
        req.body.ora,
        req.body.salla.trim(),
        req.body.afati.trim(),
      ]
    );

    res.status(201).json({
      message: "Provimi u shtua me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate shtimit te provimit.");
  }
};

const updateExam = async (req, res) => {
  const validationError = validateExamPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const existingExam = await getOwnedExam(req.user.profesor_id, req.params.id);

    if (!existingExam) {
      return res.status(404).json({ message: "Provimi nuk u gjet." });
    }

    const course = await getOwnedCourse(req.user.profesor_id, req.body.lende_id);

    if (!course) {
      return res.status(403).json({
        message: "Mund te perditesoni provim vetem per lendet tuaja.",
      });
    }

    await connection.query(
      `
        UPDATE provimet
        SET lende_id = ?, data_provimit = ?, ora = ?, salla = ?, afati = ?
        WHERE provimi_id = ? AND profesor_id = ?
      `,
      [
        req.body.lende_id,
        req.body.data_provimit,
        req.body.ora,
        req.body.salla.trim(),
        req.body.afati.trim(),
        req.params.id,
        req.user.profesor_id,
      ]
    );

    res.json({ message: "Provimi u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te provimit.");
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await getOwnedExam(req.user.profesor_id, req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Provimi nuk u gjet." });
    }

    await connection.query(
      `
        DELETE FROM provimet
        WHERE provimi_id = ? AND profesor_id = ?
      `,
      [req.params.id, req.user.profesor_id]
    );

    res.json({ message: "Provimi u fshi me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate fshirjes se provimit.");
  }
};

const getExamStudents = async (req, res) => {
  try {
    const exam = await getOwnedExam(req.user.profesor_id, req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Provimi nuk u gjet." });
    }

    const [rows] = await connection.query(
      `
        SELECT
          s.student_id,
          s.emri,
          s.mbiemri,
          s.email,
          s.viti_studimit,
          MAX(r.regjistrimi_id) AS regjistrimi_id,
          MAX(r.statusi) AS statusi_regjistrimit,
          n.nota_id,
          n.nota,
          n.data_vendosjes
        FROM regjistrimet r
        JOIN studentet s ON r.student_id = s.student_id
        LEFT JOIN notat n
          ON n.student_id = s.student_id
         AND n.provimi_id = ?
        WHERE r.lende_id = ?
        GROUP BY s.student_id, s.emri, s.mbiemri, s.email, s.viti_studimit, n.nota_id, n.nota, n.data_vendosjes
        ORDER BY s.emri, s.mbiemri
      `,
      [req.params.id, exam.lende_id]
    );

    res.json({
      exam,
      students: rows,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se studenteve per provimin.");
  }
};

const createGrade = async (req, res) => {
  const validationError = validateGradeCreatePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const exam = await getOwnedExam(req.user.profesor_id, req.body.provimi_id);

    if (!exam) {
      return res.status(403).json({
        message: "Mund te vendosni nota vetem per provimet tuaja.",
      });
    }

    const enrolled = await isStudentEnrolledInCourse(
      req.body.student_id,
      exam.lende_id
    );

    if (!enrolled) {
      return res.status(400).json({
        message: "Ky student nuk eshte i regjistruar ne lenden e zgjedhur.",
      });
    }

    const [existingRows] = await connection.query(
      `
        SELECT nota_id
        FROM notat
        WHERE student_id = ? AND provimi_id = ?
        LIMIT 1
      `,
      [req.body.student_id, req.body.provimi_id]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        message: "Nota per kete student dhe provim ekziston tashme.",
      });
    }

    const [result] = await connection.query(
      `
        INSERT INTO notat (student_id, provimi_id, nota, data_vendosjes)
        VALUES (?, ?, ?, ?)
      `,
      [
        req.body.student_id,
        req.body.provimi_id,
        req.body.nota,
        req.body.data_vendosjes,
      ]
    );

    res.status(201).json({
      message: "Nota u vendos me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate vendosjes se notes.");
  }
};

const updateGrade = async (req, res) => {
  const validationError = validateGradeUpdatePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const [rows] = await connection.query(
      `
        SELECT
          n.nota_id,
          n.student_id,
          n.provimi_id
        FROM notat n
        JOIN provimet p ON n.provimi_id = p.provimi_id
        WHERE n.nota_id = ? AND p.profesor_id = ?
        LIMIT 1
      `,
      [req.params.id, req.user.profesor_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet." });
    }

    await connection.query(
      `
        UPDATE notat
        SET nota = ?, data_vendosjes = ?
        WHERE nota_id = ?
      `,
      [req.body.nota, req.body.data_vendosjes, req.params.id]
    );

    res.json({ message: "Nota u perditesua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate perditesimit te notes.");
  }
};

const getSchedule = async (req, res) => {
  try {
    const schedule = await getProfesorSchedule(req.user.profesor_id);
    res.json(schedule);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se orarit te profesorit.");
  }
};

module.exports = {
  createExam,
  createGrade,
  deleteExam,
  getCourseStudents,
  getCourses,
  getExamStudents,
  getExams,
  getProfile,
  getSchedule,
  updateExam,
  updateGrade,
};

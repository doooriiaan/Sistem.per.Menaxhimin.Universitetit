const db = require("../db");
const { handleDbError } = require("../utils/validation");

const connection = db.promise();

const getStudentProfile = async (studentId) => {
  const [profileRows] = await connection.query(
    `
      SELECT
        s.student_id,
        s.emri,
        s.mbiemri,
        s.email,
        s.telefoni,
        s.adresa,
        s.statusi,
        s.viti_studimit,
        s.data_lindjes,
        d.emri AS drejtimi,
        f.emri AS fakulteti
      FROM studentet s
      LEFT JOIN drejtimet d ON s.drejtimi_id = d.drejtim_id
      LEFT JOIN fakultetet f ON d.fakulteti_id = f.fakultet_id
      WHERE s.student_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  const [summaryRows] = await connection.query(
    `
      SELECT
        ROUND(AVG(n.nota), 2) AS mesatarja,
        COUNT(n.nota_id) AS total_notash,
        (
          SELECT COUNT(*)
          FROM regjistrimet r
          WHERE r.student_id = ?
        ) AS total_regjistrimeve
      FROM notat n
      WHERE n.student_id = ?
    `,
    [studentId, studentId]
  );

  return {
    profile: profileRows[0] || null,
    summary: summaryRows[0] || {
      mesatarja: null,
      total_notash: 0,
      total_regjistrimeve: 0,
    },
  };
};

const getStudentGrades = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT
        n.nota_id,
        n.nota,
        n.data_vendosjes,
        p.provimi_id,
        p.data_provimit,
        p.afati,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        CONCAT(COALESCE(pr.emri, ''), ' ', COALESCE(pr.mbiemri, '')) AS profesori
      FROM notat n
      JOIN provimet p ON n.provimi_id = p.provimi_id
      JOIN lendet l ON p.lende_id = l.lende_id
      LEFT JOIN profesoret pr ON p.profesor_id = pr.profesor_id
      WHERE n.student_id = ?
      ORDER BY n.data_vendosjes DESC, p.data_provimit DESC
    `,
    [studentId]
  );

  return rows;
};

const getStudentEnrollments = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT
        r.regjistrimi_id,
        r.semestri,
        r.viti_akademik,
        r.statusi,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        l.kreditet,
        l.lloji,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori
      FROM regjistrimet r
      JOIN lendet l ON r.lende_id = l.lende_id
      LEFT JOIN profesoret p ON l.profesor_id = p.profesor_id
      WHERE r.student_id = ?
      ORDER BY r.viti_akademik DESC, l.emri
    `,
    [studentId]
  );

  return rows;
};

const getStudentExams = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT DISTINCT
        p.provimi_id,
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        CONCAT(COALESCE(pr.emri, ''), ' ', COALESCE(pr.mbiemri, '')) AS profesori
      FROM regjistrimet r
      JOIN provimet p ON r.lende_id = p.lende_id
      JOIN lendet l ON p.lende_id = l.lende_id
      LEFT JOIN profesoret pr ON p.profesor_id = pr.profesor_id
      WHERE r.student_id = ?
      ORDER BY p.data_provimit DESC, p.ora DESC
    `,
    [studentId]
  );

  return rows;
};

const getStudentSchedule = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT DISTINCT
        o.orari_id,
        o.dita,
        o.ora_fillimit,
        o.ora_mbarimit,
        o.salla,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori
      FROM regjistrimet r
      JOIN oraret o ON r.lende_id = o.lende_id
      JOIN lendet l ON o.lende_id = l.lende_id
      LEFT JOIN profesoret p ON o.profesor_id = p.profesor_id
      WHERE r.student_id = ?
      ORDER BY FIELD(o.dita, 'E hene', 'E marte', 'E merkure', 'E enjte', 'E premte', 'E shtune', 'E diel'), o.ora_fillimit
    `,
    [studentId]
  );

  return rows;
};

const getProfile = async (req, res) => {
  try {
    const data = await getStudentProfile(req.user.student_id);

    if (!data.profile) {
      return res.status(404).json({ message: "Profili nuk u gjet." });
    }

    res.json(data);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se profilit te studentit.");
  }
};

const getGrades = async (req, res) => {
  try {
    const grades = await getStudentGrades(req.user.student_id);
    res.json(grades);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se notave te studentit.");
  }
};

const getEnrollments = async (req, res) => {
  try {
    const enrollments = await getStudentEnrollments(req.user.student_id);
    res.json(enrollments);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se regjistrimeve te studentit.");
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await getStudentExams(req.user.student_id);
    res.json(exams);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se provimeve te studentit.");
  }
};

const getSchedule = async (req, res) => {
  try {
    const schedule = await getStudentSchedule(req.user.student_id);
    res.json(schedule);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se orarit te studentit.");
  }
};

module.exports = {
  getEnrollments,
  getExams,
  getGrades,
  getProfile,
  getSchedule,
};

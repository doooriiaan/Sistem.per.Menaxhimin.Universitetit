const db = require("../db");
const { sendSuccess } = require("../utils/apiResponse");
const { buildFileUrl } = require("../utils/fileStorage");
const {
  handleDbError,
  isPositiveInteger,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? year : year - 1;

  return `${startYear}/${startYear + 1}`;
};

const getCurrentSemesterForStudent = (studyYear) => {
  const normalizedStudyYear = Math.max(1, Number(studyYear) || 1);
  const month = new Date().getMonth();
  const isWinterSemester = month >= 8 || month <= 0;

  return normalizedStudyYear * 2 - (isWinterSemester ? 1 : 0);
};

const getEnrollmentSemester = (student, requestedSemester) => {
  if (isPositiveInteger(requestedSemester)) {
    return Number(requestedSemester);
  }

  return (
    Number(student.active_semestri) ||
    getCurrentSemesterForStudent(student.viti_studimit)
  );
};

const getStudentForEnrollment = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT
        s.student_id,
        s.emri,
        s.mbiemri,
        s.drejtimi_id,
        s.viti_studimit,
        active_courses.semestri AS active_semestri
      FROM studentet s
      LEFT JOIN (
        SELECT
          r.student_id,
          MAX(r.semestri) AS semestri
        FROM regjistrimet r
        WHERE r.student_id = ?
          AND r.statusi = 'Aktiv'
        GROUP BY r.student_id
      ) active_courses ON active_courses.student_id = s.student_id
      WHERE s.student_id = ?
      LIMIT 1
    `,
    [studentId, studentId]
  );

  return rows[0] || null;
};

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
        g.emri AS gjenerata,
        d.emri AS drejtimi,
        f.emri AS fakulteti
      FROM studentet s
      LEFT JOIN gjeneratat g ON s.gjenerata_id = g.gjenerata_id
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
        ) AS total_regjistrimeve,
        (
          SELECT COUNT(*)
          FROM kerkesat_sherbimeve ks
          WHERE ks.student_id = ?
        ) AS total_kerkesave_sherbimeve,
        (
          SELECT COUNT(*)
          FROM rindjekjet_lendeve rl
          WHERE rl.student_id = ?
        ) AS total_rindjekjeve
      FROM notat n
      WHERE n.student_id = ?
    `,
    [studentId, studentId, studentId, studentId]
  );

  return {
    profile: profileRows[0] || null,
    summary: summaryRows[0] || {
      mesatarja: null,
      total_notash: 0,
      total_regjistrimeve: 0,
      total_kerkesave_sherbimeve: 0,
      total_rindjekjeve: 0,
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
        (
          SELECT COUNT(*)
          FROM regjistrim_dokumentet rd
          WHERE rd.regjistrimi_id = r.regjistrimi_id
        ) AS total_dokumenteve,
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

const getAvailableSemestersForEnrollment = async (studentId) => {
  const student = await getStudentForEnrollment(studentId);

  if (!student) {
    return null;
  }

  const currentSemester = getEnrollmentSemester(student);
  const [rows] = await connection.query(
    `
      SELECT
        l.semestri,
        COUNT(DISTINCT l.lende_id) AS total_lende,
        COUNT(DISTINCT registered.lende_id) AS total_regjistruar,
        CASE WHEN l.semestri = ? THEN 1 ELSE 0 END AS is_current
      FROM lendet l
      LEFT JOIN regjistrimet registered
        ON registered.lende_id = l.lende_id
       AND registered.student_id = ?
      WHERE l.drejtimi_id = ?
      GROUP BY l.semestri
      ORDER BY l.semestri ASC
    `,
    [currentSemester, studentId, student.drejtimi_id]
  );

  return rows;
};

const getAvailableCoursesForEnrollment = async (studentId, requestedSemester) => {
  const student = await getStudentForEnrollment(studentId);

  if (!student) {
    return null;
  }

  const currentSemester = getEnrollmentSemester(student, requestedSemester);
  const [rows] = await connection.query(
    `
      SELECT
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        l.kreditet,
        l.semestri,
        l.lloji,
        l.pershkrimi,
        r.regjistrimi_id,
        r.statusi AS statusi_regjistrimit,
        CASE WHEN r.regjistrimi_id IS NULL THEN 0 ELSE 1 END AS is_registered,
        CASE
          WHEN r.regjistrimi_id IS NULL THEN NULL
          ELSE CONCAT(?, ' ', ?)
        END AS studenti_regjistruar,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori
      FROM lendet l
      LEFT JOIN profesoret p ON l.profesor_id = p.profesor_id
      LEFT JOIN regjistrimet r
        ON r.lende_id = l.lende_id
       AND r.student_id = ?
      WHERE l.drejtimi_id = ?
        AND l.semestri = ?
      ORDER BY l.emri ASC
    `,
    [
      student.emri || "",
      student.mbiemri || "",
      studentId,
      student.drejtimi_id,
      currentSemester,
    ]
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
        CONCAT(COALESCE(pr.emri, ''), ' ', COALESCE(pr.mbiemri, '')) AS profesori,
        pp.paraqitje_id,
        pp.statusi AS statusi_paraqitjes,
        pp.paraqitur_at,
        n.nota_id,
        n.nota,
        n.data_vendosjes,
        course_grade.nota_id AS course_nota_id,
        course_grade.nota AS course_nota
      FROM regjistrimet r
      JOIN provimet p ON r.lende_id = p.lende_id
      JOIN lendet l ON p.lende_id = l.lende_id
      LEFT JOIN profesoret pr ON p.profesor_id = pr.profesor_id
      LEFT JOIN paraqitjet_provimeve pp
        ON pp.provimi_id = p.provimi_id
       AND pp.student_id = r.student_id
      LEFT JOIN notat n
        ON n.provimi_id = p.provimi_id
       AND n.student_id = r.student_id
      LEFT JOIN (
        SELECT
          p2.lende_id,
          n2.student_id,
          MAX(n2.nota_id) AS nota_id,
          MAX(n2.nota) AS nota
        FROM notat n2
        JOIN provimet p2 ON n2.provimi_id = p2.provimi_id
        GROUP BY p2.lende_id, n2.student_id
      ) course_grade
        ON course_grade.lende_id = l.lende_id
       AND course_grade.student_id = r.student_id
      WHERE r.student_id = ?
      ORDER BY
        CASE WHEN p.data_provimit >= CURDATE() THEN 0 ELSE 1 END,
        CASE WHEN p.data_provimit >= CURDATE() THEN p.data_provimit END ASC,
        CASE WHEN p.data_provimit < CURDATE() THEN p.data_provimit END DESC,
        p.ora ASC
    `,
    [studentId]
  );

  return rows;
};

const getStudentExamApplications = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT
        pp.paraqitje_id,
        pp.student_id,
        pp.provimi_id,
        pp.statusi AS statusi_paraqitjes,
        pp.paraqitur_at,
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        CONCAT(COALESCE(pr.emri, ''), ' ', COALESCE(pr.mbiemri, '')) AS profesori,
        n.nota_id,
        n.nota,
        n.data_vendosjes
      FROM paraqitjet_provimeve pp
      JOIN provimet p ON pp.provimi_id = p.provimi_id
      JOIN lendet l ON p.lende_id = l.lende_id
      LEFT JOIN profesoret pr ON p.profesor_id = pr.profesor_id
      LEFT JOIN notat n
        ON n.provimi_id = pp.provimi_id
       AND n.student_id = pp.student_id
      WHERE pp.student_id = ?
      ORDER BY
        CASE WHEN p.data_provimit >= CURDATE() THEN 0 ELSE 1 END,
        CASE WHEN p.data_provimit >= CURDATE() THEN p.data_provimit END ASC,
        CASE WHEN p.data_provimit < CURDATE() THEN p.data_provimit END DESC,
        p.ora ASC
    `,
    [studentId]
  );

  return rows;
};

const getStudentTranscript = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT
        r.regjistrimi_id,
        r.viti_akademik,
        r.semestri,
        r.statusi AS statusi_regjistrimit,
        l.lende_id,
        l.emri AS lenda,
        l.kodi,
        l.kreditet,
        l.lloji,
        CONCAT(COALESCE(pr.emri, ''), ' ', COALESCE(pr.mbiemri, '')) AS profesori,
        grade_summary.nota_finale,
        grade_summary.data_notes,
        CASE
          WHEN grade_summary.nota_finale >= 6 THEN 'Kaluar'
          WHEN grade_summary.nota_finale IS NOT NULL THEN 'Jo kaluese'
          ELSE 'Ne vijim'
        END AS statusi_akademik
      FROM regjistrimet r
      JOIN lendet l ON r.lende_id = l.lende_id
      LEFT JOIN profesoret pr ON l.profesor_id = pr.profesor_id
      LEFT JOIN (
        SELECT
          p.lende_id,
          n.student_id,
          MAX(n.nota) AS nota_finale,
          MAX(n.data_vendosjes) AS data_notes
        FROM notat n
        JOIN provimet p ON n.provimi_id = p.provimi_id
        WHERE n.student_id = ?
        GROUP BY p.lende_id, n.student_id
      ) grade_summary
        ON grade_summary.lende_id = r.lende_id
       AND grade_summary.student_id = r.student_id
      WHERE r.student_id = ?
      ORDER BY r.viti_akademik DESC, r.semestri DESC, l.emri ASC
    `,
    [studentId, studentId]
  );

  return rows;
};

const getAccessibleExamForStudent = async (studentId, examId) => {
  const [rows] = await connection.query(
    `
      SELECT
        p.provimi_id,
        p.lende_id,
        p.data_provimit,
        p.ora,
        p.afati,
        l.emri AS lenda,
        (
          SELECT COUNT(*)
          FROM notat n
          JOIN provimet graded_exam ON n.provimi_id = graded_exam.provimi_id
          WHERE n.student_id = ?
            AND graded_exam.lende_id = p.lende_id
        ) AS total_course_grades,
        CASE WHEN p.data_provimit < CURDATE() THEN 1 ELSE 0 END AS is_past
      FROM provimet p
      JOIN lendet l ON p.lende_id = l.lende_id
      JOIN regjistrimet r
        ON r.lende_id = p.lende_id
       AND r.student_id = ?
      WHERE p.provimi_id = ?
      LIMIT 1
    `,
    [studentId, studentId, examId]
  );

  return rows[0] || null;
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

const getStudentDocuments = async (studentId, req) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM student_dokumentet
      WHERE student_id = ?
      ORDER BY uploaded_at DESC
    `,
    [studentId]
  );

  return rows.map((row) => ({
    ...row,
    download_url: buildFileUrl(req, row.file_path),
  }));
};

const getAcademicHistory = async (studentId) => {
  const [rows] = await connection.query(
    `
      SELECT
        history.viti_akademik,
        history.semestri,
        COUNT(*) AS total_courses,
        ROUND(AVG(history.final_grade), 2) AS average_grade,
        SUM(CASE WHEN history.final_grade >= 6 THEN 1 ELSE 0 END) AS passed_courses,
        SUM(CASE WHEN history.final_grade IS NULL OR history.final_grade < 6 THEN 1 ELSE 0 END) AS open_courses
      FROM (
        SELECT
          r.regjistrimi_id,
          r.viti_akademik,
          r.semestri,
          (
            SELECT MAX(n.nota)
            FROM provimet p
            JOIN notat n ON n.provimi_id = p.provimi_id
            WHERE p.lende_id = r.lende_id
              AND n.student_id = r.student_id
          ) AS final_grade
        FROM regjistrimet r
        WHERE r.student_id = ?
      ) AS history
      GROUP BY history.viti_akademik, history.semestri
      ORDER BY history.viti_akademik DESC, history.semestri DESC
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

const getAvailableCourses = async (req, res) => {
  try {
    const courses = await getAvailableCoursesForEnrollment(
      req.user.student_id,
      req.query.semestri
    );

    if (!courses) {
      return res.status(404).json({ message: "Profili i studentit nuk u gjet." });
    }

    res.json(courses);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se lendeve per regjistrim.");
  }
};

const getAvailableSemesters = async (req, res) => {
  try {
    const semesters = await getAvailableSemestersForEnrollment(req.user.student_id);

    if (!semesters) {
      return res.status(404).json({ message: "Profili i studentit nuk u gjet." });
    }

    res.json(semesters);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se semestrave.");
  }
};

const registerCourse = async (req, res) => {
  const requestedCourseIds = Array.isArray(req.body.lende_ids)
    ? req.body.lende_ids
    : [req.body.lende_id];
  const courseIds = [
    ...new Set(requestedCourseIds.map((courseId) => Number(courseId))),
  ];

  if (courseIds.length === 0 || courseIds.some((courseId) => !isPositiveInteger(courseId))) {
    return sendValidationError(res, "Zgjidh te pakten nje lende valide.");
  }

  try {
    const student = await getStudentForEnrollment(req.user.student_id);

    if (!student) {
      return res.status(404).json({ message: "Profili i studentit nuk u gjet." });
    }

    const currentSemester = getEnrollmentSemester(student, req.body.semestri);
    const [courseRows] = await connection.query(
      `
        SELECT lende_id, semestri
        FROM lendet l
        WHERE l.lende_id IN (?)
          AND l.drejtimi_id = ?
          AND l.semestri = ?
      `,
      [courseIds, student.drejtimi_id, currentSemester]
    );

    if (courseRows.length !== courseIds.length) {
      return res.status(403).json({
        message: "Nje ose me shume lende nuk jane te disponueshme per drejtimin dhe semestrin tuaj aktual.",
      });
    }

    const [existingRows] = await connection.query(
      `
        SELECT regjistrimi_id, lende_id
        FROM regjistrimet
        WHERE student_id = ? AND lende_id IN (?)
      `,
      [req.user.student_id, courseIds]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        message: "Je i regjistruar tashme ne nje ose me shume nga keto lende.",
      });
    }

    const academicYear = getCurrentAcademicYear();
    const insertValues = courseRows.map((course) => [
      req.user.student_id,
      course.lende_id,
      currentSemester,
      academicYear,
      "Aktiv",
    ]);

    const [result] = await connection.query(
      `
        INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
        VALUES ?
      `,
      [insertValues]
    );

    res.status(201).json({
      message:
        courseRows.length === 1
          ? "Lenda u regjistrua me sukses."
          : "Lendet u regjistruan me sukses.",
      id: result.insertId,
      total: courseRows.length,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate regjistrimit te lendes.");
  }
};

const deleteEnrollment = async (req, res) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return sendValidationError(res, "Regjistrimi duhet te zgjidhet sakte.");
  }

  try {
    const [rows] = await connection.query(
      `
        SELECT regjistrimi_id, lende_id
        FROM regjistrimet
        WHERE regjistrimi_id = ? AND student_id = ?
        LIMIT 1
      `,
      [id, req.user.student_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet." });
    }

    const [usageRows] = await connection.query(
      `
        SELECT
          (
            SELECT COUNT(*)
            FROM paraqitjet_provimeve pp
            JOIN provimet p ON pp.provimi_id = p.provimi_id
            WHERE pp.student_id = ?
              AND p.lende_id = ?
          ) AS total_paraqitjeve,
          (
            SELECT COUNT(*)
            FROM notat n
            JOIN provimet p ON n.provimi_id = p.provimi_id
            WHERE n.student_id = ?
              AND p.lende_id = ?
          ) AS total_notave
      `,
      [
        req.user.student_id,
        rows[0].lende_id,
        req.user.student_id,
        rows[0].lende_id,
      ]
    );

    if (
      Number(usageRows[0]?.total_paraqitjeve || 0) > 0 ||
      Number(usageRows[0]?.total_notave || 0) > 0
    ) {
      return res.status(400).json({
        message:
          "Nuk mund te hiqet regjistrimi sepse ka paraqitje provimi ose note.",
      });
    }

    await connection.query(
      `
        DELETE FROM regjistrimet
        WHERE regjistrimi_id = ? AND student_id = ?
      `,
      [id, req.user.student_id]
    );

    res.json({ message: "Regjistrimi u hoq me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate heqjes se regjistrimit.");
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

const getExamApplications = async (req, res) => {
  try {
    const applications = await getStudentExamApplications(req.user.student_id);
    res.json(applications);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se provimeve te paraqitura.");
  }
};

const applyForExam = async (req, res) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return sendValidationError(res, "Provimi duhet te zgjidhet sakte.");
  }

  try {
    const exam = await getAccessibleExamForStudent(req.user.student_id, id);

    if (!exam) {
      return res.status(404).json({
        message: "Provimi nuk u gjet ose nuk eshte i lidhur me regjistrimet tuaja.",
      });
    }

    if (Number(exam.is_past) === 1) {
      return res.status(400).json({
        message: "Nuk mund te paraqitet nje provim qe ka kaluar.",
      });
    }

    if (Number(exam.total_course_grades) > 0) {
      return res.status(400).json({
        message: "Kjo lende eshte tashme e notuar dhe nuk mund te paraqitet perseri.",
      });
    }

    const [result] = await connection.query(
      `
        INSERT INTO paraqitjet_provimeve (student_id, provimi_id, statusi)
        VALUES (?, ?, 'Paraqitur')
      `,
      [req.user.student_id, id]
    );

    res.status(201).json({
      message: "Provimi u paraqit me sukses.",
      id: result.insertId,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate paraqitjes se provimit.");
  }
};

const cancelExamApplication = async (req, res) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return sendValidationError(res, "Provimi duhet te zgjidhet sakte.");
  }

  try {
    const [gradeRows] = await connection.query(
      `
        SELECT nota_id
        FROM notat
        WHERE student_id = ? AND provimi_id = ?
        LIMIT 1
      `,
      [req.user.student_id, id]
    );

    if (gradeRows.length > 0) {
      return res.status(400).json({
        message: "Nuk mund te anulohet paraqitja pasi nota eshte vendosur.",
      });
    }

    const [result] = await connection.query(
      `
        DELETE pp
        FROM paraqitjet_provimeve pp
        JOIN provimet p ON pp.provimi_id = p.provimi_id
        WHERE pp.student_id = ?
          AND pp.provimi_id = ?
          AND p.data_provimit >= CURDATE()
      `,
      [req.user.student_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Paraqitja nuk u gjet ose provimi ka kaluar.",
      });
    }

    res.json({ message: "Paraqitja e provimit u anulua me sukses." });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate anulimit te paraqitjes.");
  }
};

const getTranscript = async (req, res) => {
  try {
    const transcript = await getStudentTranscript(req.user.student_id);
    res.json(transcript);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se transkriptes.");
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

const getProfileOverview = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const [profileData, grades, enrollments, documents, history] = await Promise.all(
      [
        getStudentProfile(studentId),
        getStudentGrades(studentId),
        getStudentEnrollments(studentId),
        getStudentDocuments(studentId, req),
        getAcademicHistory(studentId),
      ]
    );

    if (!profileData.profile) {
      return res.status(404).json({
        success: false,
        message: "Profili nuk u gjet.",
      });
    }

    return sendSuccess(res, {
      message: "Profili i plote i studentit u mor me sukses.",
      data: {
        ...profileData,
        grades,
        enrollments,
        documents,
        history,
      },
    });
  } catch (err) {
    return handleDbError(
      res,
      err,
      "Gabim gjate marrjes se profilit te plote te studentit."
    );
  }
};

module.exports = {
  applyForExam,
  cancelExamApplication,
  deleteEnrollment,
  getAvailableCourses,
  getAvailableSemesters,
  getEnrollments,
  getExamApplications,
  getExams,
  getGrades,
  getProfile,
  getProfileOverview,
  getSchedule,
  getTranscript,
  registerCourse,
};

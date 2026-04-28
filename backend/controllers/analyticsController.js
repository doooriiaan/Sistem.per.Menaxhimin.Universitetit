const db = require("../db");
const { sendSuccess } = require("../utils/apiResponse");
const { handleDbError } = require("../utils/validation");

const connection = db.promise();

const getAnalyticsOverview = async (req, res) => {
  try {
    const [
      summaryRows,
      studentsByFacultyRows,
      registrationsBySemesterRows,
      gradeDistributionRows,
      professorWorkloadRows,
    ] = await Promise.all([
      connection.query(
        `
          SELECT
            (SELECT COUNT(*) FROM studentet) AS total_students,
            (SELECT COUNT(*) FROM profesoret) AS total_professors,
            (SELECT COUNT(*) FROM lendet) AS total_courses,
            (SELECT COUNT(*) FROM regjistrimet) AS total_registrations,
            (SELECT COUNT(*) FROM provimet) AS total_exams,
            (SELECT COUNT(*) FROM kerkesat_sherbimeve WHERE statusi = 'Ne pritje') AS pending_service_requests
        `
      ),
      connection.query(
        `
          SELECT
            COALESCE(f.emri, 'Pa fakultet') AS faculty,
            COUNT(*) AS total
          FROM studentet s
          LEFT JOIN drejtimet d ON s.drejtimi_id = d.drejtim_id
          LEFT JOIN fakultetet f ON d.fakulteti_id = f.fakultet_id
          GROUP BY COALESCE(f.emri, 'Pa fakultet')
          ORDER BY total DESC, faculty ASC
        `
      ),
      connection.query(
        `
          SELECT
            CONCAT('Semestri ', r.semestri) AS semester,
            r.semestri,
            r.viti_akademik AS academic_year,
            COUNT(*) AS total
          FROM regjistrimet r
          GROUP BY r.viti_akademik, r.semestri
          ORDER BY r.viti_akademik ASC, r.semestri ASC
        `
      ),
      connection.query(
        `
          SELECT
            CAST(n.nota AS CHAR) AS grade,
            COUNT(*) AS total
          FROM notat n
          GROUP BY n.nota
          ORDER BY n.nota ASC
        `
      ),
      connection.query(
        `
          SELECT
            p.profesor_id,
            CONCAT(p.emri, ' ', p.mbiemri) AS professor,
            COUNT(DISTINCT l.lende_id) AS courses,
            COUNT(DISTINCT r.student_id) AS students,
            COUNT(DISTINCT pr.provimi_id) AS exams,
            COUNT(DISTINCT o.orari_id) AS schedule_slots
          FROM profesoret p
          LEFT JOIN lendet l ON l.profesor_id = p.profesor_id
          LEFT JOIN regjistrimet r ON r.lende_id = l.lende_id
          LEFT JOIN provimet pr ON pr.profesor_id = p.profesor_id
          LEFT JOIN oraret o ON o.profesor_id = p.profesor_id
          GROUP BY p.profesor_id, p.emri, p.mbiemri
          ORDER BY courses DESC, students DESC, professor ASC
          LIMIT 8
        `
      ),
    ]);

    return sendSuccess(res, {
      message: "Analitika u mor me sukses.",
      data: {
        summary: summaryRows[0][0] || {},
        studentsByFaculty: studentsByFacultyRows[0],
        registrationsBySemester: registrationsBySemesterRows[0],
        gradeDistribution: gradeDistributionRows[0],
        professorWorkload: professorWorkloadRows[0],
      },
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se analitikes.");
  }
};

module.exports = {
  getAnalyticsOverview,
};

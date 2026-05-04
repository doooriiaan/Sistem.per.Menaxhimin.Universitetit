const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("../utils/authConfig");
const {
  clearRefreshTokenCookie,
  createRefreshToken,
  getRefreshTokenFromRequest,
  getRefreshTokenRecord,
  isRefreshTokenExpired,
  markRefreshTokenUsed,
  revokeRefreshToken,
  revokeRefreshTokenById,
  revokeUserRefreshTokens,
  setRefreshTokenCookie,
} = require("../utils/sessionTokens");
const {
  handleDbError,
  isEnumValue,
  isNonEmptyString,
  isValidEmail,
  sendValidationError,
} = require("../utils/validation");

const connection = db.promise();

const ROLE_LABELS = {
  admin: "Admin",
  profesor: "Profesor",
  student: "Student",
};

const DAY_LABELS = [
  "E diel",
  "E hene",
  "E marte",
  "E merkure",
  "E enjte",
  "E premte",
  "E shtune",
];

const getTodayScheduleLabel = () => DAY_LABELS[new Date().getDay()];

const buildAuthUser = (user) => ({
  user_id: user.user_id,
  email: user.email,
  roli: user.role,
  roli_label: ROLE_LABELS[user.role] || user.role,
  admin_id: user.admin_id || null,
  profesor_id: user.profesor_id || null,
  student_id: user.student_id || null,
  emri: user.emri,
  mbiemri: user.mbiemri,
});

const createToken = (user) =>
  jwt.sign(buildAuthUser(user), JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const buildSessionPayload = async (res, user, userAgent) => {
  const { expiresAt, refreshToken } = await createRefreshToken(
    user.user_id,
    userAgent
  );

  setRefreshTokenCookie(res, refreshToken);

  return {
    session: {
      accessTokenExpiresIn: JWT_EXPIRES_IN,
      refreshTokenExpiresAt: expiresAt.toISOString(),
    },
    token: createToken(user),
    user: buildAuthUser(user),
  };
};

const issueAuthResponse = async (
  req,
  res,
  user,
  message,
  statusCode = 200
) => {
  const currentRefreshToken = getRefreshTokenFromRequest(req);

  if (currentRefreshToken) {
    await revokeRefreshToken(currentRefreshToken);
  }

  const payload = await buildSessionPayload(
    res,
    user,
    req.headers["user-agent"]
  );

  return res.status(statusCode).json({
    message,
    ...payload,
  });
};

const getUserByEmail = async (email) => {
  const [rows] = await connection.query(
    `
      SELECT
        u.user_id,
        u.email,
        u.role,
        u.password_hash,
        u.admin_id,
        u.profesor_id,
        u.student_id,
        COALESCE(a.emri, p.emri, s.emri) AS emri,
        COALESCE(a.mbiemri, p.mbiemri, s.mbiemri) AS mbiemri
      FROM users u
      LEFT JOIN admins a ON u.admin_id = a.admin_id
      LEFT JOIN profesoret p ON u.profesor_id = p.profesor_id
      LEFT JOIN studentet s ON u.student_id = s.student_id
      WHERE u.email = ? AND u.is_active = 1
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const getUserById = async (userId) => {
  const [rows] = await connection.query(
    `
      SELECT
        u.user_id,
        u.email,
        u.role,
        u.password_hash,
        u.admin_id,
        u.profesor_id,
        u.student_id,
        COALESCE(a.emri, p.emri, s.emri) AS emri,
        COALESCE(a.mbiemri, p.mbiemri, s.mbiemri) AS mbiemri
      FROM users u
      LEFT JOIN admins a ON u.admin_id = a.admin_id
      LEFT JOIN profesoret p ON u.profesor_id = p.profesor_id
      LEFT JOIN studentet s ON u.student_id = s.student_id
      WHERE u.user_id = ? AND u.is_active = 1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const validateLoginPayload = ({ email, password }) => {
  if (!isValidEmail(email)) {
    return "Email nuk eshte valid.";
  }

  if (!isNonEmptyString(password)) {
    return "Fjalekalimi eshte i detyrueshem.";
  }

  return null;
};

const validateRegisterPayload = ({ role, email, password, confirmPassword }) => {
  if (!isEnumValue(role, ["student", "profesor"])) {
    return "Regjistrimi lejohet vetem per student ose profesor.";
  }

  if (!isValidEmail(email)) {
    return "Email nuk eshte valid.";
  }

  if (!isNonEmptyString(password) || password.trim().length < 8) {
    return "Fjalekalimi duhet te kete te pakten 8 karaktere.";
  }

  if (password !== confirmPassword) {
    return "Fjalekalimet nuk perputhen.";
  }

  return null;
};

const validatePasswordChangePayload = ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  if (!isNonEmptyString(currentPassword)) {
    return "Fjalekalimi aktual eshte i detyrueshem.";
  }

  if (!isNonEmptyString(newPassword) || newPassword.trim().length < 8) {
    return "Fjalekalimi i ri duhet te kete te pakten 8 karaktere.";
  }

  if (newPassword !== confirmPassword) {
    return "Fjalekalimet nuk perputhen.";
  }

  if (currentPassword === newPassword) {
    return "Fjalekalimi i ri duhet te jete i ndryshem nga ai aktual.";
  }

  return null;
};

const getRegisterProfile = async (role, email) => {
  if (role === "student") {
    const [rows] = await connection.query(
      `
        SELECT student_id, emri, mbiemri, email
        FROM studentet
        WHERE LOWER(email) = ?
      `,
      [email]
    );

    return {
      rows,
      idField: "student_id",
    };
  }

  const [rows] = await connection.query(
    `
      SELECT profesor_id, emri, mbiemri, email
      FROM profesoret
      WHERE LOWER(email) = ?
    `,
    [email]
  );

  return {
    rows,
    idField: "profesor_id",
  };
};

const login = async (req, res) => {
  const validationError = validateLoginPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Email ose fjalekalimi nuk eshte i sakte.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Email ose fjalekalimi nuk eshte i sakte.",
      });
    }

    return issueAuthResponse(
      req,
      res,
      user,
      "Identifikimi u krye me sukses."
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate identifikimit.");
  }
};

const register = async (req, res) => {
  const validationError = validateRegisterPayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const role = req.body.role;
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password.trim();

  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: "Per kete email ekziston tashme nje llogari.",
      });
    }

    const { rows, idField } = await getRegisterProfile(role, email);

    if (rows.length === 0) {
      return res.status(404).json({
        message:
          role === "student"
            ? "Nuk u gjet student me kete email. Kontakto administratorin."
            : "Nuk u gjet profesor me kete email. Kontakto administratorin.",
      });
    }

    if (rows.length > 1) {
      return res.status(409).json({
        message:
          "Ky email eshte i lidhur me me shume se nje rekord. Kontakto administratorin.",
      });
    }

    const profile = rows[0];
    const passwordHash = await bcrypt.hash(password, 10);

    const payload = {
      email,
      passwordHash,
      role,
      adminId: null,
      profesorId: null,
      studentId: null,
    };

    payload[idField === "student_id" ? "studentId" : "profesorId"] =
      profile[idField];

    const [result] = await connection.query(
      `
        INSERT INTO users (email, password_hash, role, admin_id, profesor_id, student_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        payload.email,
        payload.passwordHash,
        payload.role,
        payload.adminId,
        payload.profesorId,
        payload.studentId,
      ]
    );

    const registeredUser = {
      user_id: result.insertId,
      email,
      role,
      admin_id: null,
      profesor_id: payload.profesorId,
      student_id: payload.studentId,
      emri: profile.emri,
      mbiemri: profile.mbiemri,
    };

    return issueAuthResponse(
      req,
      res,
      registeredUser,
      "Regjistrimi u krye me sukses.",
      201
    );
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate regjistrimit.");
  }
};

const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        message: "Perdoruesi nuk u gjet.",
      });
    }

    res.json({
      user: buildAuthUser(user),
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se profilit.");
  }
};

const changePassword = async (req, res) => {
  const validationError = validatePasswordChangePayload(req.body);

  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const user = await getUserById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        message: "Perdoruesi nuk u gjet.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      req.body.currentPassword,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Fjalekalimi aktual nuk eshte i sakte.",
      });
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword.trim(), 10);

    await connection.query(
      `
        UPDATE users
        SET password_hash = ?
        WHERE user_id = ?
      `,
      [passwordHash, req.user.user_id]
    );

    if (user.admin_id) {
      await connection.query(
        `
          UPDATE admins
          SET password_hash = ?
          WHERE admin_id = ?
        `,
        [passwordHash, user.admin_id]
      );
    }

    await revokeUserRefreshTokens(req.user.user_id);
    clearRefreshTokenCookie(res);

    return res.json({
      message:
        "Fjalekalimi u ndryshua me sukses. Ju lutem identifikohuni perseri.",
      requiresReauthentication: true,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate ndryshimit te fjalekalimit.");
  }
};

const refresh = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      message: "Sesioni nuk mund te rifreskohet pa refresh token.",
    });
  }

  try {
    const refreshTokenRecord = await getRefreshTokenRecord(refreshToken);

    if (!refreshTokenRecord) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Refresh token nuk eshte valid.",
      });
    }

    if (
      refreshTokenRecord.revoked_at ||
      isRefreshTokenExpired(refreshTokenRecord)
    ) {
      await revokeRefreshTokenById(refreshTokenRecord.refresh_token_id);
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Refresh token ka skaduar ose eshte revokuar.",
      });
    }

    const user = await getUserById(refreshTokenRecord.user_id);

    if (!user) {
      await revokeRefreshTokenById(refreshTokenRecord.refresh_token_id);
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Perdoruesi i lidhur me sesionin nuk u gjet.",
      });
    }

    await markRefreshTokenUsed(refreshTokenRecord.refresh_token_id);
    await revokeRefreshTokenById(refreshTokenRecord.refresh_token_id);

    const payload = await buildSessionPayload(
      res,
      user,
      req.headers["user-agent"]
    );

    return res.json({
      message: "Sesioni u rifreskua me sukses.",
      ...payload,
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate rifreskimit te sesionit.");
  }
};

const logout = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  try {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearRefreshTokenCookie(res);

    return res.json({
      message: "Sesioni u mbyll me sukses.",
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate mbylljes se sesionit.");
  }
};

const getAdminDashboard = async () => {
  const [
    countsRows,
    attentionRows,
    upcomingExamRows,
    deadlineRows,
    activityRows,
  ] = await Promise.all([
    connection.query(`
      SELECT
        (SELECT COUNT(*) FROM studentet) AS students,
        (SELECT COUNT(*) FROM profesoret) AS profesoret,
        (SELECT COUNT(*) FROM lendet) AS lendet,
        (SELECT COUNT(*) FROM provimet) AS provimet,
        (SELECT COUNT(*) FROM regjistrimet) AS regjistrimet,
        (SELECT COUNT(*) FROM gjeneratat) AS gjeneratat,
        (SELECT COUNT(*) FROM kerkesat_sherbimeve) AS kerkesat_sherbimeve,
        (SELECT COUNT(*) FROM rindjekjet_lendeve) AS rindjekjet,
        (SELECT COUNT(*) FROM bursat) AS bursat,
        (SELECT COUNT(*) FROM praktikat) AS praktikat,
        (SELECT COUNT(*) FROM programet_erasmus) AS erasmus
    `),
    connection.query(`
      SELECT
        (SELECT COUNT(*) FROM kerkesat_sherbimeve WHERE statusi = 'Ne pritje') AS pending_service_requests,
        (SELECT COUNT(*) FROM rindjekjet_lendeve WHERE statusi = 'Ne pritje') AS pending_repeat_requests,
        (SELECT COUNT(*) FROM aplikimet_bursave WHERE statusi = 'Ne pritje') AS pending_scholarship_applications,
        (SELECT COUNT(*) FROM aplikimet_praktikave WHERE statusi = 'Ne pritje') AS pending_internship_applications,
        (SELECT COUNT(*) FROM aplikimet_erasmus WHERE statusi = 'Ne pritje') AS pending_erasmus_applications,
        (
          SELECT COUNT(*)
          FROM studentet
          WHERE email IS NULL OR email = '' OR telefoni IS NULL OR telefoni = ''
        ) AS incomplete_student_contacts
    `),
    connection.query(`
      SELECT
        pr.provimi_id,
        l.emri AS lenda,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori,
        pr.data_provimit,
        pr.ora,
        pr.salla,
        pr.afati
      FROM provimet pr
      LEFT JOIN lendet l ON pr.lende_id = l.lende_id
      LEFT JOIN profesoret p ON pr.profesor_id = p.profesor_id
      WHERE pr.data_provimit >= CURDATE()
      ORDER BY pr.data_provimit ASC, pr.ora ASC
      LIMIT 6
    `),
    connection.query(`
      SELECT *
      FROM (
        SELECT
          'Burse' AS type,
          b.titulli AS title,
          b.lloji AS meta,
          b.afati_aplikimit AS due_date,
          b.statusi
        FROM bursat b
        WHERE b.statusi = 'Hapur' AND b.afati_aplikimit >= CURDATE()
        UNION ALL
        SELECT
          'Praktike' AS type,
          CONCAT(p.pozita, ' - ', p.kompania) AS title,
          p.lokacioni AS meta,
          p.afati_aplikimit AS due_date,
          p.statusi
        FROM praktikat p
        WHERE p.statusi = 'Hapur' AND p.afati_aplikimit >= CURDATE()
        UNION ALL
        SELECT
          'Erasmus' AS type,
          e.universiteti AS title,
          e.shteti AS meta,
          e.afati_aplikimit AS due_date,
          e.statusi
        FROM programet_erasmus e
        WHERE e.statusi = 'Hapur' AND e.afati_aplikimit >= CURDATE()
      ) upcoming_deadlines
      ORDER BY due_date ASC, title ASC
      LIMIT 6
    `),
    connection.query(`
      SELECT *
      FROM (
        SELECT
          'Sherbim' AS type,
          CONCAT(s.emri, ' ', s.mbiemri) AS title,
          sh.emri AS meta,
          k.statusi,
          CAST(k.kerkesa_id AS CHAR) AS reference_id,
          k.requested_at AS activity_date
        FROM kerkesat_sherbimeve k
        LEFT JOIN studentet s ON k.student_id = s.student_id
        LEFT JOIN sherbimet_studentore sh ON k.sherbimi_id = sh.sherbimi_id
        UNION ALL
        SELECT
          'Dokument' AS type,
          CONCAT(s.emri, ' ', s.mbiemri) AS title,
          sd.lloji_dokumentit AS meta,
          'Ngarkuar' AS statusi,
          CAST(sd.dokument_id AS CHAR) AS reference_id,
          sd.uploaded_at AS activity_date
        FROM student_dokumentet sd
        LEFT JOIN studentet s ON sd.student_id = s.student_id
      ) recent_activity
      ORDER BY activity_date DESC
      LIMIT 8
    `),
  ]);

  return {
    role: "admin",
    counts: countsRows[0][0],
    attention: attentionRows[0][0] || {},
    upcomingExams: upcomingExamRows[0],
    deadlines: deadlineRows[0],
    recentActivity: activityRows[0],
  };
};

const getProfesorDashboard = async (profesorId) => {
  const todayScheduleLabel = getTodayScheduleLabel();
  const [profileRows] = await connection.query(
    `
      SELECT
        p.profesor_id,
        p.emri,
        p.mbiemri,
        p.email,
        p.telefoni,
        p.titulli_akademik,
        p.specializimi,
        d.emri AS departamenti
      FROM profesoret p
      LEFT JOIN departamentet d ON p.departamenti_id = d.departament_id
      WHERE p.profesor_id = ?
      LIMIT 1
    `,
    [profesorId]
  );

  const [coursesRows] = await connection.query(
    `
      SELECT
        l.lende_id,
        l.emri,
        l.kodi,
        l.lloji,
        l.semestri,
        l.kreditet,
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

  const [examRows] = await connection.query(
    `
      SELECT
        p.provimi_id,
        l.emri AS lenda,
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati,
        (
          SELECT COUNT(DISTINCT r.student_id)
          FROM regjistrimet r
          WHERE r.lende_id = p.lende_id
        ) AS total_studentesh,
        (
          SELECT COUNT(DISTINCT n.student_id)
          FROM notat n
          WHERE n.provimi_id = p.provimi_id
        ) AS total_notash
      FROM provimet p
      LEFT JOIN lendet l ON p.lende_id = l.lende_id
      WHERE p.profesor_id = ?
      ORDER BY
        CASE WHEN p.data_provimit >= CURDATE() THEN 0 ELSE 1 END,
        CASE WHEN p.data_provimit >= CURDATE() THEN p.data_provimit END ASC,
        CASE WHEN p.data_provimit < CURDATE() THEN p.data_provimit END DESC,
        p.ora ASC
      LIMIT 6
    `,
    [profesorId]
  );

  const [scheduleRows] = await connection.query(
    `
      SELECT
        o.orari_id,
        l.emri AS lenda,
        o.dita,
        o.ora_fillimit,
        o.ora_mbarimit,
        o.salla
      FROM oraret o
      LEFT JOIN lendet l ON o.lende_id = l.lende_id
      WHERE o.profesor_id = ?
      ORDER BY FIELD(o.dita, 'E hene', 'E marte', 'E merkure', 'E enjte', 'E premte', 'E shtune', 'E diel'), o.ora_fillimit
      LIMIT 8
    `,
    [profesorId]
  );

  const [summaryRows] = await connection.query(
    `
      SELECT
        (SELECT COUNT(*) FROM lendet WHERE profesor_id = ?) AS total_courses,
        (
          SELECT COUNT(DISTINCT r.student_id)
          FROM regjistrimet r
          JOIN lendet l ON r.lende_id = l.lende_id
          WHERE l.profesor_id = ?
        ) AS total_students,
        (SELECT COUNT(*) FROM provimet WHERE profesor_id = ?) AS total_exams,
        (
          SELECT COUNT(*)
          FROM (
            SELECT
              p.provimi_id,
              GREATEST(
                COUNT(DISTINCT r.student_id) - COUNT(DISTINCT n.student_id),
                0
              ) AS pending_count
            FROM provimet p
            LEFT JOIN regjistrimet r ON r.lende_id = p.lende_id
            LEFT JOIN notat n ON n.provimi_id = p.provimi_id
            WHERE p.profesor_id = ?
              AND p.data_provimit <= CURDATE()
            GROUP BY p.provimi_id
            HAVING pending_count > 0
          ) pending_exams
        ) AS pending_grade_exams,
        (
          SELECT COALESCE(SUM(pending_count), 0)
          FROM (
            SELECT
              GREATEST(
                COUNT(DISTINCT r.student_id) - COUNT(DISTINCT n.student_id),
                0
              ) AS pending_count
            FROM provimet p
            LEFT JOIN regjistrimet r ON r.lende_id = p.lende_id
            LEFT JOIN notat n ON n.provimi_id = p.provimi_id
            WHERE p.profesor_id = ?
              AND p.data_provimit <= CURDATE()
            GROUP BY p.provimi_id
          ) pending_grades
        ) AS pending_grades_total,
        (
          SELECT COUNT(*)
          FROM provimet
          WHERE profesor_id = ? AND data_provimit >= CURDATE()
        ) AS upcoming_exams_count,
        (
          SELECT COUNT(*)
          FROM oraret
          WHERE profesor_id = ? AND dita = ?
        ) AS today_schedule_count
    `,
    [
      profesorId,
      profesorId,
      profesorId,
      profesorId,
      profesorId,
      profesorId,
      profesorId,
      todayScheduleLabel,
    ]
  );

  const [gradePipelineRows] = await connection.query(
    `
      SELECT
        p.provimi_id,
        l.emri AS lenda,
        p.data_provimit,
        p.afati,
        COUNT(DISTINCT r.student_id) AS total_students,
        COUNT(DISTINCT n.student_id) AS total_grades,
        GREATEST(
          COUNT(DISTINCT r.student_id) - COUNT(DISTINCT n.student_id),
          0
        ) AS pending_grades
      FROM provimet p
      JOIN lendet l ON p.lende_id = l.lende_id
      LEFT JOIN regjistrimet r ON r.lende_id = p.lende_id
      LEFT JOIN notat n ON n.provimi_id = p.provimi_id
      WHERE p.profesor_id = ?
        AND p.data_provimit <= CURDATE()
      GROUP BY p.provimi_id, l.emri, p.data_provimit, p.afati
      ORDER BY pending_grades DESC, p.data_provimit DESC
      LIMIT 6
    `,
    [profesorId]
  );

  return {
    role: "profesor",
    profile: profileRows[0] || null,
    courses: coursesRows,
    exams: examRows,
    schedule: scheduleRows,
    summary: summaryRows[0] || {
      total_courses: 0,
      total_students: 0,
      total_exams: 0,
      pending_grade_exams: 0,
      pending_grades_total: 0,
      upcoming_exams_count: 0,
      today_schedule_count: 0,
    },
    gradePipeline: gradePipelineRows,
  };
};

const getStudentDashboard = async (studentId) => {
  const [profileRows] = await connection.query(
    `
      SELECT
        s.student_id,
        s.emri,
        s.mbiemri,
        s.email,
        s.telefoni,
        s.statusi,
        s.viti_studimit,
        s.drejtimi_id,
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

  const [gradeRows] = await connection.query(
    `
      SELECT
        n.nota_id,
        l.emri AS lenda,
        n.nota,
        n.data_vendosjes,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori
      FROM notat n
      LEFT JOIN provimet pr ON n.provimi_id = pr.provimi_id
      LEFT JOIN lendet l ON pr.lende_id = l.lende_id
      LEFT JOIN profesoret p ON pr.profesor_id = p.profesor_id
      WHERE n.student_id = ?
      ORDER BY n.data_vendosjes DESC
      LIMIT 6
    `,
    [studentId]
  );

  const [enrollmentRows] = await connection.query(
    `
      SELECT
        r.regjistrimi_id,
        l.emri AS lenda,
        l.kodi,
        r.semestri,
        r.viti_akademik,
        r.statusi,
        l.kreditet,
        l.lloji,
        (
          SELECT COUNT(*)
          FROM regjistrim_dokumentet rd
          WHERE rd.regjistrimi_id = r.regjistrimi_id
        ) AS total_dokumenteve,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori
      FROM regjistrimet r
      LEFT JOIN lendet l ON r.lende_id = l.lende_id
      LEFT JOIN profesoret p ON l.profesor_id = p.profesor_id
      WHERE r.student_id = ?
      ORDER BY r.viti_akademik DESC, l.emri
      LIMIT 8
    `,
    [studentId]
  );

  const [examRows] = await connection.query(
    `
      SELECT DISTINCT
        p.provimi_id,
        l.emri AS lenda,
        CONCAT(COALESCE(pr.emri, ''), ' ', COALESCE(pr.mbiemri, '')) AS profesori,
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati
      FROM regjistrimet r
      JOIN provimet p ON r.lende_id = p.lende_id
      LEFT JOIN lendet l ON p.lende_id = l.lende_id
      LEFT JOIN profesoret pr ON p.profesor_id = pr.profesor_id
      WHERE r.student_id = ?
      ORDER BY
        CASE WHEN p.data_provimit >= CURDATE() THEN 0 ELSE 1 END,
        CASE WHEN p.data_provimit >= CURDATE() THEN p.data_provimit END ASC,
        CASE WHEN p.data_provimit < CURDATE() THEN p.data_provimit END DESC,
        p.ora ASC
      LIMIT 6
    `,
    [studentId]
  );

  const [scheduleRows] = await connection.query(
    `
      SELECT DISTINCT
        o.orari_id,
        l.emri AS lenda,
        CONCAT(COALESCE(p.emri, ''), ' ', COALESCE(p.mbiemri, '')) AS profesori,
        o.dita,
        o.ora_fillimit,
        o.ora_mbarimit,
        o.salla
      FROM regjistrimet r
      JOIN oraret o ON r.lende_id = o.lende_id
      LEFT JOIN lendet l ON o.lende_id = l.lende_id
      LEFT JOIN profesoret p ON o.profesor_id = p.profesor_id
      WHERE r.student_id = ?
      ORDER BY FIELD(o.dita, 'E hene', 'E marte', 'E merkure', 'E enjte', 'E premte', 'E shtune', 'E diel'), o.ora_fillimit
      LIMIT 8
    `,
    [studentId]
  );

  const [summaryRows] = await connection.query(
    `
      SELECT
        ROUND(AVG(nota), 2) AS mesatarja,
        COUNT(*) AS total_notash,
        (
          SELECT COUNT(*)
          FROM regjistrimet r
          WHERE r.student_id = ?
        ) AS total_regjistrimeve,
        (
          SELECT COALESCE(SUM(l.kreditet), 0)
          FROM regjistrimet r
          JOIN lendet l ON r.lende_id = l.lende_id
          WHERE r.student_id = ?
        ) AS total_kredite,
        (
          SELECT COALESCE(SUM(l.kreditet), 0)
          FROM lendet l
          WHERE l.lende_id IN (
            SELECT DISTINCT pr.lende_id
            FROM notat n
            JOIN provimet pr ON n.provimi_id = pr.provimi_id
            WHERE n.student_id = ? AND n.nota >= 6
          )
        ) AS kredite_te_kaluara,
        (
          SELECT COUNT(DISTINCT pr.lende_id)
          FROM notat n
          JOIN provimet pr ON n.provimi_id = pr.provimi_id
          WHERE n.student_id = ? AND n.nota >= 6
        ) AS lende_te_kaluara,
        (
          SELECT COUNT(DISTINCT r.lende_id)
          FROM regjistrimet r
          WHERE r.student_id = ?
            AND NOT EXISTS (
              SELECT 1
              FROM notat n
              JOIN provimet pr ON n.provimi_id = pr.provimi_id
              WHERE n.student_id = r.student_id
                AND pr.lende_id = r.lende_id
                AND n.nota >= 6
            )
        ) AS lende_pa_note_kaluese,
        (
          SELECT COUNT(*)
          FROM kerkesat_sherbimeve ks
          WHERE ks.student_id = ?
        ) AS total_kerkesave_sherbimeve,
        (
          SELECT COUNT(*)
          FROM rindjekjet_lendeve rl
          WHERE rl.student_id = ?
        ) AS total_rindjekjeve,
        (
          SELECT COUNT(*)
          FROM rindjekjet_lendeve rl
          WHERE rl.student_id = ? AND rl.statusi = 'Ne pritje'
        ) AS pending_repeat_requests,
        (
          SELECT COUNT(DISTINCT p.provimi_id)
          FROM regjistrimet r
          JOIN provimet p ON r.lende_id = p.lende_id
          WHERE r.student_id = ? AND p.data_provimit >= CURDATE()
        ) AS upcoming_exams_count,
        (
          SELECT COUNT(*)
          FROM regjistrimet r
          WHERE r.student_id = ?
            AND NOT EXISTS (
              SELECT 1
              FROM regjistrim_dokumentet rd
              WHERE rd.regjistrimi_id = r.regjistrimi_id
            )
        ) AS missing_course_documents_count,
        (
          SELECT COUNT(*)
          FROM kerkesat_sherbimeve ks
          WHERE ks.student_id = ? AND ks.statusi = 'Ne pritje'
        ) AS pending_service_requests,
        (
          SELECT
            (SELECT COUNT(*) FROM aplikimet_bursave ab WHERE ab.student_id = ? AND ab.statusi = 'Ne pritje') +
            (SELECT COUNT(*) FROM aplikimet_praktikave ap WHERE ap.student_id = ? AND ap.statusi = 'Ne pritje') +
            (SELECT COUNT(*) FROM aplikimet_erasmus ae WHERE ae.student_id = ? AND ae.statusi = 'Ne pritje')
        ) AS pending_applications_count
      FROM notat
      WHERE student_id = ?
    `,
    [
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
      studentId,
    ]
  );

  const [serviceRows] = await connection.query(
    `
      SELECT
        k.kerkesa_id,
        sh.emri AS sherbimi,
        sh.kategoria,
        k.statusi,
        k.statusi_pageses,
        k.requested_at,
        k.shuma_paguar
      FROM kerkesat_sherbimeve k
      LEFT JOIN sherbimet_studentore sh ON k.sherbimi_id = sh.sherbimi_id
      WHERE k.student_id = ?
      ORDER BY k.requested_at DESC
      LIMIT 5
    `,
    [studentId]
  );

  const drejtimiId = profileRows[0]?.drejtimi_id || null;

  const [deadlineRows] = await connection.query(
    `
      SELECT *
      FROM (
        SELECT
          'Burse' AS type,
          b.titulli AS title,
          b.lloji AS meta,
          b.afati_aplikimit AS due_date,
          b.statusi
        FROM bursat b
        WHERE b.statusi = 'Hapur' AND b.afati_aplikimit >= CURDATE()
        UNION ALL
        SELECT
          'Praktike' AS type,
          CONCAT(p.pozita, ' - ', p.kompania) AS title,
          p.lokacioni AS meta,
          p.afati_aplikimit AS due_date,
          p.statusi
        FROM praktikat p
        WHERE p.statusi = 'Hapur'
          AND p.afati_aplikimit >= CURDATE()
          AND (p.drejtimi_id IS NULL OR p.drejtimi_id = ?)
        UNION ALL
        SELECT
          'Erasmus' AS type,
          e.universiteti AS title,
          e.shteti AS meta,
          e.afati_aplikimit AS due_date,
          e.statusi
        FROM programet_erasmus e
        WHERE e.statusi = 'Hapur'
          AND e.afati_aplikimit >= CURDATE()
          AND (e.drejtimi_id IS NULL OR e.drejtimi_id = ?)
      ) student_deadlines
      ORDER BY due_date ASC, title ASC
      LIMIT 5
    `,
    [drejtimiId, drejtimiId]
  );

  const [applicationRows] = await connection.query(
    `
      SELECT *
      FROM (
        SELECT
          'Burse' AS type,
          b.titulli AS title,
          a.statusi,
          a.applied_at AS activity_date
        FROM aplikimet_bursave a
        JOIN bursat b ON a.bursa_id = b.bursa_id
        WHERE a.student_id = ?
        UNION ALL
        SELECT
          'Praktike' AS type,
          CONCAT(p.pozita, ' - ', p.kompania) AS title,
          a.statusi,
          a.applied_at AS activity_date
        FROM aplikimet_praktikave a
        JOIN praktikat p ON a.praktika_id = p.praktika_id
        WHERE a.student_id = ?
        UNION ALL
        SELECT
          'Erasmus' AS type,
          e.universiteti AS title,
          a.statusi,
          a.applied_at AS activity_date
        FROM aplikimet_erasmus a
        JOIN programet_erasmus e ON a.erasmus_id = e.erasmus_id
        WHERE a.student_id = ?
      ) student_applications
      ORDER BY activity_date DESC
      LIMIT 5
    `,
    [studentId, studentId, studentId]
  );

  return {
    role: "student",
    profile: profileRows[0] || null,
    grades: gradeRows,
    enrollments: enrollmentRows,
    exams: examRows,
    schedule: scheduleRows,
    services: serviceRows,
    deadlines: deadlineRows,
    applications: applicationRows,
    summary: summaryRows[0] || {
      mesatarja: null,
      total_notash: 0,
      total_regjistrimeve: 0,
      total_kredite: 0,
      kredite_te_kaluara: 0,
      lende_te_kaluara: 0,
      lende_pa_note_kaluese: 0,
      total_kerkesave_sherbimeve: 0,
      total_rindjekjeve: 0,
      pending_repeat_requests: 0,
      upcoming_exams_count: 0,
      missing_course_documents_count: 0,
      pending_service_requests: 0,
      pending_applications_count: 0,
    },
  };
};

const dashboard = async (req, res) => {
  try {
    if (req.user.roli === "admin") {
      return res.json(await getAdminDashboard());
    }

    if (req.user.roli === "profesor") {
      return res.json(await getProfesorDashboard(req.user.profesor_id));
    }

    return res.json(await getStudentDashboard(req.user.student_id));
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se dashboard-it.");
  }
};

module.exports = {
  changePassword,
  dashboard,
  login,
  logout,
  me,
  refresh,
  register,
};

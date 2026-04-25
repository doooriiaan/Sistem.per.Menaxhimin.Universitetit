const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("../utils/authConfig");
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

    const token = createToken(user);

    res.json({
      message: "Identifikimi u krye me sukses.",
      token,
      user: buildAuthUser(user),
    });
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

    const token = createToken(registeredUser);

    res.status(201).json({
      message: "Regjistrimi u krye me sukses.",
      token,
      user: buildAuthUser(registeredUser),
    });
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

    return res.json({
      message: "Fjalekalimi u ndryshua me sukses.",
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate ndryshimit te fjalekalimit.");
  }
};

const getAdminDashboard = async () => {
  const [countsRows] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM studentet) AS students,
      (SELECT COUNT(*) FROM profesoret) AS profesoret,
      (SELECT COUNT(*) FROM lendet) AS lendet,
      (SELECT COUNT(*) FROM provimet) AS provimet,
      (SELECT COUNT(*) FROM regjistrimet) AS regjistrimet
  `);

  return {
    role: "admin",
    counts: countsRows[0],
  };
};

const getProfesorDashboard = async (profesorId) => {
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
        l.kreditet
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
        p.afati
      FROM provimet p
      LEFT JOIN lendet l ON p.lende_id = l.lende_id
      WHERE p.profesor_id = ?
      ORDER BY p.data_provimit DESC, p.ora DESC
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

  return {
    role: "profesor",
    profile: profileRows[0] || null,
    courses: coursesRows,
    exams: examRows,
    schedule: scheduleRows,
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
        r.statusi
      FROM regjistrimet r
      LEFT JOIN lendet l ON r.lende_id = l.lende_id
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
        p.data_provimit,
        p.ora,
        p.salla,
        p.afati
      FROM regjistrimet r
      JOIN provimet p ON r.lende_id = p.lende_id
      LEFT JOIN lendet l ON p.lende_id = l.lende_id
      WHERE r.student_id = ?
      ORDER BY p.data_provimit DESC, p.ora DESC
      LIMIT 6
    `,
    [studentId]
  );

  const [scheduleRows] = await connection.query(
    `
      SELECT DISTINCT
        o.orari_id,
        l.emri AS lenda,
        o.dita,
        o.ora_fillimit,
        o.ora_mbarimit,
        o.salla
      FROM regjistrimet r
      JOIN oraret o ON r.lende_id = o.lende_id
      LEFT JOIN lendet l ON o.lende_id = l.lende_id
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
        COUNT(*) AS total_notash
      FROM notat
      WHERE student_id = ?
    `,
    [studentId]
  );

  return {
    role: "student",
    profile: profileRows[0] || null,
    grades: gradeRows,
    enrollments: enrollmentRows,
    exams: examRows,
    schedule: scheduleRows,
    summary: summaryRows[0] || { mesatarja: null, total_notash: 0 },
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
  me,
  register,
};

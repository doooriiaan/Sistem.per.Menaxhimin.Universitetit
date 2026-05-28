const bcrypt = require("bcrypt");
const db = require("../db");
const { revokeUserRefreshTokens } = require("../utils/sessionTokens");
const {
  handleDbError,
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

const buildLinkedLabel = (user) => {
  if (user.admin_id) {
    return `Admin #${user.admin_id}`;
  }

  if (user.profesor_id) {
    return `Profesor #${user.profesor_id}`;
  }

  if (user.student_id) {
    return `Student #${user.student_id}`;
  }

  return "Pa lidhje";
};

const getUserById = async (userId) => {
  const [rows] = await connection.query(
    `
      SELECT user_id, email, role, admin_id, profesor_id, student_id, is_active
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const listUsers = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT
        u.user_id,
        u.email,
        u.role,
        u.admin_id,
        u.profesor_id,
        u.student_id,
        u.is_active,
        u.created_at,
        COALESCE(a.emri, p.emri, s.emri) AS emri,
        COALESCE(a.mbiemri, p.mbiemri, s.mbiemri) AS mbiemri,
        COALESCE(a.email, p.email, s.email) AS profile_email
      FROM users u
      LEFT JOIN admins a ON u.admin_id = a.admin_id
      LEFT JOIN profesoret p ON u.profesor_id = p.profesor_id
      LEFT JOIN studentet s ON u.student_id = s.student_id
      ORDER BY u.role, u.user_id
    `);

    const users = rows.map((user) => ({
      ...user,
      role_label: ROLE_LABELS[user.role] || user.role,
      full_name: [user.emri, user.mbiemri].filter(Boolean).join(" "),
      linked_label: buildLinkedLabel(user),
      is_active: Boolean(user.is_active),
    }));

    return res.json(users);
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate marrjes se perdoruesve.");
  }
};

const updateUserEmail = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  let transactionStarted = false;

  if (!isValidEmail(email)) {
    return sendValidationError(res, "Email nuk eshte valid.");
  }

  if (Number(req.params.id) === Number(req.user.user_id)) {
    return res.status(400).json({
      message: "Per llogarine tende perdor faqen Llogaria.",
    });
  }

  try {
    const targetUser = await getUserById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "Perdoruesi nuk u gjet." });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    await connection.query(
      `
        UPDATE users
        SET email = ?
        WHERE user_id = ?
      `,
      [email, req.params.id]
    );

    if (targetUser.admin_id) {
      await connection.query(
        "UPDATE admins SET email = ? WHERE admin_id = ?",
        [email, targetUser.admin_id]
      );
    } else if (targetUser.profesor_id) {
      await connection.query(
        "UPDATE profesoret SET email = ? WHERE profesor_id = ?",
        [email, targetUser.profesor_id]
      );
    } else if (targetUser.student_id) {
      await connection.query(
        "UPDATE studentet SET email = ? WHERE student_id = ?",
        [email, targetUser.student_id]
      );
    }

    await connection.commit();
    await revokeUserRefreshTokens(req.params.id);

    return res.json({
      message: "Email-i i perdoruesit u perditesua me sukses.",
    });
  } catch (err) {
    if (transactionStarted) {
      await connection.rollback();
    }
    return handleDbError(res, err, "Gabim gjate perditesimit te email-it.");
  }
};

const resetUserPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!isNonEmptyString(password) || password.trim().length < 8) {
    return sendValidationError(
      res,
      "Fjalekalimi duhet te kete te pakten 8 karaktere."
    );
  }

  if (password !== confirmPassword) {
    return sendValidationError(res, "Fjalekalimet nuk perputhen.");
  }

  if (Number(req.params.id) === Number(req.user.user_id)) {
    return res.status(400).json({
      message: "Per llogarine tende perdor faqen Llogaria.",
    });
  }

  try {
    const targetUser = await getUserById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "Perdoruesi nuk u gjet." });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    await connection.query(
      `
        UPDATE users
        SET password_hash = ?
        WHERE user_id = ?
      `,
      [passwordHash, req.params.id]
    );

    if (targetUser.admin_id) {
      await connection.query(
        "UPDATE admins SET password_hash = ? WHERE admin_id = ?",
        [passwordHash, targetUser.admin_id]
      );
    }

    await revokeUserRefreshTokens(req.params.id);

    return res.json({
      message: "Fjalekalimi u resetua. Perdoruesi duhet te identifikohet perseri.",
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate resetimit te fjalekalimit.");
  }
};

const updateUserStatus = async (req, res) => {
  const isActive = Boolean(req.body.is_active);

  if (Number(req.params.id) === Number(req.user.user_id)) {
    return res.status(400).json({
      message: "Nuk mund ta ndryshosh statusin e llogarise tende.",
    });
  }

  try {
    const targetUser = await getUserById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "Perdoruesi nuk u gjet." });
    }

    await connection.query(
      `
        UPDATE users
        SET is_active = ?
        WHERE user_id = ?
      `,
      [isActive ? 1 : 0, req.params.id]
    );

    if (!isActive) {
      await revokeUserRefreshTokens(req.params.id);
    }

    return res.json({
      message: isActive
        ? "Llogaria u aktivizua me sukses."
        : "Llogaria u deaktivizua me sukses.",
    });
  } catch (err) {
    return handleDbError(res, err, "Gabim gjate ndryshimit te statusit.");
  }
};

module.exports = {
  listUsers,
  resetUserPassword,
  updateUserEmail,
  updateUserStatus,
};

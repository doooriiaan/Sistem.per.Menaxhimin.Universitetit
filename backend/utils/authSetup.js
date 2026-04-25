const bcrypt = require("bcrypt");
const db = require("../db");
const {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_FIRST_NAME,
  DEFAULT_ADMIN_LAST_NAME,
  DEFAULT_ADMIN_PASSWORD,
} = require("./authConfig");

const connection = db.promise();

const getColumnNames = async (tableName) => {
  const [rows] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return rows.map((row) => row.COLUMN_NAME);
};

const tableExists = async (tableName) => {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName]
  );

  return rows.length > 0;
};

const hasColumn = async (tableName, columnName) => {
  const columns = await getColumnNames(tableName);
  return columns.includes(columnName);
};

const renameColumnIfNeeded = async (
  tableName,
  oldColumnName,
  newColumnName,
  definition
) => {
  const [hasOldColumn, hasNewColumn] = await Promise.all([
    hasColumn(tableName, oldColumnName),
    hasColumn(tableName, newColumnName),
  ]);

  if (!hasOldColumn || hasNewColumn) {
    return;
  }

  await connection.query(`
    ALTER TABLE ${tableName}
    CHANGE COLUMN ${oldColumnName} ${newColumnName} ${definition}
  `);
};

const hasIndex = async (tableName, indexName) => {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1
    `,
    [tableName, indexName]
  );

  return rows.length > 0;
};

const hasUniqueIndexForColumns = async (tableName, columns) => {
  const [rows] = await connection.query(
    `
      SELECT
        INDEX_NAME,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS indexed_columns
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND NON_UNIQUE = 0
      GROUP BY INDEX_NAME
    `,
    [tableName]
  );

  const requestedColumns = columns.join(",");

  return rows.some((row) => row.indexed_columns === requestedColumns);
};

const hasDuplicateValues = async (tableName, columns) => {
  const nonNullClause = columns
    .map((column) => `${column} IS NOT NULL`)
    .join(" AND ");
  const groupByClause = columns.join(", ");
  const [rows] = await connection.query(`
    SELECT 1
    FROM ${tableName}
    WHERE ${nonNullClause}
    GROUP BY ${groupByClause}
    HAVING COUNT(*) > 1
    LIMIT 1
  `);

  return rows.length > 0;
};

const ensureUniqueIndex = async (tableName, indexName, columns) => {
  if (!(await tableExists(tableName))) {
    return;
  }

  if (
    (await hasIndex(tableName, indexName)) ||
    (await hasUniqueIndexForColumns(tableName, columns))
  ) {
    return;
  }

  if (await hasDuplicateValues(tableName, columns)) {
    console.warn(
      `Unique index ${indexName} nuk u krijua sepse tabela ${tableName} ka duplikate.`
    );
    return;
  }

  await connection.query(`
    CREATE UNIQUE INDEX ${indexName}
    ON ${tableName} (${columns.join(", ")})
  `);
};

const ensureAdminsTable = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admins (
      admin_id INT AUTO_INCREMENT PRIMARY KEY,
      emri VARCHAR(100) NOT NULL,
      mbiemri VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      roli VARCHAR(50) NOT NULL DEFAULT 'Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const ensureUsersTable = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'profesor', 'student') NOT NULL,
      admin_id INT NULL UNIQUE,
      profesor_id INT NULL UNIQUE,
      student_id INT NULL UNIQUE,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (profesor_id) REFERENCES profesoret(profesor_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const normalizeSchemaNaming = async () => {
  await renameColumnIfNeeded("lendet", "profesori_id", "profesor_id", "INT NULL");
  await renameColumnIfNeeded("oraret", "profesori_id", "profesor_id", "INT NULL");
};

const ensureCoreUniqueIndexes = async () => {
  await ensureUniqueIndex("studentet", "uq_studentet_numri_personal", [
    "numri_personal",
  ]);
  await ensureUniqueIndex("studentet", "uq_studentet_email", ["email"]);
  await ensureUniqueIndex("profesoret", "uq_profesoret_email", ["email"]);
  await ensureUniqueIndex("notat", "uq_notat_student_provimi", [
    "student_id",
    "provimi_id",
  ]);
  await ensureUniqueIndex("regjistrimet", "uq_regjistrimet_student_lende_viti", [
    "student_id",
    "lende_id",
    "viti_akademik",
  ]);
};

const ensureSeedAdmin = async () => {
  const [rows] = await connection.query(
    "SELECT COUNT(*) AS total FROM admins"
  );

  if (rows[0].total > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  await connection.query(
    `
      INSERT INTO admins (emri, mbiemri, email, password_hash, roli)
      VALUES (?, ?, ?, ?, 'Admin')
    `,
    [
      DEFAULT_ADMIN_FIRST_NAME,
      DEFAULT_ADMIN_LAST_NAME,
      DEFAULT_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
    ]
  );

  console.log(`Admin i pare u krijua me email: ${DEFAULT_ADMIN_EMAIL}`);
};

const migrateAdminsToUsers = async () => {
  const [admins] = await connection.query(`
    SELECT a.admin_id, a.email, a.password_hash
    FROM admins a
    LEFT JOIN users u ON u.admin_id = a.admin_id
    WHERE u.user_id IS NULL
  `);

  for (const admin of admins) {
    await connection.query(
      `
        INSERT INTO users (email, password_hash, role, admin_id)
        VALUES (?, ?, 'admin', ?)
      `,
      [admin.email.toLowerCase(), admin.password_hash, admin.admin_id]
    );
  }
};

const ensureAuthSetup = async () => {
  await normalizeSchemaNaming();
  await ensureAdminsTable();
  await ensureSeedAdmin();
  await ensureUsersTable();
  await migrateAdminsToUsers();
  await ensureCoreUniqueIndexes();
};

module.exports = {
  ensureAuthSetup,
};

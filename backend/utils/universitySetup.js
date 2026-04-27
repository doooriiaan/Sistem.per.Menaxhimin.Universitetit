const db = require("../db");
const { ensureDirectory, UPLOADS_ROOT } = require("./fileStorage");

const connection = db.promise();

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
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
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

const hasForeignKey = async (tableName, constraintName) => {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      LIMIT 1
    `,
    [tableName, constraintName]
  );

  return rows.length > 0;
};

const addColumnIfMissing = async (tableName, columnName, definition) => {
  if (!(await hasColumn(tableName, columnName))) {
    await connection.query(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`
    );
  }
};

const ensureIndex = async (tableName, indexName, columns) => {
  if (!(await hasIndex(tableName, indexName))) {
    await connection.query(
      `CREATE INDEX ${indexName} ON ${tableName} (${columns.join(", ")})`
    );
  }
};

const ensureForeignKey = async (tableName, constraintName, statement) => {
  if (!(await hasForeignKey(tableName, constraintName))) {
    await connection.query(`ALTER TABLE ${tableName} ADD CONSTRAINT ${statement}`);
  }
};

const ensureGenerationsTable = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS gjeneratat (
      gjenerata_id INT AUTO_INCREMENT PRIMARY KEY,
      emri VARCHAR(120) NOT NULL,
      viti_regjistrimit INT NOT NULL,
      viti_diplomimit INT NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Aktive',
      pershkrimi TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await addColumnIfMissing("studentet", "gjenerata_id", "INT NULL AFTER drejtimi_id");
  await ensureIndex("studentet", "idx_studentet_gjenerata_id", ["gjenerata_id"]);
  await ensureForeignKey(
    "studentet",
    "fk_studentet_gjeneratat",
    "fk_studentet_gjeneratat FOREIGN KEY (gjenerata_id) REFERENCES gjeneratat(gjenerata_id) ON DELETE SET NULL ON UPDATE CASCADE"
  );
};

const ensureRegistrationDocumentsTable = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS regjistrim_dokumentet (
      dokument_id INT AUTO_INCREMENT PRIMARY KEY,
      regjistrimi_id INT NOT NULL,
      student_id INT NOT NULL,
      emri_dokumentit VARCHAR(120) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120) NOT NULL,
      file_size INT NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (regjistrimi_id) REFERENCES regjistrimet(regjistrimi_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const ensureStudentDocumentsTable = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_dokumentet (
      dokument_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      lloji_dokumentit VARCHAR(120) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120) NOT NULL,
      file_size INT NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const ensureServicesTables = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sherbimet_studentore (
      sherbimi_id INT AUTO_INCREMENT PRIMARY KEY,
      emri VARCHAR(140) NOT NULL,
      kategoria VARCHAR(80) NOT NULL,
      pershkrimi TEXT NOT NULL,
      cmimi DECIMAL(10,2) NOT NULL DEFAULT 0,
      valuta VARCHAR(10) NOT NULL DEFAULT 'EUR',
      aktiv TINYINT(1) NOT NULL DEFAULT 1,
      kerkon_dokument TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS kerkesat_sherbimeve (
      kerkesa_id INT AUTO_INCREMENT PRIMARY KEY,
      sherbimi_id INT NOT NULL,
      student_id INT NOT NULL,
      arsyeja TEXT NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      statusi_pageses VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      metoda_pageses VARCHAR(40) NULL,
      karta_maskuar VARCHAR(40) NULL,
      reference_pagese VARCHAR(80) NULL,
      shuma_paguar DECIMAL(10,2) NOT NULL DEFAULT 0,
      shenime_admin TEXT NULL,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME NULL,
      approved_at DATETIME NULL,
      FOREIGN KEY (sherbimi_id) REFERENCES sherbimet_studentore(sherbimi_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const ensureRepeatCoursesTable = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS rindjekjet_lendeve (
      rindjekja_id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      lende_id INT NOT NULL,
      semestri INT NOT NULL,
      viti_akademik VARCHAR(20) NOT NULL,
      arsyeja TEXT NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      statusi_pageses VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      karta_maskuar VARCHAR(40) NULL,
      reference_pagese VARCHAR(80) NULL,
      shuma_detyrimit DECIMAL(10,2) NOT NULL DEFAULT 0,
      shuma_paguar DECIMAL(10,2) NOT NULL DEFAULT 0,
      shenime_admin TEXT NULL,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const ensureScholarshipTables = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS bursat (
      bursa_id INT AUTO_INCREMENT PRIMARY KEY,
      titulli VARCHAR(160) NOT NULL,
      pershkrimi TEXT NOT NULL,
      lloji VARCHAR(80) NOT NULL,
      shuma DECIMAL(10,2) NOT NULL,
      kriteret TEXT NOT NULL,
      afati_aplikimit DATE NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Hapur',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS aplikimet_bursave (
      aplikimi_id INT AUTO_INCREMENT PRIMARY KEY,
      bursa_id INT NOT NULL,
      student_id INT NOT NULL,
      motivimi TEXT NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      dokument_name VARCHAR(255) NULL,
      dokument_path VARCHAR(255) NULL,
      dokument_mime VARCHAR(120) NULL,
      dokument_size INT NULL,
      shenime_admin TEXT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_aplikimet_bursave_student (bursa_id, student_id),
      FOREIGN KEY (bursa_id) REFERENCES bursat(bursa_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const ensureInternshipsTables = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS praktikat (
      praktika_id INT AUTO_INCREMENT PRIMARY KEY,
      kompania VARCHAR(160) NOT NULL,
      pozita VARCHAR(160) NOT NULL,
      pershkrimi TEXT NOT NULL,
      lokacioni VARCHAR(120) NOT NULL,
      kompensimi VARCHAR(120) NOT NULL,
      lloji VARCHAR(60) NOT NULL,
      afati_aplikimit DATE NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Hapur',
      drejtimi_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS aplikimet_praktikave (
      aplikimi_id INT AUTO_INCREMENT PRIMARY KEY,
      praktika_id INT NOT NULL,
      student_id INT NOT NULL,
      mesazh TEXT NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      dokument_name VARCHAR(255) NULL,
      dokument_path VARCHAR(255) NULL,
      dokument_mime VARCHAR(120) NULL,
      dokument_size INT NULL,
      shenime_admin TEXT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_aplikimet_praktikave_student (praktika_id, student_id),
      FOREIGN KEY (praktika_id) REFERENCES praktikat(praktika_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const ensureErasmusTables = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS programet_erasmus (
      erasmus_id INT AUTO_INCREMENT PRIMARY KEY,
      universiteti VARCHAR(180) NOT NULL,
      shteti VARCHAR(120) NOT NULL,
      semestri VARCHAR(40) NOT NULL,
      viti_akademik VARCHAR(20) NOT NULL,
      financimi VARCHAR(140) NOT NULL,
      pershkrimi TEXT NOT NULL,
      afati_aplikimit DATE NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Hapur',
      drejtimi_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS aplikimet_erasmus (
      aplikimi_id INT AUTO_INCREMENT PRIMARY KEY,
      erasmus_id INT NOT NULL,
      student_id INT NOT NULL,
      motivimi TEXT NOT NULL,
      statusi VARCHAR(40) NOT NULL DEFAULT 'Ne pritje',
      dokument_name VARCHAR(255) NULL,
      dokument_path VARCHAR(255) NULL,
      dokument_mime VARCHAR(120) NULL,
      dokument_size INT NULL,
      shenime_admin TEXT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_aplikimet_erasmus_student (erasmus_id, student_id),
      FOREIGN KEY (erasmus_id) REFERENCES programet_erasmus(erasmus_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
};

const getCurrentAcademicStartYear = () => {
  const today = new Date();
  return today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
};

const seedGenerations = async () => {
  const [[{ total }]] = await connection.query(
    "SELECT COUNT(*) AS total FROM gjeneratat"
  );

  if (total > 0) {
    return;
  }

  const startYear = getCurrentAcademicStartYear();
  const rows = [
    {
      emri: `Gjenerata ${startYear - 4}/${startYear - 3}`,
      vitiRegjistrimit: startYear - 4,
      vitiDiplomimit: startYear - 1,
      statusi: "Diplomuar",
      pershkrimi: "Gjenerate e kaluar e arkivuar per historikun akademik.",
    },
    {
      emri: `Gjenerata ${startYear - 3}/${startYear - 2}`,
      vitiRegjistrimit: startYear - 3,
      vitiDiplomimit: startYear,
      statusi: "Diplomuar",
      pershkrimi: "Gjenerate e kaluar me studentet qe kane perfunduar studimet.",
    },
    {
      emri: `Gjenerata ${startYear - 2}/${startYear - 1}`,
      vitiRegjistrimit: startYear - 2,
      vitiDiplomimit: startYear + 1,
      statusi: "Aktive",
      pershkrimi: "Gjenerate aktive ne fazen e avancuar te studimeve.",
    },
    {
      emri: `Gjenerata ${startYear - 1}/${startYear}`,
      vitiRegjistrimit: startYear - 1,
      vitiDiplomimit: startYear + 2,
      statusi: "Aktive",
      pershkrimi: "Gjenerate aktive me studentet e viteve te mesme.",
    },
    {
      emri: `Gjenerata ${startYear}/${startYear + 1}`,
      vitiRegjistrimit: startYear,
      vitiDiplomimit: startYear + 3,
      statusi: "Aktive",
      pershkrimi: "Gjenerate e re per pranimet aktuale dhe regjistrimet hyrse.",
    },
  ];

  for (const row of rows) {
    await connection.query(
      `
        INSERT INTO gjeneratat
          (emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        row.emri,
        row.vitiRegjistrimit,
        row.vitiDiplomimit,
        row.statusi,
        row.pershkrimi,
      ]
    );
  }
};

const assignStudentsToGenerations = async () => {
  const [generations] = await connection.query(
    "SELECT gjenerata_id, viti_regjistrimit FROM gjeneratat"
  );
  const generationByYear = generations.reduce((accumulator, generation) => {
    accumulator[generation.viti_regjistrimit] = generation.gjenerata_id;
    return accumulator;
  }, {});
  const currentStartYear = getCurrentAcademicStartYear();

  const [students] = await connection.query(
    `
      SELECT student_id, viti_studimit
      FROM studentet
      WHERE gjenerata_id IS NULL
    `
  );

  for (const student of students) {
    const targetYear = currentStartYear - (Number(student.viti_studimit) - 1);
    const gjenerataId =
      generationByYear[targetYear] || generationByYear[currentStartYear];

    if (!gjenerataId) {
      continue;
    }

    await connection.query(
      "UPDATE studentet SET gjenerata_id = ? WHERE student_id = ?",
      [gjenerataId, student.student_id]
    );
  }
};

const seedServices = async () => {
  const [[{ total }]] = await connection.query(
    "SELECT COUNT(*) AS total FROM sherbimet_studentore"
  );

  if (total > 0) {
    return;
  }

  const rows = [
    [
      "Kartela ID e re",
      "Identifikim",
      "Leshimi i karteles se re studentore ne rast humbjeje ose demtimi.",
      12,
      "EUR",
      1,
      1,
    ],
    [
      "Vertetim studenti",
      "Administrate",
      "Vertetim zyrtar per statusin aktiv te studentit.",
      3,
      "EUR",
      1,
      0,
    ],
    [
      "Transkript notash",
      "Akademike",
      "Transkript zyrtar i notave per aplikime te jashtme ose transfer.",
      5,
      "EUR",
      1,
      0,
    ],
    [
      "Dublikim diplome",
      "Administrate",
      "Leshim i duplikatit te diplomes per rastet e humbjes ose demtimit.",
      25,
      "EUR",
      1,
      1,
    ],
  ];

  await connection.query(
    `
      INSERT INTO sherbimet_studentore
        (emri, kategoria, pershkrimi, cmimi, valuta, aktiv, kerkon_dokument)
      VALUES ?
    `,
    [rows]
  );
};

const seedScholarships = async () => {
  const [[{ total }]] = await connection.query(
    "SELECT COUNT(*) AS total FROM bursat"
  );

  if (total > 0) {
    return;
  }

  await connection.query(
    `
      INSERT INTO bursat
        (titulli, pershkrimi, lloji, shuma, kriteret, afati_aplikimit, statusi)
      VALUES
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      "Bursa e Ekselences Akademike",
      "Burse vjetore per studentet me performance te larte akademike.",
      "Merite",
      800,
      "Mesatare minimale 9.0 dhe se paku 30 ECTS te perfunduara.",
      "2026-06-30",
      "Hapur",
      "Bursa e Mbeshtetjes Sociale",
      "Mbeshtetje financiare per studentet ne kushte te veshtira ekonomike.",
      "Sociale",
      650,
      "Dokumentim i gjendjes ekonomike dhe status aktiv i studimeve.",
      "2026-07-15",
      "Hapur",
    ]
  );
};

const seedInternships = async () => {
  const [[{ total }]] = await connection.query(
    "SELECT COUNT(*) AS total FROM praktikat"
  );

  if (total > 0) {
    return;
  }

  await connection.query(
    `
      INSERT INTO praktikat
        (kompania, pozita, pershkrimi, lokacioni, kompensimi, lloji, afati_aplikimit, statusi, drejtimi_id)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      "TechNova",
      "Frontend Intern",
      "Praktike verore ne zhvillim frontend me fokus ne React dhe UX.",
      "Prishtine",
      "250 EUR/muaj",
      "Me pagese",
      "2026-06-20",
      "Hapur",
      1,
      "FinCore",
      "Analist Praktikant",
      "Praktike ne finance operative, raportim dhe analiza te te dhenave.",
      "Prishtine",
      "300 EUR/muaj",
      "Me pagese",
      "2026-06-25",
      "Hapur",
      3,
    ]
  );
};

const seedErasmusPrograms = async () => {
  const [[{ total }]] = await connection.query(
    "SELECT COUNT(*) AS total FROM programet_erasmus"
  );

  if (total > 0) {
    return;
  }

  await connection.query(
    `
      INSERT INTO programet_erasmus
        (universiteti, shteti, semestri, viti_akademik, financimi, pershkrimi, afati_aplikimit, statusi, drejtimi_id)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      "University of Ljubljana",
      "Sloveni",
      "Dimeror",
      "2026/2027",
      "Burse Erasmus+ dhe mbulim pjese te qendrimit",
      "Shkembim semestral per studentet e shkencave kompjuterike dhe sistemeve informative.",
      "2026-07-10",
      "Hapur",
      1,
      "University of Graz",
      "Austri",
      "Veror",
      "2026/2027",
      "Mbeshtetje Erasmus+ dhe kredi transferuese",
      "Program mobiliteti per studentet e financave, bankes dhe auditimit.",
      "2026-07-20",
      "Hapur",
      3,
    ]
  );
};

const ensureUniversitySetup = async () => {
  ensureDirectory(UPLOADS_ROOT);
  await ensureGenerationsTable();
  await ensureStudentDocumentsTable();
  await ensureRegistrationDocumentsTable();
  await ensureServicesTables();
  await ensureRepeatCoursesTable();
  await ensureScholarshipTables();
  await ensureInternshipsTables();
  await ensureErasmusTables();
  await seedGenerations();
  await assignStudentsToGenerations();
  await seedServices();
  await seedScholarships();
  await seedInternships();
  await seedErasmusPrograms();
};

module.exports = {
  ensureUniversitySetup,
};

DROP DATABASE IF EXISTS universitydb;
CREATE DATABASE universitydb;
USE universitydb;

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    roli VARCHAR(50) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fakultetet (
    fakultet_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    dekani_id INT NULL,
    adresa VARCHAR(150) NOT NULL,
    telefoni VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE departamentet (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    shefi_id INT NULL,
    pershkrimi TEXT NOT NULL,
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE drejtimet (
    drejtim_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    niveli VARCHAR(50) NOT NULL,
    kohezgjatja_vite INT NOT NULL,
    pershkrimi TEXT NOT NULL,
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE gjeneratat (
    gjenerata_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(120) NOT NULL,
    viti_regjistrimit INT NOT NULL,
    viti_diplomimit INT NOT NULL,
    statusi VARCHAR(40) NOT NULL DEFAULT 'Aktive',
    pershkrimi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profesoret (
    profesor_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100) NOT NULL,
    titulli_akademik VARCHAR(100) NOT NULL,
    departamenti_id INT NULL,
    email VARCHAR(100) NOT NULL,
    telefoni VARCHAR(50) NOT NULL,
    specializimi VARCHAR(100) NOT NULL,
    data_punesimit DATE NOT NULL,
    UNIQUE KEY uq_profesoret_email (email),
    FOREIGN KEY (departamenti_id) REFERENCES departamentet(departament_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE studentet (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100) NOT NULL,
    numri_personal VARCHAR(20) NOT NULL,
    data_lindjes DATE NOT NULL,
    gjinia VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefoni VARCHAR(50) NOT NULL,
    adresa VARCHAR(150) NOT NULL,
    drejtimi_id INT NULL,
    gjenerata_id INT NULL,
    viti_studimit INT NOT NULL,
    statusi VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_studentet_numri_personal (numri_personal),
    UNIQUE KEY uq_studentet_email (email),
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (gjenerata_id) REFERENCES gjeneratat(gjenerata_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE lendet (
    lende_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    kodi VARCHAR(50) NOT NULL UNIQUE,
    kreditet INT NOT NULL,
    semestri INT NOT NULL,
    drejtimi_id INT NULL,
    profesor_id INT NULL,
    lloji VARCHAR(50) NOT NULL,
    pershkrimi TEXT NOT NULL,
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesoret(profesor_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE provimet (
    provimi_id INT AUTO_INCREMENT PRIMARY KEY,
    lende_id INT NULL,
    profesor_id INT NULL,
    data_provimit DATE NOT NULL,
    ora TIME NOT NULL,
    salla VARCHAR(50) NOT NULL,
    afati VARCHAR(50) NOT NULL,
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesoret(profesor_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE regjistrimet (
    regjistrimi_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    lende_id INT NULL,
    semestri INT NOT NULL,
    viti_akademik VARCHAR(20) NOT NULL,
    statusi VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_regjistrimet_student_lende_viti (student_id, lende_id, viti_akademik),
    FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE notat (
    nota_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    provimi_id INT NULL,
    nota DECIMAL(4,2) NOT NULL,
    data_vendosjes DATE NOT NULL,
    UNIQUE KEY uq_notat_student_provimi (student_id, provimi_id),
    FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (provimi_id) REFERENCES provimet(provimi_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE oraret (
    orari_id INT AUTO_INCREMENT PRIMARY KEY,
    lende_id INT NULL,
    profesor_id INT NULL,
    dita VARCHAR(20) NOT NULL,
    ora_fillimit TIME NOT NULL,
    ora_mbarimit TIME NOT NULL,
    salla VARCHAR(50) NOT NULL,
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesoret(profesor_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE users (
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
);

CREATE TABLE refresh_tokens (
    refresh_token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    last_used_at DATETIME NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE student_dokumentet (
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
);

CREATE TABLE regjistrim_dokumentet (
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
);

CREATE TABLE sherbimet_studentore (
    sherbimi_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(140) NOT NULL,
    kategoria VARCHAR(80) NOT NULL,
    pershkrimi TEXT NOT NULL,
    cmimi DECIMAL(10,2) NOT NULL DEFAULT 0,
    valuta VARCHAR(10) NOT NULL DEFAULT 'EUR',
    aktiv TINYINT(1) NOT NULL DEFAULT 1,
    kerkon_dokument TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kerkesat_sherbimeve (
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
);

CREATE TABLE rindjekjet_lendeve (
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
);

CREATE TABLE bursat (
    bursa_id INT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(160) NOT NULL,
    pershkrimi TEXT NOT NULL,
    lloji VARCHAR(80) NOT NULL,
    shuma DECIMAL(10,2) NOT NULL,
    kriteret TEXT NOT NULL,
    afati_aplikimit DATE NOT NULL,
    statusi VARCHAR(40) NOT NULL DEFAULT 'Hapur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE aplikimet_bursave (
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
);

CREATE TABLE praktikat (
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
);

CREATE TABLE aplikimet_praktikave (
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
);

CREATE TABLE programet_erasmus (
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
);

CREATE TABLE njoftimet (
    njoftim_id INT AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(80) NOT NULL,
    titulli VARCHAR(180) NOT NULL,
    pershkrimi TEXT NOT NULL,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE aplikimet_erasmus (
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
);

-- Seed data bazike per testim dhe autentikim
-- Kredencialet default:
-- Admin: admin@universiteti.local / Admin123!
-- Profesor: dorian.rinor1@universiteti.local / Profesor123!
-- Student: dorian.rinor1@student.uni.local / Student123!
-- Profesor finance: dorian.rinor3@universiteti.local / Profesor123!
-- Student finance: dorian.rinor3@student.uni.local / Student123!

INSERT INTO admins (admin_id, emri, mbiemri, email, password_hash, roli) VALUES
    (1, 'Dorian', 'Rinor', 'admin@universiteti.local', '$2b$10$jjUUPF1AWdBXRTbEv7uUX.ZsiYxSgFlO3QlKcq2ynk7HeoXWk928u', 'Admin');

INSERT INTO fakultetet (fakultet_id, emri, dekani_id, adresa, telefoni, email) VALUES
    (1, 'Fakulteti i Shkencave Kompjuterike', NULL, 'Rr. Universiteti, Prishtine', '+38344111222', 'fshk@universiteti.local'),
    (2, 'Fakulteti Ekonomik', NULL, 'Rr. Dardania, Prishtine', '+38344111333', 'ekonomik@universiteti.local');

INSERT INTO departamentet (departament_id, emri, fakulteti_id, shefi_id, pershkrimi) VALUES
    (1, 'Inxhinieri Softuerike', 1, NULL, 'Departamenti fokusohet ne zhvillim softuerik, arkitekture sistemesh dhe teknologji moderne web.'),
    (2, 'Menaxhment dhe Informatike', 2, NULL, 'Departamenti kombinon menaxhmentin, analitiken dhe transformimin digjital ne biznes.'),
    (3, 'Financa dhe Kontabilitet', 2, NULL, 'Departamenti mbulon financat korporative, kontabilitetin, raportimin dhe menaxhimin financiar.'),
    (4, 'Banka, Sigurime dhe Risk', 2, NULL, 'Departamenti fokusohet ne banke, sigurime, tregje financiare dhe menaxhim te riskut.'),
    (5, 'Auditim dhe Tatime', 2, NULL, 'Departamenti fokusohet ne auditim, tatime, kontroll financiar dhe pajtueshmeri fiskale.');

INSERT INTO drejtimet (drejtim_id, emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi) VALUES
    (1, 'Shkenca Kompjuterike', 1, 'Bachelor', 3, 'Program i fokusuar ne programim, databaza, algoritme dhe sisteme informative.'),
    (2, 'Menaxhment Informatik', 2, 'Bachelor', 3, 'Program i fokusuar ne menaxhim, sisteme biznesi dhe analiza te proceseve.'),
    (3, 'Financa dhe Kontabilitet', 2, 'Bachelor', 3, 'Program i fokusuar ne kontabilitet, financa, raportim dhe planifikim financiar.'),
    (4, 'Banka dhe Sigurime', 2, 'Bachelor', 3, 'Program i fokusuar ne banka, sigurime, produkte financiare dhe menaxhim risku.'),
    (5, 'Analize Financiare dhe Auditim', 2, 'Master', 2, 'Program i avancuar per auditim, tatime, raportim financiar dhe analiza te tregjeve.');

INSERT INTO gjeneratat (
    gjenerata_id, emri, viti_regjistrimit, viti_diplomimit, statusi, pershkrimi
) VALUES
    (1, 'Gjenerata 2021/2022', 2021, 2024, 'Diplomuar', 'Gjenerate e kaluar e arkivuar per historikun akademik.'),
    (2, 'Gjenerata 2022/2023', 2022, 2025, 'Diplomuar', 'Gjenerate e kaluar me studentet qe kane perfunduar studimet.'),
    (3, 'Gjenerata 2023/2024', 2023, 2026, 'Aktive', 'Gjenerate aktive ne fazen e avancuar te studimeve.'),
    (4, 'Gjenerata 2024/2025', 2024, 2027, 'Aktive', 'Gjenerate aktive me studentet e viteve te mesme.'),
    (5, 'Gjenerata 2025/2026', 2025, 2028, 'Aktive', 'Gjenerate e re per pranimet aktuale dhe regjistrimet hyrse.');

INSERT INTO profesoret (
    profesor_id, emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit
) VALUES
    (1, 'Dorian', 'Rinor', 'Prof. Dr.', 1, 'dorian.rinor1@universiteti.local', '+38344123456', 'Zhvillim Softuerik', '2020-10-01'),
    (2, 'Rinor', 'Dorian', 'Prof. Ass.', 2, 'rinor.dorian2@universiteti.local', '+38344123457', 'Sisteme Informative', '2022-02-15'),
    (3, 'Dorian', 'Rinor', 'Prof. Dr.', 3, 'dorian.rinor3@universiteti.local', '+38344123458', 'Financa Korporative', '2019-09-15'),
    (4, 'Rinor', 'Dorian', 'Prof. Ass.', 4, 'rinor.dorian4@universiteti.local', '+38344123459', 'Banka dhe Sigurime', '2021-03-10'),
    (5, 'Dorian', 'Rinor', 'Prof. Dr.', 5, 'dorian.rinor5@universiteti.local', '+38344123460', 'Auditim dhe Tatime', '2018-10-01');

UPDATE fakultetet
SET dekani_id = 1
WHERE fakultet_id = 1;

UPDATE fakultetet
SET dekani_id = 2
WHERE fakultet_id = 2;

UPDATE departamentet
SET shefi_id = 1
WHERE departament_id = 1;

UPDATE departamentet
SET shefi_id = 2
WHERE departament_id = 2;

UPDATE departamentet
SET shefi_id = 3
WHERE departament_id = 3;

UPDATE departamentet
SET shefi_id = 4
WHERE departament_id = 4;

UPDATE departamentet
SET shefi_id = 5
WHERE departament_id = 5;

INSERT INTO studentet (
    student_id, emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
) VALUES
    (1, 'Dorian', 'Rinor', '1002003001', '2004-03-12', 'M', 'dorian.rinor1@student.uni.local', '+38349111111', 'Prishtine', 1, 4, 2, 'Aktiv'),
    (2, 'Rinor', 'Dorian', '1002003002', '2003-11-07', 'M', 'rinor.dorian2@student.uni.local', '+38349222222', 'Gjilan', 2, 3, 3, 'Aktiv'),
    (3, 'Dorian', 'Rinor', '1002003003', '2004-06-20', 'F', 'dorian.rinor3@student.uni.local', '+38349333333', 'Prizren', 3, 4, 2, 'Aktiv'),
    (4, 'Rinor', 'Dorian', '1002003004', '2002-09-17', 'M', 'rinor.dorian4@student.uni.local', '+38349444444', 'Peje', 4, 3, 3, 'Aktiv'),
    (5, 'Dorian', 'Rinor', '1002003005', '2001-12-09', 'F', 'dorian.rinor5@student.uni.local', '+38349555555', 'Ferizaj', 5, 5, 1, 'Aktiv');

INSERT INTO lendet (
    lende_id, emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi
) VALUES
    (1, 'Programim ne Web', 'CS201', 6, 4, 1, 1, 'Obligative', 'Zhvillimi i aplikacioneve moderne web me fokus ne frontend dhe backend.'),
    (2, 'Databaza', 'CS202', 6, 4, 1, 1, 'Obligative', 'Modelimi relacional, SQL dhe optimizimi i databazave.'),
    (3, 'Sisteme Informative Menaxheriale', 'MI301', 5, 5, 2, 2, 'Zgjedhore', 'Perdorimi i sistemeve informative ne vendimmarrje dhe menaxhim.'),
    (4, 'Hyrje ne Financa', 'FK201', 6, 3, 3, 3, 'Obligative', 'Konceptet baze te financave, vlera ne kohe e parase dhe vendimmarrja financiare.'),
    (5, 'Kontabilitet Financiar', 'FK202', 6, 3, 3, 5, 'Obligative', 'Parimet e kontabilitetit financiar, pasqyrat financiare dhe regjistrimet kontabel.'),
    (6, 'Menaxhim Financiar', 'FK301', 6, 5, 3, 3, 'Obligative', 'Menaxhimi i burimeve financiare, investimeve dhe financimit ne ndermarrje.'),
    (7, 'Analize e Pasqyrave Financiare', 'FK302', 5, 5, 3, 5, 'Obligative', 'Analiza e likuiditetit, fitueshmerise dhe struktures financiare te kompanive.'),
    (8, 'Banka dhe Sistemi Financiar', 'BS301', 6, 5, 4, 4, 'Obligative', 'Roli i bankave ne ekonomi, instrumentet financiare dhe ndermjetesimi bankar.'),
    (9, 'Sigurime dhe Menaxhim Risku', 'BS302', 5, 5, 4, 4, 'Obligative', 'Parimet e sigurimeve, vleresimi i riskut dhe menaxhimi i ekspozimit financiar.'),
    (10, 'Tregjet e Kapitalit', 'BS303', 5, 6, 4, 3, 'Zgjedhore', 'Instrumentet e tregjeve te kapitalit, investimet dhe sjellja e investitoreve.'),
    (11, 'Auditim i Jashtem', 'AF501', 6, 1, 5, 5, 'Obligative', 'Metodat e auditimit te jashtem, kontrolli i brendshem dhe standardet profesionale.'),
    (12, 'Tatime dhe Planifikim Fiskal', 'AF502', 5, 2, 5, 5, 'Obligative', 'Legjislacioni fiskal, planifikimi tatimor dhe optimizimi i detyrimeve tatimore.'),
    (13, 'Raportim Financiar i Avancuar', 'AF503', 5, 2, 5, 5, 'Obligative', 'Raportimi financiar i avancuar, konsolidimi dhe interpretimi i standardeve kontabel.');

INSERT INTO provimet (
    provimi_id, lende_id, profesor_id, data_provimit, ora, salla, afati
) VALUES
    (1, 1, 1, '2026-06-10', '10:00:00', 'A1', 'Qershor'),
    (2, 2, 1, '2026-06-15', '13:00:00', 'B2', 'Qershor'),
    (3, 3, 2, '2026-06-18', '09:00:00', 'C3', 'Qershor'),
    (4, 4, 3, '2026-02-12', '10:00:00', 'A2', 'Shkurt'),
    (5, 5, 5, '2026-02-19', '12:00:00', 'B3', 'Shkurt'),
    (6, 6, 3, '2026-06-12', '09:00:00', 'A3', 'Qershor'),
    (7, 7, 5, '2026-06-17', '11:00:00', 'B4', 'Qershor'),
    (8, 8, 4, '2026-02-16', '09:00:00', 'C1', 'Shkurt'),
    (9, 9, 4, '2026-06-16', '13:00:00', 'C2', 'Qershor'),
    (10, 10, 3, '2026-06-22', '10:00:00', 'C4', 'Qershor'),
    (11, 11, 5, '2026-02-26', '14:00:00', 'D1', 'Shkurt'),
    (12, 12, 5, '2026-06-20', '09:00:00', 'D2', 'Qershor'),
    (13, 13, 5, '2026-06-24', '12:00:00', 'D3', 'Qershor');

INSERT INTO regjistrimet (
    regjistrimi_id, student_id, lende_id, semestri, viti_akademik, statusi
) VALUES
    (1, 1, 1, 4, '2025/2026', 'Aktiv'),
    (2, 1, 2, 4, '2025/2026', 'Aktiv'),
    (3, 2, 3, 5, '2025/2026', 'Aktiv'),
    (4, 3, 4, 3, '2025/2026', 'Aktiv'),
    (5, 3, 5, 3, '2025/2026', 'Aktiv'),
    (6, 3, 6, 5, '2025/2026', 'Aktiv'),
    (7, 3, 7, 5, '2025/2026', 'Aktiv'),
    (8, 4, 8, 5, '2025/2026', 'Aktiv'),
    (9, 4, 9, 5, '2025/2026', 'Aktiv'),
    (10, 4, 10, 6, '2025/2026', 'Aktiv'),
    (11, 5, 11, 1, '2025/2026', 'Aktiv'),
    (12, 5, 12, 2, '2025/2026', 'Aktiv'),
    (13, 5, 13, 2, '2025/2026', 'Aktiv');

INSERT INTO oraret (
    orari_id, lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla
) VALUES
    (1, 1, 1, 'E hene', '09:00:00', '11:00:00', 'Lab 1'),
    (2, 2, 1, 'E merkure', '11:00:00', '13:00:00', 'Lab 2'),
    (3, 3, 2, 'E premte', '14:00:00', '16:00:00', 'Salla 5'),
    (4, 4, 3, 'E marte', '09:00:00', '11:00:00', 'Salla E1'),
    (5, 5, 5, 'E enjte', '10:00:00', '12:00:00', 'Salla E2'),
    (6, 6, 3, 'E hene', '12:00:00', '14:00:00', 'Salla E3'),
    (7, 7, 5, 'E merkure', '14:00:00', '16:00:00', 'Salla E4'),
    (8, 8, 4, 'E marte', '12:00:00', '14:00:00', 'Salla F1'),
    (9, 9, 4, 'E premte', '09:00:00', '11:00:00', 'Salla F2'),
    (10, 10, 3, 'E enjte', '14:00:00', '16:00:00', 'Salla F3'),
    (11, 11, 5, 'E hene', '16:00:00', '18:00:00', 'Salla M1'),
    (12, 12, 5, 'E merkure', '16:00:00', '18:00:00', 'Salla M2'),
    (13, 13, 5, 'E premte', '12:00:00', '14:00:00', 'Salla M3');

INSERT INTO notat (
    nota_id, student_id, provimi_id, nota, data_vendosjes
) VALUES
    (1, 1, 1, 9.00, '2026-01-25'),
    (2, 2, 3, 8.00, '2026-01-28'),
    (3, 3, 4, 10.00, '2026-02-20'),
    (4, 3, 5, 9.00, '2026-02-27'),
    (5, 4, 8, 8.00, '2026-02-21'),
    (6, 5, 11, 9.00, '2026-03-05');

INSERT INTO users (
    user_id, email, password_hash, role, admin_id, profesor_id, student_id, is_active
) VALUES
    (1, 'admin@universiteti.local', '$2b$10$jjUUPF1AWdBXRTbEv7uUX.ZsiYxSgFlO3QlKcq2ynk7HeoXWk928u', 'admin', 1, NULL, NULL, 1),
    (2, 'dorian.rinor1@universiteti.local', '$2b$10$QWnQIkLCfASiKMAI7neHteJB/m1SdrBMkxHnH5fhF55c273uFs.2i', 'profesor', NULL, 1, NULL, 1),
    (3, 'rinor.dorian2@universiteti.local', '$2b$10$QWnQIkLCfASiKMAI7neHteJB/m1SdrBMkxHnH5fhF55c273uFs.2i', 'profesor', NULL, 2, NULL, 1),
    (4, 'dorian.rinor1@student.uni.local', '$2b$10$qh84MaGcEQ9L3EChUoltHOpJveH3obzWIcvChKb0QILSB5ofmEESW', 'student', NULL, NULL, 1, 1),
    (5, 'rinor.dorian2@student.uni.local', '$2b$10$qh84MaGcEQ9L3EChUoltHOpJveH3obzWIcvChKb0QILSB5ofmEESW', 'student', NULL, NULL, 2, 1),
    (6, 'dorian.rinor3@universiteti.local', '$2b$10$QWnQIkLCfASiKMAI7neHteJB/m1SdrBMkxHnH5fhF55c273uFs.2i', 'profesor', NULL, 3, NULL, 1),
    (7, 'rinor.dorian4@universiteti.local', '$2b$10$QWnQIkLCfASiKMAI7neHteJB/m1SdrBMkxHnH5fhF55c273uFs.2i', 'profesor', NULL, 4, NULL, 1),
    (8, 'dorian.rinor5@universiteti.local', '$2b$10$QWnQIkLCfASiKMAI7neHteJB/m1SdrBMkxHnH5fhF55c273uFs.2i', 'profesor', NULL, 5, NULL, 1),
    (9, 'dorian.rinor3@student.uni.local', '$2b$10$qh84MaGcEQ9L3EChUoltHOpJveH3obzWIcvChKb0QILSB5ofmEESW', 'student', NULL, NULL, 3, 1),
    (10, 'rinor.dorian4@student.uni.local', '$2b$10$qh84MaGcEQ9L3EChUoltHOpJveH3obzWIcvChKb0QILSB5ofmEESW', 'student', NULL, NULL, 4, 1),
    (11, 'dorian.rinor5@student.uni.local', '$2b$10$qh84MaGcEQ9L3EChUoltHOpJveH3obzWIcvChKb0QILSB5ofmEESW', 'student', NULL, NULL, 5, 1);

INSERT INTO sherbimet_studentore (
    sherbimi_id, emri, kategoria, pershkrimi, cmimi, valuta, aktiv, kerkon_dokument
) VALUES
    (1, 'Kartela ID e re', 'Identifikim', 'Leshimi i karteles se re studentore ne rast humbjeje ose demtimi.', 12.00, 'EUR', 1, 1),
    (2, 'Vertetim studenti', 'Administrate', 'Vertetim zyrtar per statusin aktiv te studentit.', 3.00, 'EUR', 1, 0),
    (3, 'Transkript notash', 'Akademike', 'Transkript zyrtar i notave per aplikime te jashtme ose transfer.', 5.00, 'EUR', 1, 0),
    (4, 'Dublikim diplome', 'Administrate', 'Leshim i duplikatit te diplomes per rastet e humbjes ose demtimit.', 25.00, 'EUR', 1, 1);

INSERT INTO bursat (
    bursa_id, titulli, pershkrimi, lloji, shuma, kriteret, afati_aplikimit, statusi
) VALUES
    (1, 'Bursa e Ekselences Akademike', 'Burse vjetore per studentet me performance te larte akademike.', 'Merite', 800.00, 'Mesatare minimale 9.0 dhe se paku 30 ECTS te perfunduara.', '2026-06-30', 'Hapur'),
    (2, 'Bursa e Mbeshtetjes Sociale', 'Mbeshtetje financiare per studentet ne kushte te veshtira ekonomike.', 'Sociale', 650.00, 'Dokumentim i gjendjes ekonomike dhe status aktiv i studimeve.', '2026-07-15', 'Hapur');

INSERT INTO praktikat (
    praktika_id, kompania, pozita, pershkrimi, lokacioni, kompensimi, lloji, afati_aplikimit, statusi, drejtimi_id
) VALUES
    (1, 'TechNova', 'Frontend Intern', 'Praktike verore ne zhvillim frontend me fokus ne React dhe UX.', 'Prishtine', '250 EUR/muaj', 'Me pagese', '2026-06-20', 'Hapur', 1),
    (2, 'FinCore', 'Analist Praktikant', 'Praktike ne finance operative, raportim dhe analiza te te dhenave.', 'Prishtine', '300 EUR/muaj', 'Me pagese', '2026-06-25', 'Hapur', 3);

INSERT INTO programet_erasmus (
    erasmus_id, universiteti, shteti, semestri, viti_akademik, financimi, pershkrimi, afati_aplikimit, statusi, drejtimi_id
) VALUES
    (1, 'University of Ljubljana', 'Sloveni', 'Dimeror', '2026/2027', 'Burse Erasmus+ dhe mbulim pjese te qendrimit', 'Shkembim semestral per studentet e shkencave kompjuterike dhe sistemeve informative.', '2026-07-10', 'Hapur', 1),
    (2, 'University of Graz', 'Austri', 'Veror', '2026/2027', 'Mbeshtetje Erasmus+ dhe kredi transferuese', 'Program mobiliteti per studentet e financave, bankes dhe auditimit.', '2026-07-20', 'Hapur', 3);

INSERT INTO njoftimet (
    njoftim_id, tag, titulli, pershkrimi, created_by_user_id
) VALUES
    (1, 'Akademik', 'Afati i regjistrimeve mbetet i hapur deri te premten', 'Studentet mund te perfundojne regjistrimet aktive deri ne fund te javes pa penalizime shtese.', 1),
    (2, 'Provime', 'Orari i sesionit te ardhshem eshte publikuar', 'Profesoret dhe studentet mund te verifikojne sallat, datat dhe oraret nga modulet perkatese.', 1),
    (3, 'Sistem', 'Paneli i ri i menaxhimit eshte optimizuar', 'Navigimi, kartat informative dhe pamja e pergjithshme tani jane me te qarta per perdorim ditor.', 1);

-- Seed shtese demo per me shume te dhena testuese
-- Kredencialet per rekordet e reja:
-- Profesoret e rinj: Profesor123!
-- Studentet e rinj: Student123!

SET @profesor_password_hash = '$2b$10$QWnQIkLCfASiKMAI7neHteJB/m1SdrBMkxHnH5fhF55c273uFs.2i';
SET @student_password_hash = '$2b$10$qh84MaGcEQ9L3EChUoltHOpJveH3obzWIcvChKb0QILSB5ofmEESW';

INSERT INTO profesoret (
    emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit
)
SELECT
    'Mentor',
    'Krasniqi',
    'Prof. Ass.',
    (
        SELECT departament_id
        FROM departamentet
        WHERE emri = 'Inxhinieri Softuerike'
        LIMIT 1
    ),
    'mentor.krasniqi@universiteti.local',
    '+38344123061',
    'Cloud Computing',
    '2023-02-01'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM profesoret
    WHERE email = 'mentor.krasniqi@universiteti.local'
);

INSERT INTO profesoret (
    emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit
)
SELECT
    'Arta',
    'Berisha',
    'Prof. Dr.',
    (
        SELECT departament_id
        FROM departamentet
        WHERE emri = 'Financa dhe Kontabilitet'
        LIMIT 1
    ),
    'arta.berisha@universiteti.local',
    '+38344123062',
    'Investime dhe Tregje Kapitali',
    '2021-09-15'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM profesoret
    WHERE email = 'arta.berisha@universiteti.local'
);

INSERT INTO users (email, password_hash, role, profesor_id, is_active)
SELECT
    p.email,
    @profesor_password_hash,
    'profesor',
    p.profesor_id,
    1
FROM profesoret p
WHERE p.email = 'mentor.krasniqi@universiteti.local'
  AND NOT EXISTS (
      SELECT 1
      FROM users u
      WHERE u.email = p.email
  );

INSERT INTO users (email, password_hash, role, profesor_id, is_active)
SELECT
    p.email,
    @profesor_password_hash,
    'profesor',
    p.profesor_id,
    1
FROM profesoret p
WHERE p.email = 'arta.berisha@universiteti.local'
  AND NOT EXISTS (
      SELECT 1
      FROM users u
      WHERE u.email = p.email
  );

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
SELECT
    'Blendi',
    'Hoxha',
    '2003004001',
    '2004-02-18',
    'M',
    'blendi.hoxha@student.uni.local',
    '+38349100001',
    'Prishtine',
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Shkenca Kompjuterike'
        LIMIT 1
    ),
    (
        SELECT gjenerata_id
        FROM gjeneratat
        WHERE emri = 'Gjenerata 2024/2025'
        LIMIT 1
    ),
    2,
    'Aktiv'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM studentet
    WHERE email = 'blendi.hoxha@student.uni.local'
       OR numri_personal = '2003004001'
);

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
SELECT
    'Era',
    'Gashi',
    '2003004002',
    '2005-05-09',
    'F',
    'era.gashi@student.uni.local',
    '+38349100002',
    'Gjakove',
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Shkenca Kompjuterike'
        LIMIT 1
    ),
    (
        SELECT gjenerata_id
        FROM gjeneratat
        WHERE emri = 'Gjenerata 2025/2026'
        LIMIT 1
    ),
    1,
    'Aktiv'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM studentet
    WHERE email = 'era.gashi@student.uni.local'
       OR numri_personal = '2003004002'
);

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
SELECT
    'Liridon',
    'Kastrati',
    '2003004003',
    '2003-08-11',
    'M',
    'liridon.kastrati@student.uni.local',
    '+38349100003',
    'Mitrovice',
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Menaxhment Informatik'
        LIMIT 1
    ),
    (
        SELECT gjenerata_id
        FROM gjeneratat
        WHERE emri = 'Gjenerata 2023/2024'
        LIMIT 1
    ),
    3,
    'Aktiv'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM studentet
    WHERE email = 'liridon.kastrati@student.uni.local'
       OR numri_personal = '2003004003'
);

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
SELECT
    'Aulona',
    'Berisha',
    '2003004004',
    '2004-10-01',
    'F',
    'aulona.berisha@student.uni.local',
    '+38349100004',
    'Ferizaj',
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Menaxhment Informatik'
        LIMIT 1
    ),
    (
        SELECT gjenerata_id
        FROM gjeneratat
        WHERE emri = 'Gjenerata 2024/2025'
        LIMIT 1
    ),
    2,
    'Aktiv'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM studentet
    WHERE email = 'aulona.berisha@student.uni.local'
       OR numri_personal = '2003004004'
);

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
SELECT
    'Arben',
    'Mehmeti',
    '2003004005',
    '2004-01-27',
    'M',
    'arben.mehmeti@student.uni.local',
    '+38349100005',
    'Prizren',
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Financa dhe Kontabilitet'
        LIMIT 1
    ),
    (
        SELECT gjenerata_id
        FROM gjeneratat
        WHERE emri = 'Gjenerata 2024/2025'
        LIMIT 1
    ),
    2,
    'Aktiv'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM studentet
    WHERE email = 'arben.mehmeti@student.uni.local'
       OR numri_personal = '2003004005'
);

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
SELECT
    'Elira',
    'Krasniqi',
    '2003004006',
    '2003-04-14',
    'F',
    'elira.krasniqi@student.uni.local',
    '+38349100006',
    'Peje',
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Financa dhe Kontabilitet'
        LIMIT 1
    ),
    (
        SELECT gjenerata_id
        FROM gjeneratat
        WHERE emri = 'Gjenerata 2023/2024'
        LIMIT 1
    ),
    3,
    'Aktiv'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM studentet
    WHERE email = 'elira.krasniqi@student.uni.local'
       OR numri_personal = '2003004006'
);

INSERT INTO users (email, password_hash, role, student_id, is_active)
SELECT s.email, @student_password_hash, 'student', s.student_id, 1
FROM studentet s
WHERE s.email = 'blendi.hoxha@student.uni.local'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

INSERT INTO users (email, password_hash, role, student_id, is_active)
SELECT s.email, @student_password_hash, 'student', s.student_id, 1
FROM studentet s
WHERE s.email = 'era.gashi@student.uni.local'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

INSERT INTO users (email, password_hash, role, student_id, is_active)
SELECT s.email, @student_password_hash, 'student', s.student_id, 1
FROM studentet s
WHERE s.email = 'liridon.kastrati@student.uni.local'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

INSERT INTO users (email, password_hash, role, student_id, is_active)
SELECT s.email, @student_password_hash, 'student', s.student_id, 1
FROM studentet s
WHERE s.email = 'aulona.berisha@student.uni.local'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

INSERT INTO users (email, password_hash, role, student_id, is_active)
SELECT s.email, @student_password_hash, 'student', s.student_id, 1
FROM studentet s
WHERE s.email = 'arben.mehmeti@student.uni.local'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

INSERT INTO users (email, password_hash, role, student_id, is_active)
SELECT s.email, @student_password_hash, 'student', s.student_id, 1
FROM studentet s
WHERE s.email = 'elira.krasniqi@student.uni.local'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

INSERT INTO lendet (
    emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi
)
SELECT
    'Cloud Computing',
    'CS305',
    6,
    4,
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Shkenca Kompjuterike'
        LIMIT 1
    ),
    (
        SELECT profesor_id
        FROM profesoret
        WHERE email = 'mentor.krasniqi@universiteti.local'
        LIMIT 1
    ),
    'Obligative',
    'Projektim dhe menaxhim i sherbimeve cloud, virtualizim dhe deployment modern.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM lendet
    WHERE kodi = 'CS305'
);

INSERT INTO lendet (
    emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi
)
SELECT
    'Zhvillim i Aplikacioneve Mobile',
    'CS306',
    5,
    4,
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Shkenca Kompjuterike'
        LIMIT 1
    ),
    (
        SELECT profesor_id
        FROM profesoret
        WHERE email = 'mentor.krasniqi@universiteti.local'
        LIMIT 1
    ),
    'Zgjedhore',
    'Konceptet baze te zhvillimit mobile, UI responsive dhe integrim me API.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM lendet
    WHERE kodi = 'CS306'
);

INSERT INTO lendet (
    emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi
)
SELECT
    'Analiza e Proceseve te Biznesit',
    'MI302',
    5,
    5,
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Menaxhment Informatik'
        LIMIT 1
    ),
    (
        SELECT profesor_id
        FROM profesoret
        WHERE email = 'rinor.dorian2@universiteti.local'
        LIMIT 1
    ),
    'Obligative',
    'Modelimi dhe optimizimi i proceseve te biznesit me fokus te transformimi digjital.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM lendet
    WHERE kodi = 'MI302'
);

INSERT INTO lendet (
    emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi
)
SELECT
    'Investime dhe Menaxhim Portofoli',
    'FK304',
    6,
    5,
    (
        SELECT drejtim_id
        FROM drejtimet
        WHERE emri = 'Financa dhe Kontabilitet'
        LIMIT 1
    ),
    (
        SELECT profesor_id
        FROM profesoret
        WHERE email = 'arta.berisha@universiteti.local'
        LIMIT 1
    ),
    'Obligative',
    'Instrumentet financiare, diversifikimi i portofolit dhe vleresimi i riskut te investimeve.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM lendet
    WHERE kodi = 'FK304'
);

INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
SELECT l.lende_id, l.profesor_id, '2026-06-11', '09:00:00', 'Lab 3', 'Qershor'
FROM lendet l
WHERE l.kodi = 'CS305'
  AND NOT EXISTS (
      SELECT 1
      FROM provimet p
      WHERE p.lende_id = l.lende_id
        AND p.data_provimit = '2026-06-11'
        AND p.afati = 'Qershor'
  );

INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
SELECT l.lende_id, l.profesor_id, '2026-06-13', '11:00:00', 'Lab 4', 'Qershor'
FROM lendet l
WHERE l.kodi = 'CS306'
  AND NOT EXISTS (
      SELECT 1
      FROM provimet p
      WHERE p.lende_id = l.lende_id
        AND p.data_provimit = '2026-06-13'
        AND p.afati = 'Qershor'
  );

INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
SELECT l.lende_id, l.profesor_id, '2026-06-19', '10:00:00', 'Salla 6', 'Qershor'
FROM lendet l
WHERE l.kodi = 'MI302'
  AND NOT EXISTS (
      SELECT 1
      FROM provimet p
      WHERE p.lende_id = l.lende_id
        AND p.data_provimit = '2026-06-19'
        AND p.afati = 'Qershor'
  );

INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
SELECT l.lende_id, l.profesor_id, '2026-06-21', '14:00:00', 'Salla E5', 'Qershor'
FROM lendet l
WHERE l.kodi = 'FK304'
  AND NOT EXISTS (
      SELECT 1
      FROM provimet p
      WHERE p.lende_id = l.lende_id
        AND p.data_provimit = '2026-06-21'
        AND p.afati = 'Qershor'
  );

INSERT INTO oraret (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
SELECT l.lende_id, l.profesor_id, 'E marte', '14:00:00', '16:00:00', 'Lab 3'
FROM lendet l
WHERE l.kodi = 'CS305'
  AND NOT EXISTS (
      SELECT 1
      FROM oraret o
      WHERE o.lende_id = l.lende_id
        AND o.dita = 'E marte'
        AND o.ora_fillimit = '14:00:00'
  );

INSERT INTO oraret (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
SELECT l.lende_id, l.profesor_id, 'E enjte', '09:00:00', '11:00:00', 'Lab 4'
FROM lendet l
WHERE l.kodi = 'CS306'
  AND NOT EXISTS (
      SELECT 1
      FROM oraret o
      WHERE o.lende_id = l.lende_id
        AND o.dita = 'E enjte'
        AND o.ora_fillimit = '09:00:00'
  );

INSERT INTO oraret (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
SELECT l.lende_id, l.profesor_id, 'E merkure', '13:00:00', '15:00:00', 'Salla 6'
FROM lendet l
WHERE l.kodi = 'MI302'
  AND NOT EXISTS (
      SELECT 1
      FROM oraret o
      WHERE o.lende_id = l.lende_id
        AND o.dita = 'E merkure'
        AND o.ora_fillimit = '13:00:00'
  );

INSERT INTO oraret (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
SELECT l.lende_id, l.profesor_id, 'E premte', '11:00:00', '13:00:00', 'Salla E5'
FROM lendet l
WHERE l.kodi = 'FK304'
  AND NOT EXISTS (
      SELECT 1
      FROM oraret o
      WHERE o.lende_id = l.lende_id
        AND o.dita = 'E premte'
        AND o.ora_fillimit = '11:00:00'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 4, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'CS305'
WHERE s.email = 'blendi.hoxha@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 4, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'CS306'
WHERE s.email = 'blendi.hoxha@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 4, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'CS305'
WHERE s.email = 'era.gashi@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 5, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'MI302'
WHERE s.email = 'liridon.kastrati@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 5, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'MI302'
WHERE s.email = 'aulona.berisha@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 3, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'FK201'
WHERE s.email = 'arben.mehmeti@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 5, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'FK304'
WHERE s.email = 'arben.mehmeti@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 3, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'FK202'
WHERE s.email = 'elira.krasniqi@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
SELECT s.student_id, l.lende_id, 5, '2025/2026', 'Aktiv'
FROM studentet s
JOIN lendet l ON l.kodi = 'FK304'
WHERE s.email = 'elira.krasniqi@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM regjistrimet r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO notat (student_id, provimi_id, nota, data_vendosjes)
SELECT s.student_id, p.provimi_id, 8.50, '2026-02-22'
FROM studentet s
JOIN lendet l ON l.kodi = 'FK201'
JOIN provimet p ON p.lende_id = l.lende_id AND p.afati = 'Shkurt'
WHERE s.email = 'arben.mehmeti@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM notat n
      WHERE n.student_id = s.student_id
        AND n.provimi_id = p.provimi_id
  );

INSERT INTO notat (student_id, provimi_id, nota, data_vendosjes)
SELECT s.student_id, p.provimi_id, 9.00, '2026-02-28'
FROM studentet s
JOIN lendet l ON l.kodi = 'FK202'
JOIN provimet p ON p.lende_id = l.lende_id AND p.afati = 'Shkurt'
WHERE s.email = 'elira.krasniqi@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM notat n
      WHERE n.student_id = s.student_id
        AND n.provimi_id = p.provimi_id
  );

INSERT INTO kerkesat_sherbimeve (
    sherbimi_id, student_id, arsyeja, statusi, statusi_pageses, metoda_pageses, karta_maskuar, reference_pagese, shuma_paguar, shenime_admin, paid_at, approved_at
)
SELECT
    sh.sherbimi_id,
    s.student_id,
    'Kartela ekzistuese eshte demtuar dhe kerkohet zevendesim i shpejte.',
    'Miratuar',
    'Paguajtur',
    'Kartele',
    '**** 4421',
    'PAY-BH-001',
    12.00,
    'Kerkesa u aprovua nga administrata.',
    '2026-04-10 10:15:00',
    '2026-04-11 09:00:00'
FROM sherbimet_studentore sh
JOIN studentet s ON s.email = 'blendi.hoxha@student.uni.local'
WHERE sh.emri = 'Kartela ID e re'
  AND NOT EXISTS (
      SELECT 1
      FROM kerkesat_sherbimeve k
      WHERE k.sherbimi_id = sh.sherbimi_id
        AND k.student_id = s.student_id
        AND k.reference_pagese = 'PAY-BH-001'
  );

INSERT INTO kerkesat_sherbimeve (
    sherbimi_id, student_id, arsyeja, statusi, statusi_pageses, metoda_pageses, karta_maskuar, reference_pagese, shuma_paguar, shenime_admin, paid_at, approved_at
)
SELECT
    sh.sherbimi_id,
    s.student_id,
    'Transkript i nevojshem per aplikim ne program nderkombetar.',
    'Perfunduar',
    'Paguajtur',
    'Kartele',
    '**** 1188',
    'PAY-AM-002',
    5.00,
    'Dokumenti u pergatit dhe u dergua.',
    '2026-04-12 14:20:00',
    '2026-04-13 11:30:00'
FROM sherbimet_studentore sh
JOIN studentet s ON s.email = 'arben.mehmeti@student.uni.local'
WHERE sh.emri = 'Transkript notash'
  AND NOT EXISTS (
      SELECT 1
      FROM kerkesat_sherbimeve k
      WHERE k.sherbimi_id = sh.sherbimi_id
        AND k.student_id = s.student_id
        AND k.reference_pagese = 'PAY-AM-002'
  );

INSERT INTO rindjekjet_lendeve (
    student_id, lende_id, semestri, viti_akademik, arsyeja, statusi, statusi_pageses, karta_maskuar, reference_pagese, shuma_detyrimit, shuma_paguar, shenime_admin
)
SELECT
    s.student_id,
    l.lende_id,
    5,
    '2025/2026',
    'Studenti deshiron ta perserise lenden per permiresim te performances akademike.',
    'Ne shqyrtim',
    'Paguajtur',
    '**** 6612',
    'RET-LK-001',
    30.00,
    30.00,
    'Ne pritje te aprovimit final nga zyra akademike.'
FROM studentet s
JOIN lendet l ON l.kodi = 'MI302'
WHERE s.email = 'liridon.kastrati@student.uni.local'
  AND NOT EXISTS (
      SELECT 1
      FROM rindjekjet_lendeve r
      WHERE r.student_id = s.student_id
        AND r.lende_id = l.lende_id
        AND r.viti_akademik = '2025/2026'
  );

INSERT INTO aplikimet_bursave (bursa_id, student_id, motivimi, statusi, shenime_admin)
SELECT
    b.bursa_id,
    s.student_id,
    'Kam performance te larte akademike dhe dua te mbeshtes shpenzimet e studimit.',
    'Ne shqyrtim',
    'Dokumentet jane ne rregull.'
FROM bursat b
JOIN studentet s ON s.email = 'arben.mehmeti@student.uni.local'
WHERE b.titulli = 'Bursa e Ekselences Akademike'
  AND NOT EXISTS (
      SELECT 1
      FROM aplikimet_bursave a
      WHERE a.bursa_id = b.bursa_id
        AND a.student_id = s.student_id
  );

INSERT INTO aplikimet_bursave (bursa_id, student_id, motivimi, statusi, shenime_admin)
SELECT
    b.bursa_id,
    s.student_id,
    'Kjo burse do te ndihmonte ne vazhdimin e studimeve dhe mbulimin e shpenzimeve mujore.',
    'Ne pritje',
    'Ne pritje te verifikimit ekonomik.'
FROM bursat b
JOIN studentet s ON s.email = 'elira.krasniqi@student.uni.local'
WHERE b.titulli = 'Bursa e Mbeshtetjes Sociale'
  AND NOT EXISTS (
      SELECT 1
      FROM aplikimet_bursave a
      WHERE a.bursa_id = b.bursa_id
        AND a.student_id = s.student_id
  );

INSERT INTO aplikimet_praktikave (praktika_id, student_id, mesazh, statusi, shenime_admin)
SELECT
    p.praktika_id,
    s.student_id,
    'Kam eksperience me React dhe jam i interesuar te kontribuoj ne projekte reale frontend.',
    'Ne shqyrtim',
    'CV u pranua dhe po vleresohet.'
FROM praktikat p
JOIN studentet s ON s.email = 'blendi.hoxha@student.uni.local'
WHERE p.kompania = 'TechNova'
  AND p.pozita = 'Frontend Intern'
  AND NOT EXISTS (
      SELECT 1
      FROM aplikimet_praktikave a
      WHERE a.praktika_id = p.praktika_id
        AND a.student_id = s.student_id
  );

INSERT INTO aplikimet_praktikave (praktika_id, student_id, mesazh, statusi, shenime_admin)
SELECT
    p.praktika_id,
    s.student_id,
    'Jam i fokusuar ne analiza financiare dhe raportim, prandaj kjo praktike perputhet me objektivat e mia.',
    'Ne pritje',
    'Ne pritje te shqyrtimit fillestar.'
FROM praktikat p
JOIN studentet s ON s.email = 'arben.mehmeti@student.uni.local'
WHERE p.kompania = 'FinCore'
  AND p.pozita = 'Analist Praktikant'
  AND NOT EXISTS (
      SELECT 1
      FROM aplikimet_praktikave a
      WHERE a.praktika_id = p.praktika_id
        AND a.student_id = s.student_id
  );

INSERT INTO aplikimet_erasmus (erasmus_id, student_id, motivimi, statusi, shenime_admin)
SELECT
    e.erasmus_id,
    s.student_id,
    'Dua te fitoj eksperience nderkombetare dhe te forcoj njohurite ne sistemet informative.',
    'Ne pritje',
    'Ne pritje te intervistes.'
FROM programet_erasmus e
JOIN studentet s ON s.email = 'blendi.hoxha@student.uni.local'
WHERE e.universiteti = 'University of Ljubljana'
  AND NOT EXISTS (
      SELECT 1
      FROM aplikimet_erasmus a
      WHERE a.erasmus_id = e.erasmus_id
        AND a.student_id = s.student_id
  );

INSERT INTO aplikimet_erasmus (erasmus_id, student_id, motivimi, statusi, shenime_admin)
SELECT
    e.erasmus_id,
    s.student_id,
    'Programi lidhet me interesin tim ne finance dhe analiza akademike ne nivel nderkombetar.',
    'Ne shqyrtim',
    'Aplikimi duket i plote.'
FROM programet_erasmus e
JOIN studentet s ON s.email = 'elira.krasniqi@student.uni.local'
WHERE e.universiteti = 'University of Graz'
  AND NOT EXISTS (
      SELECT 1
      FROM aplikimet_erasmus a
      WHERE a.erasmus_id = e.erasmus_id
        AND a.student_id = s.student_id
  );

-- Seed voluminoz per te arritur rreth 70 studente dhe 10 profesore
INSERT INTO profesoret (
    emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit
)
WITH professor_seed AS (
    SELECT
        'Besnik' AS emri,
        'Shala' AS mbiemri,
        'Lektor' AS titulli_akademik,
        1 AS departamenti_id,
        'besnik.shala@universiteti.local' AS email,
        '+38344123063' AS telefoni,
        'Siguri Kibernetike' AS specializimi,
        '2022-01-10' AS data_punesimit
    UNION ALL
    SELECT
        'Jeta',
        'Ramadani',
        'Prof. Ass.',
        4,
        'jeta.ramadani@universiteti.local',
        '+38344123064',
        'Menaxhim Bankar',
        '2021-04-05'
    UNION ALL
    SELECT
        'Alban',
        'Paci',
        'Prof. Dr.',
        5,
        'alban.paci@universiteti.local',
        '+38344123065',
        'Auditim i Sistemeve',
        '2020-09-01'
)
SELECT
    ps.emri,
    ps.mbiemri,
    ps.titulli_akademik,
    ps.departamenti_id,
    ps.email,
    ps.telefoni,
    ps.specializimi,
    ps.data_punesimit
FROM professor_seed ps
LEFT JOIN profesoret p ON p.email = ps.email
WHERE p.profesor_id IS NULL;

INSERT IGNORE INTO users (email, password_hash, role, profesor_id, is_active)
SELECT
    p.email,
    @profesor_password_hash,
    'profesor',
    p.profesor_id,
    1
FROM profesoret p
WHERE p.email IN (
    'besnik.shala@universiteti.local',
    'jeta.ramadani@universiteti.local',
    'alban.paci@universiteti.local'
);

INSERT INTO lendet (
    emri, kodi, kreditet, semestri, drejtimi_id, profesor_id, lloji, pershkrimi
)
WITH course_seed AS (
    SELECT
        'Siguria e Aplikacioneve' AS emri,
        'CS307' AS kodi,
        5 AS kreditet,
        5 AS semestri,
        1 AS drejtimi_id,
        'besnik.shala@universiteti.local' AS profesor_email,
        'Zgjedhore' AS lloji,
        'Siguria ne aplikacione web, autentikim, autorizim dhe mbrojtje nga sulmet me te zakonshme.' AS pershkrimi
    UNION ALL
    SELECT
        'Operacione Bankare',
        'BS304',
        5,
        6,
        4,
        'jeta.ramadani@universiteti.local',
        'Obligative',
        'Proceset kryesore bankare, sherbimet financiare dhe menaxhimi operacional ne sektorin bankar.'
    UNION ALL
    SELECT
        'Auditim i Sistemeve Informative',
        'AF504',
        5,
        2,
        5,
        'alban.paci@universiteti.local',
        'Obligative',
        'Auditimi i sistemeve informative, kontrollet e TI-se dhe menaxhimi i rrezikut teknologjik.'
)
SELECT
    cs.emri,
    cs.kodi,
    cs.kreditet,
    cs.semestri,
    cs.drejtimi_id,
    p.profesor_id,
    cs.lloji,
    cs.pershkrimi
FROM course_seed cs
JOIN profesoret p ON p.email = cs.profesor_email
LEFT JOIN lendet l ON l.kodi = cs.kodi
WHERE l.lende_id IS NULL;

INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
WITH exam_seed AS (
    SELECT 'CS307' AS kodi, '2026-06-25' AS data_provimit, '10:00:00' AS ora, 'Lab 5' AS salla, 'Qershor' AS afati
    UNION ALL
    SELECT 'BS304', '2026-06-26', '12:00:00', 'Salla F4', 'Qershor'
    UNION ALL
    SELECT 'AF504', '2026-06-27', '09:00:00', 'Salla M4', 'Qershor'
)
SELECT
    l.lende_id,
    l.profesor_id,
    es.data_provimit,
    es.ora,
    es.salla,
    es.afati
FROM exam_seed es
JOIN lendet l ON l.kodi = es.kodi
LEFT JOIN provimet p
    ON p.lende_id = l.lende_id
   AND p.data_provimit = es.data_provimit
   AND p.afati = es.afati
WHERE p.provimi_id IS NULL;

INSERT INTO oraret (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
WITH schedule_seed AS (
    SELECT 'CS307' AS kodi, 'E marte' AS dita, '16:00:00' AS ora_fillimit, '18:00:00' AS ora_mbarimit, 'Lab 5' AS salla
    UNION ALL
    SELECT 'BS304', 'E enjte', '12:00:00', '14:00:00', 'Salla F4'
    UNION ALL
    SELECT 'AF504', 'E premte', '14:00:00', '16:00:00', 'Salla M4'
)
SELECT
    l.lende_id,
    l.profesor_id,
    ss.dita,
    ss.ora_fillimit,
    ss.ora_mbarimit,
    ss.salla
FROM schedule_seed ss
JOIN lendet l ON l.kodi = ss.kodi
LEFT JOIN oraret o
    ON o.lende_id = l.lende_id
   AND o.dita = ss.dita
   AND o.ora_fillimit = ss.ora_fillimit
WHERE o.orari_id IS NULL;

INSERT INTO studentet (
    emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, gjenerata_id, viti_studimit, statusi
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM seq
    WHERE n < 59
),
student_seed AS (
    SELECT
        n,
        ELT(
            MOD(n - 1, 20) + 1,
            'Ardit', 'Blerim', 'Gent', 'Luan', 'Valon',
            'Bujar', 'Kushtrim', 'Flamur', 'Leutrim', 'Erjon',
            'Besa', 'Arta', 'Liridona', 'Kaltrina', 'Saranda',
            'Donika', 'Era', 'Aulona', 'Elira', 'Vjosa'
        ) AS emri,
        ELT(
            MOD(n * 7 - 1, 15) + 1,
            'Hoxha', 'Berisha', 'Krasniqi', 'Gashi', 'Shala',
            'Paci', 'Selimi', 'Hasani', 'Kastrati', 'Mehmeti',
            'Dervishi', 'Bajrami', 'Rama', 'Bytyqi', 'Halimi'
        ) AS mbiemri,
        CONCAT(
            LOWER(
                REPLACE(
                    ELT(
                        MOD(n - 1, 20) + 1,
                        'Ardit', 'Blerim', 'Gent', 'Luan', 'Valon',
                        'Bujar', 'Kushtrim', 'Flamur', 'Leutrim', 'Erjon',
                        'Besa', 'Arta', 'Liridona', 'Kaltrina', 'Saranda',
                        'Donika', 'Era', 'Aulona', 'Elira', 'Vjosa'
                    ),
                    ' ',
                    ''
                )
            ),
            '.',
            LOWER(
                REPLACE(
                    ELT(
                        MOD(n * 7 - 1, 15) + 1,
                        'Hoxha', 'Berisha', 'Krasniqi', 'Gashi', 'Shala',
                        'Paci', 'Selimi', 'Hasani', 'Kastrati', 'Mehmeti',
                        'Dervishi', 'Bajrami', 'Rama', 'Bytyqi', 'Halimi'
                    ),
                    ' ',
                    ''
                )
            ),
            LPAD(n, 2, '0'),
            '@student.uni.local'
        ) AS email,
        CONCAT('3006', LPAD(n, 6, '0')) AS numri_personal,
        DATE_ADD('2002-01-15', INTERVAL n * 17 DAY) AS data_lindjes,
        CASE WHEN MOD(n, 2) = 0 THEN 'F' ELSE 'M' END AS gjinia,
        CONCAT('+38349', LPAD(110000 + n, 6, '0')) AS telefoni,
        ELT(
            MOD(n - 1, 7) + 1,
            'Prishtine', 'Prizren', 'Peje', 'Gjilan', 'Ferizaj', 'Mitrovice', 'Gjakove'
        ) AS adresa,
        CASE MOD(n - 1, 5)
            WHEN 0 THEN 1
            WHEN 1 THEN 2
            WHEN 2 THEN 3
            WHEN 3 THEN 4
            ELSE 5
        END AS drejtimi_id,
        CASE MOD(n - 1, 3)
            WHEN 0 THEN 5
            WHEN 1 THEN 4
            ELSE 3
        END AS gjenerata_id,
        CASE MOD(n - 1, 3)
            WHEN 0 THEN 1
            WHEN 1 THEN 2
            ELSE 3
        END AS viti_studimit
    FROM seq
)
SELECT
    ss.emri,
    ss.mbiemri,
    ss.numri_personal,
    ss.data_lindjes,
    ss.gjinia,
    ss.email,
    ss.telefoni,
    ss.adresa,
    ss.drejtimi_id,
    ss.gjenerata_id,
    ss.viti_studimit,
    'Aktiv'
FROM student_seed ss
LEFT JOIN studentet s
    ON s.email = ss.email
    OR s.numri_personal = ss.numri_personal
WHERE s.student_id IS NULL;

INSERT IGNORE INTO users (email, password_hash, role, student_id, is_active)
SELECT
    s.email,
    @student_password_hash,
    'student',
    s.student_id,
    1
FROM studentet s
WHERE s.email LIKE '%@student.uni.local';

-- Regjistrime shtese per ta pasuruar pjesen e mesimdhenies
INSERT IGNORE INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
WITH course_targets AS (
    SELECT
        l.lende_id,
        l.drejtimi_id,
        l.semestri,
        CASE
            WHEN l.semestri IN (1, 2) THEN 1
            WHEN l.semestri IN (3, 4) THEN 2
            ELSE 3
        END AS target_year
    FROM lendet l
    WHERE l.drejtimi_id IS NOT NULL
)
SELECT
    s.student_id,
    ct.lende_id,
    ct.semestri,
    '2025/2026',
    CASE
        WHEN ct.semestri <= 3 THEN 'Perfunduar'
        ELSE 'Aktiv'
    END
FROM course_targets ct
JOIN studentet s
    ON s.drejtimi_id = ct.drejtimi_id
   AND s.viti_studimit = ct.target_year;

-- Afat shtese per profesoret ne menyre qe faqja e provimeve dhe notimit te jete me e pasur
INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
WITH april_exam_seed AS (
    SELECT
        l.lende_id,
        l.profesor_id,
        DATE_ADD('2026-03-05', INTERVAL l.lende_id DAY) AS data_provimit,
        CASE MOD(l.lende_id, 4)
            WHEN 0 THEN '09:00:00'
            WHEN 1 THEN '11:00:00'
            WHEN 2 THEN '13:00:00'
            ELSE '15:00:00'
        END AS ora,
        CONCAT(
            'Salla ',
            ELT(MOD(l.lende_id - 1, 5) + 1, 'A1', 'B2', 'C3', 'D4', 'E5')
        ) AS salla,
        'Prill' AS afati
    FROM lendet l
    WHERE l.profesor_id IS NOT NULL
)
SELECT
    aes.lende_id,
    aes.profesor_id,
    aes.data_provimit,
    aes.ora,
    aes.salla,
    aes.afati
FROM april_exam_seed aes
LEFT JOIN provimet p
    ON p.lende_id = aes.lende_id
   AND p.afati = aes.afati
WHERE p.provimi_id IS NULL;

-- Nota shtese per afatet tashme te perfunduara
INSERT IGNORE INTO notat (student_id, provimi_id, nota, data_vendosjes)
WITH completed_exams AS (
    SELECT
        p.provimi_id,
        p.lende_id,
        p.data_provimit
    FROM provimet p
    WHERE p.data_provimit <= '2026-04-27'
),
eligible_grades AS (
    SELECT
        r.student_id,
        ce.provimi_id,
        ce.data_provimit
    FROM completed_exams ce
    JOIN regjistrimet r ON r.lende_id = ce.lende_id
    WHERE r.statusi IN ('Aktiv', 'Perfunduar')
)
SELECT
    eg.student_id,
    eg.provimi_id,
    CASE MOD(eg.student_id + eg.provimi_id, 8)
        WHEN 0 THEN 6.00
        WHEN 1 THEN 6.50
        WHEN 2 THEN 7.00
        WHEN 3 THEN 7.50
        WHEN 4 THEN 8.00
        WHEN 5 THEN 8.50
        WHEN 6 THEN 9.00
        ELSE 10.00
    END AS nota,
    DATE_ADD(eg.data_provimit, INTERVAL MOD(eg.student_id, 5) + 1 DAY) AS data_vendosjes
FROM eligible_grades eg
WHERE MOD(eg.student_id + eg.provimi_id, 4) <> 0;

-- Seanca shtese ne orar per laborator ose ushtrime
INSERT INTO oraret (lende_id, profesor_id, dita, ora_fillimit, ora_mbarimit, salla)
WITH extra_schedule_seed AS (
    SELECT
        l.lende_id,
        l.profesor_id,
        CASE MOD(l.lende_id, 5)
            WHEN 0 THEN 'E hene'
            WHEN 1 THEN 'E marte'
            WHEN 2 THEN 'E merkure'
            WHEN 3 THEN 'E enjte'
            ELSE 'E premte'
        END AS dita,
        CASE MOD(l.lende_id, 4)
            WHEN 0 THEN '08:30:00'
            WHEN 1 THEN '10:30:00'
            WHEN 2 THEN '12:30:00'
            ELSE '14:30:00'
        END AS ora_fillimit,
        CASE MOD(l.lende_id, 4)
            WHEN 0 THEN '10:00:00'
            WHEN 1 THEN '12:00:00'
            WHEN 2 THEN '14:00:00'
            ELSE '16:00:00'
        END AS ora_mbarimit,
        CONCAT(
            'Laboratori ',
            ELT(MOD(l.lende_id - 1, 4) + 1, 'L1', 'L2', 'S1', 'S2')
        ) AS salla
    FROM lendet l
    WHERE l.profesor_id IS NOT NULL
)
SELECT
    ess.lende_id,
    ess.profesor_id,
    ess.dita,
    ess.ora_fillimit,
    ess.ora_mbarimit,
    ess.salla
FROM extra_schedule_seed ess
LEFT JOIN oraret o
    ON o.lende_id = ess.lende_id
   AND o.dita = ess.dita
   AND o.ora_fillimit = ess.ora_fillimit
WHERE o.orari_id IS NULL;

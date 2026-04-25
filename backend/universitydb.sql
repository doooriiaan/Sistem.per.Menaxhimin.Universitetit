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
    viti_studimit INT NOT NULL,
    statusi VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_studentet_numri_personal (numri_personal),
    UNIQUE KEY uq_studentet_email (email),
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
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
    student_id, emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, viti_studimit, statusi
) VALUES
    (1, 'Dorian', 'Rinor', '1002003001', '2004-03-12', 'M', 'dorian.rinor1@student.uni.local', '+38349111111', 'Prishtine', 1, 2, 'Aktiv'),
    (2, 'Rinor', 'Dorian', '1002003002', '2003-11-07', 'M', 'rinor.dorian2@student.uni.local', '+38349222222', 'Gjilan', 2, 3, 'Aktiv'),
    (3, 'Dorian', 'Rinor', '1002003003', '2004-06-20', 'F', 'dorian.rinor3@student.uni.local', '+38349333333', 'Prizren', 3, 2, 'Aktiv'),
    (4, 'Rinor', 'Dorian', '1002003004', '2002-09-17', 'M', 'rinor.dorian4@student.uni.local', '+38349444444', 'Peje', 4, 3, 'Aktiv'),
    (5, 'Dorian', 'Rinor', '1002003005', '2001-12-09', 'F', 'dorian.rinor5@student.uni.local', '+38349555555', 'Ferizaj', 5, 1, 'Aktiv');

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

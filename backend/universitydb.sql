DROP DATABASE IF EXISTS universitydb;
CREATE DATABASE universitydb;
USE universitydb;

-- ======================
-- FAKULTETET
-- ======================
CREATE TABLE fakultetet (
    fakultet_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    dekani_id INT NULL,
    adresa VARCHAR(150),
    telefoni VARCHAR(50),
    email VARCHAR(100)
);

-- ======================
-- DEPARTAMENTET
-- ======================
CREATE TABLE departamentet (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    shefi_id INT NULL,
    pershkrimi TEXT,
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ======================
-- DREJTIMET
-- ======================
CREATE TABLE drejtimet (
    drejtim_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    niveli VARCHAR(50),
    kohezgjatja_vite INT,
    pershkrimi TEXT,
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ======================
-- STUDENTET
-- ======================
CREATE TABLE studentet (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100),
    numri_personal VARCHAR(20),
    data_lindjes DATE,
    gjinia VARCHAR(10),
    email VARCHAR(100),
    telefoni VARCHAR(50),
    adresa VARCHAR(150),
    drejtimi_id INT NULL,
    viti_studimit INT,
    statusi VARCHAR(50),
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ======================
-- PROFESORET
-- ======================
CREATE TABLE profesoret (
    profesor_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100),
    titulli_akademik VARCHAR(100),
    departamenti_id INT NULL,
    email VARCHAR(100),
    telefoni VARCHAR(50),
    specializimi VARCHAR(100),
    data_punesimit DATE,
    FOREIGN KEY (departamenti_id) REFERENCES departamentet(departament_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ======================
-- LENDET
-- ======================
CREATE TABLE lendet (
    lende_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    kodi VARCHAR(50),
    kreditet INT,
    semestri INT,
    drejtimi_id INT NULL,
    lloji VARCHAR(50),
    pershkrimi TEXT,
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ======================
-- REGJISTRIMET
-- ======================
CREATE TABLE regjistrimet (
    regjistrim_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    lende_id INT NULL,
    semestri INT,
    viti_akademik VARCHAR(20),
    statusi VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ======================
-- PROVIMET (E RE)
-- ======================
CREATE TABLE provimet (
    provimi_id INT AUTO_INCREMENT PRIMARY KEY,
    lende_id INT NULL,
    profesor_id INT NULL,
    data_provimit DATE,
    ora TIME,
    salla VARCHAR(50),
    afati VARCHAR(50),
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesoret(profesor_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

USE universitydb;

DROP TABLE IF EXISTS notat;

DROP TABLE IF EXISTS notat;

CREATE TABLE notat (
    nota_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    provimi_id INT NOT NULL,
    nota DECIMAL(4,2) NOT NULL,
    data_vendosjes DATE,
    FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (provimi_id) REFERENCES provimet(provimi_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
-- ======================
-- TEST DATA (OPTIONAL)
-- ======================

INSERT INTO studentet (emri, mbiemri, email)
VALUES ('Dorian', 'Test', 'dorian@test.com');

INSERT INTO provimet (data_provimit, ora, salla, afati)
VALUES ('2026-04-10', '10:00:00', 'A1', 'Prill');

-- ======================
-- CHECK
-- ======================
SHOW TABLES;
SELECT * FROM studentet;
SELECT * FROM provimet;
SELECT * FROM notat;
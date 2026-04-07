DROP DATABASE IF EXISTS universitydb;
CREATE DATABASE universitydb;
USE universitydb;

CREATE TABLE fakultetet (
    fakultet_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    dekani_id INT NULL,
    adresa VARCHAR(150),
    telefoni VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE departamentet (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    shefi_id INT NULL,
    pershkrimi TEXT,
    CONSTRAINT fk_departamentet_fakultetet
        FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE drejtimet (
    drejtim_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    niveli VARCHAR(50),
    kohezgjatja_vite INT,
    pershkrimi TEXT,
    CONSTRAINT fk_drejtimet_fakultetet
        FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

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
    CONSTRAINT fk_studentet_drejtimet
        FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

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
    CONSTRAINT fk_profesoret_departamentet
        FOREIGN KEY (departamenti_id) REFERENCES departamentet(departament_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE lendet (
    lende_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    kodi VARCHAR(50),
    kreditet INT,
    semestri INT,
    drejtimi_id INT NULL,
    lloji VARCHAR(50),
    pershkrimi TEXT,
    CONSTRAINT fk_lendet_drejtimet
        FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE regjistrimet (
    regjistrim_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    lende_id INT NULL,
    semestri INT,
    viti_akademik VARCHAR(20),
    statusi VARCHAR(50),
    CONSTRAINT fk_regjistrimet_studentet
        FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_regjistrimet_lendet
        FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE notat (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NULL,
    lende_id INT NULL,
    nota DECIMAL(5,2),
    data_vleresimit DATE,
    shenimet TEXT,
    CONSTRAINT fk_notat_studentet
        FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_notat_lendet
        FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

SHOW TABLES;
SELECT * FROM studentet;
SELECT * FROM lendet;

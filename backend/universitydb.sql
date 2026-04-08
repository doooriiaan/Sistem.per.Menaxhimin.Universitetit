DROP DATABASE IF EXISTS universitydb;
CREATE DATABASE universitydb;
USE universitydb;

CREATE TABLE fakultetet (
    fakultet_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    dekani_id INT NULL,
    adresa VARCHAR(150),
    telefoni VARCHAR(50),
    email VARCHAR(100) UNIQUE
);

CREATE TABLE departamentet (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    fakulteti_id INT NULL,
    shefi_id INT NULL,
    pershkrimi TEXT,
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
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE studentet (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100) NOT NULL,
    numri_personal VARCHAR(20) NOT NULL UNIQUE,
    data_lindjes DATE,
    gjinia VARCHAR(10),
    email VARCHAR(100) NOT NULL UNIQUE,
    telefoni VARCHAR(50),
    adresa VARCHAR(150),
    drejtimi_id INT NULL,
    viti_studimit INT,
    statusi VARCHAR(50),
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE profesoret (
    profesor_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    mbiemri VARCHAR(100) NOT NULL,
    titulli_akademik VARCHAR(100),
    departamenti_id INT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefoni VARCHAR(50),
    specializimi VARCHAR(100),
    data_punesimit DATE,
    FOREIGN KEY (departamenti_id) REFERENCES departamentet(departament_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE lendet (
    lende_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    kodi VARCHAR(50) NOT NULL UNIQUE,
    kreditet INT,
    semestri INT,
    drejtimi_id INT NULL,
    lloji VARCHAR(50),
    pershkrimi TEXT,
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE regjistrimet (
    regjistrim_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lende_id INT NOT NULL,
    semestri INT NOT NULL,
    viti_akademik VARCHAR(20) NOT NULL,
    statusi VARCHAR(50),
    UNIQUE (student_id, lende_id, viti_akademik),
    FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE provimet (
    provimi_id INT AUTO_INCREMENT PRIMARY KEY,
    lende_id INT NOT NULL,
    profesor_id INT NOT NULL,
    data_provimit DATE NOT NULL,
    ora TIME NOT NULL,
    salla VARCHAR(50),
    afati VARCHAR(50),
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesoret(profesor_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE notat (
    nota_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    provimi_id INT NOT NULL,
    nota DECIMAL(4,2) NOT NULL,
    data_vendosjes DATE,
    UNIQUE (student_id, provimi_id),
    FOREIGN KEY (student_id) REFERENCES studentet(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (provimi_id) REFERENCES provimet(provimi_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CHECK (nota >= 5.00 AND nota <= 10.00)
);

ALTER TABLE fakultetet
ADD CONSTRAINT fk_fakultetet_dekani
FOREIGN KEY (dekani_id) REFERENCES profesoret(profesor_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE departamentet
ADD CONSTRAINT fk_departamentet_shefi
FOREIGN KEY (shefi_id) REFERENCES profesoret(profesor_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

INSERT INTO fakultetet (emri, dekani_id, adresa, telefoni, email)
VALUES ('Fakulteti i Shkencave Kompjuterike', NULL, 'Prishtine', '038123123', 'fshk@ubt.com');

INSERT INTO departamentet (emri, fakulteti_id, shefi_id, pershkrimi)
VALUES ('Inxhinieri Softuerike', 1, NULL, 'Departamenti i softwares');

INSERT INTO drejtimet (emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi)
VALUES ('Shkenca Kompjuterike', 1, 'Bachelor', 3, 'Drejtimi kryesor');

INSERT INTO studentet (emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, viti_studimit, statusi)
VALUES ('Dorian', 'Test', '123456789', '2003-05-10', 'M', 'dorian@test.com', '044111111', 'Prishtine', 1, 2, 'Aktiv');

INSERT INTO profesoret (emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit)
VALUES ('Arben', 'Gashi', 'Profesor', 1, 'arben@test.com', '044123123', 'Programim', '2020-01-01');

UPDATE fakultetet
SET dekani_id = 1
WHERE fakultet_id = 1;

UPDATE departamentet
SET shefi_id = 1
WHERE departament_id = 1;

INSERT INTO lendet (emri, kodi, kreditet, semestri, drejtimi_id, lloji, pershkrimi)
VALUES ('Programim Web', 'WEB101', 6, 2, 1, 'Obligative', 'Lenda e programimit web');

INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
VALUES (1, 1, 2, '2025/2026', 'I regjistruar');

INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
VALUES (1, 1, '2026-04-10', '10:00:00', 'A1', 'Prill');

INSERT INTO notat (student_id, provimi_id, nota, data_vendosjes)
VALUES (1, 1, 9.50, '2026-04-15');

SHOW TABLES;
SELECT * FROM fakultetet;
SELECT * FROM departamentet;
SELECT * FROM drejtimet;
SELECT * FROM studentet;
SELECT * FROM profesoret;
SELECT * FROM lendet;
SELECT * FROM regjistrimet;
SELECT * FROM provimet;
SELECT * FROM notat;
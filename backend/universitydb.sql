CREATE DATABASE universitydb;
USE universitydb;

CREATE TABLE fakultetet (
    fakultet_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100),
    dekani_id INT,
    adresa VARCHAR(150),
    telefoni VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE departamentet (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100),
    fakulteti_id INT,
    shefi_id INT,
    pershkrimi TEXT,
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
);

CREATE TABLE drejtimet (
    drejtim_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100),
    fakulteti_id INT,
    niveli VARCHAR(50),
    kohezgjatja_vite INT,
    pershkrimi TEXT,
    FOREIGN KEY (fakulteti_id) REFERENCES fakultetet(fakultet_id)
);

CREATE TABLE studentet (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100),
    mbiemri VARCHAR(100),
    numri_personal VARCHAR(20),
    data_lindjes DATE,
    gjinia VARCHAR(10),
    email VARCHAR(100),
    telefoni VARCHAR(50),
    adresa VARCHAR(150),
    drejtimi_id INT,
    viti_studimit INT,
    statusi VARCHAR(50),
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
);

CREATE TABLE profesoret (
    profesor_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100),
    mbiemri VARCHAR(100),
    titulli_akademik VARCHAR(100),
    departamenti_id INT,
    email VARCHAR(100),
    telefoni VARCHAR(50),
    specializimi VARCHAR(100),
    data_punesimit DATE,
    FOREIGN KEY (departamenti_id) REFERENCES departamentet(departament_id)
);

CREATE TABLE lendet (
    lende_id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(100),
    kodi VARCHAR(50),
    kreditet INT,
    semestri INT,
    drejtimi_id INT,
    lloji VARCHAR(50),
    pershkrimi TEXT,
    FOREIGN KEY (drejtimi_id) REFERENCES drejtimet(drejtim_id)
);

CREATE TABLE regjistrimet (
    regjistrim_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    lende_id INT,
    semestri INT,
    viti_akademik VARCHAR(20),
    statusi VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES studentet(student_id),
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
);

CREATE TABLE notat (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    lende_id INT,
    nota DECIMAL(5,2),
    data_vleresimit DATE,
    shenimet TEXT,
    FOREIGN KEY (student_id) REFERENCES studentet(student_id),
    FOREIGN KEY (lende_id) REFERENCES lendet(lende_id)
);

USE universitydb;
SHOW TABLES;
SELECT * FROM studentet;

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

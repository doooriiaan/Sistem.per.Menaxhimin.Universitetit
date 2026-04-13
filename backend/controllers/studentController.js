const db = require("../db");

const getallstudents = (req, res) => {
  const sql = "SELECT * FROM studentet";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

const getstudentbyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM studentet WHERE student_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createstudent = (req, res) => {
  const {
    emri,
    mbiemri,
    numri_personal,
    data_lindjes,
    gjinia,
    email,
    telefoni,
    adresa,
    drejtimi_id,
    viti_studimit,
    statusi
  } = req.body;

  const sql = `
    INSERT INTO studentet
    (emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, viti_studimit, statusi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      emri,
      mbiemri,
      numri_personal,
      data_lindjes,
      gjinia,
      email,
      telefoni,
      adresa,
      drejtimi_id,
      viti_studimit,
      statusi
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Studenti u shtua",
        id: result.insertId
      });
    }
  );
};

const updatestudent = (req, res) => {
  const { id } = req.params;
  const {
    emri,
    mbiemri,
    numri_personal,
    data_lindjes,
    gjinia,
    email,
    telefoni,
    adresa,
    drejtimi_id,
    viti_studimit,
    statusi
  } = req.body;

  const sql = `
    UPDATE studentet
    SET emri = ?, mbiemri = ?, numri_personal = ?, data_lindjes = ?, gjinia = ?, email = ?, telefoni = ?, adresa = ?, drejtimi_id = ?, viti_studimit = ?, statusi = ?
    WHERE student_id = ?
  `;

  db.query(
    sql,
    [
      emri,
      mbiemri,
      numri_personal,
      data_lindjes,
      gjinia,
      email,
      telefoni,
      adresa,
      drejtimi_id,
      viti_studimit,
      statusi,
      id
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Studenti nuk u gjet" });
      }

      res.json({ message: "Studenti u perditesua" });
    }
  );
};

const deletestudent = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM studentet WHERE student_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    res.json({ message: "Studenti u fshi" });
  });
};

const getstudentdetails = (req, res) => {
  const sql = `
    SELECT 
      s.student_id,
      s.emri,
      s.mbiemri,
      d.emri AS drejtimi,
      f.emri AS fakulteti,
      s.viti_studimit,
      s.statusi
    FROM studentet s
    JOIN drejtimet d ON s.drejtimi_id = d.drejtim_id
    JOIN fakultetet f ON d.fakulteti_id = f.fakultet_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

module.exports = {
  getallstudents,
  getstudentbyid,
  createstudent,
  updatestudent,
  deletestudent,
  getstudentdetails
};
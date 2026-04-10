const db = require("../db");

const getallprofesoret = (req, res) => {
  const sql = "SELECT * FROM profesoret";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

const getprofesoribyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM profesoret WHERE profesor_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createprofesor = (req, res) => {
  const {
    emri,
    mbiemri,
    titulli_akademik,
    departamenti_id,
    email,
    telefoni,
    specializimi,
    data_punesimit
  } = req.body;

  const sql = `
    INSERT INTO profesoret
    (emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Profesori u shtua",
        id: result.insertId
      });
    }
  );
};

const updateprofesor = (req, res) => {
  const { id } = req.params;
  const {
    emri,
    mbiemri,
    titulli_akademik,
    departamenti_id,
    email,
    telefoni,
    specializimi,
    data_punesimit
  } = req.body;

  const sql = `
    UPDATE profesoret
    SET emri = ?, mbiemri = ?, titulli_akademik = ?, departamenti_id = ?, email = ?, telefoni = ?, specializimi = ?, data_punesimit = ?
    WHERE profesor_id = ?
  `;

  db.query(
    sql,
    [emri, mbiemri, titulli_akademik, departamenti_id, email, telefoni, specializimi, data_punesimit, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Profesori nuk u gjet" });
      }

      res.json({ message: "Profesori u perditesua" });
    }
  );
};

const deleteprofesor = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM profesoret WHERE profesor_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    res.json({ message: "Profesori u fshi" });
  });
};

module.exports = {
  getallprofesoret,
  getprofesoribyid,
  createprofesor,
  updateprofesor,
  deleteprofesor
};
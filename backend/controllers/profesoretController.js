const db = require("../db");

const getProfesoret = (req, res) => {
  db.query("SELECT * FROM profesoret", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gabim ne server",
        error: err.message
      });
    }

    res.status(200).json(result);
  });
};

const getProfesoriById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM profesoret WHERE profesor_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gabim ne server",
        error: err.message
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Profesori nuk u gjet"
      });
    }

    res.status(200).json(result[0]);
  });
};

const addProfesor = (req, res) => {
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
        return res.status(500).json({
          message: "Gabim ne server",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Profesori u shtua me sukses",
        profesorId: result.insertId
      });
    }
  );
};

const updateProfesor = (req, res) => {
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
        return res.status(500).json({
          message: "Gabim ne server",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Profesori nuk u gjet"
        });
      }

      res.status(200).json({
        message: "Profesori u perditesua me sukses"
      });
    }
  );
};

const deleteProfesor = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM profesoret WHERE profesor_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gabim ne server",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Profesori nuk u gjet"
      });
    }

    res.status(200).json({
      message: "Profesori u fshi me sukses"
    });
  });
};

module.exports = {
  getProfesoret,
  getProfesoriById,
  addProfesor,
  updateProfesor,
  deleteProfesor
};
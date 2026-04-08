const db = require("../db");

const getProvimet = (req, res) => {
  const sql = "SELECT * FROM provimet";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Gabim ne getProvimet:", err);
      return res.status(500).json({
        message: "Gabim ne server",
        error: err.message
      });
    }

    res.status(200).json(result);
  });
};

const getProvimiById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM provimet WHERE provimi_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Gabim ne getProvimiById:", err);
      return res.status(500).json({
        message: "Gabim ne server",
        error: err.message
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Provimi nuk u gjet"
      });
    }

    res.status(200).json(result[0]);
  });
};

const addProvimi = (req, res) => {
  const { lende_id, profesor_id, data_provimit, ora, salla, afati } = req.body;

  const sql = `
    INSERT INTO provimet (lende_id, profesor_id, data_provimit, ora, salla, afati)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [lende_id, profesor_id, data_provimit, ora, salla, afati],
    (err, result) => {
      if (err) {
        console.log("Gabim ne addProvimi:", err);
        return res.status(500).json({
          message: "Gabim ne server",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Provimi u shtua me sukses",
        provimiId: result.insertId
      });
    }
  );
};

const updateProvimi = (req, res) => {
  const { id } = req.params;
  const { lende_id, profesor_id, data_provimit, ora, salla, afati } = req.body;

  const sql = `
    UPDATE provimet
    SET lende_id = ?, profesor_id = ?, data_provimit = ?, ora = ?, salla = ?, afati = ?
    WHERE provimi_id = ?
  `;

  db.query(
    sql,
    [lende_id, profesor_id, data_provimit, ora, salla, afati, id],
    (err, result) => {
      if (err) {
        console.log("Gabim ne updateProvimi:", err);
        return res.status(500).json({
          message: "Gabim ne server",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Provimi nuk u gjet"
        });
      }

      res.status(200).json({
        message: "Provimi u perditesua me sukses"
      });
    }
  );
};

const deleteProvimi = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM provimet WHERE provimi_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Gabim ne deleteProvimi:", err);
      return res.status(500).json({
        message: "Gabim ne server",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Provimi nuk u gjet"
      });
    }

    res.status(200).json({
      message: "Provimi u fshi me sukses"
    });
  });
};

module.exports = {
  getProvimet,
  getProvimiById,
  addProvimi,
  updateProvimi,
  deleteProvimi
};
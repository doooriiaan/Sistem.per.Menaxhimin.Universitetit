const db = require("../db");

const getallprovimet = (req, res) => {
  const sql = "SELECT * FROM provimet";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

const getprovimibyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM provimet WHERE provimi_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Provimi nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createprovimi = (req, res) => {
  const {
    lende_id,
    profesor_id,
    data_provimit,
    ora,
    salla,
    afati
  } = req.body;

  const sql = `
    INSERT INTO provimet
    (lende_id, profesor_id, data_provimit, ora, salla, afati)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [lende_id, profesor_id, data_provimit, ora, salla, afati],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Provimi u shtua",
        id: result.insertId
      });
    }
  );
};

const updateprovimi = (req, res) => {
  const { id } = req.params;
  const {
    lende_id,
    profesor_id,
    data_provimit,
    ora,
    salla,
    afati
  } = req.body;

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
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Provimi nuk u gjet" });
      }

      res.json({ message: "Provimi u perditesua" });
    }
  );
};

const deleteprovimi = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM provimet WHERE provimi_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Provimi nuk u gjet" });
    }

    res.json({ message: "Provimi u fshi" });
  });
};

const getprovimetdetails = (req, res) => {
  const sql = `
    SELECT 
      p.provimi_id,
      l.emri AS lenda,
      pr.emri AS profesori,
      p.data_provimit,
      p.ora,
      p.salla,
      p.afati
    FROM provimet p
    JOIN lendet l ON p.lende_id = l.lende_id
    JOIN profesoret pr ON p.profesor_id = pr.profesor_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

module.exports = {
  getallprovimet,
  getprovimibyid,
  createprovimi,
  updateprovimi,
  deleteprovimi,
  getprovimetdetails
};
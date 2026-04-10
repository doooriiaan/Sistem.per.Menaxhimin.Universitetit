const db = require("../db");

const getalllendet = (req, res) => {
  const sql = "SELECT * FROM lendet";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

const getlendabyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM lendet WHERE lende_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createlenda = (req, res) => {
  const {
    emri,
    kodi,
    kreditet,
    semestri,
    drejtimi_id,
    profesori_id,
    lloji,
    pershkrimi
  } = req.body;

  const sql = `
    INSERT INTO lendet
    (emri, kodi, kreditet, semestri, drejtimi_id, profesori_id, lloji, pershkrimi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [emri, kodi, kreditet, semestri, drejtimi_id, profesori_id, lloji, pershkrimi],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Lenda u shtua",
        id: result.insertId
      });
    }
  );
};

const updatelenda = (req, res) => {
  const { id } = req.params;
  const {
    emri,
    kodi,
    kreditet,
    semestri,
    drejtimi_id,
    profesori_id,
    lloji,
    pershkrimi
  } = req.body;

  const sql = `
    UPDATE lendet
    SET emri = ?, kodi = ?, kreditet = ?, semestri = ?, drejtimi_id = ?, profesori_id = ?, lloji = ?, pershkrimi = ?
    WHERE lende_id = ?
  `;

  db.query(
    sql,
    [emri, kodi, kreditet, semestri, drejtimi_id, profesori_id, lloji, pershkrimi, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lenda nuk u gjet" });
      }

      res.json({ message: "Lenda u perditesua" });
    }
  );
};

const deletelenda = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM lendet WHERE lende_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    res.json({ message: "Lenda u fshi" });
  });
};

module.exports = {
  getalllendet,
  getlendabyid,
  createlenda,
  updatelenda,
  deletelenda
};
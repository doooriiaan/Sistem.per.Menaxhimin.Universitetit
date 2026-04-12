const db = require("../db");

const getAllOraret = (req, res) => {
  const sql = "SELECT * FROM oraret";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getOrariById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM oraret WHERE orari_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Orari nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createOrari = (req, res) => {
  const {
    lende_id,
    profesori_id,
    dita,
    ora_fillimit,
    ora_mbarimit,
    salla
  } = req.body;

  if (!lende_id || !profesori_id || !dita) {
    return res.status(400).json({ message: "Fushat kryesore mungojne" });
  }

  const sql = `
    INSERT INTO oraret
    (lende_id, profesori_id, dita, ora_fillimit, ora_mbarimit, salla)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [lende_id, profesori_id, dita, ora_fillimit, ora_mbarimit, salla],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Orari u shtua",
        id: result.insertId
      });
    }
  );
};

const updateOrari = (req, res) => {
  const { id } = req.params;

  const {
    lende_id,
    profesori_id,
    dita,
    ora_fillimit,
    ora_mbarimit,
    salla
  } = req.body;

  const sql = `
    UPDATE oraret
    SET lende_id = ?, profesori_id = ?, dita = ?, ora_fillimit = ?, ora_mbarimit = ?, salla = ?
    WHERE orari_id = ?
  `;

  db.query(
    sql,
    [lende_id, profesori_id, dita, ora_fillimit, ora_mbarimit, salla, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Orari nuk u gjet" });
      }

      res.json({ message: "Orari u perditesua" });
    }
  );
};

const deleteOrari = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM oraret WHERE orari_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Orari nuk u gjet" });
    }

    res.json({ message: "Orari u fshi" });
  });
};

module.exports = {
  getAllOraret,
  getOrariById,
  createOrari,
  updateOrari,
  deleteOrari
};
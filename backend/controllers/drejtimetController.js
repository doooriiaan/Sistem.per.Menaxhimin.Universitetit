const db = require("../db");

const getAllDrejtimet = (req, res) => {
  db.query("SELECT * FROM drejtimet", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getDrejtimiById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM drejtimet WHERE drejtim_id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(404).json({ message: "Drejtimi nuk u gjet" });
      }

      res.json(results[0]);
    }
  );
};

const createDrejtimi = (req, res) => {
  const { emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi } = req.body;

  if (!emri) {
    return res.status(400).json({ message: "Emri eshte i detyrueshem" });
  }

  const sql = `
    INSERT INTO drejtimet (emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Drejtimi u shtua",
      id: result.insertId
    });
  });
};

const updateDrejtimi = (req, res) => {
  const { id } = req.params;
  const { emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi } = req.body;

  const sql = `
    UPDATE drejtimet
    SET emri = ?, fakulteti_id = ?, niveli = ?, kohezgjatja_vite = ?, pershkrimi = ?
    WHERE drejtim_id = ?
  `;

  db.query(sql, [emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Drejtimi nuk u gjet" });
    }

    res.json({ message: "Drejtimi u perditesua" });
  });
};

const deleteDrejtimi = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM drejtimet WHERE drejtim_id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Drejtimi nuk u gjet" });
      }

      res.json({ message: "Drejtimi u fshi" });
    }
  );
};

module.exports = {
  getAllDrejtimet,
  getDrejtimiById,
  createDrejtimi,
  updateDrejtimi,
  deleteDrejtimi
};
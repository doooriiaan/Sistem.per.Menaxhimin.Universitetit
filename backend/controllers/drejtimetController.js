const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM drejtimet", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const { emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi } = req.body;

  const sql = `
    INSERT INTO drejtimet (emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [emri, fakulteti_id, niveli, kohezgjatja_vite, pershkrimi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Drejtimi u krijua", id: result.insertId });
  });
};
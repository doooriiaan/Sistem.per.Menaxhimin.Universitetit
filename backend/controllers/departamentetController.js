const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM departamentet", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const { emri, fakulteti_id, shefi_id, pershkrimi } = req.body;

  const sql = `
    INSERT INTO departamentet (emri, fakulteti_id, shefi_id, pershkrimi)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [emri, fakulteti_id, shefi_id, pershkrimi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Departamenti u krijua", id: result.insertId });
  });
};
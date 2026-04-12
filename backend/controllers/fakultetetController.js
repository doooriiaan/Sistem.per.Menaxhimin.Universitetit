const db = require("../db");

// GET ALL
exports.getAll = (req, res) => {
  db.query("SELECT * FROM fakultetet", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// POST
exports.create = (req, res) => {
  const { emri, dekani_id, adresa, telefoni, email } = req.body;

  const sql = `
    INSERT INTO fakultetet (emri, dekani_id, adresa, telefoni, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [emri, dekani_id, adresa, telefoni, email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Fakulteti u krijua", id: result.insertId });
  });
};
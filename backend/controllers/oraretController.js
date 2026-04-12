const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM oraret", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const { lende_id, profesori_id, dita, ora_fillimit, ora_mbarimit, salla } = req.body;

  const sql = `
    INSERT INTO oraret (lende_id, profesori_id, dita, ora_fillimit, ora_mbarimit, salla)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [lende_id, profesori_id, dita, ora_fillimit, ora_mbarimit, salla], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Orari u krijua", id: result.insertId });
  });
};
const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM regjistrimet", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const { student_id, lende_id, semestri, viti_akademik, statusi } = req.body;

  const sql = `
    INSERT INTO regjistrimet (student_id, lende_id, semestri, viti_akademik, statusi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [student_id, lende_id, semestri, viti_akademik, statusi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Regjistrimi u krijua", id: result.insertId });
  });
};
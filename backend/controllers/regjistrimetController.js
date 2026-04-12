const db = require("../db");

const getAllRegjistrimet = (req, res) => {
  const sql = "SELECT * FROM regjistrimet";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getRegjistrimiById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM regjistrimet WHERE regjistrim_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createRegjistrimi = (req, res) => {
  const {
    student_id,
    lende_id,
    semestri,
    viti_akademik,
    statusi
  } = req.body;

  if (!student_id || !lende_id || !semestri || !viti_akademik) {
    return res.status(400).json({ message: "Fushat kryesore mungojne" });
  }

  const sql = `
    INSERT INTO regjistrimet
    (student_id, lende_id, semestri, viti_akademik, statusi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [student_id, lende_id, semestri, viti_akademik, statusi],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Regjistrimi u shtua",
        id: result.insertId
      });
    }
  );
};

const updateRegjistrimi = (req, res) => {
  const { id } = req.params;

  const {
    student_id,
    lende_id,
    semestri,
    viti_akademik,
    statusi
  } = req.body;

  const sql = `
    UPDATE regjistrimet
    SET student_id = ?, lende_id = ?, semestri = ?, viti_akademik = ?, statusi = ?
    WHERE regjistrim_id = ?
  `;

  db.query(
    sql,
    [student_id, lende_id, semestri, viti_akademik, statusi, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
      }

      res.json({ message: "Regjistrimi u perditesua" });
    }
  );
};

const deleteRegjistrimi = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM regjistrimet WHERE regjistrim_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Regjistrimi nuk u gjet" });
    }

    res.json({ message: "Regjistrimi u fshi" });
  });
};

module.exports = {
  getAllRegjistrimet,
  getRegjistrimiById,
  createRegjistrimi,
  updateRegjistrimi,
  deleteRegjistrimi
};
const db = require("../db");

// GET krejt notat
const getNotat = (req, res) => {
  const sql = "SELECT * FROM notat";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Gabim te getNotat:", err);
      return res.status(500).json({ message: "Gabim ne server", error: err.message });
    }

    res.json(result);
  });
};

// GET note by id
const getNotaById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM notat WHERE nota_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Gabim te getNotaById:", err);
      return res.status(500).json({ message: "Gabim ne server", error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json(result[0]);
  });
};

// POST
const addNota = (req, res) => {
  const { student_id, provimi_id, nota, data_vendosjes } = req.body;

  if (!student_id || !provimi_id || nota === undefined || nota === null) {
    return res.status(400).json({
      message: "student_id, provimi_id dhe nota jane obligative"
    });
  }

  const sql = `
    INSERT INTO notat (student_id, provimi_id, nota, data_vendosjes)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [student_id, provimi_id, nota, data_vendosjes || null], (err, result) => {
    if (err) {
      console.log("Gabim te addNota:", err);
      return res.status(500).json({ message: "Gabim ne server", error: err.message });
    }

    res.status(201).json({
      message: "Nota u shtua me sukses",
      nota_id: result.insertId
    });
  });
};

// PUT
const updateNota = (req, res) => {
  const { id } = req.params;
  const { student_id, provimi_id, nota, data_vendosjes } = req.body;

  const sql = `
    UPDATE notat
    SET student_id = ?, provimi_id = ?, nota = ?, data_vendosjes = ?
    WHERE nota_id = ?
  `;

  db.query(sql, [student_id, provimi_id, nota, data_vendosjes || null, id], (err, result) => {
    if (err) {
      console.log("Gabim te updateNota:", err);
      return res.status(500).json({ message: "Gabim ne server", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json({ message: "Nota u perditesua me sukses" });
  });
};

// DELETE
const deleteNota = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM notat WHERE nota_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Gabim te deleteNota:", err);
      return res.status(500).json({ message: "Gabim ne server", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json({ message: "Nota u fshi me sukses" });
  });
};

module.exports = {
  getNotat,
  getNotaById,
  addNota,
  updateNota,
  deleteNota
};
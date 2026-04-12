const db = require("../db");

const getAllFakultetet = (req, res) => {
  const sql = "SELECT * FROM fakultetet";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getFakultetiById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM fakultetet WHERE fakultet_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Fakulteti nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createFakulteti = (req, res) => {
  const { emri, dekani_id, adresa, telefoni, email } = req.body;

  if (!emri || !email) {
    return res.status(400).json({ message: "Emri dhe email jane te detyrueshme" });
  }

  const sql = `
    INSERT INTO fakultetet (emri, dekani_id, adresa, telefoni, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [emri, dekani_id, adresa, telefoni, email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Fakulteti u shtua",
      id: result.insertId
    });
  });
};

const updateFakulteti = (req, res) => {
  const { id } = req.params;
  const { emri, dekani_id, adresa, telefoni, email } = req.body;

  const sql = `
    UPDATE fakultetet
    SET emri = ?, dekani_id = ?, adresa = ?, telefoni = ?, email = ?
    WHERE fakultet_id = ?
  `;

  db.query(sql, [emri, dekani_id, adresa, telefoni, email, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Fakulteti nuk u gjet" });
    }

    res.json({ message: "Fakulteti u perditesua" });
  });
};

const deleteFakulteti = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM fakultetet WHERE fakultet_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Fakulteti nuk u gjet" });
    }

    res.json({ message: "Fakulteti u fshi" });
  });
};

module.exports = {
  getAllFakultetet,
  getFakultetiById,
  createFakulteti,
  updateFakulteti,
  deleteFakulteti
};
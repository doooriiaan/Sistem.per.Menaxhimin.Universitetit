const db = require("../db");

// GET all lendet
const getLendet = (req, res) => {
  db.query("SELECT * FROM lendet", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// ADD lende
const addLende = (req, res) => {
  const { emri, kodi, kreditet, semestri, lloji, pershkrimi } = req.body;

  const sql = `
    INSERT INTO lendet (emri, kodi, kreditet, semestri, drejtimi_id, lloji, pershkrimi)
    VALUES (?, ?, ?, ?, NULL, ?, ?)
  `;

  db.query(
    sql,
    [emri, kodi, kreditet, semestri, lloji, pershkrimi],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Lenda u shtua me sukses" });
    }
  );
};

// UPDATE lende
const updateLende = (req, res) => {
  const id = req.params.id;
  const { emri, kodi, kreditet, semestri, lloji, pershkrimi } = req.body;

  const sql = `
    UPDATE lendet
    SET emri=?, kodi=?, kreditet=?, semestri=?, lloji=?, pershkrimi=?
    WHERE lende_id=?
  `;

  db.query(
    sql,
    [emri, kodi, kreditet, semestri, lloji, pershkrimi, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Lenda u perditesua me sukses" });
    }
  );
};

// DELETE lende
const deleteLende = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM lendet WHERE lende_id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lenda u fshi me sukses" });
  });
};

module.exports = {
  getLendet,
  addLende,
  updateLende,
  deleteLende,
};
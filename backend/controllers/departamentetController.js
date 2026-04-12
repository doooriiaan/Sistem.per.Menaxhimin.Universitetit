const db = require("../db");

const getAllDepartamentet = (req, res) => {
  db.query("SELECT * FROM departamentet", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getDepartamentiById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM departamentet WHERE departament_id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(404).json({ message: "Departamenti nuk u gjet" });
      }

      res.json(results[0]);
    }
  );
};

const createDepartamenti = (req, res) => {
  const { emri, fakulteti_id, shefi_id, pershkrimi } = req.body;

  if (!emri) {
    return res.status(400).json({ message: "Emri eshte i detyrueshem" });
  }

  const sql = `
    INSERT INTO departamentet (emri, fakulteti_id, shefi_id, pershkrimi)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [emri, fakulteti_id, shefi_id, pershkrimi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Departamenti u shtua",
      id: result.insertId
    });
  });
};

const updateDepartamenti = (req, res) => {
  const { id } = req.params;
  const { emri, fakulteti_id, shefi_id, pershkrimi } = req.body;

  const sql = `
    UPDATE departamentet
    SET emri = ?, fakulteti_id = ?, shefi_id = ?, pershkrimi = ?
    WHERE departament_id = ?
  `;

  db.query(sql, [emri, fakulteti_id, shefi_id, pershkrimi, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Departamenti nuk u gjet" });
    }

    res.json({ message: "Departamenti u perditesua" });
  });
};

const deleteDepartamenti = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM departamentet WHERE departament_id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Departamenti nuk u gjet" });
      }

      res.json({ message: "Departamenti u fshi" });
    }
  );
};

module.exports = {
  getAllDepartamentet,
  getDepartamentiById,
  createDepartamenti,
  updateDepartamenti,
  deleteDepartamenti
};
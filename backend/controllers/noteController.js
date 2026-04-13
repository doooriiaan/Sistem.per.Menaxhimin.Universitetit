const db = require("../db");

const getallnotat = (req, res) => {
  const sql = "SELECT * FROM notat";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

const getnotabyid = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM notat WHERE nota_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json(results[0]);
  });
};

const createnota = (req, res) => {
  const {
    student_id,
    provimi_id,
    nota,
    data_vendosjes,
    pershkrimi
  } = req.body;

  const sql = `
    INSERT INTO notat
    (student_id, provimi_id, nota, data_vendosjes, pershkrimi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [student_id, provimi_id, nota, data_vendosjes, pershkrimi],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Nota u shtua",
        id: result.insertId
      });
    }
  );
};

const updatenota = (req, res) => {
  const { id } = req.params;
  const {
    student_id,
    provimi_id,
    nota,
    data_vendosjes,
    pershkrimi
  } = req.body;

  const sql = `
    UPDATE notat
    SET student_id = ?, provimi_id = ?, nota = ?, data_vendosjes = ?, pershkrimi = ?
    WHERE nota_id = ?
  `;

  db.query(
    sql,
    [student_id, provimi_id, nota, data_vendosjes, pershkrimi, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nota nuk u gjet" });
      }

      res.json({ message: "Nota u perditesua" });
    }
  );
};

const deletenota = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM notat WHERE nota_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nota nuk u gjet" });
    }

    res.json({ message: "Nota u fshi" });
  });
};

const getnotatdetails = (req, res) => {
  const sql = `
    SELECT 
      n.nota_id,
      s.emri,
      s.mbiemri,
      l.emri AS lenda,
      pr.emri AS profesori,
      n.nota,
      n.data_vendosjes,
      n.pershkrimi
    FROM notat n
    JOIN studentet s ON n.student_id = s.student_id
    JOIN provimet p ON n.provimi_id = p.provimi_id
    JOIN lendet l ON p.lende_id = l.lende_id
    JOIN profesoret pr ON p.profesor_id = pr.profesor_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
};

module.exports = {
  getallnotat,
  getnotabyid,
  createnota,
  updatenota,
  deletenota,
  getnotatdetails
};
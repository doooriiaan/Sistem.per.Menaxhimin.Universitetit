const db = require("../db");

// GET
const getStudentet = (req, res) => {
  db.query("SELECT * FROM studentet", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
};

// POST
const addStudent = (req, res) => {
  const { emri, mbiemri, email } = req.body;

  if (!emri || !mbiemri || !email) {
    return res.status(400).json({
      message: "Te gjitha fushat jane te detyrueshme"
    });
  }

  const sql = "INSERT INTO studentet (emri, mbiemri, email) VALUES (?, ?, ?)";

  db.query(sql, [emri, mbiemri, email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.status(201).json({
      message: "Studenti u shtua me sukses",
      id: result.insertId
    });
  });
};

module.exports = { getStudentet, addStudent };
const db = require("../db"); // ose lidhja jote me mysql

const getStudentet = (req, res) => {
  db.query("SELECT * FROM studentet", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
};

module.exports = { getStudentet };



// POST
const addStudent = (req, res) => {
  const { emri, mbiemri, email } = req.body;

  const sql = "INSERT INTO studentet (emri, mbiemri, email) VALUES (?, ?, ?)";

  db.query(sql, [emri, mbiemri, email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json({
      message: "Studenti u shtua me sukses",
      id: result.insertId
    });
  });
};

module.exports = { getStudentet, addStudent };
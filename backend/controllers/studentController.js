const db = require("../db");

// GET
const getStudentet = (req, res) => {
  db.query("SELECT * FROM studentet", (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
};

// POST (pa null)
const addStudent = (req, res) => {
  const {
    emri,
    mbiemri,
    numri_personal,
    data_lindjes,
    gjinia,
    email,
    telefoni,
    adresa,
    drejtimi_id,
    viti_studimit,
    statusi
  } = req.body;

  if (
    !emri?.trim() ||
    !mbiemri?.trim() ||
    !numri_personal?.trim() ||
    !data_lindjes ||
    !gjinia?.trim() ||
    !email?.trim() ||
    !telefoni?.trim() ||
    !adresa?.trim() ||
    !drejtimi_id ||
    !viti_studimit ||
    !statusi?.trim()
  ) {
    return res.status(400).json({
      message: "Te gjitha fushat jane te detyrueshme"
    });
  }

  const sql = `
    INSERT INTO studentet
    (emri, mbiemri, numri_personal, data_lindjes, gjinia, email, telefoni, adresa, drejtimi_id, viti_studimit, statusi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      emri.trim(),
      mbiemri.trim(),
      numri_personal.trim(),
      data_lindjes,
      gjinia.trim(),
      email.trim(),
      telefoni.trim(),
      adresa.trim(),
      drejtimi_id,
      viti_studimit,
      statusi.trim()
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        message: "Studenti u shtua me sukses",
        id: result.insertId
      });
    }
  );
};

module.exports = { getStudentet, addStudent };
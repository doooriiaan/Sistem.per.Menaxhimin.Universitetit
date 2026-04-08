const express = require("express");
const router = express.Router();

const noteController = require("../controllers/noteController");

// GET krejt notat
router.get("/notat", noteController.getNotat);

// GET note sipas ID
router.get("/notat/:id", noteController.getNotaById);

// POST shto note
router.post("/notat", noteController.addNota);

// PUT update note
router.put("/notat/:id", noteController.updateNota);

// DELETE note
router.delete("/notat/:id", noteController.deleteNota);

module.exports = router;
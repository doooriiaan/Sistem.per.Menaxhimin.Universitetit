const express = require("express");
const router = express.Router();
const {
  getAllOraret,
  getOrariById,
  createOrari,
  updateOrari,
  deleteOrari
} = require("../controllers/oraretController");

router.get("/", getAllOraret);
router.get("/:id", getOrariById);
router.post("/", createOrari);
router.put("/:id", updateOrari);
router.delete("/:id", deleteOrari);

module.exports = router;
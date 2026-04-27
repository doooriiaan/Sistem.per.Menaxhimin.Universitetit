const express = require("express");
const {
  getAllRindjekjet,
  updateRindjekja,
} = require("../controllers/rindjekjetController");

const router = express.Router();

router.get("/", getAllRindjekjet);
router.put("/:id", updateRindjekja);

module.exports = router;

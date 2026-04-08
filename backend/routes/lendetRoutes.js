const express = require("express");
const router = express.Router();
const {
  getLendet,
  getLendaById,
  addLenda,
  updateLenda,
  deleteLenda
} = require("../controllers/lendetController");

router.get("/lendet", getLendet);
router.get("/lendet/:id", getLendaById);
router.post("/lendet", addLenda);
router.put("/lendet/:id", updateLenda);
router.delete("/lendet/:id", deleteLenda);

module.exports = router;
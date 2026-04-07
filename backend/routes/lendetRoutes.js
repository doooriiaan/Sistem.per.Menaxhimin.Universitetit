const express = require("express");
const router = express.Router();

const {
  getLendet,
  addLende,
  updateLende,
  deleteLende,
} = require("../controllers/lendetController");

router.get("/lendet", getLendet);
router.post("/lendet", addLende);
router.put("/lendet/:id", updateLende);
router.delete("/lendet/:id", deleteLende);

module.exports = router;
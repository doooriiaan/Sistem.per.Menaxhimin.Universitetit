const express = require("express");
const router = express.Router();
const {
  getProvimet,
  getProvimiById,
  addProvimi,
  updateProvimi,
  deleteProvimi
} = require("../controllers/provimetController");

router.get("/provimet", getProvimet);
router.get("/provimet/:id", getProvimiById);
router.post("/provimet", addProvimi);
router.put("/provimet/:id", updateProvimi);
router.delete("/provimet/:id", deleteProvimi);

module.exports = router;
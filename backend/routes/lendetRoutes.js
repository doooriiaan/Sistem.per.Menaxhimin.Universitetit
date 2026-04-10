const express = require("express");
const router = express.Router();
const lendetController = require("../controllers/lendetController");

router.get("/", lendetController.getalllendet);
router.get("/:id", lendetController.getlendabyid);
router.post("/", lendetController.createlenda);
router.put("/:id", lendetController.updatelenda);
router.delete("/:id", lendetController.deletelenda);

module.exports = router;
const express = require("express");
const router = express.Router();
const provimetController = require("../controllers/provimetController");

router.get("/", provimetController.getallprovimet);
router.get("/:id", provimetController.getprovimibyid);
router.post("/", provimetController.createprovimi);
router.put("/:id", provimetController.updateprovimi);
router.delete("/:id", provimetController.deleteprovimi);

module.exports = router;
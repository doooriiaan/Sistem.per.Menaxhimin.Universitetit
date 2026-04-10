const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.get("/", noteController.getallnotat);
router.get("/:id", noteController.getnotabyid);
router.post("/", noteController.createnota);
router.put("/:id", noteController.updatenota);
router.delete("/:id", noteController.deletenota);

module.exports = router;
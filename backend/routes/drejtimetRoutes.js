const express = require("express");
const router = express.Router();
const {
  getAllDrejtimet,
  getDrejtimiById,
  createDrejtimi,
  updateDrejtimi,
  deleteDrejtimi
} = require("../controllers/drejtimetController");

router.get("/", getAllDrejtimet);
router.get("/:id", getDrejtimiById);
router.post("/", createDrejtimi);
router.put("/:id", updateDrejtimi);
router.delete("/:id", deleteDrejtimi);

module.exports = router;
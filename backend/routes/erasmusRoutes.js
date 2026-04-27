const express = require("express");
const {
  createErasmusProgram,
  deleteErasmusProgram,
  getAllErasmusPrograms,
  getErasmusApplications,
  updateErasmusApplication,
  updateErasmusProgram,
} = require("../controllers/erasmusController");

const router = express.Router();

router.get("/aplikimet", getErasmusApplications);
router.put("/aplikimet/:id", updateErasmusApplication);
router.get("/", getAllErasmusPrograms);
router.post("/", createErasmusProgram);
router.put("/:id", updateErasmusProgram);
router.delete("/:id", deleteErasmusProgram);

module.exports = router;

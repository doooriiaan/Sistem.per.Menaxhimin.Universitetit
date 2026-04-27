const express = require("express");
const {
  createPraktika,
  deletePraktika,
  getAllPraktikat,
  getInternshipApplications,
  updateInternshipApplication,
  updatePraktika,
} = require("../controllers/praktikatController");

const router = express.Router();

router.get("/aplikimet", getInternshipApplications);
router.put("/aplikimet/:id", updateInternshipApplication);
router.get("/", getAllPraktikat);
router.post("/", createPraktika);
router.put("/:id", updatePraktika);
router.delete("/:id", deletePraktika);

module.exports = router;

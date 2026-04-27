const express = require("express");
const {
  createBursa,
  deleteBursa,
  getAllBursat,
  getScholarshipApplications,
  updateBursa,
  updateScholarshipApplication,
} = require("../controllers/bursatController");

const router = express.Router();

router.get("/aplikimet", getScholarshipApplications);
router.put("/aplikimet/:id", updateScholarshipApplication);
router.get("/", getAllBursat);
router.post("/", createBursa);
router.put("/:id", updateBursa);
router.delete("/:id", deleteBursa);

module.exports = router;

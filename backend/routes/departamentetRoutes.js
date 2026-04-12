const express = require("express");
const router = express.Router();
const {
  getAllDepartamentet,
  getDepartamentiById,
  createDepartamenti,
  updateDepartamenti,
  deleteDepartamenti
} = require("../controllers/departamentetController");

router.get("/", getAllDepartamentet);
router.get("/:id", getDepartamentiById);
router.post("/", createDepartamenti);
router.put("/:id", updateDepartamenti);
router.delete("/:id", deleteDepartamenti);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getAllFakultetet,
  getFakultetiById,
  createFakulteti,
  updateFakulteti,
  deleteFakulteti
} = require("../controllers/fakultetetController");

router.get("/", getAllFakultetet);
router.get("/:id", getFakultetiById);
router.post("/", createFakulteti);
router.put("/:id", updateFakulteti);
router.delete("/:id", deleteFakulteti);

module.exports = router;
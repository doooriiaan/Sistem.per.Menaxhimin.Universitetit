const express = require("express");
const {
  getAllSallat,
  getSallaById,
  createSalla,
  updateSalla,
  deleteSalla,
} = require("../controllers/sallatController");
const { authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllSallat);
router.get("/:id", getSallaById);
router.post("/", authorizeRoles("admin"), createSalla);
router.put("/:id", authorizeRoles("admin"), updateSalla);
router.delete("/:id", authorizeRoles("admin"), deleteSalla);

module.exports = router;

const express = require("express");
const {
  createNjoftim,
  deleteNjoftim,
  getAllNjoftimet,
  updateNjoftim,
} = require("../controllers/njoftimetController");
const { authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllNjoftimet);
router.post("/", authorizeRoles("admin"), createNjoftim);
router.put("/:id", authorizeRoles("admin"), updateNjoftim);
router.delete("/:id", authorizeRoles("admin"), deleteNjoftim);

module.exports = router;

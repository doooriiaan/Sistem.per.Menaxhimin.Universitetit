const express = require("express");
const router = express.Router();

const {
  getProfesoret,
  getProfesoriById,
  addProfesor,
  updateProfesor,
  deleteProfesor
} = require("../controllers/profesoretController");

router.get("/profesoret", getProfesoret);
router.get("/profesoret/:id", getProfesoriById);
router.post("/profesoret", addProfesor);
router.put("/profesoret/:id", updateProfesor);
router.delete("/profesoret/:id", deleteProfesor);

module.exports = router;
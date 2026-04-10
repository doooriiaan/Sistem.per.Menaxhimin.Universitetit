const express = require("express");
const router = express.Router();
const profesoretController = require("../controllers/profesoretController");

router.get("/", profesoretController.getallprofesoret);
router.get("/:id", profesoretController.getprofesoribyid);
router.post("/", profesoretController.createprofesor);
router.put("/:id", profesoretController.updateprofesor);
router.delete("/:id", profesoretController.deleteprofesor);

module.exports = router;
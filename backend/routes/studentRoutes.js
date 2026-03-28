const express = require("express");
const router = express.Router();
const { getStudentet, addStudent } = require("../controllers/studentController");

router.get("/studentet", getStudentet);
router.post("/studentet", addStudent);

module.exports = router;


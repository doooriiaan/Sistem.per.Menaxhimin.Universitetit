const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/details", studentController.getstudentdetails);
router.get("/:id/dokumentet", studentController.getStudentDocuments);
router.post("/:id/dokumentet", studentController.uploadStudentDocument);
router.get("/", studentController.getallstudents);
router.get("/:id", studentController.getstudentbyid);
router.post("/", studentController.createstudent);
router.put("/:id", studentController.updatestudent);
router.delete("/:id", studentController.deletestudent);

module.exports = router;

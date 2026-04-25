const express = require("express");
const profesorPortalController = require("../controllers/profesorPortalController");

const router = express.Router();

router.get("/profili", profesorPortalController.getProfile);
router.get("/lendet", profesorPortalController.getCourses);
router.get("/lendet/:id/studentet", profesorPortalController.getCourseStudents);
router.get("/provimet", profesorPortalController.getExams);
router.post("/provimet", profesorPortalController.createExam);
router.put("/provimet/:id", profesorPortalController.updateExam);
router.delete("/provimet/:id", profesorPortalController.deleteExam);
router.get("/provimet/:id/studentet", profesorPortalController.getExamStudents);
router.get("/orari", profesorPortalController.getSchedule);
router.post("/notat", profesorPortalController.createGrade);
router.put("/notat/:id", profesorPortalController.updateGrade);

module.exports = router;

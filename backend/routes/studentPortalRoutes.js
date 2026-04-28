const express = require("express");
const studentPortalController = require("../controllers/studentPortalController");
const studentServicesController = require("../controllers/studentServicesController");
const studentOpportunitiesController = require("../controllers/studentOpportunitiesController");

const router = express.Router();

router.get("/profili", studentPortalController.getProfile);
router.get("/profili/overview", studentPortalController.getProfileOverview);
router.get("/notat", studentPortalController.getGrades);
router.get("/regjistrimet", studentPortalController.getEnrollments);
router.get("/dokumentet", studentServicesController.getStudentBaseDocuments);
router.post("/dokumentet", studentServicesController.uploadStudentBaseDocument);
router.get(
  "/regjistrimet/:id/dokumentet",
  studentServicesController.getRegistrationDocuments
);
router.post(
  "/regjistrimet/:id/dokumentet",
  studentServicesController.uploadRegistrationDocument
);
router.get("/provimet", studentPortalController.getExams);
router.get("/orari", studentPortalController.getSchedule);
router.get("/sherbimet", studentServicesController.getStudentServices);
router.post("/sherbimet/kerkesat", studentServicesController.createStudentServiceRequest);
router.get("/rindjekjet/lendet", studentServicesController.getRetakeCourses);
router.get("/rindjekjet", studentServicesController.getStudentRetakeRequests);
router.post("/rindjekjet", studentServicesController.createRetakeRequest);
router.get("/bursat", studentOpportunitiesController.getStudentBursat);
router.post("/bursat/apliko", studentOpportunitiesController.applyToBursa);
router.get("/praktikat", studentOpportunitiesController.getStudentPraktikat);
router.post("/praktikat/apliko", studentOpportunitiesController.applyToPraktika);
router.get("/erasmus", studentOpportunitiesController.getStudentErasmusPrograms);
router.post("/erasmus/apliko", studentOpportunitiesController.applyToErasmus);

module.exports = router;

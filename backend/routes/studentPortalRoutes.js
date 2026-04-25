const express = require("express");
const studentPortalController = require("../controllers/studentPortalController");

const router = express.Router();

router.get("/profili", studentPortalController.getProfile);
router.get("/notat", studentPortalController.getGrades);
router.get("/regjistrimet", studentPortalController.getEnrollments);
router.get("/provimet", studentPortalController.getExams);
router.get("/orari", studentPortalController.getSchedule);

module.exports = router;

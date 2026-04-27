const express = require("express");
const {
  createSherbimi,
  deleteSherbimi,
  getAllSherbimet,
  getServiceRequests,
  updateServiceRequest,
  updateSherbimi,
} = require("../controllers/sherbimetController");

const router = express.Router();

router.get("/kerkesat", getServiceRequests);
router.put("/kerkesat/:id", updateServiceRequest);
router.get("/", getAllSherbimet);
router.post("/", createSherbimi);
router.put("/:id", updateSherbimi);
router.delete("/:id", deleteSherbimi);

module.exports = router;

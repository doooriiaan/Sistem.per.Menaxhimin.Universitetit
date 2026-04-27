const express = require("express");
const router = express.Router();
const {
  getAllRegjistrimet,
  getRegjistrimiById,
  createRegjistrimi,
  updateRegjistrimi,
  deleteRegjistrimi,
  getRegjistrimiDocuments
} = require("../controllers/regjistrimetController");

router.get("/", getAllRegjistrimet);
router.get("/:id/dokumentet", getRegjistrimiDocuments);
router.get("/:id", getRegjistrimiById);
router.post("/", createRegjistrimi);
router.put("/:id", updateRegjistrimi);
router.delete("/:id", deleteRegjistrimi);

module.exports = router;

const express = require("express");
const {
  createGjenerata,
  deleteGjenerata,
  getAllGjeneratat,
  getGjenerataById,
  updateGjenerata,
} = require("../controllers/gjeneratatController");

const router = express.Router();

router.get("/", getAllGjeneratat);
router.get("/:id", getGjenerataById);
router.post("/", createGjenerata);
router.put("/:id", updateGjenerata);
router.delete("/:id", deleteGjenerata);

module.exports = router;

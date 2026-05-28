const express = require("express");
const {
  listUsers,
  resetUserPassword,
  updateUserEmail,
  updateUserStatus,
} = require("../controllers/usersController");

const router = express.Router();

router.get("/", listUsers);
router.put("/:id/email", updateUserEmail);
router.put("/:id/password", resetUserPassword);
router.put("/:id/status", updateUserStatus);

module.exports = router;

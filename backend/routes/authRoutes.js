const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authenticateToken, authController.me);
router.get("/dashboard", authenticateToken, authController.dashboard);
router.put("/password", authenticateToken, authController.changePassword);

module.exports = router;

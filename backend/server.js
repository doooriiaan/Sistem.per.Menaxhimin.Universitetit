const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const lendetRoutes = require("./routes/lendetRoutes");
const profesoretRoutes = require("./routes/profesoretRoutes");
const noteRoutes = require("./routes/noteRoutes");
const provimetRoutes = require("./routes/provimet");
const fakultetetRoutes = require("./routes/fakultetetRoutes");
const departamentetRoutes = require("./routes/departamentetRoutes");
const drejtimetRoutes = require("./routes/drejtimetRoutes");
const regjistrimetRoutes = require("./routes/regjistrimetRoutes");
const oraretRoutes = require("./routes/oraretRoutes");
const profesorPortalRoutes = require("./routes/profesorPortalRoutes");
const studentPortalRoutes = require("./routes/studentPortalRoutes");
const {
  authenticateToken,
  authorizeRoles,
} = require("./middleware/authMiddleware");
const { ensureAuthSetup } = require("./utils/authSetup");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server working");
});

app.use("/api/auth", authRoutes);
app.use("/api/studentet", authenticateToken, authorizeRoles("admin"), studentRoutes);
app.use("/api/lendet", authenticateToken, authorizeRoles("admin"), lendetRoutes);
app.use("/api/profesoret", authenticateToken, authorizeRoles("admin"), profesoretRoutes);
app.use("/api/notat", authenticateToken, authorizeRoles("admin"), noteRoutes);
app.use("/api/provimet", authenticateToken, authorizeRoles("admin"), provimetRoutes);
app.use("/api/fakultetet", authenticateToken, authorizeRoles("admin"), fakultetetRoutes);
app.use("/api/departamentet", authenticateToken, authorizeRoles("admin"), departamentetRoutes);
app.use("/api/drejtimet", authenticateToken, authorizeRoles("admin"), drejtimetRoutes);
app.use("/api/regjistrimet", authenticateToken, authorizeRoles("admin"), regjistrimetRoutes);
app.use("/api/oraret", authenticateToken, authorizeRoles("admin"), oraretRoutes);
app.use(
  "/api/profesor",
  authenticateToken,
  authorizeRoles("profesor"),
  profesorPortalRoutes
);
app.use(
  "/api/student",
  authenticateToken,
  authorizeRoles("student"),
  studentPortalRoutes
);
const PORT = process.env.PORT || 5001;

ensureAuthSetup()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Gabim gjate inicializimit te autentikimit:", err);
    process.exit(1);
  });



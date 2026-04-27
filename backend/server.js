const express = require("express");
const cors = require("cors");
const path = require("path");

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
const gjeneratatRoutes = require("./routes/gjeneratatRoutes");
const regjistrimetRoutes = require("./routes/regjistrimetRoutes");
const sherbimetRoutes = require("./routes/sherbimetRoutes");
const rindjekjetRoutes = require("./routes/rindjekjetRoutes");
const bursatRoutes = require("./routes/bursatRoutes");
const praktikatRoutes = require("./routes/praktikatRoutes");
const erasmusRoutes = require("./routes/erasmusRoutes");
const oraretRoutes = require("./routes/oraretRoutes");
const njoftimetRoutes = require("./routes/njoftimetRoutes");
const profesorPortalRoutes = require("./routes/profesorPortalRoutes");
const studentPortalRoutes = require("./routes/studentPortalRoutes");
const {
  authenticateToken,
  authorizeRoles,
} = require("./middleware/authMiddleware");
const { FRONTEND_ORIGINS } = require("./utils/authConfig");
const { ensureAuthSetup } = require("./utils/authSetup");
const { ensureUniversitySetup } = require("./utils/universitySetup");

const app = express();

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || FRONTEND_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin nuk lejohet nga CORS."));
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server working");
});

app.use("/api/auth", authRoutes);
app.use("/api/njoftime", authenticateToken, njoftimetRoutes);
app.use(
  "/api/studentet",
  authenticateToken,
  authorizeRoles("admin"),
  studentRoutes
);
app.use(
  "/api/lendet",
  authenticateToken,
  authorizeRoles("admin"),
  lendetRoutes
);
app.use(
  "/api/profesoret",
  authenticateToken,
  authorizeRoles("admin"),
  profesoretRoutes
);
app.use("/api/notat", authenticateToken, authorizeRoles("admin"), noteRoutes);
app.use(
  "/api/provimet",
  authenticateToken,
  authorizeRoles("admin"),
  provimetRoutes
);
app.use(
  "/api/fakultetet",
  authenticateToken,
  authorizeRoles("admin"),
  fakultetetRoutes
);
app.use(
  "/api/departamentet",
  authenticateToken,
  authorizeRoles("admin"),
  departamentetRoutes
);
app.use(
  "/api/drejtimet",
  authenticateToken,
  authorizeRoles("admin"),
  drejtimetRoutes
);
app.use(
  "/api/gjeneratat",
  authenticateToken,
  authorizeRoles("admin"),
  gjeneratatRoutes
);
app.use(
  "/api/regjistrimet",
  authenticateToken,
  authorizeRoles("admin"),
  regjistrimetRoutes
);
app.use(
  "/api/sherbimet",
  authenticateToken,
  authorizeRoles("admin"),
  sherbimetRoutes
);
app.use(
  "/api/rindjekjet",
  authenticateToken,
  authorizeRoles("admin"),
  rindjekjetRoutes
);
app.use(
  "/api/bursat",
  authenticateToken,
  authorizeRoles("admin"),
  bursatRoutes
);
app.use(
  "/api/praktikat",
  authenticateToken,
  authorizeRoles("admin"),
  praktikatRoutes
);
app.use(
  "/api/erasmus",
  authenticateToken,
  authorizeRoles("admin"),
  erasmusRoutes
);
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
  .then(() => ensureUniversitySetup())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Gabim gjate inicializimit te autentikimit:", err);
    process.exit(1);
  });

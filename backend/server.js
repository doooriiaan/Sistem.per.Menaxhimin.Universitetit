const express = require("express");
const cors = require("cors");

require("dotenv").config();

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


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server working");
});

app.use("/api/studentet", studentRoutes);
app.use("/api/lendet", lendetRoutes);
app.use("/api/profesoret", profesoretRoutes);
app.use("/api/notat", noteRoutes);
app.use("/api/provimet", provimetRoutes);
app.use("/api/fakultetet", fakultetetRoutes);
app.use("/api/departamentet", departamentetRoutes);
app.use("/api/drejtimet", drejtimetRoutes);
app.use("/api/regjistrimet", regjistrimetRoutes);
app.use("/api/oraret", oraretRoutes);
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
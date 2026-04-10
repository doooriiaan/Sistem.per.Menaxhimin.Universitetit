const express = require("express");
const cors = require("cors");

require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");
const lendetRoutes = require("./routes/lendetRoutes");
const profesoretRoutes = require("./routes/profesoretRoutes");
const noteRoutes = require("./routes/noteRoutes");
const provimetRoutes = require("./routes/provimet");

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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
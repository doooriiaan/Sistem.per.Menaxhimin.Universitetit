const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const lendetRoutes = require("./routes/lendetRoutes");
const profesoretRoutes = require("./routes/profesoretRoutes");
const noteRoutes = require("./routes/noteRoutes");
const provimetRoutes = require("./routes/provimet");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/", studentRoutes);
app.use("/", lendetRoutes);
app.use("/", profesoretRoutes);
app.use("/", noteRoutes);
app.use("/", provimetRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
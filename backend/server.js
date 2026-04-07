const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const lendetRoutes = require("./routes/lendetRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/", studentRoutes);
app.use("/", lendetRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
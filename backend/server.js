const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const lendetRoutes = require("./routes/lendetRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express(); // DUHET me kon para app.use

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// routes
app.use("/", studentRoutes);
app.use("/", lendetRoutes);
app.use("/", noteRoutes);

// PORT
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
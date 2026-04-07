const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const lendetRoutes = require("./routes/lendetRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// routes
app.use("/", studentRoutes);
app.use("/", lendetRoutes);

// PORT
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
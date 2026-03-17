require("dotenv").config();
const cors = require("cors");
require("./src/config/db");
require("./src/config/redis");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "GG Translate backend is running" });
});

const translateRoute = require("./src/routes/translate");
app.use("/translate", translateRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

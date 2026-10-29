
const express = require("express");
const router = express.Router();

// GET /api/health
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Application Tracker API is running",
  });
});

module.exports = router;

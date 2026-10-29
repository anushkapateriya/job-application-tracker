
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const requireAuth = require("../middleware/auth");

// Only logged-in users can view their dashboard.
router.get("/", requireAuth, dashboardController.getDashboard);

module.exports = router;

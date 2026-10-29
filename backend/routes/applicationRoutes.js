
const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applicationController");
const requireAuth = require("../middleware/auth");

// All routes below require the user to be logged in.
router.use(requireAuth);

// Create a job application
router.post("/", applicationController.createApplication);

// Get all applications belonging to the logged-in user
router.get("/", applicationController.getApplications);

// Get one application by ID
router.get("/:id", applicationController.getApplicationById);

// Update one application
router.put("/:id", applicationController.updateApplication);

// Delete one application
router.delete("/:id", applicationController.deleteApplication);

module.exports = router;

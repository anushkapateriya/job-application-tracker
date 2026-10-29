
const express = require("express");
const router = express.Router();

const interviewController = require("../controllers/interviewController");
const requireAuth = require("../middleware/auth");

// All interview routes require login.
router.use(requireAuth);

// Schedule an interview
router.post("/", interviewController.createInterview);

// Get all interviews for the logged-in user
router.get("/", interviewController.getInterviews);

// Get one interview by ID
router.get("/:id", interviewController.getInterviewById);

// Update an interview
router.put("/:id", interviewController.updateInterview);

// Delete an interview
router.delete("/:id", interviewController.deleteInterview);

module.exports = router;

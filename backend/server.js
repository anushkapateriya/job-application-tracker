
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const { startReminderScheduler } = require("./services/reminderService");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from .env");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(
  session({
    name: "jobtracker.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Health check
app.use("/api", require("./routes/healthRoutes"));

// Authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

// Job application routes
app.use("/api/applications", require("./routes/applicationRoutes"));

// Interview management routes
app.use("/api/interviews", require("./routes/interviewRoutes"));

// Dashboard statistics routes
app.use("/api/dashboard", require("./routes/dashboardRoutes"));


// Handle invalid JSON
app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  next(err);
});

// Handle unexpected errors
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  startReminderScheduler();
});


const bcrypt = require("bcrypt");
const { User } = require("../models");

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length > 100 || cleanEmail.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Name or email exceeds the allowed length.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes.",
      });
    }

    const existingUser = await User.findOne({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please log in.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register right now.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail.length > 255) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = await User.findOne({
      where: { email: cleanEmail },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Regenerate the session to help prevent session fixation.
    req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration failed:", error.message);

        return res.status(500).json({
          success: false,
          message: "Unable to log in right now.",
        });
      }

      req.session.userId = user.id;

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save failed:", saveError.message);

          return res.status(500).json({
            success: false,
            message: "Unable to log in right now.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Login successful.",
          user: publicUser(user),
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
};

exports.logout = (req, res, next) => {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  }

  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("jobtracker.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "name", "email", "created_at"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists. Please log in again.",
      });
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Current-user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the current user.",
    });
  }
};

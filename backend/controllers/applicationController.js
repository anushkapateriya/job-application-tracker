
const { Application } = require("../models");

// Create a new job application
exports.createApplication = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobUrl,
      status,
      appliedAt,
      notes,
    } = req.body || {};

    if (
      typeof companyName !== "string" ||
      typeof jobTitle !== "string" ||
      !companyName.trim() ||
      !jobTitle.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name and job title are required.",
      });
    }

    if (companyName.trim().length > 150 || jobTitle.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Company name and job title must not exceed 150 characters.",
      });
    }

    if (
      jobUrl !== undefined &&
      jobUrl !== null &&
      jobUrl !== "" &&
      typeof jobUrl !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Job URL must be a string.",
      });
    }

    if (
      typeof jobUrl === "string" &&
      jobUrl.trim() &&
      jobUrl.trim().length > 2048
    ) {
      return res.status(400).json({
        success: false,
        message: "Job URL must not exceed 2048 characters.",
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Notes must be a string.",
      });
    }

    if (typeof notes === "string" && notes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Notes must not exceed 5000 characters.",
      });
    }

    const allowedStatuses = [
      "Applied",
      "Interview",
      "Offer",
      "Rejected",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Applied, Interview, Offer, or Rejected.",
      });
    }

    if (
      appliedAt !== undefined &&
      appliedAt !== null &&
      appliedAt !== "" &&
      (
        typeof appliedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(appliedAt) ||
        !Number.isFinite(Date.parse(`${appliedAt}T00:00:00Z`)) ||
        new Date(`${appliedAt}T00:00:00Z`).toISOString().slice(0, 10) !== appliedAt
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Applied date must be a valid date in YYYY-MM-DD format.",
      });
    }

    const application = await Application.create({
      userId: req.userId,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobUrl: typeof jobUrl === "string" ? jobUrl.trim() || null : null,
      status: status || "Applied",
      appliedAt: appliedAt || null,
      notes: typeof notes === "string" ? notes.trim() || null : null,
    });

    return res.status(201).json({
      success: true,
      message: "Job application created successfully.",
      application,
    });
  } catch (error) {
    console.error("Create application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create job application.",
    });
  }
};

// Get all applications belonging to the logged-in user

exports.getApplications = async (req, res) => {
  try {
    const { Op } = require("sequelize");

    // Read search and pagination values from the URL.
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const offset = (page - 1) * limit;

    // Always restrict results to the logged-in user.
    const where = {
      userId: req.userId,
    };

    // Search company name OR job title.
    if (search) {
      where[Op.or] = [
        {
          companyName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          jobTitle: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    // Fetch the current page and count all matching applications.
    const { count, rows } = await Application.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      applications: rows,
      pagination: {
        totalApplications: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Get applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve applications.",
    });
  }
};


// Get one application belonging to the logged-in user
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    console.error("Get application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve job application.",
    });
  }
};

// Update one application belonging to the logged-in user
exports.updateApplication = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobUrl,
      status,
      appliedAt,
      notes,
    } = req.body || {};

    const allowedFields = [
      "companyName",
      "jobTitle",
      "jobUrl",
      "status",
      "appliedAt",
      "notes",
    ];

    const hasAllowedField = allowedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body || {}, field)
    );

    if (!hasAllowedField) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    if (
      companyName !== undefined &&
      (
        typeof companyName !== "string" ||
        !companyName.trim() ||
        companyName.trim().length > 150
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name must be a non-empty string of at most 150 characters.",
      });
    }

    if (
      jobTitle !== undefined &&
      (
        typeof jobTitle !== "string" ||
        !jobTitle.trim() ||
        jobTitle.trim().length > 150
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Job title must be a non-empty string of at most 150 characters.",
      });
    }

    if (
      jobUrl !== undefined &&
      jobUrl !== null &&
      jobUrl !== "" &&
      (
        typeof jobUrl !== "string" ||
        jobUrl.trim().length > 2048
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Job URL must be a string of at most 2048 characters.",
      });
    }

    if (notes !== undefined && notes !== null && typeof notes !== "string") {
      return res.status(400).json({
        success: false,
        message: "Notes must be a string.",
      });
    }

    if (typeof notes === "string" && notes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Notes must not exceed 5000 characters.",
      });
    }

    const allowedStatuses = [
      "Applied",
      "Interview",
      "Offer",
      "Rejected",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Applied, Interview, Offer, or Rejected.",
      });
    }

    if (
      appliedAt !== undefined &&
      appliedAt !== null &&
      appliedAt !== "" &&
      (
        typeof appliedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(appliedAt) ||
        !Number.isFinite(Date.parse(`${appliedAt}T00:00:00Z`)) ||
        new Date(`${appliedAt}T00:00:00Z`).toISOString().slice(0, 10) !== appliedAt
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Applied date must be a valid date in YYYY-MM-DD format.",
      });
    }

    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    if (companyName !== undefined) application.companyName = companyName.trim();
    if (jobTitle !== undefined) application.jobTitle = jobTitle.trim();
    if (jobUrl !== undefined) {
      application.jobUrl =
        typeof jobUrl === "string" ? jobUrl.trim() || null : null;
    }
    if (status !== undefined) application.status = status;
    if (appliedAt !== undefined) application.appliedAt = appliedAt || null;
    if (notes !== undefined) {
      application.notes =
        typeof notes === "string" ? notes.trim() || null : null;
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Job application updated successfully.",
      application,
    });
  } catch (error) {
    console.error("Update application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update job application.",
    });
  }
};

// Delete one application belonging to the logged-in user
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    await application.destroy();

    return res.status(200).json({
      success: true,
      message: "Job application deleted successfully.",
    });
  } catch (error) {
    console.error("Delete application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete job application.",
    });
  }
};

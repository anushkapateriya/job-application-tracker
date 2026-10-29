
const { Application, Interview } = require("../models");

const allowedInterviewTypes = ["online", "phone", "in-person"];

// Check whether a date string is valid.
function isValidDate(value) {
  if (typeof value !== "string") return false;

  const date = new Date(value);

  return (
    value.trim() !== "" &&
    !Number.isNaN(date.getTime())
  );
}

// Schedule an interview for an application owned by the logged-in user.
exports.createInterview = async (req, res) => {
  try {
    const { applicationId, interviewDate, interviewType, notes } =
      req.body || {};

    if (
      applicationId === undefined ||
      !Number.isInteger(Number(applicationId)) ||
      Number(applicationId) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid application ID is required.",
      });
    }

    if (!isValidDate(interviewDate)) {
      return res.status(400).json({
        success: false,
        message: "A valid interview date is required.",
      });
    }

    if (
      interviewType !== undefined &&
      !allowedInterviewTypes.includes(interviewType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Interview type must be online, phone, or in-person.",
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Interview notes must be a string.",
      });
    }

    if (typeof notes === "string" && notes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Interview notes must not exceed 5000 characters.",
      });
    }

    const application = await Application.findOne({
      where: {
        id: Number(applicationId),
        userId: req.userId,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    const interview = await Interview.create({
      applicationId: application.id,
      interviewDate: new Date(interviewDate),
      interviewType: interviewType || "online",
      notes: typeof notes === "string" ? notes.trim() || null : null,
    });

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule interview.",
    });
  }
};

// Get interviews belonging to the logged-in user's applications.
exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "companyName", "jobTitle", "userId"],
          where: { userId: req.userId },
          required: true,
        },
      ],
      order: [["interviewDate", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get interviews error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interviews.",
    });
  }
};

// Get one interview, but only if its application belongs to the logged-in user.
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "companyName", "jobTitle", "userId"],
          where: { userId: req.userId },
          required: true,
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get interview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview.",
    });
  }
};

// Update an interview belonging to the logged-in user.
exports.updateInterview = async (req, res) => {
  try {
    const { interviewDate, interviewType, notes } = req.body || {};

    const allowedFields = ["interviewDate", "interviewType", "notes"];

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
      interviewDate !== undefined &&
      !isValidDate(interviewDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid interview date is required.",
      });
    }

    if (
      interviewType !== undefined &&
      !allowedInterviewTypes.includes(interviewType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Interview type must be online, phone, or in-person.",
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Interview notes must be a string.",
      });
    }

    if (typeof notes === "string" && notes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Interview notes must not exceed 5000 characters.",
      });
    }

    const interview = await Interview.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "userId"],
          where: { userId: req.userId },
          required: true,
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    if (interviewDate !== undefined) {
      interview.interviewDate = new Date(interviewDate);
    }

    if (interviewType !== undefined) {
      interview.interviewType = interviewType;
    }

    if (notes !== undefined) {
      interview.notes =
        typeof notes === "string" ? notes.trim() || null : null;
    }

    // Reset the reminder flag if the interview date changes.
    if (interviewDate !== undefined) {
      interview.reminderSent = false;
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview updated successfully.",
      interview,
    });
  } catch (error) {
    console.error("Update interview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update interview.",
    });
  }
};

// Delete an interview belonging to the logged-in user's application.
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "userId"],
          where: { userId: req.userId },
          required: true,
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    await interview.destroy();

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully.",
    });
  } catch (error) {
    console.error("Delete interview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete interview.",
    });
  }
};


const { Op } = require("sequelize");
const { Application, Interview } = require("../models");

exports.getDashboard = async (req, res) => {
  try {
    // Count all applications belonging to the logged-in user.
    const totalApplications = await Application.count({
      where: { userId: req.userId },
    });

    // Count applications in each status.
    const statuses = ["Applied", "Interview", "Offer", "Rejected"];

    const statusCounts = {};

    for (const status of statuses) {
      statusCounts[status] = await Application.count({
        where: {
          userId: req.userId,
          status,
        },
      });
    }

    // Get upcoming interviews linked to the user's applications.
    const now = new Date();

    const upcomingInterviews = await Interview.findAll({
      where: {
        interviewDate: {
          [Op.gte]: now,
        },
      },
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "companyName", "jobTitle"],
          where: { userId: req.userId },
          required: true,
        },
      ],
      order: [["interviewDate", "ASC"]],
      limit: 5,
    });

    // Get the user's five most recently created applications.
    const recentApplications = await Application.findAll({
      where: { userId: req.userId },
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalApplications,
        statusCounts,
        upcomingInterviews,
        recentApplications,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve dashboard statistics.",
    });
  }
};

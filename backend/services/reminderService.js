
const cron = require("node-cron");
const { Op } = require("sequelize");

const { Interview, Application, User } = require("../models");
const { sendEmail } = require("./emailService");

function startReminderScheduler() {
  // Run once every hour, at the beginning of the hour.
  cron.schedule("0 * * * *", async () => {
    console.log("Checking for upcoming interview reminders...");

    try {
      const now = new Date();
      const reminderWindow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      );

      const interviews = await Interview.findAll({
        where: {
          interviewDate: {
            [Op.gt]: now,
            [Op.lte]: reminderWindow,
          },
          reminderSent: false,
        },
        include: [
          {
            model: Application,
            as: "application",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name", "email"],
              },
            ],
          },
        ],
      });

      for (const interview of interviews) {
        const application = interview.application;
        const user = application?.user;

        if (!user?.email) {
          console.log(
            `Skipping interview ${interview.id}: user email unavailable.`
          );
          continue;
        }

        try {
          await sendEmail({
            to: user.email,
            subject: "Reminder: Your upcoming job interview",
            text: [
              `Hi ${user.name},`,
              "",
              "This is a reminder about your upcoming job interview.",
              `Company: ${application.companyName}`,
              `Position: ${application.jobTitle}`,
              `Interview date: ${interview.interviewDate}`,
              `Interview type: ${interview.interviewType}`,
              "",
              "Good luck with your interview!",
            ].join("\n"),
          });

          interview.reminderSent = true;
          await interview.save();

          console.log(
            `Reminder sent for interview ${interview.id}.`
          );
        } catch (emailError) {
          console.error(
            `Failed to send reminder for interview ${interview.id}:`,
            emailError.message
          );
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error.message);
    }
  });

  console.log("Interview reminder scheduler started.");
}

module.exports = { startReminderScheduler };

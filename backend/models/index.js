
const sequelize = require("../config/database");

const User = require("./User");
const Application = require("./Application");
const Interview = require("./Interview");

User.hasMany(Application, {
  foreignKey: "userId",
  as: "applications",
  onDelete: "CASCADE",
});

Application.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Application.hasMany(Interview, {
  foreignKey: "applicationId",
  as: "interviews",
  onDelete: "CASCADE",
});

Interview.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

module.exports = {
  sequelize,
  User,
  Application,
  Interview,
};

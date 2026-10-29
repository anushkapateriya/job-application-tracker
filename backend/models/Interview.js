
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Interview = sequelize.define(
  "Interview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "application_id",
    },
    interviewDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "interview_date",
      validate: {
        isDate: true,
      },
    },
    interviewType: {
      type: DataTypes.ENUM("online", "phone", "in-person"),
      allowNull: false,
      field: "interview_type",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "reminder_sent",
    },
  },
  {
    tableName: "interviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        fields: ["application_id"],
      },
      {
        fields: ["interview_date", "reminder_sent"],
      },
    ],
  }
);

module.exports = Interview;

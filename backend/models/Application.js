
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    companyName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "company_name",
      validate: {
        notEmpty: true,
      },
    },
    jobTitle: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "job_title",
      validate: {
        notEmpty: true,
      },
    },
    jobUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      field: "job_url",
      validate: {
        isUrl: true,
      },
    },
    status: {
      type: DataTypes.ENUM(
        "Applied",
        "Interview",
        "Offer",
        "Rejected"
      ),
      allowNull: false,
      defaultValue: "Applied",
    },
    appliedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "applied_at",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["user_id", "status"],
      },
    ],
  }
);

module.exports = Application;

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";


export const CourseWeek = sequelize.define("CourseWeek", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
